import sqlite3

conn = sqlite3.connect("apps/backend/bonnivo.db")
tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print(f"Total tables: {len(tables)}")
print("Admin tables:", [t for t in tables if "admin" in t])
conn.close()
