import sqlite3
from pathlib import Path

db_path = Path("apps/backend/bonnivo.db")
if not db_path.exists():
    print("Database bonnivo.db not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [t[0] for t in cursor.fetchall()]
print(f"Total tables: {len(tables)}")
print("Tables:", ", ".join(tables))

for check_table in ["users", "canonical_products", "categories", "seller_offers", "orders", "wallets", "pets"]:
    if check_table in tables:
        cursor.execute(f"SELECT count(*) FROM {check_table};")
        count = cursor.fetchone()[0]
        print(f"  - {check_table}: {count} records")
    else:
        print(f"  - {check_table}: TABLE NOT FOUND")

conn.close()
