"""
模板文件系统服务
实现模板与工作流之间的文件系统复制
"""

from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from app.modules.template import models as template_models
from app.modules.filesystem.models import File, FileType
from app.modules.filesystem import schemas as filesystem_schemas


def copy_template_filesystem_to_workflow(
    db: Session,
    template_id: int,
    flow_id: int
) -> Dict[int, int]:
    """
    将模板的文件系统复制到新工作流
    
    Args:
        db: 数据库会话
        template_id: 模板ID
        flow_id: 目标工作流ID
    
    Returns:
        文件ID映射 {template_file_id: new_file_id}
    """
    # 获取模板的所有文件
    template_files = db.query(template_models.TemplateFile).filter(
        template_models.TemplateFile.template_id == template_id
    ).all()
    
    # 创建文件ID映射
    file_id_mapping = {}
    
    # 首先创建所有文件（不处理父子关系）
    for template_file in template_files:
        new_file = File(
            flow_id=flow_id,
            name=template_file.name,
            type=FileType(template_file.type) if template_file.type in ['file', 'folder'] else FileType.FILE,
            content=template_file.content,
            size=template_file.size
        )
        db.add(new_file)
        db.flush()
        file_id_mapping[template_file.id] = new_file.id
    
    # 然后更新父子关系
    for template_file in template_files:
        if template_file.parent_id and template_file.parent_id in file_id_mapping:
            new_file_id = file_id_mapping[template_file.id]
            new_parent_id = file_id_mapping[template_file.parent_id]
            
            new_file = db.query(File).filter(File.id == new_file_id).first()
            if new_file:
                new_file.parent_id = new_parent_id
    
    db.commit()
    return file_id_mapping


def update_node_file_paths(
    db: Session,
    template_id: int,
    flow_id: int,
    file_id_mapping: Dict[int, int],
    original_to_new_node_mapping: Dict[int, int] = None
) -> None:
    """
    更新节点中的文件路径引用和节点ID占位符
    
    将节点中的文件ID从原始工作流ID更新为新工作流的文件ID
    同时更新prompt中的节点ID占位符
    """
    from app.modules.workflow.models import Node
    import re
    
    # 获取新工作流的所有节点
    nodes = db.query(Node).filter(Node.flow_id == flow_id).all()
    
    # 构建原始文件ID到新文件ID的映射
    # file_id_mapping 是 {template_file_id: new_file_id}
    # 需要转换为 {original_file_id: new_file_id}
    original_to_new_mapping = {}
    template_files = db.query(template_models.TemplateFile).filter(
        template_models.TemplateFile.template_id == template_id
    ).all()
    
    for template_file in template_files:
        if template_file.original_file_id and template_file.id in file_id_mapping:
            original_to_new_mapping[template_file.original_file_id] = file_id_mapping[template_file.id]
    
    # 如果没有传入节点映射，则构建它
    if original_to_new_node_mapping is None:
        # 需要从模板节点获取原始节点ID
        template_nodes = db.query(template_models.TemplateNode).filter(
            template_models.TemplateNode.template_id == template_id
        ).all()
        
        original_to_new_node_mapping = {}
        for template_node in template_nodes:
            # 找到对应的新节点
            new_node = db.query(Node).filter(
                Node.flow_id == flow_id,
                Node.node_type == template_node.node_type,
                Node.name == template_node.name
            ).first()
            if new_node and template_node.original_node_id:
                original_to_new_node_mapping[template_node.original_node_id] = new_node.id
    
    # 更新节点中的文件引用和prompt占位符
    for node in nodes:
        updated = False
        node_data = node.data.copy() if node.data else {}
        
        # 根据节点类型更新文件引用
        if node.node_type in ['file_reader', 'file_writer']:
            # 文件读取/写入节点
            if 'fileId' in node_data:
                old_file_id = node_data.get('fileId')
                # 使用映射表更新文件ID
                if old_file_id in original_to_new_mapping:
                    node_data['fileId'] = original_to_new_mapping[old_file_id]
                    updated = True
        
        elif node.node_type == 'folder_writer':
            # 文件夹写入节点
            if 'folderId' in node_data:
                old_folder_id = node_data.get('folderId')
                # 使用映射表更新文件夹ID
                if old_folder_id in original_to_new_mapping:
                    node_data['folderId'] = original_to_new_mapping[old_folder_id]
                    updated = True
        
        # 更新prompt中的节点ID占位符
        if 'prompt' in node_data and node_data['prompt']:
            prompt = node_data['prompt']
            original_prompt = prompt
            
            # 替换文件节点占位符 {file_66} - 使用节点ID映射
            # {file_XX} 表示文件读取节点的ID，不是文件系统中的文件ID
            if original_to_new_node_mapping:
                for old_node_id, new_node_id in original_to_new_node_mapping.items():
                    prompt = prompt.replace(f'{{file_{old_node_id}}}', f'{{file_{new_node_id}}}')
            
            # 替换输入节点占位符 {input_104}
            if original_to_new_node_mapping:
                for old_node_id, new_node_id in original_to_new_node_mapping.items():
                    prompt = prompt.replace(f'{{input_{old_node_id}}}', f'{{input_{new_node_id}}}')
            
            if prompt != original_prompt:
                node_data['prompt'] = prompt
                updated = True
        
        if updated:
            node.data = node_data
    
    db.commit()


def get_template_files_tree(
    db: Session,
    template_id: int,
    parent_id: Optional[int] = None
) -> List[Dict]:
    """
    获取模板文件系统的树形结构
    
    Args:
        db: 数据库会话
        template_id: 模板ID
        parent_id: 父文件夹ID（None表示根目录）
    
    Returns:
        文件树列表
    """
    files = db.query(template_models.TemplateFile).filter(
        template_models.TemplateFile.template_id == template_id,
        template_models.TemplateFile.parent_id == parent_id
    ).all()
    
    result = []
    for file in files:
        file_dict = {
            'id': file.id,
            'name': file.name,
            'type': file.type,
            'size': file.size,
            'path': file.path,
            'children': []
        }
        
        # 如果是文件夹，递归获取子文件
        if file.type == 'folder':
            file_dict['children'] = get_template_files_tree(db, template_id, file.id)
        
        result.append(file_dict)
    
    return result
