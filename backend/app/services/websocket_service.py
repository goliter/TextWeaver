"""
WebSocket服务
提供实时通讯功能，用于工作流执行状态推送
"""

import asyncio
import time
from typing import Dict, Set, Any
from fastapi import WebSocket


class ConnectionManager:
    """
    WebSocket连接管理器
    管理所有客户端连接，处理消息广播
    """
    
    def __init__(self):
        # 存储活动连接 {execution_id: Set[WebSocket]}
        self.execution_connections: Dict[int, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, execution_id: int):
        """
        接受WebSocket连接
        
        Args:
            websocket: WebSocket连接对象
            execution_id: 执行ID
        """
        await websocket.accept()
        
        # 添加到执行连接集合
        if execution_id not in self.execution_connections:
            self.execution_connections[execution_id] = set()
        self.execution_connections[execution_id].add(websocket)
        
        print(f"WebSocket连接成功: execution_id={execution_id}")
    
    def disconnect(self, websocket: WebSocket, execution_id: int):
        """
        断开WebSocket连接
        
        Args:
            websocket: WebSocket连接对象
            execution_id: 执行ID
        """
        # 从执行连接集合中移除
        if execution_id in self.execution_connections:
            if websocket in self.execution_connections[execution_id]:
                self.execution_connections[execution_id].remove(websocket)
                # 如果执行没有连接了，移除执行
                if not self.execution_connections[execution_id]:
                    del self.execution_connections[execution_id]
                print(f"WebSocket连接断开: execution_id={execution_id}")
    
    async def broadcast_to_execution(self, execution_id: int, message: Dict[str, Any]):
        """
        向指定执行的所有连接广播消息
        
        Args:
            execution_id: 执行ID
            message: 消息内容
        """
        if execution_id in self.execution_connections:
            for connection in list(self.execution_connections[execution_id]):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    # 连接可能已断开，移除
                    print(f"发送消息失败: {str(e)}")
                    self.execution_connections[execution_id].remove(connection)
                    if not self.execution_connections[execution_id]:
                        del self.execution_connections[execution_id]


# 创建全局连接管理器实例
manager = ConnectionManager()


async def send_execution_status(execution_id: int, status: str, node_id: int = None, error: str = None):
    """
    发送执行状态消息
    
    Args:
        execution_id: 执行ID
        status: 状态（start, running, success, error）
        node_id: 节点ID
        error: 错误信息
    """
    message = {
        "type": "execution_status",
        "execution_id": execution_id,
        "status": status,
        "node_id": node_id,
        "error": error,
        "timestamp": int(time.time() * 1000)
    }
    await manager.broadcast_to_execution(execution_id, message)


async def send_node_status(execution_id: int, node_id: int, status: str, result: Any = None, error: str = None):
    """
    发送节点执行状态消息
    
    Args:
        execution_id: 执行ID
        node_id: 节点ID
        status: 状态（start, success, error）
        result: 执行结果
        error: 错误信息
    """
    message = {
        "type": "node_status",
        "execution_id": execution_id,
        "node_id": node_id,
        "status": status,
        "result": result,
        "error": error,
        "timestamp": int(time.time() * 1000)
    }
    await manager.broadcast_to_execution(execution_id, message)