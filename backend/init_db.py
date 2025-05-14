from app import create_app
from models import db
import logging

def init_db():
    app = create_app()
    with app.app_context():
        try:
            # Drop all existing tables
            db.drop_all()
            print("Existing tables dropped successfully!")
            
            # Create all tables
            db.create_all()
            print("Database tables created successfully!")
            
        except Exception as e:
            logging.error(f"Error initializing database: {str(e)}")
            raise

if __name__ == '__main__':
    init_db() 