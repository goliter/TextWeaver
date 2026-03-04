from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.modules.workflow import models, crud
from app.modules.workflow.nodes import (
    StartNodeExecutor,
    EndNodeExecutor,
    AINodeExecutor,
    FileReaderNodeExecutor,
    FileWriterNodeExecutor
)
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ExecutionEngine:
    """执行引擎类"""
    
    def __init__(self, db: Session):
        self.db = db
        # 初始化节点执行器
        self.node_executors = {
            "start": StartNodeExecutor(),
            "end": EndNodeExecutor(),
            "ai": AINodeExecutor(),
            "file_reader": FileReaderNodeExecutor(),
            "file_writer": FileWriterNodeExecutor()
        }
    
    def execute_workflow(self, flow_id: int, user_id: int, inputs: Dict[str, Any] = None) -> models.Execution:
        """执行工作流
        
        Args:
            flow_id: 工作流ID
            user_id: 用户ID
            inputs: 输入数据
        
        Returns:
            执行记录
        """
        try:
            # 创建执行记录
            execution = crud.create_execution(self.db, flow_id=flow_id, user_id=user_id)
            
            # 更新执行状态为运行中
            crud.update_execution_status(self.db, execution_id=execution.id, status="running")
            
            # 获取工作流的节点和边
            nodes = crud.get_nodes_by_flow(self.db, flow_id=flow_id, user_id=user_id)
            edges = crud.get_edges_by_flow(self.db, flow_id=flow_id, user_id=user_id)
            
            # 构建节点映射
            node_map = {node.id: node for node in nodes}
            
            # 构建边映射（按源节点分组）
            edges_by_source = {node.id: [] for node in nodes}
            for edge in edges:
                edges_by_source[edge.source_node_id].append(edge)
            
            # 查找开始节点
            start_node = None
            for node in nodes:
                if node.node_type == "start":
                    start_node = node
                    break
            
            if not start_node:
                raise ValueError("Workflow must have a start node")
            
            # 执行工作流
            execution_data = inputs or {}
            self._execute_node(start_node, execution.id, execution_data, node_map, edges_by_source)
            
            # 更新执行状态为成功
            crud.update_execution_status(self.db, execution_id=execution.id, status="success")
            
            return execution
            
        except Exception as e:
            # 更新执行状态为错误
            if 'execution' in locals():
                crud.update_execution_status(self.db, execution_id=execution.id, status="error", error_message=str(e))
            logger.error(f"Error executing workflow: {str(e)}")
            raise
    
    def _execute_node(self, node: models.Node, execution_id: int, input_data: Dict[str, Any], 
                     node_map: Dict[int, models.Node], edges_by_source: Dict[int, List[models.Edge]]):
        """执行单个节点
        
        Args:
            node: 节点对象
            execution_id: 执行记录ID
            input_data: 输入数据
            node_map: 节点映射
            edges_by_source: 边映射（按源节点分组）
        """
        # 创建执行日志
        log = crud.create_execution_log(self.db, execution_id=execution_id, node_id=node.id)
        
        try:
            # 更新日志状态为运行中
            crud.update_execution_log(self.db, log_id=log.id, status="running", input_data=input_data)
            
            # 根据节点类型执行
            if node.node_type not in self.node_executors:
                raise ValueError(f"Unknown node type: {node.node_type}")
            
            # 使用节点执行器执行节点
            executor = self.node_executors[node.node_type]
            output_data = executor.execute(node, input_data)
            
            # 更新日志状态为成功
            crud.update_execution_log(self.db, log_id=log.id, status="success", output_data=output_data)
            
            # 找到下一个节点并执行
            for edge in edges_by_source.get(node.id, []):
                target_node = node_map.get(edge.target_node_id)
                if target_node:
                    self._execute_node(target_node, execution_id, output_data, node_map, edges_by_source)
            
        except Exception as e:
            # 更新日志状态为错误
            crud.update_execution_log(self.db, log_id=log.id, status="error", error_message=str(e))
            raise
    

