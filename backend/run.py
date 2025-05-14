import os
import subprocess
import sys

def run_app():
    try:
        # Start Flask application
        print("Starting Flask application...")
        os.environ['FLASK_APP'] = 'app.py'
        os.environ['FLASK_ENV'] = 'development'
        
        # Run Flask
        subprocess.run(['flask', 'run', '--host=127.0.0.1', '--port=5000'])
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    run_app() 