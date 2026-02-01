from app.core.database import engine, SessionLocal
from app.modules.auth.models import User
from sqlalchemy import text

def reset_database():
    print("🔄 开始重置数据库...")
    
    # 1. 清空 users 表
    print("🗑️  清空 users 表...")
    with engine.connect() as conn:
        conn.execute(text('TRUNCATE TABLE users RESTART IDENTITY CASCADE'))
        conn.commit()
    print("✅ users 表已清空")
    
    # 2. 验证清空结果
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        print(f"📊 清空后用户数量: {user_count}")
    finally:
        db.close()
    
    print("✅ 数据库重置完成！")

if __name__ == "__main__":
    reset_database()
