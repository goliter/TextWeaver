"""
数据流管理器
管理工作流执行过程中的数据流转
"""

from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.modules.workflow.models import Node, Edge


class DataFlowManager:
    """数据流管理器"""
    
    def __init__(self, db: Session, flow_id: int):
        """
        初始化数据流管理器
        
        Args:
            db: 数据库会话
            flow_id: 工作流ID
        """
        self.db = db
        self.flow_id = flow_id
        self.node_data: Dict[str, Any] = {}  # 存储节点输出数据
        self.file_cache: Dict[int, str] = {}  # 文件内容缓存
    
    def set_node_output(self, node_id: int, handle: str, data: Any) -> None:
        """
        设置节点输出数据
        
        Args:
            node_id: 节点ID
            handle: 输出连接点名称（如 "bottom", "right"）
            data: 输出数据
        """
        key = f"{node_id}:{handle}"
        self.node_data[key] = data
    
    def get_node_output(self, node_id: int, handle: str) -> Optional[Any]:
        """
        获取节点输出数据
        
        Args:
            node_id: 节点ID
            handle: 输出连接点名称
        
        Returns:
            节点输出数据，如果不存在则返回None
        """
        key = f"{node_id}:{handle}"
        return self.node_data.get(key)
    
    def get_node_inputs(self, node_id: int) -> Dict[str, Any]:
        """
        获取节点的所有输入数据
        
        Args:
            node_id: 节点ID
        
        Returns:
            输入数据字典，key为连接点名称，value可能是单个值或列表（当多个边连接到同一端口时）
        """
        inputs = {}
        
        # 查询所有连接到该节点的边
        edges = self.db.query(Edge).filter(
            Edge.target_node_id == node_id,
            Edge.flow_id == self.flow_id
        ).all()
        
        for edge in edges:
            # 获取源节点的输出数据
            source_handle = edge.source_handle or "bottom"  # 默认从底部输出
            source_data = self.get_node_output(edge.source_node_id, source_handle)
            
            if source_data is not None:
                # 使用目标连接点作为key
                target_handle = edge.target_handle or "top"  # 默认输入到顶部
                
                # 如果该连接点已有数据，转换为列表
                if target_handle in inputs:
                    existing_data = inputs[target_handle]
                    if isinstance(existing_data, list):
                        existing_data.append(source_data)
                    else:
                        inputs[target_handle] = [existing_data, source_data]
                else:
                    inputs[target_handle] = source_data
        
        return inputs
    
    def get_node_inputs_by_source_node(self, node_id: int, source_node_id: int) -> Optional[Any]:
        """
        根据源节点ID获取输入数据（用于选择节点）
        
        Args:
            node_id: 目标节点ID
            source_node_id: 源节点ID
        
        Returns:
            输入数据，如果不存在则返回None
        """
        # 查询从指定源节点连接到目标节点的边
        edge = self.db.query(Edge).filter(
            Edge.source_node_id == source_node_id,
            Edge.target_node_id == node_id,
            Edge.flow_id == self.flow_id
        ).first()
        
        if edge:
            # 获取源节点的输出数据
            source_handle = edge.source_handle or "bottom"  # 默认从底部输出
            return self.get_node_output(source_node_id, source_handle)
        
        return None
    
    def get_file_content(self, file_id: int, encoding: str = "utf-8") -> str:
        """
        获取文件内容（带缓存）
        
        Args:
            file_id: 文件ID
            encoding: 文件编码
        
        Returns:
            文件内容
        """
        if file_id not in self.file_cache:
            from app.services.file_service import get_file_service
            file_service = get_file_service(self.db)
            self.file_cache[file_id] = file_service.read_file(file_id, encoding)
        
        return self.file_cache[file_id]
    
    def clear_cache(self) -> None:
        """清除所有缓存"""
        self.node_data.clear()
        self.file_cache.clear()
    
    def get_data_summary(self) -> Dict[str, Any]:
        """
        获取数据流摘要
        
        Returns:
            数据流摘要信息
        """
        return {
            "node_data_count": len(self.node_data),
            "file_cache_count": len(self.file_cache),
            "node_data_keys": list(self.node_data.keys()),
            "file_cache_keys": list(self.file_cache.keys()),
        }
