// WebSocket服务

// WebSocket消息类型
export interface WebSocketMessage {
  type: string;
  execution_id: number;
  status?: string;
  node_id?: number;
  error?: string;
  message?: string;
  timestamp?: number;
  result?: any;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: number | null = null;
  private isDisconnecting = false;

  constructor(url: string) {
    this.url = url;
  }

  // 连接WebSocket
  connect(): void {
    if (this.ws) {
      this.ws.close();
    }
    console.log("WebSocket连接中...", this.url);
    this.isDisconnecting = false;
    this.ws = new WebSocket(this.url);

    // 连接成功
    this.ws.onopen = (event) => {
      console.log("WebSocket已经连接");
      this.reconnectAttempts = 0;
      // 开始心跳
      this.startHeartbeat();
    };

    // 接收消息
    this.ws.onmessage = (event) => {
      console.log("WebSocket收到消息:", event.data);
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.messageHandlers.forEach((handler) => handler(message));
      } catch (error) {
        console.error("WebSocket消息解析错误:", error);
      }
    };

    // 连接关闭
    this.ws.onclose = (event) => {
      console.log("WebSocket连接关闭", event);
      // 停止心跳
      this.stopHeartbeat();
      // 只有在非主动断开的情况下才重连
      if (!this.isDisconnecting) {
        this.reconnect();
      }
    };

    // 连接错误
    this.ws.onerror = (error) => {
      console.error("WebSocket错误:", error);
      // 停止心跳
      this.stopHeartbeat();
    };
  }

  // 断开WebSocket
  disconnect(): void {
    console.log("WebSocket断开连接");
    this.isDisconnecting = true;
    if (this.ws) {
      this.ws.close(1000, "Execution completed");
      this.ws = null;
    }
    // 停止心跳
    this.stopHeartbeat();
  }

  // 发送消息
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // 监听消息
  onMessage(handler: (message: WebSocketMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  // 开始心跳
  private startHeartbeat(): void {
    // 每隔30秒发送一次心跳
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send("ping");
        console.log("WebSocket发送心跳");
      }
    }, 30000);
  }

  // 停止心跳
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 重连
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("WebSocket重连失败，已达到最大重连次数");
      this.reconnectAttempts = 0;
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `WebSocket重连中... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    // 延迟重连
    setTimeout(() => {
      this.connect();
    }, 1000 * this.reconnectAttempts);
  }

  // 检查连接状态
  isReady(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// 创建WebSocket服务
export const createWebSocketService = (
  executionId: number,
  token: string,
): WebSocketService => {
  const wsUrl = `ws://localhost:8000/ws/execution/${executionId}?token=${token}`;
  return new WebSocketService(wsUrl);
};

// 自定义Hook，用于在React组件中使用WebSocket
import { useState, useEffect, useCallback, useRef } from "react";

export const useWebSocket = (
  executionId: number | null,
  token: string | null,
) => {
  const [socket, setSocket] = useState<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 存储当前的socket实例
  const currentSocket = useRef<WebSocketService | null>(null);

  // 立即创建和连接WebSocket
  const connectWebSocket = useCallback((id: number, t: string) => {
    console.log("connectWebSocket called with id:", id, "token:", t);
    const newSocket = createWebSocketService(id, t);
    setSocket(newSocket);
    currentSocket.current = newSocket;
    newSocket.connect();

    // 监听连接状态
    const checkConnection = setInterval(() => {
      const isReady = newSocket.isReady();
      console.log("WebSocket connection status:", isReady);
      setIsConnected(isReady);
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      newSocket.disconnect();
    };
  }, []);

  // 当socket变化时，更新currentSocket
  useEffect(() => {
    if (socket) {
      currentSocket.current = socket;
    }
  }, [socket]);

  // 当executionId或token变化时，重新连接
  useEffect(() => {
    if (!executionId || !token) {
      return;
    }

    console.log(
      "useEffect: connecting WebSocket with executionId:",
      executionId,
      "token:",
      token,
    );
    const cleanup = connectWebSocket(executionId, token);

    return cleanup;
  }, [executionId, token, connectWebSocket]);

  const onMessage = useCallback(
    (handler: (message: WebSocketMessage) => void) => {
      // 使用currentSocket而不是socket状态，确保能够立即获取到最新的socket实例
      const current = currentSocket.current;
      if (!current) {
        console.log("onMessage called but socket is null");
        return () => {};
      }
      console.log("onMessage called, socket is ready:", current.isReady());
      return current.onMessage(handler);
    },
    [], // 不再依赖socket状态
  );

  return { socket, isConnected, onMessage, connectWebSocket };
};
