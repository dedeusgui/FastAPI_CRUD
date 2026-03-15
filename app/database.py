import sqlite3

conn = sqlite3.connect("user.db")
cursor = conn.cursor()
cursor.execute(
    """ CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL
)"""
)
conn.commit()
conn.close()
