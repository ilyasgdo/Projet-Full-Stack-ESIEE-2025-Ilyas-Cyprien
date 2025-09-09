from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['ADMIN_PASSWORD'] = os.environ.get('ADMIN_PASSWORD', 'iloveflask')

@app.route('/')
def hello_world():
    return jsonify({
        "message": "Quiz API is running!",
        "version": "1.0.0",
        "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    })

# Public endpoints - Front Office
@app.route('/quiz-info', methods=['GET'])
def get_quiz_info():
    # TODO: Implement quiz info retrieval
    return jsonify({
        "size": 0,
        "scores": []
    })

@app.route('/questions/<int:question_id>', methods=['GET'])
def get_question_by_id(question_id):
    # TODO: Implement question retrieval by ID
    return jsonify({
        "question": {
            "id": question_id,
            "title": "Sample Question",
            "position": 1,
            "text": "What is 2+2?",
            "image": None,
            "possibleAnswers": [
                {"id": 1, "text": "3", "isCorrect": False},
                {"id": 2, "text": "4", "isCorrect": True},
                {"id": 3, "text": "5", "isCorrect": False},
                {"id": 4, "text": "6", "isCorrect": False}
            ]
        }
    })

@app.route('/questions', methods=['GET'])
def get_question_by_position():
    position = request.args.get('position', 1, type=int)
    # TODO: Implement question retrieval by position
    return jsonify({
        "question": {
            "id": position,
            "title": f"Question {position}",
            "position": position,
            "text": f"Sample question at position {position}?",
            "image": None,
            "possibleAnswers": [
                {"id": 1, "text": "Option A", "isCorrect": False},
                {"id": 2, "text": "Option B", "isCorrect": True},
                {"id": 3, "text": "Option C", "isCorrect": False},
                {"id": 4, "text": "Option D", "isCorrect": False}
            ]
        }
    })

@app.route('/participations', methods=['POST'])
def submit_participation():
    data = request.get_json()
    # TODO: Implement participation submission and scoring
    player_name = data.get('player_name', 'Anonymous')
    answers = data.get('answers', [])
    
    return jsonify({
        "answersSummaries": [
            {
                "correctAnswerPosition": 2,
                "wasCorrect": True
            }
        ],
        "playerName": player_name,
        "score": 1
    })

# Auth endpoint
@app.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    password = data.get('password', '')
    
    if password == app.config['ADMIN_PASSWORD']:
        # TODO: Generate proper JWT token
        token = "sample-admin-token-123"
        return jsonify({"token": token})
    else:
        return jsonify({"error": "Invalid password"}), 401

# Admin endpoints (protected)
@app.route('/questions', methods=['POST'])
def create_question():
    # TODO: Implement token validation middleware
    # TODO: Implement question creation
    return jsonify({"id": 1}), 201

@app.route('/questions/<int:question_id>', methods=['PUT'])
def update_question(question_id):
    # TODO: Implement token validation and question update
    return '', 204

@app.route('/questions/<int:question_id>', methods=['DELETE'])
def delete_question(question_id):
    # TODO: Implement token validation and question deletion
    return '', 204

@app.route('/questions/all', methods=['DELETE'])
def delete_all_questions():
    # TODO: Implement token validation and bulk deletion
    return '', 204

@app.route('/participations/all', methods=['DELETE'])
def delete_all_participations():
    # TODO: Implement token validation and bulk deletion
    return '', 204

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
