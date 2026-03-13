"""
节点执行器
实现各种节点的执行逻辑
"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.modules.workflow.models import Node, Edge, Flow
from app.modules.workflow.engine.data_flow import DataFlowManager
from app.services.file_service import get_file_service
from app.modules.ai.service import LangChainService
from app.modules.filesystem.models import File, FileType


class BaseNodeExecutor:
    """基础节点执行器"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def execute(self, node: Node, data_flow: DataFlowManager) -> Dict[str, Any]:
        """
        执行节点
        
        Args:
            node: 节点对象
            data_flow: 数据流管理器
        
        Returns:
            节点输出数据字典，key为连接点名称
        """
        raise NotImplementedError("子类必须实现execute方法")


class FileReaderNodeExecutor(BaseNodeExecutor):
    """文件读取节点执行器"""
    
    def _get_file_by_path(self, file_path: str, flow_id: int) -> Optional[File]:
        """根据文件路径查找文件
        
        Args:
            file_path: 文件路径，格式如 /工作流名称/文件夹/文件
            flow_id: 工作流ID
        
        Returns:
            文件对象，如果不存在则返回None
        """
        # 解析路径
        path_parts = [part for part in file_path.split('/') if part]
        if not path_parts:
            return None
        
        # 从根文件夹开始查找
        current_parent_id = None
        
        for part in path_parts:
            file = self.db.query(File).filter(
                File.name == part,
                File.parent_id == current_parent_id,
                File.flow_id == flow_id
            ).first()
            
            if not file:
                return None
            
            # 如果是最后一个部分，必须是文件
            if part == path_parts[-1] and file.type != FileType.FILE:
                return None
            
            current_parent_id = file.id
        
        return file
    
    def _get_file_id(self, node_data: Dict[str, Any], flow_id: int) -> int:
        """获取文件ID
        
        优先使用fileId，如果没有则根据filePath查找
        """
        # 优先使用fileId
        file_id = node_data.get("fileId")
        if file_id:
            return file_id
        
        # 根据filePath查找文件
        file_path = node_data.get("filePath")
        if file_path:
            file = self._get_file_by_path(file_path, flow_id)
            if file:
                return file.id
            raise ValueError(f"文件不存在: {file_path}")
        
        raise ValueError("文件读取节点缺少fileId或filePath配置")
    
    def execute(self, node: Node, data_flow: DataFlowManager) -> Dict[str, Any]:
        """
        执行文件读取节点
        
        读取文件内容并从右侧输出
        """
        try:
            # 获取文件ID
            file_id = self._get_file_id(node.data, node.flow_id)
            
            # 获取编码格式
            encoding = node.data.get("encoding", "utf-8")
            
            # 读取文件内容
            file_service = get_file_service(self.db)
            content = file_service.read_file(file_id, encoding)
            
            # 从右侧输出文件内容
            return {
                "right": content
            }
        except Exception as e:
            raise ValueError(f"文件读取失败: {str(e)}")


