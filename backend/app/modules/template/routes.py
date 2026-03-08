"""
模板模块 API 路由
提供模板的创建、查询、使用等接口
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.template import crud, schemas, file_service
from app.modules.auth.models import User
from app.modules.auth.jwt import get_current_active_user
from app.modules.workflow.crud import create_flow, create_node, create_edge
from app.modules.workflow import schemas as workflow_schemas

router = APIRouter(prefix="/templates", tags=["templates"])


@router.post("", response_model=schemas.WorkflowTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    template_data: schemas.WorkflowTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    创建工作流模板
    
    从现有工作流创建模板，包含节点、边和文件系统
    """
    # 验证工作流存在且属于当前用户
    from app.modules.workflow.models import Flow
    flow = db.query(Flow).filter(
        Flow.id == template_data.source_flow_id,
        Flow.user_id == current_user.id
    ).first()
    
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="工作流不存在或无权限"
        )
    
    template = crud.create_template(db, template_data, current_user.id)
    return template


@router.get("", response_model=List[schemas.WorkflowTemplateList])
def list_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    include_public: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取模板列表
    
    返回当前用户的模板和公开模板
    """
    templates = crud.list_templates(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        include_public=include_public
    )
    return templates


@router.get("/market", response_model=schemas.TemplateMarketList)
def get_template_market(
    keyword: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    sort_by: str = Query("use_count"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取模板市场列表
    
    返回所有公开分享的模板
    """
    from sqlalchemy import desc, asc, or_
    from app.modules.template.models import WorkflowTemplate
    
    query = db.query(WorkflowTemplate).filter(WorkflowTemplate.is_public == True)
    
    # 关键词搜索
    if keyword:
        query = query.filter(
            or_(
                WorkflowTemplate.name.ilike(f"%{keyword}%"),
                WorkflowTemplate.description.ilike(f"%{keyword}%")
            )
        )
    
    # 标签筛选
    if tags:
        # 简化处理：检查tags字段是否包含任一指定标签
        for tag in tags:
            query = query.filter(WorkflowTemplate.tags.contains([tag]))
    
    # 排序
    if sort_order == "desc":
        query = query.order_by(desc(getattr(WorkflowTemplate, sort_by, WorkflowTemplate.use_count)))
    else:
        query = query.order_by(asc(getattr(WorkflowTemplate, sort_by, WorkflowTemplate.use_count)))
    
    total = query.count()
    templates = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "templates": templates,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/{template_id}", response_model=schemas.WorkflowTemplateDetail)
def get_template_detail(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取模板详情
    
    包含节点、边和文件系统的完整信息
    """
    template = crud.get_template_detail(db, template_id, current_user.id)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模板不存在或无权限"
        )
    
    return template


@router.post("/{template_id}/use", response_model=schemas.UseTemplateResponse)
def use_template(
    template_id: int,
    use_data: schemas.UseTemplateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    使用模板创建工作流
    
    从模板创建新的工作流，复制所有节点、边和文件系统
    """
    # 获取模板详情
    template = crud.get_template_detail(db, template_id, current_user.id)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模板不存在或无权限"
        )
    
    try:
        # 1. 创建工作流
        flow_data = workflow_schemas.FlowCreate(
            name=use_data.name,
            description=use_data.description or template.description
        )
        new_flow = create_flow(db, flow_data, current_user.id)
        
        # 2. 删除自动创建的根文件夹（因为我们会从模板复制文件系统）
        from app.modules.filesystem.models import File
        auto_created_root = db.query(File).filter(
            File.flow_id == new_flow.id,
            File.parent_id.is_(None),
            File.type == 'folder'
        ).first()
        if auto_created_root:
            db.delete(auto_created_root)
            db.flush()
        
        # 3. 复制文件系统
        file_id_mapping = file_service.copy_template_filesystem_to_workflow(
            db, template_id, new_flow.id
        )
        
        # 4. 创建节点
        node_id_mapping = {}
        original_to_new_node_mapping = {}
        for template_node in template.nodes:
            node_data = workflow_schemas.NodeCreate(
                node_type=template_node.node_type,
                name=template_node.name,
                position=template_node.position,
                data=template_node.data
            )
            new_node = create_node(db, node_data, new_flow.id, current_user.id)
            node_id_mapping[template_node.id] = new_node.id
            # 保存原始节点ID到新节点ID的映射
            if template_node.original_node_id:
                original_to_new_node_mapping[template_node.original_node_id] = new_node.id
        
        # 5. 创建边
        for template_edge in template.edges:
            source_node_id = node_id_mapping.get(template_edge.source_node_id)
            target_node_id = node_id_mapping.get(template_edge.target_node_id)
            
            if source_node_id and target_node_id:
                edge_data = workflow_schemas.EdgeCreate(
                    source_node_id=source_node_id,
                    target_node_id=target_node_id,
                    source_handle=template_edge.source_handle,
                    target_handle=template_edge.target_handle
                )
                create_edge(db, edge_data, new_flow.id, current_user.id)
        
        # 6. 更新节点中的文件路径引用和prompt占位符
        file_service.update_node_file_paths(db, template_id, new_flow.id, file_id_mapping, original_to_new_node_mapping)
        
        # 7. 增加模板使用次数
        crud.increment_use_count(db, template_id)
        
        return {
            "flow_id": new_flow.id,
            "message": "工作流创建成功"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建工作流失败: {str(e)}"
        )


