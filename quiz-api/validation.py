import base64
import re
from flask import current_app

def validate_base64_image(base64_string):
    """
    Valide une image encodée en base64
    
    Args:
        base64_string (str): L'image encodée en base64
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not base64_string:
        return True, None  # Image optionnelle
    
    try:
        # Vérifier le format data:image/...;base64,
        if not base64_string.startswith('data:image/'):
            return False, "Format d'image invalide. Utilisez le format data:image/...;base64,..."
        
        # Extraire le type MIME et les données base64
        header, data = base64_string.split(',', 1)
        
        # Vérifier le type MIME
        mime_match = re.match(r'data:image/(jpeg|jpg|png|gif|webp);base64', header)
        if not mime_match:
            return False, "Type d'image non supporté. Formats acceptés: JPEG, PNG, GIF, WebP"
        
        # Décoder les données base64
        try:
            image_data = base64.b64decode(data)
        except Exception:
            return False, "Données base64 invalides"
        
        # Vérifier la taille
        max_size = current_app.config.get('MAX_IMAGE_SIZE_BYTES', 1024 * 1024)  # 1MB par défaut
        if len(image_data) > max_size:
            max_size_mb = max_size / (1024 * 1024)
            return False, f"L'image est trop volumineuse. Taille maximale autorisée: {max_size_mb:.1f}MB"
        
        return True, None
        
    except Exception as e:
        return False, f"Erreur lors de la validation de l'image: {str(e)}"

def get_image_size_bytes(base64_string):
    """
    Retourne la taille en bytes d'une image base64
    
    Args:
        base64_string (str): L'image encodée en base64
        
    Returns:
        int: Taille en bytes, ou 0 si erreur
    """
    if not base64_string or not base64_string.startswith('data:image/'):
        return 0
    
    try:
        _, data = base64_string.split(',', 1)
        image_data = base64.b64decode(data)
        return len(image_data)
    except Exception:
        return 0