class FileWriterNodeExecutor(BaseNodeExecutor):
    """文件写入节点执行器"""
    
    def _get_file_by_path(self, file_path: str, flow_id: int) -> Optional[File]:
        """根据文件路径查找文件
        
        Args:
            file_path: 文件路径，格式如 /工作流名称/文件夹/文件
            flow_id: 工作流ID
        
        Returns:
            文件对象，如果不存在则返回None
        """
        # 解析路径
        path_parts = [part for part in file_path.split('/') if part]
        if not path_parts:
            return None
        
        # 从根文件夹开始查找
        current_parent_id = None
        
        for part in path_parts:
            file = self.db.query(File).filter(
                File.name == part,
                File.parent_id == current_parent_id,
                File.flow_id == flow_id
            ).first()
            
            if not file:
                return None
            
            # 如果是最后一个部分，必须是文件
            if part == path_parts[-1] and file.type != FileType.FILE:
                return None
            
            current_parent_id = file.id
        
        return file
    
    def _get_file_id(self, node_data: Dict[str, Any], flow_id: int) -> int:
        """获取文件ID
        
        优先使用fileId，如果没有则根据filePath查找
        """
        # 优先使用fileId
        file_id = node_data.get("fileId")
        if file_id:
            return file_id
        
        # 根据filePath查找文件
        file_path = node_data.get("filePath")
        if file_path:
            file = self._get_file_by_path(file_path, flow_id)
            if file:
                return file.id
            raise ValueError(f"文件不存在: {file_path}")
        
        raise ValueError("文件写入节点缺少fileId或filePath配置")
    
    def _get_input_edges(self, node_id: int) -> list:
        """获取节点的输入边"""
        return self.db.query(Edge).filter(
            Edge.target_node_id == node_id
        ).all()
    
    def execute(self, node: Node, data_flow: DataFlowManager) -> Dict[str, Any]:
        """
        执行文件写入节点
        
        支持直接写入和AI修改两种模式
        """
        try:
            # 获取文件ID
            file_id = self._get_file_id(node.data, node.flow_id)
            
            # 获取写入模式
            mode = node.data.get("mode", "direct")
            
            # 获取输入数据（只使用左侧输入端口）
            inputs = data_flow.get_node_inputs(node.id)
            
            # 只使用左侧输入
            input_data = inputs.get("left")
            
            if input_data is None:
                # 提供更详细的错误信息
                if not inputs:
                    raise ValueError("文件写入节点缺少输入数据：没有任何边连接到该节点")
                else:
                    raise ValueError("文件写入节点缺少输入数据：请从左侧输入端口连接数据")
            
            # 获取编码格式
            encoding = node.data.get("encoding", "utf-8")
            # 获取覆盖选项
            overwrite = node.data.get("overwrite", True)
            
            file_service = get_file_service(self.db)
            
            if mode == "direct":
                # 直接写入模式
                content = str(input_data)
            else:
                # AI修改模式
                ai_prompt = node.data.get("aiPrompt", "")
                if not ai_prompt:
                    raise ValueError("AI修改模式缺少aiPrompt配置")
                
                # 获取原文件内容
                original_content = file_service.read_file(file_id, encoding)
                
                # 构建变量字典
                variables = {"file_content": original_content}
                
                # 处理左侧输入（支持多个输入）
                left_input = inputs.get("left")
                if left_input is not None:
                    # 获取输入边信息，用于构建变量名
                    input_edges = self._get_input_edges(node.id)
                    
                    if isinstance(left_input, list):
                        # 处理多个输入的情况
                        left_edges = [edge for edge in input_edges if edge.target_handle == "left"]
                        for i, (data, edge) in enumerate(zip(left_input, left_edges)):
                            source_node_id = edge.source_node_id
                            var_name = f"input_{source_node_id}"
                            variables[var_name] = data
                        # 保留兼容的 input_data 变量
                        variables["input_data"] = left_input
                    else:
                        # 单个输入的情况
                        variables["input_data"] = left_input
                        # 构建基于源节点ID的变量名
                        left_edges = [edge for edge in input_edges if edge.target_handle == "left"]
                        if left_edges:
                            source_node_id = left_edges[0].source_node_id
                            var_name = f"input_{source_node_id}"
                            variables[var_name] = left_input
                
                # 替换提示词中的变量
                prompt = ai_prompt
                for var_name, var_value in variables.items():
                    prompt = prompt.replace(f"{{{var_name}}}", str(var_value))
                
                # 检查是否指定了AI服务配置
                ai_service_id = node.data.get("ai_service_id")
                if ai_service_id:
                    # 加载用户配置的AI服务
                    from app.modules.ai.crud import get_ai_service
                    ai_service_config = get_ai_service(self.db, ai_service_id, node.flow.user_id)
                    if ai_service_config:
                        # 创建使用用户配置的AI服务
                        ai_service = LangChainService(
                            api_key=ai_service_config.api_key,
                            api_base=ai_service_config.api_base,
                            model=ai_service_config.model
                        )
                    else:
                        # 使用默认服务
                        ai_service = LangChainService()
                else:
                    # 使用默认服务
                    ai_service = LangChainService()
                
                # 调用AI服务
                content = ai_service.generate_text(prompt)
            
            # 写入文件
            file_service.write_file(file_id, content, encoding, overwrite)
            
            # 文件写入节点没有输出
            return {}
        except Exception as e:
            raise ValueError(f"文件写入失败: {str(e)}")