@router.put("/{template_id}", response_model=schemas.WorkflowTemplateResponse)
def update_template(
    template_id: int,
    template_update: schemas.WorkflowTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    更新模板信息
    """
    template = crud.update_template(db, template_id, current_user.id, template_update)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模板不存在或无权限"
        )
    
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    删除模板
    """
    success = crud.delete_template(db, template_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模板不存在或无权限"
        )
    
    return None


# ==================== 模板分享相关接口 ====================

@router.post("/{template_id}/share", response_model=schemas.TemplateShareResponse)
def create_share(
    template_id: int,
    share_data: schemas.TemplateShareCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    创建模板分享
    """
    from app.modules.template.models import TemplateShare, SharePermission
    import uuid
    
    # 验证模板存在且属于当前用户
    template = crud.get_template(db, template_id, current_user.id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模板不存在或无权限"
        )
    
    # 创建分享记录
    share_token = str(uuid.uuid4())
    db_share = TemplateShare(
        template_id=template_id,
        share_token=share_token,
        permission=SharePermission(share_data.permission),
        expires_at=share_data.expires_at
    )
    db.add(db_share)
    
    # 更新模板分享次数
    template.share_count += 1
    
    db.commit()
    db.refresh(db_share)
    
    # 构建分享链接
    share_url = f"/shared/template/{share_token}"
    
    return {
        **db_share.__dict__,
        "share_url": share_url
    }


@router.get("/shared/{share_token}", response_model=schemas.SharedTemplateResponse)
def get_shared_template(
    share_token: str,
    db: Session = Depends(get_db)
):
    """
    通过分享链接获取模板
    """
    from app.modules.template.models import TemplateShare
    from datetime import datetime
    
    # 查找分享记录
    share = db.query(TemplateShare).filter(
        TemplateShare.share_token == share_token
    ).first()
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="分享链接不存在"
        )
    
    # 检查是否过期
    if share.expires_at and share.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="分享链接已过期"
        )
    
    # 增加访问次数
    share.access_count += 1
    db.commit()
    
    # 获取模板详情
    template = crud.get_template_detail(db, share.template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模板不存在"
        )
    
    return {
        "template": template,
        "share_info": share
    }


@router.delete("/{template_id}/share", status_code=status.HTTP_204_NO_CONTENT)
def revoke_share(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    撤销模板分享
    """
    from app.modules.template.models import TemplateShare
    
    # 验证模板存在且属于当前用户
    template = crud.get_template(db, template_id, current_user.id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模板不存在或无权限"
        )
    
    # 删除所有分享记录
    db.query(TemplateShare).filter(
        TemplateShare.template_id == template_id
    ).delete()
    
    db.commit()
    return None
