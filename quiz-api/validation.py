"""
Image validation module.

Provides functions to validate base64-encoded images, checking format,
size, and MIME type compatibility.
"""
import base64
import re
from flask import current_app

def validate_base64_image(base64_string):
    """Validate a base64-encoded image string.
    
    Checks if the image is in a valid format (JPEG, PNG, GIF, WebP),
    decodes the base64 data, and verifies the size does not exceed 1MB.
    
    Args:
        base64_string: String base64-encoded image (may include data URI prefix)
        
    Returns:
        Tuple of (bool, str): (True, None) if valid, (False, error_message) if invalid
    """
    if not base64_string:
        return True, None
    
    try:
        if not base64_string.startswith('data:image/'):
            return True, None
        
        header, data = base64_string.split(',', 1)
        
        mime_match = re.match(r'data:image/(jpeg|jpg|png|gif|webp);base64', header)
        if not mime_match:
            return False, "Type d'image non supporté. Formats acceptés: JPEG, PNG, GIF, WebP"
        
        try:
            image_data = base64.b64decode(data)
        except Exception:
            return False, "Données base64 invalides"
        
        max_size = current_app.config.get('MAX_IMAGE_SIZE_BYTES', 1024 * 1024)
        if len(image_data) > max_size:
            max_size_mb = max_size / (1024 * 1024)
            return False, f"L'image est trop volumineuse. Taille maximale autorisée: {max_size_mb:.1f}MB"
        
        return True, None
        
    except Exception as e:
        return False, f"Erreur lors de la validation de l'image: {str(e)}"

def get_image_size_bytes(base64_string):
    """Get the size in bytes of a base64-encoded image.
    
    Decodes the base64 string and returns the size of the decoded image data.
    
    Args:
        base64_string: String base64-encoded image (may include data URI prefix)
        
    Returns:
        Integer size in bytes, or 0 if unable to decode
    """
    if not base64_string or not base64_string.startswith('data:image/'):
        return 0
    
    try:
        _, data = base64_string.split(',', 1)
        image_data = base64.b64decode(data)
        return len(image_data)
    except Exception:
        return 0