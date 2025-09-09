from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import secrets
from datetime import datetime, timedelta
from models import db, Question, Answer, Participation, AdminSession

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['ADMIN_PASSWORD'] = os.environ.get('ADMIN_PASSWORD', 'iloveflask')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quiz.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

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
    try:
        size = Question.query.count()
        participations = Participation.query.order_by(Participation.score.desc(), Participation.created_at.desc()).limit(10).all()
        scores = [p.to_dict() for p in participations]
        
        return jsonify({
            "size": size,
            "scores": scores
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/questions/<int:question_id>', methods=['GET'])
def get_question_by_id(question_id):
    try:
        question = Question.query.get_or_404(question_id)
        return jsonify({"question": question.to_dict()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/questions', methods=['GET'])
def get_question_by_position():
    position = request.args.get('position', 1, type=int)
    try:
        question = Question.query.filter_by(position=position).first_or_404()
        return jsonify({"question": question.to_dict()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/participations', methods=['POST'])
def submit_participation():
    data = request.get_json()
    try:
        player_name = data.get('player_name', 'Anonymous')
        answers = data.get('answers', [])
        
        if not answers:
            return jsonify({"error": "No answers provided"}), 400
        
        # Get all questions ordered by position
        questions = Question.query.order_by(Question.position).all()
        
        if len(answers) != len(questions):
            return jsonify({"error": "Number of answers doesn't match number of questions"}), 400
        
        score = 0
        answers_summaries = []
        
        for i, question in enumerate(questions):
            selected_answer_id = answers[i] if i < len(answers) else None
            correct_answer = next((a for a in question.answers if a.is_correct), None)
            
            if correct_answer:
                correct_answer_position = next((j+1 for j, a in enumerate(question.answers) if a.id == correct_answer.id), 1)
                was_correct = selected_answer_id == correct_answer.id
                
                if was_correct:
                    score += 1
                    
                answers_summaries.append({
                    "correctAnswerPosition": correct_answer_position,
                    "wasCorrect": was_correct
                })
        
        # Save participation
        participation = Participation(
            player_name=player_name,
            score=score
        )
        db.session.add(participation)
        db.session.commit()
        
        return jsonify({
            "answersSummaries": answers_summaries,
            "playerName": player_name,
            "score": score
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

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

def init_database():
    """Initialize database with sample data"""
    with app.app_context():
        db.create_all()
        
        # Check if we already have data
        if Question.query.count() == 0:
            # Create sample questions
            questions_data = [
                {
                    "position": 1,
                    "title": "Question 1",
                    "text": "Quelle est la capitale de la France ?",
                    "answers": [
                        {"text": "Londres", "is_correct": False},
                        {"text": "Paris", "is_correct": True},
                        {"text": "Berlin", "is_correct": False},
                        {"text": "Madrid", "is_correct": False}
                    ]
                },
                {
                    "position": 2,
                    "title": "Question 2", 
                    "text": "Combien font 2 + 2 ?",
                    "answers": [
                        {"text": "3", "is_correct": False},
                        {"text": "4", "is_correct": True},
                        {"text": "5", "is_correct": False},
                        {"text": "6", "is_correct": False}
                    ]
                },
                {
                    "position": 3,
                    "title": "Question 3",
                    "text": "Quel est le plus grand océan du monde ?",
                    "answers": [
                        {"text": "Océan Atlantique", "is_correct": False},
                        {"text": "Océan Indien", "is_correct": False},
                        {"text": "Océan Pacifique", "is_correct": True},
                        {"text": "Océan Arctique", "is_correct": False}
                    ]
                }
            ]
            
            for q_data in questions_data:
                question = Question(
                    position=q_data["position"],
                    title=q_data["title"],
                    text=q_data["text"]
                )
                db.session.add(question)
                db.session.flush()  # Get the question ID
                
                for a_data in q_data["answers"]:
                    answer = Answer(
                        question_id=question.id,
                        text=a_data["text"],
                        is_correct=a_data["is_correct"]
                    )
                    db.session.add(answer)
            
            # Add sample participations
            sample_participations = [
                {"player_name": "Alice", "score": 3},
                {"player_name": "Bob", "score": 2},
                {"player_name": "Charlie", "score": 1},
            ]
            
            for p_data in sample_participations:
                participation = Participation(
                    player_name=p_data["player_name"],
                    score=p_data["score"]
                )
                db.session.add(participation)
            
            db.session.commit()
            print("Database initialized with sample data")

if __name__ == "__main__":
    init_database()
    app.run(debug=True, host='0.0.0.0', port=5000)
