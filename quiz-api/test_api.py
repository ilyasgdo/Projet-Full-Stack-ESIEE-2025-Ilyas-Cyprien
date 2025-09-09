#!/usr/bin/env python3
"""
Script de test simple pour valider les endpoints de l'API Quiz
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test endpoint de santé"""
    response = requests.get(f"{BASE_URL}/")
    print(f"Health check: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
    return response.status_code == 200

def test_quiz_info():
    """Test endpoint quiz-info"""
    response = requests.get(f"{BASE_URL}/quiz-info")
    print(f"Quiz info: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Size: {data.get('size')}, Scores count: {len(data.get('scores', []))}")
    return response.status_code == 200

def test_admin_login():
    """Test login admin"""
    payload = {"password": "iloveflask"}
    response = requests.post(f"{BASE_URL}/login", json=payload)
    print(f"Admin login: {response.status_code}")
    if response.status_code == 200:
        token = response.json().get('token')
        print(f"Token received: {token[:20]}...")
        return token
    return None

def test_get_question():
    """Test récupération question par position"""
    response = requests.get(f"{BASE_URL}/questions?position=1")
    print(f"Get question: {response.status_code}")
    if response.status_code == 200:
        question = response.json().get('question')
        print(f"Question: {question.get('title')}")
    return response.status_code == 200

def test_create_question(token):
    """Test création de question"""
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": "Question Test",
        "text": "Ceci est une question de test ?",
        "position": 4,
        "possibleAnswers": [
            {"text": "Réponse A", "isCorrect": False},
            {"text": "Réponse B", "isCorrect": True},
            {"text": "Réponse C", "isCorrect": False},
            {"text": "Réponse D", "isCorrect": False}
        ]
    }
    response = requests.post(f"{BASE_URL}/questions", json=payload, headers=headers)
    print(f"Create question: {response.status_code}")
    if response.status_code == 201:
        question_id = response.json().get('id')
        print(f"Created question ID: {question_id}")
        return question_id
    return None

def main():
    print("=== Test API Quiz ===")
    
    # Test des endpoints publics
    print("\n--- Tests publics ---")
    test_health()
    test_quiz_info()
    test_get_question()
    
    # Test authentification
    print("\n--- Tests admin ---")
    token = test_admin_login()
    
    if token:
        # Test création de question
        question_id = test_create_question(token)
        
        if question_id:
            print(f"✅ Tous les tests passés avec succès!")
        else:
            print("❌ Échec création de question")
    else:
        print("❌ Échec authentification admin")

if __name__ == "__main__":
    main()
