from typing import Dict, Any
from app.modules.workflow.models import Node
from app.modules.workflow.nodes.base import NodeExecutor
from app.modules.filesystem import crud as filesystem_crud
from app.modules.filesystem import schemas as filesystem_schemas
import logging

logger = logging.getLogger(__name__)


class FileWriterNodeExecutor(NodeExecutor):
    """文件写入节点执行器"""
    
    def __init__(self, db):
        self.db = db
    
    def execute(self, node: Node, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行文件写入节点
        
        Args:
            node: 文件写入节点
            input_data: 输入数据
        
        Returns:
            输出数据
        """
        logger.info(f"Executing file writer node: {node.name}")
        
        # 获取文件写入配置
        file_id = node.data.get("fileId", None)
        overwrite = node.data.get("overwrite", True)
        
        if not file_id:
            logger.error("File ID not specified in node configuration")
            return {"error": "File ID not specified"}
        
        # 从节点关联的工作流获取flow_id
        flow_id = node.flow_id
        
        # 获取输入内容
        content = input_data.get("output", input_data.get("content", ""))
        
        # 写入文件
        try:
            # 检查文件是否存在
            file = filesystem_crud.get_file_by_id(self.db, file_id, flow_id)
            if not file:
                logger.error(f"File not found: {file_id}")
                return {"error": f"File not found: {file_id}"}
            
            # 更新文件内容
            file_update = filesystem_schemas.FileUpdate(content=content)
            updated_file = filesystem_crud.update_file(self.db, file_id, file_update, flow_id)
            
            if not updated_file:
                logger.error(f"Failed to update file: {file_id}")
                return {"error": f"Failed to update file: {file_id}"}
            
            output_data = {
                "file_id": file_id,
                "file_name": updated_file.name,
                "success": True
            }
            
            return output_data
        except Exception as e:
            logger.error(f"Error writing file: {e}")
            return {"error": str(e)}
