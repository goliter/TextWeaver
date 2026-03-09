from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.modules.workflow import models, crud
from app.modules.workflow.engine.data_flow import DataFlowManager
from app.modules.workflow.engine.executors import get_node_executor
from app.services.websocket_service import send_node_status, send_execution_status
import logging
import asyncio
import threading

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 存储事件循环的字典，用于多线程环境
_event_loops = {}

def get_or_create_event_loop() -> asyncio.AbstractEventLoop:
    """
    获取或创建事件循环
    
    Returns:
        事件循环对象
    """
    thread_id = threading.get_ident()
    if thread_id not in _event_loops:
        loop = asyncio.new_event_loop()
        _event_loops[thread_id] = loop
        # 启动事件循环
        def run_loop():
            loop.run_forever()
        thread = threading.Thread(target=run_loop, daemon=True)
        thread.start()
    return _event_loops[thread_id]


class ExecutionEngine:
    """执行引擎类"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def execute_workflow_async(self, flow_id: int, user_id: int, inputs: Dict[str, Any] = None, execution_id: int = None):
        """异步执行工作流
        
        Args:
            flow_id: 工作流ID
            user_id: 用户ID
            inputs: 输入数据
            execution_id: 预创建的执行记录ID
        """
        try:
            # 获取或创建执行记录
            if execution_id:
                # 使用预创建的执行记录
                execution = crud.get_execution(self.db, execution_id=execution_id, user_id=user_id)
                if not execution:
                    raise ValueError(f"Execution with id {execution_id} not found")
            else:
                # 创建新的执行记录
                execution = crud.create_execution(self.db, flow_id=flow_id, user_id=user_id)
            
            # 推送执行开始状态
            loop = get_or_create_event_loop()
            asyncio.run_coroutine_threadsafe(send_execution_status(execution.id, "start"), loop)
            
            # 延迟一小段时间，给前端足够的时间建立WebSocket连接
            import time
            time.sleep(0.5)
            
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
            
            # 初始化数据流管理器
            data_flow = DataFlowManager(self.db, flow_id)
            
            # 设置开始节点的初始数据
            start_value = start_node.data.get("value", "")
            data_flow.set_node_output(start_node.id, "bottom", start_value)
            
            # 执行工作流
            self._execute_workflow_nodes(start_node, execution.id, node_map, edges_by_source, data_flow)
            
            # 推送执行成功状态
            loop = get_or_create_event_loop()
            asyncio.run_coroutine_threadsafe(send_execution_status(execution.id, "success"), loop)
            
            # 更新执行状态为成功
            crud.update_execution_status(self.db, execution_id=execution.id, status="success")
            
        except Exception as e:
            # 推送执行错误状态
            if 'execution' in locals():
                loop = get_or_create_event_loop()
                asyncio.run_coroutine_threadsafe(send_execution_status(execution.id, "error", None, str(e)), loop)
                crud.update_execution_status(self.db, execution_id=execution.id, status="error", error_message=str(e))
            logger.error(f"Error executing workflow: {str(e)}")
            raise

    def execute_workflow(self, flow_id: int, user_id: int, inputs: Dict[str, Any] = None, execution_id: int = None) -> models.Execution:
        """执行工作流
        
        Args:
            flow_id: 工作流ID
            user_id: 用户ID
            inputs: 输入数据
            execution_id: 预创建的执行记录ID
        
        Returns:
            执行记录
        """
        try:
            # 获取或创建执行记录
            if execution_id:
                # 使用预创建的执行记录
                execution = crud.get_execution(self.db, execution_id=execution_id, user_id=user_id)
                if not execution:
                    raise ValueError(f"Execution with id {execution_id} not found")
            else:
                # 创建新的执行记录
                execution = crud.create_execution(self.db, flow_id=flow_id, user_id=user_id)
            
            # 推送执行开始状态
            loop = get_or_create_event_loop()
            asyncio.run_coroutine_threadsafe(send_execution_status(execution.id, "start"), loop)
            
            # 延迟一小段时间，给前端足够的时间建立WebSocket连接
            import time
            time.sleep(0.5)
            
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
            
            # 初始化数据流管理器
            data_flow = DataFlowManager(self.db, flow_id)
            
            # 设置开始节点的初始数据
            start_value = start_node.data.get("value", "")
            data_flow.set_node_output(start_node.id, "bottom", start_value)
            
            # 执行工作流
            self._execute_workflow_nodes(start_node, execution.id, node_map, edges_by_source, data_flow)
            
            # 推送执行成功状态
            loop = get_or_create_event_loop()
            asyncio.run_coroutine_threadsafe(send_execution_status(execution.id, "success"), loop)
            
            # 更新执行状态为成功
            crud.update_execution_status(self.db, execution_id=execution.id, status="success")
            
            return execution
            
        except Exception as e:
            # 推送执行错误状态
            if 'execution' in locals():
                loop = get_or_create_event_loop()
                asyncio.run_coroutine_threadsafe(send_execution_status(execution.id, "error", None, str(e)), loop)
                crud.update_execution_status(self.db, execution_id=execution.id, status="error", error_message=str(e))
            logger.error(f"Error executing workflow: {str(e)}")
            raise
    
    def _execute_workflow_nodes(
        self, 
        start_node: models.Node, 
        execution_id: int, 
        node_map: Dict[int, models.Node], 
        edges_by_source: Dict[int, List[models.Edge]],
        data_flow: DataFlowManager
    ):
        """执行工作流节点
        
        Args:
            start_node: 开始节点
            execution_id: 执行记录ID
            node_map: 节点映射
            edges_by_source: 边映射（按源节点分组）
            data_flow: 数据流管理器
        """
        # 构建边映射（按目标节点分组）
        edges_by_target = {node.id: [] for node in node_map.values()}
        for edge in sum(edges_by_source.values(), []):
            edges_by_target[edge.target_node_id].append(edge)
        
        # 使用拓扑排序执行节点
        visited = set()
        queue = [start_node.id]
        
        while queue:
            current_node_id = queue.pop(0)
            
            if current_node_id in visited:
                continue
            
            # 检查所有输入节点是否已执行
            all_inputs_executed = True
            for edge in edges_by_target.get(current_node_id, []):
                if edge.source_node_id not in visited:
                    all_inputs_executed = False
                    # 如果输入节点未执行，将其加入队列
                    if edge.source_node_id not in queue:
                        queue.append(edge.source_node_id)
            
            # 如果所有输入节点已执行，执行当前节点
            if all_inputs_executed:
                visited.add(current_node_id)
                current_node = node_map.get(current_node_id)
                
                if not current_node:
                    continue
                
                # 执行节点
                self._execute_node(current_node, execution_id, data_flow)
                
                # 找到下一个节点并加入队列
                for edge in edges_by_source.get(current_node_id, []):
                    target_node_id = edge.target_node_id
                    if target_node_id not in visited and target_node_id not in queue:
                        queue.append(target_node_id)
    
    def _execute_node(self, node: models.Node, execution_id: int, data_flow: DataFlowManager):
        """执行单个节点
        
        Args:
            node: 节点对象
            execution_id: 执行记录ID
            data_flow: 数据流管理器
        """
        # 创建执行日志
        log = crud.create_execution_log(self.db, execution_id=execution_id, node_id=node.id)
        
        try:
            # 推送节点开始执行状态
            loop = get_or_create_event_loop()
            asyncio.run_coroutine_threadsafe(send_node_status(execution_id, node.id, "start"), loop)
            
            # 更新日志状态为运行中
            inputs = data_flow.get_node_inputs(node.id)
            crud.update_execution_log(self.db, log_id=log.id, status="running", input_data=inputs)
            
            # 获取节点执行器
            executor = get_node_executor(self.db, node.node_type)
            
            # 执行节点
            outputs = executor.execute(node, data_flow)
            
            # 保存节点输出数据
            for handle, data in outputs.items():
                data_flow.set_node_output(node.id, handle, data)
            
            # 推送节点执行成功状态
            loop = get_or_create_event_loop()
            asyncio.run_coroutine_threadsafe(send_node_status(execution_id, node.id, "success", outputs), loop)
            
            # 更新日志状态为成功
            crud.update_execution_log(self.db, log_id=log.id, status="success", output_data=outputs)
            
        except Exception as e:
            # 推送节点执行错误状态
            loop = get_or_create_event_loop()
            asyncio.run_coroutine_threadsafe(send_node_status(execution_id, node.id, "error", None, str(e)), loop)
            
            # 更新日志状态为错误
            crud.update_execution_log(self.db, log_id=log.id, status="error", error_message=str(e))
            logger.error(f"Error executing node {node.id}: {str(e)}")
            raise
