import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from flask import Flask
from dotenv import load_dotenv, set_key
from models import db
from config import Config

# Load .env
load_dotenv()

# Config from .env or defaults
DB_NAME = os.getenv("PG_DB", "sama_db")
DB_USER = os.getenv("PG_USER", "sama_user")
DB_PASS = os.getenv("PG_PASS", "sama_pass")
DB_HOST = os.getenv("PG_HOST", "localhost")
DB_PORT = os.getenv("PG_PORT", "5432")
SUPERPASS = os.getenv("PG_SUPERPASS", "postgres")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
RESET = "--reset" in sys.argv

def run_sql_as_superuser(commands):
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password=SUPERPASS,
        host=DB_HOST,
        port=DB_PORT
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    for command in commands:
        try:
            cur.execute(command)
        except psycopg2.Error as e:
            print(f"⚠️  SQL error: {e.pgerror.strip()}")
    cur.close()
    conn.close()

def reset_db():
    print(f"🔁 Dropping database '{DB_NAME}' if it exists...")
    run_sql_as_superuser([
        f"DROP DATABASE IF EXISTS {DB_NAME};"
    ])

def create_user_and_db():
    print(f"🛠️ Creating user '{DB_USER}' and database '{DB_NAME}'...")
    run_sql_as_superuser([
        f"CREATE USER {DB_USER} WITH PASSWORD '{DB_PASS}';",
        f"CREATE DATABASE {DB_NAME} OWNER {DB_USER};",
        f"GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER};"
    ])

def write_env_database_url():
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.getenv("DATABASE_URL"):
        set_key(env_path, "DATABASE_URL", DATABASE_URL)
        print(f"✅ DATABASE_URL added to .env")

def create_tables():
    class TempConfig(Config):
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    app = Flask(__name__)
    app.config.from_object(TempConfig)
    db.init_app(app)
    with app.app_context():
        db.create_all()
        print("✅ Tables created.")

if __name__ == "__main__":
    if RESET:
        reset_db()
    try:
        create_user_and_db()
    except Exception as e:
        print(f"⚠️  Skipped creation (likely already exists): {e}")
    write_env_database_url()
    create_tables()
