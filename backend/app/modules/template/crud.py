"""
模板模块 CRUD 操作
实现模板的创建、查询、删除等操作
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.modules.template import models, schemas
from app.modules.workflow.models import Flow, Node, Edge
from app.modules.filesystem.models import File
import uuid
from datetime import datetime


def create_template(
    db: Session,
    template_data: schemas.WorkflowTemplateCreate,
    user_id: int
) -> models.WorkflowTemplate:
    """
    创建工作流模板
    
    从现有工作流创建模板，复制节点、边和文件系统
    """
    # 创建模板主记录
    db_template = models.WorkflowTemplate(
        name=template_data.name,
        description=template_data.description,
        tags=template_data.tags,
        user_id=user_id,
        source_flow_id=template_data.source_flow_id,
        use_count=0,
        share_count=0,
        is_public=False
    )
    db.add(db_template)
    db.flush()  # 获取模板ID
    
    # 复制工作流节点
    _copy_nodes_to_template(db, template_data.source_flow_id, db_template.id)
    
    # 复制工作流边
    _copy_edges_to_template(db, template_data.source_flow_id, db_template.id)
    
    # 复制文件系统
    _copy_filesystem_to_template(db, template_data.source_flow_id, db_template.id)
    
    db.commit()
    db.refresh(db_template)
    return db_template


def _copy_nodes_to_template(db: Session, flow_id: int, template_id: int) -> None:
    """复制工作流节点到模板"""
    nodes = db.query(Node).filter(Node.flow_id == flow_id).all()
    
    node_id_mapping = {}  # 用于后续边的映射
    
    for node in nodes:
        template_node = models.TemplateNode(
            template_id=template_id,
            node_type=node.node_type,
            name=node.name,
            position=node.position,
            data=node.data,
            original_node_id=node.id
        )
        db.add(template_node)
        db.flush()
        node_id_mapping[node.id] = template_node.id
    
    # 将节点ID映射存储到模板中，供后续使用
    db_template = db.query(models.WorkflowTemplate).filter(
        models.WorkflowTemplate.id == template_id
    ).first()
    if db_template:
        db_template.node_id_mapping = node_id_mapping


def _copy_edges_to_template(db: Session, flow_id: int, template_id: int) -> None:
    """复制工作流边到模板"""
    edges = db.query(Edge).filter(Edge.flow_id == flow_id).all()
    
    # 获取节点ID映射
    db_template = db.query(models.WorkflowTemplate).filter(
        models.WorkflowTemplate.id == template_id
    ).first()
    
    node_id_mapping = getattr(db_template, 'node_id_mapping', {})
    
    for edge in edges:
        # 查找对应的模板节点ID
        source_template_node_id = node_id_mapping.get(edge.source_node_id)
        target_template_node_id = node_id_mapping.get(edge.target_node_id)
        
        if source_template_node_id and target_template_node_id:
            template_edge = models.TemplateEdge(
                template_id=template_id,
                source_node_id=source_template_node_id,
                target_node_id=target_template_node_id,
                source_handle=edge.source_handle,
                target_handle=edge.target_handle,
                original_edge_id=edge.id
            )
            db.add(template_edge)


def _copy_filesystem_to_template(db: Session, flow_id: int, template_id: int) -> None:
    """复制文件系统到模板"""
    # 获取工作流的所有文件
    files = db.query(File).filter(File.flow_id == flow_id).all()
    
    file_id_mapping = {}  # 用于处理父子关系
    
    # 构建文件路径的辅助函数
    def get_file_path(file_obj: File) -> str:
        """递归获取文件的完整路径"""
        if file_obj.parent_id is None:
            return file_obj.name
        parent = db.query(File).filter(File.id == file_obj.parent_id).first()
        if parent:
            parent_path = get_file_path(parent)
            return f"{parent_path}/{file_obj.name}"
        return file_obj.name
    
    # 首先创建所有文件记录（不处理父子关系）
    for file in files:
        template_file = models.TemplateFile(
            template_id=template_id,
            name=file.name,
            type=file.type.value if hasattr(file.type, 'value') else file.type,
            content=file.content,
            size=file.size,
            path=get_file_path(file),
            original_file_id=file.id
        )
        db.add(template_file)
        db.flush()
        file_id_mapping[file.id] = template_file.id
    
    # 然后更新父子关系
    for file in files:
        if file.parent_id and file.parent_id in file_id_mapping:
            template_file_id = file_id_mapping[file.id]
            parent_template_file_id = file_id_mapping[file.parent_id]
            
            template_file = db.query(models.TemplateFile).filter(
                models.TemplateFile.id == template_file_id
            ).first()
            if template_file:
                template_file.parent_id = parent_template_file_id


def get_template(db: Session, template_id: int, user_id: Optional[int] = None) -> Optional[models.WorkflowTemplate]:
    """获取模板详情"""
    query = db.query(models.WorkflowTemplate).filter(
        models.WorkflowTemplate.id == template_id
    )
    
    # 如果不是公开模板，需要验证用户权限
    query = query.filter(
        (models.WorkflowTemplate.is_public == True) | 
        (models.WorkflowTemplate.user_id == user_id)
    )
    
    return query.first()


def get_template_detail(db: Session, template_id: int, user_id: Optional[int] = None) -> Optional[models.WorkflowTemplate]:
    """获取模板详情（包含节点、边、文件）"""
    template = get_template(db, template_id, user_id)
    if not template:
        return None
    
    # 加载关联数据
    template.nodes = db.query(models.TemplateNode).filter(
        models.TemplateNode.template_id == template_id
    ).all()
    
    template.edges = db.query(models.TemplateEdge).filter(
        models.TemplateEdge.template_id == template_id
    ).all()
    
    template.files = db.query(models.TemplateFile).filter(
        models.TemplateFile.template_id == template_id
    ).all()
    
    return template


def list_templates(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    include_public: bool = True
) -> List[models.WorkflowTemplate]:
    """获取模板列表"""
    query = db.query(models.WorkflowTemplate)
    
    if include_public:
        # 获取用户的模板 + 公开模板
        query = query.filter(
            (models.WorkflowTemplate.user_id == user_id) |
            (models.WorkflowTemplate.is_public == True)
        )
    else:
        # 只获取用户的模板
        query = query.filter(models.WorkflowTemplate.user_id == user_id)
    
    return query.order_by(desc(models.WorkflowTemplate.created_at)).offset(skip).limit(limit).all()


def delete_template(db: Session, template_id: int, user_id: int) -> bool:
    """删除模板"""
    template = db.query(models.WorkflowTemplate).filter(
        models.WorkflowTemplate.id == template_id,
        models.WorkflowTemplate.user_id == user_id
    ).first()
    
    if not template:
        return False
    
    db.delete(template)
    db.commit()
    return True


def update_template(
    db: Session,
    template_id: int,
    user_id: int,
    template_update: schemas.WorkflowTemplateUpdate
) -> Optional[models.WorkflowTemplate]:
    """更新模板信息"""
    template = db.query(models.WorkflowTemplate).filter(
        models.WorkflowTemplate.id == template_id,
        models.WorkflowTemplate.user_id == user_id
    ).first()
    
    if not template:
        return None
    
    update_data = template_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(template)
    return template


def increment_use_count(db: Session, template_id: int) -> None:
    """增加模板使用次数"""
    template = db.query(models.WorkflowTemplate).filter(
        models.WorkflowTemplate.id == template_id
    ).first()
    
    if template:
        template.use_count += 1
        db.commit()
