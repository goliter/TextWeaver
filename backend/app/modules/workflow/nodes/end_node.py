from typing import Dict, Any
from app.modules.workflow.models import Node
from app.modules.workflow.nodes.base import NodeExecutor
import logging

logger = logging.getLogger(__name__)


class EndNodeExecutor(NodeExecutor):
    """结束节点执行器"""
    
    def execute(self, node: Node, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行结束节点
        
        Args:
            node: 结束节点
            input_data: 输入数据
        
        Returns:
            输出数据
        """
        logger.info(f"Executing end node: {node.name}")
        # 结束节点返回输入数据
        return input_data
