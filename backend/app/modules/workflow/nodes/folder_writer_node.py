from typing import Dict, Any
from app.modules.workflow.models import Node
from app.modules.workflow.nodes.base import NodeExecutor
from app.modules.filesystem import crud as filesystem_crud
from app.modules.filesystem import schemas as filesystem_schemas
import logging
import datetime

logger = logging.getLogger(__name__)


class FolderWriterNodeExecutor(NodeExecutor):
    """文件夹写入节点执行器"""
    
    def __init__(self, db):
        self.db = db
    
    def execute(self, node: Node, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行文件夹写入节点
        
        Args:
            node: 文件夹写入节点
            input_data: 输入数据
        
        Returns:
            输出数据
        """
        logger.info(f"Executing folder writer node: {node.name}")
        
        # 获取文件夹配置
        folder_id = node.data.get("folderId", None)
        
        if not folder_id:
            logger.error("Folder ID not specified in node configuration")
            return {"error": "Folder ID not specified"}
        
        # 从节点关联的工作流获取flow_id
        flow_id = node.flow_id
        
        # 检查文件夹是否存在
        folder = filesystem_crud.get_file_by_id(self.db, folder_id, flow_id)
        if not folder or folder.type != "folder":
            logger.error(f"Folder not found or is not a folder: {folder_id}")
            return {"error": f"Folder not found or is not a folder: {folder_id}"}
        
        # 获取输入内容
        content = input_data.get("output", input_data.get("content", ""))
        
        # 生成文件名（使用当前时间）
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"output_{timestamp}.txt"
        
        # 创建新文件
        try:
            # 检查同名文件是否存在
            existing_file = filesystem_crud.get_file_by_name_and_parent(
                self.db, file_name, folder_id, flow_id
            )
            
            # 如果文件已存在，添加序号
            if existing_file:
                counter = 1
                while existing_file:
                    file_name = f"output_{timestamp}_{counter}.txt"
                    existing_file = filesystem_crud.get_file_by_name_and_parent(
                        self.db, file_name, folder_id, flow_id
                    )
                    counter += 1
            
            # 创建新文件
            file_create = filesystem_schemas.FileCreate(
                name=file_name,
                type="file",
                content=content,
                parent_id=folder_id
            )
            
            new_file = filesystem_crud.create_file(self.db, file_create, flow_id)
            
            if not new_file:
                logger.error("Failed to create new file")
                return {"error": "Failed to create new file"}
            
            output_data = {
                "file_id": new_file.id,
                "file_name": new_file.name,
                "folder_id": folder_id,
                "folder_name": folder.name,
                "success": True
            }
            
            return output_data
        except Exception as e:
            logger.error(f"Error writing to folder: {e}")
            return {"error": str(e)}
