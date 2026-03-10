from app.core.database import engine
from sqlalchemy import text

# 要清空的表列表，按照依赖关系排序
tables_to_truncate = [
    'execution_logs',
    'file_snapshots',  # 先清空引用执行记录的表
    'executions',
    'edges',
    'nodes',
    'files',
    'workflow_templates',
    'template_files',
    'template_edges',
    'template_nodes',
    'users'
]

def reset_database():
    print("🔄 开始重置数据库...")
    
    with engine.connect() as conn:
        for table in tables_to_truncate:
            try:
                print(f"🗑️  清空 {table} 表...")
                conn.execute(text(f'TRUNCATE TABLE {table} RESTART IDENTITY CASCADE'))
                conn.commit()
                print(f"✅ {table} 表已清空")
            except Exception as e:
                print(f"⚠️  清空 {table} 表时出错: {e}")
                # 继续执行其他表的清空
                conn.rollback()
    
    # 重新运行迁移
    print("\n🔄 重新运行数据库迁移...")
    import subprocess
    result = subprocess.run(['alembic', 'upgrade', 'head'], 
                          cwd='e:\My Project\ai-work-flow\TextWeaver\backend',
                          capture_output=True, 
                          text=True)
    print(f"迁移输出: {result.stdout}")
    if result.stderr:
        print(f"迁移错误: {result.stderr}")
    
    print("\n✅ 数据库重置完成！")

if __name__ == "__main__":
    reset_database()