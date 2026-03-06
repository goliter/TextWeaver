from typing import Dict, Any
from app.modules.workflow.models import Node
from app.modules.workflow.nodes.base import NodeExecutor
from app.modules.filesystem import crud as filesystem_crud
import logging

logger = logging.getLogger(__name__)


class FileReaderNodeExecutor(NodeExecutor):
    """文件读取节点执行器"""
    
    def __init__(self, db):
        self.db = db
    
    def execute(self, node: Node, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行文件读取节点
        
        Args:
            node: 文件读取节点
            input_data: 输入数据
        
        Returns:
            输出数据
        """
        logger.info(f"Executing file reader node: {node.name}")
        
        # 获取文件读取配置
        file_id = node.data.get("fileId", None)
        
        if not file_id:
            logger.error("File ID not specified in node configuration")
            return {"error": "File ID not specified"}
        
        # 从节点关联的工作流获取flow_id
        flow_id = node.flow_id
        
        # 读取文件
        try:
            file = filesystem_crud.get_file_by_id(self.db, file_id, flow_id)
            if not file:
                logger.error(f"File not found: {file_id}")
                return {"error": f"File not found: {file_id}"}
            
            output_data = {
                "file_id": file_id,
                "file_name": file.name,
                "content": file.content or ""
            }
            
            return output_data
        except Exception as e:
            logger.error(f"Error reading file: {e}")
            return {"error": str(e)}
