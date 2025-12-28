"""
Quiz API Unit Tests

Tests unitaires pour l'API Flask du quiz.
Couvre les endpoints publics et admin avec opérations CRUD.
"""
import pytest
import json
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db
from models import Question, Answer, Participation


@pytest.fixture
def client():
    """Create a test client with in-memory database."""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()


@pytest.fixture
def auth_token(client):
    """Get admin authentication token."""
    response = client.post('/login', 
        data=json.dumps({'password': 'iloveflask'}),
        content_type='application/json'
    )
    data = json.loads(response.data)
    return data.get('token')


class TestHealthCheck:
    """Tests for health check endpoint."""
    
    def test_health_check_returns_200(self, client):
        """Test that health check endpoint returns 200."""
        response = client.get('/')
        assert response.status_code == 200
    
    def test_health_check_returns_json(self, client):
        """Test that health check returns proper JSON structure."""
        response = client.get('/')
        data = json.loads(response.data)
        assert 'message' in data
        assert 'version' in data
        assert data['message'] == 'Quiz API is running!'


class TestAuthentication:
    """Tests for authentication endpoints."""
    
    def test_login_with_correct_password(self, client):
        """Test login with correct password returns token."""
        response = client.post('/login',
            data=json.dumps({'password': 'iloveflask'}),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'token' in data
    
    def test_login_with_wrong_password(self, client):
        """Test login with wrong password returns 401."""
        response = client.post('/login',
            data=json.dumps({'password': 'wrongpassword'}),
            content_type='application/json'
        )
        assert response.status_code == 401
    
    def test_login_without_password(self, client):
        """Test login without password returns 401."""
        response = client.post('/login',
            data=json.dumps({}),
            content_type='application/json'
        )
        assert response.status_code == 401


class TestQuizInfo:
    """Tests for quiz info endpoint."""
    
    def test_get_quiz_info_empty(self, client):
        """Test quiz info with no questions."""
        response = client.get('/quiz-info')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['size'] == 0
        assert data['scores'] == []
    
    def test_get_quiz_info_with_questions(self, client, auth_token):
        """Test quiz info after adding questions."""
        # Create a question
        question_data = {
            'title': 'Test Question',
            'text': 'What is 2+2?',
            'position': 1,
            'possibleAnswers': [
                {'text': '3', 'isCorrect': False},
                {'text': '4', 'isCorrect': True},
                {'text': '5', 'isCorrect': False},
                {'text': '6', 'isCorrect': False}
            ]
        }
        client.post('/questions',
            data=json.dumps(question_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        response = client.get('/quiz-info')
        data = json.loads(response.data)
        assert data['size'] == 1


class TestQuestionsCRUD:
    """Tests for CRUD operations on questions."""
    
    def test_create_question(self, client, auth_token):
        """Test creating a new question."""
        question_data = {
            'title': 'Math Question',
            'text': 'What is 5+5?',
            'position': 1,
            'possibleAnswers': [
                {'text': '8', 'isCorrect': False},
                {'text': '9', 'isCorrect': False},
                {'text': '10', 'isCorrect': True},
                {'text': '11', 'isCorrect': False}
            ]
        }
        
        response = client.post('/questions',
            data=json.dumps(question_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'id' in data
    
    def test_create_question_without_auth(self, client):
        """Test creating question without authentication fails."""
        question_data = {
            'title': 'Test',
            'text': 'Test?',
            'position': 1,
            'possibleAnswers': [
                {'text': 'A', 'isCorrect': True},
                {'text': 'B', 'isCorrect': False},
                {'text': 'C', 'isCorrect': False},
                {'text': 'D', 'isCorrect': False}
            ]
        }
        
        response = client.post('/questions',
            data=json.dumps(question_data),
            content_type='application/json'
        )
        
        assert response.status_code == 401
    
    def test_create_question_invalid_answers(self, client, auth_token):
        """Test creating question with wrong number of answers."""
        question_data = {
            'title': 'Test',
            'text': 'Test?',
            'position': 1,
            'possibleAnswers': [
                {'text': 'A', 'isCorrect': True},
                {'text': 'B', 'isCorrect': False}
            ]
        }
        
        response = client.post('/questions',
            data=json.dumps(question_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        assert response.status_code == 400
    
    def test_get_question_by_id(self, client, auth_token):
        """Test getting a question by its ID."""
        # First create a question
        question_data = {
            'title': 'Test Question',
            'text': 'What is the answer?',
            'position': 1,
            'possibleAnswers': [
                {'text': 'A', 'isCorrect': True},
                {'text': 'B', 'isCorrect': False},
                {'text': 'C', 'isCorrect': False},
                {'text': 'D', 'isCorrect': False}
            ]
        }
        
        create_response = client.post('/questions',
            data=json.dumps(question_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        question_id = json.loads(create_response.data)['id']
        
        # Get the question
        response = client.get(f'/questions/{question_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Test Question'
    
    def test_get_question_not_found(self, client):
        """Test getting a non-existent question returns 404."""
        response = client.get('/questions/9999')
        assert response.status_code == 404
    
    def test_get_question_by_position(self, client, auth_token):
        """Test getting a question by position."""
        # Create a question at position 1
        question_data = {
            'title': 'Position Test',
            'text': 'Question at position 1',
            'position': 1,
            'possibleAnswers': [
                {'text': 'A', 'isCorrect': True},
                {'text': 'B', 'isCorrect': False},
                {'text': 'C', 'isCorrect': False},
                {'text': 'D', 'isCorrect': False}
            ]
        }
        
        client.post('/questions',
            data=json.dumps(question_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        response = client.get('/questions?position=1')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Position Test'
    
    def test_update_question(self, client, auth_token):
        """Test updating a question."""
        # Create a question
        question_data = {
            'title': 'Original Title',
            'text': 'Original text',
            'position': 1,
            'possibleAnswers': [
                {'text': 'A', 'isCorrect': True},
                {'text': 'B', 'isCorrect': False},
                {'text': 'C', 'isCorrect': False},
                {'text': 'D', 'isCorrect': False}
            ]
        }
        
        create_response = client.post('/questions',
            data=json.dumps(question_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        question_id = json.loads(create_response.data)['id']
        
        # Update the question
        update_data = {'title': 'Updated Title'}
        response = client.put(f'/questions/{question_id}',
            data=json.dumps(update_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        assert response.status_code == 204
        
        # Verify update
        get_response = client.get(f'/questions/{question_id}')
        data = json.loads(get_response.data)
        assert data['title'] == 'Updated Title'
    
    def test_delete_question(self, client, auth_token):
        """Test deleting a question."""
        # Create a question
        question_data = {
            'title': 'To Delete',
            'text': 'This will be deleted',
            'position': 1,
            'possibleAnswers': [
                {'text': 'A', 'isCorrect': True},
                {'text': 'B', 'isCorrect': False},
                {'text': 'C', 'isCorrect': False},
                {'text': 'D', 'isCorrect': False}
            ]
        }
        
        create_response = client.post('/questions',
            data=json.dumps(question_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        question_id = json.loads(create_response.data)['id']
        
        # Delete the question
        response = client.delete(f'/questions/{question_id}',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        assert response.status_code == 204
        
        # Verify deletion
        get_response = client.get(f'/questions/{question_id}')
        assert get_response.status_code == 404


class TestParticipations:
    """Tests for participation endpoints."""
    
    def test_submit_participation(self, client, auth_token):
        """Test submitting a quiz participation."""
        # Create a question first
        question_data = {
            'title': 'Quiz Question',
            'text': 'What is 1+1?',
            'position': 1,
            'possibleAnswers': [
                {'text': '1', 'isCorrect': False},
                {'text': '2', 'isCorrect': True},
                {'text': '3', 'isCorrect': False},
                {'text': '4', 'isCorrect': False}
            ]
        }
        
        client.post('/questions',
            data=json.dumps(question_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        # Submit participation
        participation_data = {
            'playerName': 'TestPlayer',
            'answers': [2]  # Position 2 is correct (answer "2")
        }
        
        response = client.post('/participations',
            data=json.dumps(participation_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['playerName'] == 'TestPlayer'
        assert data['score'] == 1
        assert len(data['answersSummaries']) == 1
    
    def test_submit_participation_wrong_answer(self, client, auth_token):
        """Test submitting participation with wrong answer."""
        # Create a question
        question_data = {
            'title': 'Quiz Question',
            'text': 'What is 1+1?',
            'position': 1,
            'possibleAnswers': [
                {'text': '1', 'isCorrect': False},
                {'text': '2', 'isCorrect': True},
                {'text': '3', 'isCorrect': False},
                {'text': '4', 'isCorrect': False}
            ]
        }
        
        client.post('/questions',
            data=json.dumps(question_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        # Submit wrong answer
        participation_data = {
            'playerName': 'WrongPlayer',
            'answers': [1]  # Position 1 is incorrect
        }
        
        response = client.post('/participations',
            data=json.dumps(participation_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['score'] == 0
    
    def test_submit_participation_no_answers(self, client):
        """Test submitting participation without answers."""
        participation_data = {
            'playerName': 'NoAnswerPlayer',
            'answers': []
        }
        
        response = client.post('/participations',
            data=json.dumps(participation_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400


class TestDeleteAll:
    """Tests for bulk delete operations."""
    
    def test_delete_all_questions(self, client, auth_token):
        """Test deleting all questions."""
        # Create questions
        for i in range(3):
            question_data = {
                'title': f'Question {i}',
                'text': f'Text {i}',
                'position': i + 1,
                'possibleAnswers': [
                    {'text': 'A', 'isCorrect': True},
                    {'text': 'B', 'isCorrect': False},
                    {'text': 'C', 'isCorrect': False},
                    {'text': 'D', 'isCorrect': False}
                ]
            }
            client.post('/questions',
                data=json.dumps(question_data),
                content_type='application/json',
                headers={'Authorization': f'Bearer {auth_token}'}
            )
        
        # Verify questions exist
        info_response = client.get('/quiz-info')
        assert json.loads(info_response.data)['size'] == 3
        
        # Delete all
        response = client.delete('/questions/all',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        assert response.status_code == 204
        
        # Verify deletion
        info_response = client.get('/quiz-info')
        assert json.loads(info_response.data)['size'] == 0
    
    def test_delete_all_participations(self, client, auth_token):
        """Test deleting all participations."""
        response = client.delete('/participations/all',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        assert response.status_code == 204


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
