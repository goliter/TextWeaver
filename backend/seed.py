from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.auth.crud import get_password_hash

def seed_database():
    db = SessionLocal()
    try:
        # 检查是否已有用户数据
        if db.query(User).count() == 0:
            # 创建默认管理员用户
            admin_user = User(
                email="admin@example.com",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ 种子数据创建成功：默认管理员账户已添加")
        else:
            print("ℹ️  数据库已有数据，跳过种子操作")
    except Exception as e:
        print(f"❌ 种子数据创建失败：{e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
