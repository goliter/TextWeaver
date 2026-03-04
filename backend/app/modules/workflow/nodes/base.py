from abc import ABC, abstractmethod
from typing import Dict, Any
from app.modules.workflow.models import Node


class NodeExecutor(ABC):
    """节点执行器基类"""
    
    @abstractmethod
    def execute(self, node: Node, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行节点
        
        Args:
            node: 节点对象
            input_data: 输入数据
        
        Returns:
            输出数据
        """
        pass
