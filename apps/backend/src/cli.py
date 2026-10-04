import sys
import argparse
import asyncio
from datetime import datetime, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import getpass
from src.core.database import AsyncSessionLocal
from src.models.admin import AdminUser, AdminAuditLog
from src.core.admin_security import hash_password
from sqlalchemy import select, or_


async def create_admin(username: str, email: str, password: str, full_name: str, totp_enabled: bool = False):
    if len(password) < 8:
        print("[!] خطا: گذرواژه ادمین باید حداقل ۸ کاراکتر باشد.")
        sys.exit(1)

    async with AsyncSessionLocal() as session:
        # Check uniqueness
        stmt = select(AdminUser).where(
            or_(AdminUser.username == username.strip(), AdminUser.email == email.strip().lower())
        )
        res = await session.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            print(f"[!] خطا: مدیر با این نام کاربری ({username}) یا ایمیل ({email}) از قبل وجود دارد.")
            sys.exit(1)

        hashed = hash_password(password)
        admin = AdminUser(
            username=username.strip(),
            email=email.strip().lower(),
            full_name=full_name.strip(),
            password_hash=hashed,
            is_active=True,
            failed_login_attempts=0,
            totp_enabled=totp_enabled,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(admin)
        await session.flush()

        audit = AdminAuditLog(
            admin_id=admin.id,
            admin_username=admin.username,
            action="CLI_ADMIN_CREATED",
            details=f"حساب مدیر با نام {admin.username} و ایمیل {admin.email} از طریق CLI ایجاد شد.",
            created_at=datetime.now(timezone.utc),
        )
        session.add(audit)
        await session.commit()

        print(f"[+] موفق: مدیر با شناسه {admin.id} و نام کاربری '{admin.username}' با موفقیت ساخته شد.")


def main():
    parser = argparse.ArgumentParser(description="Bonnivo Admin Management CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    create_parser = subparsers.add_parser("create-admin", help="ایجاد کاربر ادمین جدید")
    create_parser.add_argument("--username", required=True, help="نام کاربری مدیر")
    create_parser.add_argument("--email", required=True, help="ایمیل مدیر")
    create_parser.add_argument("--full-name", required=True, help="نام و نام خانوادگی مدیر")
    create_parser.add_argument("--totp", action="store_true", help="فعال‌سازی ورود دو مرحله‌ای")

    args = parser.parse_args()

    if args.command == "create-admin":
        password = getpass.getpass("گذرواژه ادمین را وارد کنید (حداقل ۸ کاراکتر): ")
        confirm = getpass.getpass("تکرار گذرواژه: ")
        if password != confirm:
            print("[!] خطا: گذرواژه‌های وارد شده یکسان نیستند.")
            sys.exit(1)
        if len(password) < 8:
            print("[!] خطا: گذرواژه ادمین باید حداقل ۸ کاراکتر باشد.")
            sys.exit(1)

        asyncio.run(
            create_admin(
                username=args.username,
                email=args.email,
                password=password,
                full_name=args.full_name,
                totp_enabled=args.totp,
            )
        )


if __name__ == "__main__":
    main()
