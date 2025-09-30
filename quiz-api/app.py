from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import secrets
from datetime import datetime, timedelta
from models import db, Question, Answer, Participation, AdminSession
from auth import generate_token, token_required

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

@app.route('/questions/all', methods=['GET'])
@token_required
def get_all_questions():
    try:
        questions = Question.query.order_by(Question.position).all()
        return jsonify({
            "questions": [q.to_dict() for q in questions]
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
        token = generate_token()
        return jsonify({"token": token})
    else:
        return jsonify({"error": "Invalid password"}), 401

# Admin endpoints (protected)
@app.route('/questions', methods=['POST'])
@token_required
def create_question():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'text', 'position', 'possibleAnswers']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Validate answers
        answers = data.get('possibleAnswers', [])
        if len(answers) != 4:
            return jsonify({"error": "Exactly 4 answers are required"}), 400
        
        correct_answers = [a for a in answers if a.get('isCorrect', False)]
        if len(correct_answers) != 1:
            return jsonify({"error": "Exactly one correct answer is required"}), 400
        
        # Check if position is available or shift existing questions
        position = data.get('position')
        if position is None:
            # If no position specified, assign to the end
            max_position = db.session.query(db.func.max(Question.position)).scalar() or 0
            position = max_position + 1
        
        # Use a different approach: find the highest position and shift from there
        existing_question = Question.query.filter_by(position=position).first()
        if existing_question:
            # Get all questions at or after this position, ordered by position DESC
            questions_to_shift = Question.query.filter(Question.position >= position).order_by(Question.position.desc()).all()
            
            # Update positions in reverse order to avoid conflicts
            for i, q in enumerate(questions_to_shift):
                # Use a temporary high position to avoid conflicts
                temp_position = 10000 + i
                q.position = temp_position
            
            db.session.flush()
            
            # Now set the correct positions
            for i, q in enumerate(questions_to_shift):
                q.position = position + 1 + i
            
            db.session.flush()
        
        # Create question
        question = Question(
            position=position,
            title=data.get('title'),
            text=data.get('text'),
            image=data.get('image')
        )
        db.session.add(question)
        db.session.flush()  # Get question ID
        
        # Create answers
        for answer_data in answers:
            answer = Answer(
                question_id=question.id,
                text=answer_data.get('text'),
                is_correct=answer_data.get('isCorrect', False)
            )
            db.session.add(answer)
        
        db.session.commit()
        return jsonify({"id": question.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/questions/<int:question_id>', methods=['PUT'])
@token_required
def update_question(question_id):
    try:
        question = Question.query.get_or_404(question_id)
        data = request.get_json()
        
        # Validate answers if provided
        if 'possibleAnswers' in data:
            answers = data.get('possibleAnswers', [])
            if len(answers) != 4:
                return jsonify({"error": "Exactly 4 answers are required"}), 400
            
            correct_answers = [a for a in answers if a.get('isCorrect', False)]
            if len(correct_answers) != 1:
                return jsonify({"error": "Exactly one correct answer is required"}), 400
        
        # Handle position change
        if 'position' in data and data['position'] != question.position:
            new_position = data['position']
            old_position = question.position
            
            # Temporarily set position to None to avoid constraint violations
            question.position = None
            db.session.flush()
            
            if new_position > old_position:
                # Moving down: shift questions between old and new position up
                questions_to_shift = Question.query.filter(
                    Question.position > old_position,
                    Question.position <= new_position,
                    Question.id != question_id
                ).all()
                for q in questions_to_shift:
                    q.position -= 1
            else:
                # Moving up: shift questions between new and old position down
                questions_to_shift = Question.query.filter(
                    Question.position >= new_position,
                    Question.position < old_position,
                    Question.id != question_id
                ).all()
                for q in questions_to_shift:
                    q.position += 1
            
            db.session.flush()  # Commit position changes
            question.position = new_position
        
        # Update question fields
        if 'title' in data:
            question.title = data['title']
        if 'text' in data:
            question.text = data['text']
        if 'image' in data:
            question.image = data['image']
        
        question.updated_at = datetime.utcnow()
        
        # Update answers if provided
        if 'possibleAnswers' in data:
            # Delete existing answers
            Answer.query.filter_by(question_id=question_id).delete()
            
            # Create new answers
            for answer_data in data['possibleAnswers']:
                answer = Answer(
                    question_id=question_id,
                    text=answer_data.get('text'),
                    is_correct=answer_data.get('isCorrect', False)
                )
                db.session.add(answer)
        
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/questions/<int:question_id>', methods=['DELETE'])
@token_required
def delete_question(question_id):
    try:
        question = Question.query.get_or_404(question_id)
        position_to_delete = question.position
        
        # Delete the question (answers will be deleted by cascade)
        db.session.delete(question)
        
        # Shift subsequent questions up
        questions_to_shift = Question.query.filter(Question.position > position_to_delete).all()
        for q in questions_to_shift:
            q.position -= 1
        
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/questions/all', methods=['DELETE'])
@token_required
def delete_all_questions():
    try:
        Question.query.delete()
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/participations/all', methods=['DELETE'])
@token_required
def delete_all_participations():
    try:
        Participation.query.delete()
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

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
