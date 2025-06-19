import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/sama_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # API Keys
    NREL_API_KEY = os.getenv('NREL_API_KEY')
    HOLIDAY_API_KEY = os.getenv('HOLIDAY_API_KEY')
    
    # App configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # File upload configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sama_python/content')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True) 