class AINodeExecutor(BaseNodeExecutor):
    """AI节点执行器"""
    
    def __init__(self, db: Session):
        super().__init__(db)
        self.ai_service = LangChainService()  # 默认服务，在execute中可能会被替换
    
    def _get_input_edges(self, node_id: int) -> list:
        """获取节点的输入边"""
        return self.db.query(Edge).filter(
            Edge.target_node_id == node_id
        ).all()
    
    def execute(self, node: Node, data_flow: DataFlowManager) -> Dict[str, Any]:
        """
        执行AI节点
        
        支持多输入（上侧和左侧）和多输出（下侧和右侧）
        """
        # 收集输入数据
        inputs = data_flow.get_node_inputs(node.id)
        
        # 获取输入边信息，用于构建变量名
        input_edges = self._get_input_edges(node.id)
        edge_map = {edge.target_handle: edge for edge in input_edges}
        
        # 构建变量字典
        variables = {}
        
        # 处理上侧输入（一般数据）
        top_input = inputs.get("top")
        if top_input is not None:
            # 处理多个输入的情况
            if isinstance(top_input, list):
                # 为每个输入创建变量名
                top_edges = [edge for edge in input_edges if edge.target_handle == "top"]
                for i, (data, edge) in enumerate(zip(top_input, top_edges)):
                    source_node_id = edge.source_node_id
                    var_name = f"input_{source_node_id}"
                    variables[var_name] = data
            else:
                # 单个输入的情况
                if "top" in edge_map:
                    source_node_id = edge_map["top"].source_node_id
                    var_name = f"input_{source_node_id}"
                    variables[var_name] = top_input
                else:
                    variables["input"] = top_input
        
        # 处理左侧输入（文件数据）
        left_input = inputs.get("left")
        if left_input is not None:
            # 处理多个输入的情况
            if isinstance(left_input, list):
                # 为每个输入创建变量名
                left_edges = [edge for edge in input_edges if edge.target_handle == "left"]
                for i, (data, edge) in enumerate(zip(left_input, left_edges)):
                    source_node_id = edge.source_node_id
                    var_name = f"file_{source_node_id}"
                    variables[var_name] = data
            else:
                # 单个输入的情况
                if "left" in edge_map:
                    source_node_id = edge_map["left"].source_node_id
                    var_name = f"file_{source_node_id}"
                    variables[var_name] = left_input
                else:
                    variables["file"] = left_input
        
        # 获取提示词
        prompt = node.data.get("prompt", "")
        
        # 替换提示词中的变量
        for var_name, var_value in variables.items():
            prompt = prompt.replace(f"{{{var_name}}}", str(var_value))
        
        # 检查是否需要使用AI处理
        use_ai = node.data.get("use_ai", True)  # 默认使用AI
        if not use_ai:
            # 不使用AI，直接返回提示词内容
            content = prompt
            
            # 构建输出数据
            outputs = {}
            
            # 获取输出配置
            output_config = node.data.get("outputs", {})
            
            # 下侧输出
            if output_config.get("bottom") or not output_config:
                outputs["bottom"] = content
            
            # 右侧输出
            if output_config.get("right") or not output_config:
                outputs["right"] = content
            
            return outputs
        
        try:
            # 检查是否指定了AI服务配置
            ai_service_id = node.data.get("ai_service_id")
            if ai_service_id:
                # 加载用户配置的AI服务
                from app.modules.ai.crud import get_ai_service
                ai_service_config = get_ai_service(self.db, ai_service_id, node.flow.user_id)
                if ai_service_config:
                    # 创建使用用户配置的AI服务
                    self.ai_service = LangChainService(
                        api_key=ai_service_config.api_key,
                        api_base=ai_service_config.api_base,
                        model=ai_service_config.model
                    )
            
            # 调用AI服务
            content = self.ai_service.generate_text(prompt)
            
            # 构建输出数据
            outputs = {}
            
            # 获取输出配置
            output_config = node.data.get("outputs", {})
            
            # 下侧输出
            if output_config.get("bottom") or not output_config:
                outputs["bottom"] = content
            
            # 右侧输出
            if output_config.get("right") or not output_config:
                outputs["right"] = content
            
            return outputs
        except Exception as e:
            raise ValueError(f"AI节点执行失败: {str(e)}")


class StartNodeExecutor(BaseNodeExecutor):
    """开始节点执行器"""
    
    def execute(self, node: Node, data_flow: DataFlowManager) -> Dict[str, Any]:
        """
        执行开始节点
        
        返回初始输入数据
        """
        # 开始节点从底部输出初始数据
        return {
            "bottom": node.data.get("value", "")
        }


class EndNodeExecutor(BaseNodeExecutor):
    """结束节点执行器"""
    
    def execute(self, node: Node, data_flow: DataFlowManager) -> Dict[str, Any]:
        """
        执行结束节点
        
        收集所有输入数据并完成工作流
        """
        # 收集输入数据
        inputs = data_flow.get_node_inputs(node.id)
        
        # 结束节点没有输出
        return {}


