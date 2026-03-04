from typing import Dict, Any
from app.modules.workflow.models import Node
from app.modules.workflow.nodes.base import NodeExecutor
from app.modules.ai.service import langchain_service
import logging

logger = logging.getLogger(__name__)


class AINodeExecutor(NodeExecutor):
    """AI节点执行器"""
    
    def execute(self, node: Node, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行AI节点
        
        Args:
            node: AI节点
            input_data: 输入数据
        
        Returns:
            输出数据
        """
        logger.info(f"Executing AI node: {node.name}")
        
        # 获取AI节点配置
        model = node.data.get("model", "gpt-3.5-turbo")
        prompt = node.data.get("prompt", "请处理以下内容: {input}")
        system_prompt = node.data.get("system_prompt", "")
        
        # 使用 LangChain 生成文本
        try:
            if system_prompt:
                # 使用系统提示词
                result = langchain_service.generate_with_system_prompt(
                    system_prompt=system_prompt,
                    user_prompt=prompt,
                    context=input_data
                )
            else:
                # 仅使用用户提示词
                result = langchain_service.generate_text(
                    prompt=prompt,
                    context=input_data
                )
            
            output_data = {
                "response": result,
                "model": model
            }
            
            logger.info(f"AI node execution completed: {node.name}")
            return output_data
            
        except Exception as e:
            logger.error(f"AI node execution failed: {str(e)}")
            raise
