"""
WebSocket路由
处理WebSocket连接和消息
"""

from fastapi import WebSocket, APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.websocket_service import manager

# 创建路由
router = APIRouter(prefix="/ws")


@router.websocket("/execution/{execution_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    execution_id: int,
    db: Session = Depends(get_db)
):
    """
    WebSocket端点 - 用于工作流执行状态推送
    
    Args:
        websocket: WebSocket连接对象
        execution_id: 执行ID
        db: 数据库会话
    """
    try:
        # 接受连接
        await manager.connect(websocket, execution_id)
        
        # 发送连接成功消息
        await websocket.send_json({
            "type": "connection_success",
            "message": "WebSocket连接成功",
            "execution_id": execution_id
        })
        
        # 心跳检测
        while True:
            try:
                # 等待客户端消息
                data = await websocket.receive_text()
                # 处理心跳消息
                if data == "ping":
                    await websocket.send_json({"type": "pong"})
                else:
                    # 处理其他消息
                    print(f"收到消息: {data}")
            except Exception as e:
                print(f"接收消息错误: {str(e)}")
                break
                
    except Exception as e:
        # 其他错误
        print(f"WebSocket错误: {str(e)}")
    finally:
        # 断开连接
        manager.disconnect(websocket, execution_id)