class SelectNodeExecutor(BaseNodeExecutor):
    """选择节点执行器"""
    
    def __init__(self, db: Session):
        super().__init__(db)
        self.ai_service = LangChainService()  # 默认服务
    
    def _get_input_edges(self, node_id: int) -> list:
        """获取节点的输入边"""
        return self.db.query(Edge).filter(
            Edge.target_node_id == node_id
        ).all()
    
    def _get_output_edges(self, node_id: int) -> list:
        """获取节点的输出边"""
        return self.db.query(Edge).filter(
            Edge.source_node_id == node_id
        ).all()
    
    def execute(self, node: Node, data_flow: DataFlowManager) -> Dict[str, Any]:
        """
        执行选择节点
        
        1. 收集所有上侧输入的数据
        2. 将数据插入到提示词中
        3. 调用AI分析并选择一个输出节点
        4. 将输入数据传递给选择的输出节点
        """
        # 收集输入数据
        inputs = data_flow.get_node_inputs(node.id)
        
        # 获取输入边信息，用于构建变量名
        input_edges = self._get_input_edges(node.id)
        edge_map = {edge.target_handle: edge for edge in input_edges}
        
        # 构建变量字典
        variables = {}
        
        # 处理上侧输入（数据输入）
        top_input = inputs.get("top")
        if top_input is not None:
            # 只处理单个输入的情况
            if isinstance(top_input, list):
                # 如果是多个输入，只使用第一个
                top_input = top_input[0]
            
            # 单个输入的情况
            if "top" in edge_map:
                source_node_id = edge_map["top"].source_node_id
                var_name = f"input_{source_node_id}"
                variables[var_name] = top_input
            else:
                variables["input"] = top_input
        
        # 获取提示词
        prompt = node.data.get("prompt", "")
        
        # 获取所有输出边，用于构建输出节点变量映射
        output_edges = self._get_output_edges(node.id)
        
        # 构建输出节点变量映射：将变量名映射到节点ID
        output_node_map = {}
        for edge in output_edges:
            # 假设输出节点变量名格式为 {output_节点ID} 或 {节点ID}
            target_node_id = str(edge.target_node_id)
            output_node_map[f"output_{target_node_id}"] = target_node_id
            output_node_map[target_node_id] = target_node_id
        
        # 替换提示词中的输入变量
        for var_name, var_value in variables.items():
            prompt = prompt.replace(f"{{{var_name}}}", str(var_value))
        
        # 替换提示词中的输出节点变量为节点ID
        for var_name, node_id in output_node_map.items():
            prompt = prompt.replace(f"{{{var_name}}}", node_id)
        
        try:
            # 检查是否指定了AI服务配置
            ai_service_id = node.data.get("ai_service_id")
            if ai_service_id:
                # 加载用户配置的AI服务
                from app.modules.ai.crud import get_ai_service
                ai_service_config = get_ai_service(self.db, ai_service_id, node.flow.user_id)
                if ai_service_config:
                    # 创建使用用户配置的AI服务
                    self.ai_service = LangChainService(
                        api_key=ai_service_config.api_key,
                        api_base=ai_service_config.api_base,
                        model=ai_service_config.model
                    )
            
            # 调用AI服务选择输出节点
            selection = self.ai_service.generate_text(prompt)
            
            # 构建输出边映射
            output_edge_map = {}
            target_node_map = {}
            for edge in output_edges:
                # 使用source_handle作为key，因为这是选择节点输出的连接点
                source_handle = edge.source_handle or "bottom"
                target_node_id = edge.target_node_id
                output_edge_map[str(target_node_id)] = source_handle
                target_node_map[str(target_node_id)] = edge
            
            # 解析AI的选择结果
            selected_edge = None
            # 提取选择结果中的节点ID
            import re
            selection_clean = selection.strip()
            # 从output_12格式中提取节点ID
            match = re.search(r'output_(\d+)', selection_clean)
            if match:
                selection_clean = match.group(1)
            for node_id, handle in output_edge_map.items():
                if node_id in selection_clean or handle in selection_clean:
                    selected_edge = target_node_map.get(node_id)
                    break
            
            # 如果没有找到匹配的节点，使用第一个输出边
            if not selected_edge and output_edges:
                selected_edge = output_edges[0]
            
            # 构建输出数据
            outputs = {}
            if selected_edge:
                # 使用target_node_id作为key，这样执行引擎可以根据节点ID来判断
                target_node_id = str(selected_edge.target_node_id)
                selected_handle = selected_edge.source_handle or "bottom"
                # 将输入数据传递给选择的输出节点
                # 使用target_node_id作为key，执行引擎会根据这个key来判断哪个节点应该被执行
                outputs[target_node_id] = {
                    "handle": selected_handle,
                    "data": top_input
                }
            
            return outputs
        except Exception as e:
            raise ValueError(f"选择节点执行失败: {str(e)}")


