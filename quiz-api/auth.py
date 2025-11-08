"""
Authentication module for JWT token generation and validation.

Provides functions for creating JWT tokens and protecting routes with token authentication.
"""
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app

def generate_token(user_id="admin"):
    """Generate a JWT token for authentication.
    
    Creates a JWT token with user ID, expiration time (24 hours), and issue time.
    Uses the application's SECRET_KEY for signing.
    
    Args:
        user_id: String user identifier (default: "admin")
        
    Returns:
        String JWT token encoded with HS256 algorithm
    """
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    return token

def verify_token(token):
    """Verify and decode a JWT token.
    
    Validates the token signature and checks expiration.
    
    Args:
        token: String JWT token to verify
        
    Returns:
        Dictionary payload if token is valid, None if expired or invalid
    """
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require JWT authentication for a route.
    
    Extracts the Bearer token from the Authorization header and verifies it.
    Returns 401 error if token is missing, invalid, or expired.
    
    Args:
        f: Function to decorate (Flask route handler)
        
    Returns:
        Decorated function that checks authentication before executing
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        payload = verify_token(token)
        if payload is None:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        return f(*args, **kwargs)
    
    return decorated
