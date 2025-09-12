from functools import wraps
from flask import request
import logging

# GET RID OF LATER!!!!
def log_function_input(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get logger from the calling module
        logger = logging.getLogger(f.__module__)
        func_name = f.__name__
        logger.info(f"=== {func_name} called ===")
        logger.info(f"Args: {args}")
        logger.info(f"Kwargs: {kwargs}")
        
        # Log request data if it's a Flask request
        if hasattr(request, 'get_json'):
            try:
                request_data = request.get_json()
                logger.info(f"Request JSON: {request_data}")
            except:
                logger.info("No JSON data in request")
        
        if hasattr(request, 'headers'):
            logger.info(f"Headers: {dict(request.headers)}")
        
        result = f(*args, **kwargs)
        logger.info(f"=== {func_name} completed ===")
        return result
    return decorated_function