class FolderWriterNodeExecutor(BaseNodeExecutor):
    """文件夹写入节点执行器"""
    
    def _get_folder_by_path(self, folder_path: str, flow_id: int) -> Optional[File]:
        """根据文件夹路径查找文件夹
        
        Args:
            folder_path: 文件夹路径，格式如 /工作流名称/文件夹1/文件夹2
            flow_id: 工作流ID
        
        Returns:
            文件夹对象，如果不存在则返回None
        """
        # 解析路径
        path_parts = [part for part in folder_path.split('/') if part]
        if not path_parts:
            return None
        
        # 从根文件夹开始查找
        current_parent_id = None
        
        for part in path_parts:
            file = self.db.query(File).filter(
                File.name == part,
                File.parent_id == current_parent_id,
                File.flow_id == flow_id
            ).first()
            
            if not file:
                return None
            
            # 必须是文件夹
            if file.type != FileType.FOLDER:
                return None
            
            current_parent_id = file.id
        
        return file
    
    def _get_folder_id(self, node_data: Dict[str, Any], flow_id: int) -> int:
        """获取文件夹ID
        
        优先使用folderId，如果没有则根据folderPath查找
        """
        # 优先使用folderId
        folder_id = node_data.get("folderId")
        if folder_id:
            return folder_id
        
        # 根据folderPath查找文件夹
        folder_path = node_data.get("folderPath")
        if folder_path:
            folder = self._get_folder_by_path(folder_path, flow_id)
            if folder:
                return folder.id
            raise ValueError(f"文件夹不存在: {folder_path}")
        
        raise ValueError("文件夹写入节点缺少folderId或folderPath配置")
    
    def execute(self, node: Node, data_flow: DataFlowManager) -> Dict[str, Any]:
        """
        执行文件夹写入节点
        
        在指定文件夹中创建新文件并写入内容
        """
        try:
            # 获取文件夹ID
            folder_id = self._get_folder_id(node.data, node.flow_id)
            
            # 获取输入数据（只使用左侧输入端口）
            inputs = data_flow.get_node_inputs(node.id)
            
            # 只使用左侧输入
            input_data = inputs.get("left")
            
            if input_data is None:
                # 提供更详细的错误信息
                if not inputs:
                    raise ValueError("文件夹写入节点缺少输入数据：没有任何边连接到该节点")
                else:
                    raise ValueError("文件夹写入节点缺少输入数据：请从左侧输入端口连接数据")
            
            # 生成文件名（使用当前时间）
            import datetime
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            file_name = f"output_{timestamp}.txt"
            
            # 检查同名文件是否存在
            existing_file = self.db.query(File).filter(
                File.name == file_name,
                File.parent_id == folder_id,
                File.flow_id == node.flow_id
            ).first()
            
            # 如果文件已存在，添加序号
            if existing_file:
                counter = 1
                while existing_file:
                    file_name = f"output_{timestamp}_{counter}.txt"
                    existing_file = self.db.query(File).filter(
                        File.name == file_name,
                        File.parent_id == folder_id,
                        File.flow_id == node.flow_id
                    ).first()
                    counter += 1
            
            # 创建新文件
            new_file = File(
                name=file_name,
                type=FileType.FILE,
                content=str(input_data),
                size=len(str(input_data)),
                flow_id=node.flow_id,
                parent_id=folder_id
            )
            self.db.add(new_file)
            self.db.commit()
            self.db.refresh(new_file)
            
            # 文件夹写入节点没有输出
            return {}
        except Exception as e:
            raise ValueError(f"文件夹写入失败: {str(e)}")


def get_node_executor(db: Session, node_type: str) -> BaseNodeExecutor:
    """
    获取节点执行器
    
    Args:
        db: 数据库会话
        node_type: 节点类型
    
    Returns:
        节点执行器实例
    
    Raises:
        ValueError: 如果节点类型不支持
    """
    executors = {
        "file_reader": FileReaderNodeExecutor,
        "fileReader": FileReaderNodeExecutor,
        "file_writer": FileWriterNodeExecutor,
        "fileWriter": FileWriterNodeExecutor,
        "folder_writer": FolderWriterNodeExecutor,
        "folderWriter": FolderWriterNodeExecutor,
        "ai": AINodeExecutor,
        "select": SelectNodeExecutor,
        "start": StartNodeExecutor,
        "end": EndNodeExecutor,
    }
    
    executor_class = executors.get(node_type)
    if not executor_class:
        raise ValueError(f"不支持的节点类型: {node_type}")
    
    return executor_class(db)
