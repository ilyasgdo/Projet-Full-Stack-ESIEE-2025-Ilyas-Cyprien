"""
Quiz API Application

Flask REST API for managing quiz questions, answers, and participations.
Provides endpoints for public quiz access and admin management.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import secrets
import base64
from datetime import datetime, timedelta
from models import db, Question, Answer, Participation, AdminSession
from auth import generate_token, token_required
from validation import validate_base64_image
from werkzeug.exceptions import HTTPException

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['ADMIN_PASSWORD'] = os.environ.get('ADMIN_PASSWORD', 'iloveflask')
instance_path = app.instance_path
os.makedirs(instance_path, exist_ok=True)
db_path = os.path.join(instance_path, 'quiz.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_IMAGE_SIZE_BYTES'] = 1024 * 1024

db.init_app(app)

@app.errorhandler(HTTPException)
def handle_http_exception(e):
    """Handle HTTP exceptions and return JSON error response.
    
    Args:
        e: HTTPException instance with error details
        
    Returns:
        JSON response with error message and status code
    """
    response = jsonify({
        "error": e.description,
        "code": e.code
    })
    return response, e.code

@app.errorhandler(Exception)
def handle_unexpected_exception(e):
    """Handle unexpected exceptions and return generic error response.
    
    Args:
        e: Exception instance
        
    Returns:
        JSON response with generic error message and 500 status code
    """
    return jsonify({
        "error": "Internal server error"
    }), 500

@app.before_request
def check_request_size():
    """Middleware to check request size before processing.
    
    Validates that request content length does not exceed 1MB limit.
    Returns 413 error if request is too large.
    
    Returns:
        JSON error response with 413 status if request exceeds limit, None otherwise
    """
    if request.content_length and request.content_length > app.config['MAX_IMAGE_SIZE_BYTES']:
        return jsonify({
            "error": "Request too large. Maximum size allowed is 1MB."
        }), 413

@app.route('/')
def hello_world():
    """Health check endpoint.
    
    Returns:
        JSON response with API status, version, and current timestamp
    """
    return jsonify({
        "message": "Quiz API is running!",
        "version": "1.0.0",
        "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    })

@app.route('/quiz-info', methods=['GET'])
def get_quiz_info():
    """Get quiz information and top scores.
    
    Public endpoint that returns the total number of questions and
    the top 10 scores sorted by score (descending) and date.
    
    Returns:
        JSON response with:
            - size: total number of questions
            - scores: list of top 10 participations with playerName, score, and date
    """
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
    """Get all questions for administration.
    
    Admin-only endpoint that returns all questions ordered by position.
    Requires JWT authentication.
    
    Returns:
        JSON response with list of all questions including their answers
    """
    try:
        questions = Question.query.order_by(Question.position).all()
        return jsonify({
            "questions": [q.to_dict() for q in questions]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/questions/<int:question_id>', methods=['GET'])
def get_question_by_id(question_id):
    """Get a question by its database ID.
    
    Public endpoint to retrieve a specific question by ID.
    
    Args:
        question_id: Integer ID of the question
        
    Returns:
        JSON response with question data or 404 if not found
    """
    try:
        question = Question.query.get(question_id)
        if question is None:
            return jsonify({"error": "Question not found"}), 404
        return jsonify(question.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/questions', methods=['GET'])
def get_question_by_position():
    """Get a question by its position in the quiz.
    
    Public endpoint to retrieve a question by its position number.
    Position defaults to 1 if not provided.
    
    Query Parameters:
        position: Integer position of the question (default: 1)
        
    Returns:
        JSON response with question data or 404 if not found
    """
    position = request.args.get('position', 1, type=int)
    try:
        question = Question.query.filter_by(position=position).first()
        if question is None:
            return jsonify({"error": "Question not found"}), 404
        return jsonify(question.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/participations', methods=['POST'])
def submit_participation():
    """Submit quiz participation with answers.
    
    Public endpoint to submit a player's answers for all questions.
    Validates that the number of answers matches the number of questions,
    calculates the score, and saves the participation.
    
    Request Body:
        - playerName: String name of the player
        - answers: List of answer positions (integers) in order of questions
        
    Returns:
        JSON response with:
            - answersSummaries: List of answer results with correctAnswerPosition and wasCorrect
            - playerName: Name of the player
            - score: Total number of correct answers
    """
    data = request.get_json()
    try:
        player_name = data.get('playerName', 'Anonymous')
        answers = data.get('answers', [])
        
        if not answers:
            return jsonify({"error": "No answers provided"}), 400
        
        questions = Question.query.order_by(Question.position).all()
        
        if len(answers) != len(questions):
            return jsonify({"error": "Number of answers doesn't match number of questions"}), 400
        
        score = 0
        answers_summaries = []
        
        for i, question in enumerate(questions):
            selected_answer_position = answers[i] if i < len(answers) else None
            
            sorted_answers = sorted(question.answers, key=lambda a: a.order)
            correct_answer = next((a for a in sorted_answers if a.is_correct), None)
            
            if correct_answer:
                correct_answer_position = next((j+1 for j, a in enumerate(sorted_answers) if a.is_correct), 1)
                was_correct = selected_answer_position == correct_answer_position
                
                if was_correct:
                    score += 1
                    
                answers_summaries.append({
                    "correctAnswerPosition": correct_answer_position,
                    "wasCorrect": was_correct
                })
        
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

@app.route('/login', methods=['POST'])
def admin_login():
    """Admin login endpoint.
    
    Authenticates admin user with password and returns JWT token.
    
    Request Body:
        - password: String admin password
        
    Returns:
        JSON response with JWT token on success, or 401 error on failure
    """
    data = request.get_json()
    password = data.get('password', '')
    
    if password == app.config['ADMIN_PASSWORD']:
        token = generate_token()
        return jsonify({"token": token})
    else:
        return jsonify({"error": "Invalid password"}), 401

@app.route('/rebuild-db', methods=['POST'])
@token_required
def rebuild_database():
    """Rebuild database schema.
    
    Admin-only endpoint that drops and recreates all database tables.
    Requires JWT authentication.
    
    Returns:
        "Ok" with 200 status on success
    """
    try:
        db.drop_all()
        db.create_all()
        return "Ok", 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/questions', methods=['POST'])
@token_required
def create_question():
    """Create a new question.
    
    Admin-only endpoint to create a new question with answers.
    Automatically shifts positions of existing questions if position is taken.
    Requires exactly 4 answers with exactly 1 correct answer.
    
    Request Body:
        - title: String title of the question
        - text: String question text
        - image: Optional base64 encoded image string
        - position: Integer position in quiz (auto-assigned if not provided)
        - possibleAnswers: List of 4 answer objects with text and isCorrect
        
    Returns:
        JSON response with question ID on success
    """
    try:
        data = request.get_json()
        
        required_fields = ['title', 'text', 'position', 'possibleAnswers']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        answers = data.get('possibleAnswers', [])
        if len(answers) != 4:
            return jsonify({"error": "Exactly 4 answers are required"}), 400
        
        correct_answers = [a for a in answers if a.get('isCorrect', False)]
        if len(correct_answers) != 1:
            return jsonify({"error": "Exactly one correct answer is required"}), 400
        
        image = data.get('image')
        if image:
            is_valid, error_message = validate_base64_image(image)
            if not is_valid:
                return jsonify({"error": error_message}), 400
        
        position = data.get('position')
        if position is None:
            max_position = db.session.query(db.func.max(Question.position)).scalar() or 0
            position = max_position + 1
        
        existing_question = Question.query.filter_by(position=position).first()
        if existing_question:
            questions_to_shift = Question.query.filter(
                Question.position >= position
            ).order_by(Question.position.desc()).all()
            for q in questions_to_shift:
                q.position = q.position + 1
                db.session.flush()
        
        question = Question(
            position=position,
            title=data.get('title'),
            text=data.get('text'),
            image=data.get('image')
        )
        db.session.add(question)
        db.session.flush()
        
        for i, answer_data in enumerate(answers):
            answer = Answer(
                question_id=question.id,
                text=answer_data.get('text'),
                is_correct=answer_data.get('isCorrect', False),
                order=i + 1
            )
            db.session.add(answer)
        
        db.session.commit()
        return jsonify({"id": question.id}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/questions', methods=['PUT'])
@token_required
def update_question_without_id():
    """Handle PUT request to /questions without ID (error case).
    
    Returns:
        JSON error response indicating question ID is required
    """
    return jsonify({"error": "Question ID is required for updates"}), 400

@app.route('/questions/<int:question_id>', methods=['PUT'])
@token_required
def update_question(question_id):
    """Update an existing question.
    
    Admin-only endpoint to update a question's properties.
    Handles position changes by shifting other questions appropriately.
    Validates image and ensures at most one correct answer.
    
    Args:
        question_id: Integer ID of the question to update
        
    Request Body (all fields optional):
        - title: String title
        - text: String question text
        - image: Optional base64 encoded image
        - position: Integer new position
        - possibleAnswers: List of answer objects
        
    Returns:
        Empty response with 204 status on success
    """
    try:
        question = Question.query.get(question_id)
        if question is None:
            return jsonify({"error": "Question not found"}), 404
            
        data = request.get_json()
        
        if 'possibleAnswers' in data:
            answers = data.get('possibleAnswers', [])
            if answers:
                correct_answers = [a for a in answers if a.get('isCorrect', False)]
                if len(correct_answers) > 1:
                    return jsonify({"error": "At most one correct answer is allowed"}), 400
        
        if 'image' in data:
            image = data.get('image')
            if image:
                is_valid, error_message = validate_base64_image(image)
                if not is_valid:
                    return jsonify({"error": error_message}), 400
        
        if 'position' in data and data['position'] != question.position:
            new_position = data['position']
            old_position = question.position
            
            total_questions = Question.query.count()
            if new_position < 1 or new_position > total_questions:
                return jsonify({"error": f"Position must be between 1 and {total_questions}"}), 400
            
            question.position = None
            db.session.flush()
            
            if new_position > old_position:
                questions_to_shift = Question.query.filter(
                    Question.position > old_position,
                    Question.position <= new_position
                ).order_by(Question.position).all()
                
                for q in questions_to_shift:
                    q.position = q.position - 1
                    db.session.flush()
                    
            else:
                questions_to_shift = Question.query.filter(
                    Question.position >= new_position,
                    Question.position < old_position
                ).order_by(Question.position.desc()).all()
                
                for q in questions_to_shift:
                    q.position = q.position + 1
                    db.session.flush()
            
            question.position = new_position
            db.session.flush()
        
        if 'title' in data:
            question.title = data['title']
        if 'text' in data:
            question.text = data['text']
        if 'image' in data:
            question.image = data['image']
        
        question.updated_at = datetime.utcnow()
        
        if 'possibleAnswers' in data and data['possibleAnswers']:
            Answer.query.filter_by(question_id=question_id).delete()
            
            for i, answer_data in enumerate(data['possibleAnswers']):
                answer = Answer(
                    question_id=question_id,
                    text=answer_data.get('text'),
                    is_correct=answer_data.get('isCorrect', False),
                    order=i + 1
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
    """Delete a question by ID.
    
    Admin-only endpoint to delete a question and its answers.
    Automatically shifts positions of remaining questions.
    
    Args:
        question_id: Integer ID of the question to delete
        
    Returns:
        Empty response with 204 status on success
    """
    try:
        question = Question.query.get(question_id)
        if question is None:
            return jsonify({"error": "Question not found"}), 404
            
        position_to_delete = question.position
        
        db.session.delete(question)
        db.session.flush()
        
        if position_to_delete is not None:
            questions_to_shift = Question.query.filter(Question.position > position_to_delete).order_by(Question.position).all()
            for i, q in enumerate(questions_to_shift):
                q.position = -(i + 1)
            db.session.flush()
            
            for i, q in enumerate(questions_to_shift):
                q.position = position_to_delete + i
        
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/questions/all', methods=['DELETE'])
@token_required
def delete_all_questions():
    """Delete all questions and answers.
    
    Admin-only endpoint to delete all questions and their associated answers.
    Requires JWT authentication.
    
    Returns:
        Empty response with 204 status on success
    """
    try:
        Answer.query.delete()
        Question.query.delete()
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/participations/all', methods=['DELETE'])
@token_required
def delete_all_participations():
    """Delete all participations.
    
    Admin-only endpoint to delete all participation records.
    Requires JWT authentication.
    
    Returns:
        Empty response with 204 status on success
    """
    try:
        Participation.query.delete()
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

def init_sample_data():
    """Initialize sample quiz data for testing.
    
    Creates sample questions and answers if the database is empty.
    Does nothing if questions already exist.
    """
    existing_count = Question.query.count()
    if existing_count > 0:
        return
    
    Answer.query.delete()
    Question.query.delete()
    Participation.query.delete()
    db.session.commit()
    
    questions_data = [
        {
            "title": "Dummy Question",
            "text": "Quelle est la couleur du cheval blanc d'Henry IV ?",
            "image": "falseb64imagecontent",
            "answers": ["Noir", "Gris", "Blanc", "La réponse D"],
            "correct": 3
        },
        {
            "title": "Un framework des années 2000",
            "text": "En quelle année la première version d'angular a-t-elle été publiée ?",
            "image": "",
            "answers": ["2000", "2016", "2010", "2005"],
            "correct": 2
        },
        {
            "title": "Un framework des années 2000",
            "text": "En quelle année la première version de react a-t-elle été publiée ?",
            "image": "",
            "answers": ["2000", "2005", "2010", "2013"],
            "correct": 4
        },
        {
            "title": "Un framework des années 2000",
            "text": "En quelle année la première version de svelte a-t-elle été publiée ?",
            "image": "",
            "answers": ["2000", "2005", "2016", "2019"],
            "correct": 4
        },
        {
            "title": "Un peu de culture",
            "text": "Qui a créé le langage javascript ?",
            "image": "",
            "answers": ["Brendan Eich", "Linus Torvalds", "James Gosling", "Guido van Rossum"],
            "correct": 1
        },
        {
            "title": "Un peu de culture",
            "text": "Quel était le nom de code de javascript ?",
            "image": "",
            "answers": ["Mocha", "LiveScript", "ECMAScript", "Mocha puis LiveScript"],
            "correct": 2
        },
        {
            "title": "Un peu de culture",
            "text": "Pourquoi avoir choisi le nom de 'javascript' ?",
            "image": "",
            "answers": ["Parce que javascript est un dérivé de java", "Pour des raisons marketing, java étant populaire à l'époque", "Parce que javascript est plus puissant que java", "Pour concurrencer les produits de Google et Facebook."],
            "correct": 4
        },
        {
            "title": "Un framework des années 2000",
            "text": "En quelle année la première version de vue a-t-elle été publiée ?",
            "image": "",
            "answers": ["2000", "2014", "2010", "2005"],
            "correct": 2
        },
        {
            "title": "Un peu de culture",
            "text": "A l'exception des toutes premières, chaque version de vuejs est associée à une référence. Mais quoi ?",
            "image": "",
            "answers": ["Chaque version porte le nom d'une ville dans le monde.", "Chaque version porte le nom d'un manga/anime.", "Chaque version porte le nom d'un fondateur de l'informatique.", "Chaque version porte le nom d'un animal à la vue perçante."],
            "correct": 4
        },
        {
            "title": "Question de définition",
            "text": "On dit que VueJS est un framework javascript. Mais qu'est-ce qu'un framework javascript ?",
            "image": "",
            "answers": ["Qu'il s'agit d'un ensemble de programmes précompilés et utilisable en javascript", "Qu'il s'agit d'une suite bureatique nécessaire pour programmer en javascript", "Qu'il s'agit d'un outil chargé de transformer du JSON en HTML avec du javascript", "Qu'il s'agit d'une librairie cohérente de fonctions préécrites en javascript"],
            "correct": 1
        }
    ]
    
    for i, q_data in enumerate(questions_data):
        question = Question(
            title=q_data["title"], 
            text=q_data["text"], 
            position=i+1, 
            image=q_data["image"]
        )
        db.session.add(question)
        db.session.flush()
        
        for j, answer_text in enumerate(q_data["answers"]):
            is_correct = (j + 1 == q_data["correct"])
            answer = Answer(question_id=question.id, text=answer_text, is_correct=is_correct, order=j)
            db.session.add(answer)
    
    db.session.commit()

def init_math_questions():
    """Initialize math quiz questions.
    
    Creates a set of mathematics questions with LaTeX-formatted text
    if the database is empty.
    
    Returns:
        True if questions were created, False if questions already existed
    """
    existing_count = Question.query.count()
    if existing_count > 0:
        return False
    
    Answer.query.delete()
    Question.query.delete()
    Participation.query.delete()
    db.session.commit()
    
    questions_data = [
        {
            "title": "Arithmétique de base",
            "text": "Quel est le résultat de $2 + 3 \\times 4$ ?",
            "image": "",
            "answers": ["$20$", "$14$", "$24$", "$11$"],
            "correct": 2
        },
        {
            "title": "Algèbre simple",
            "text": "Résolvez l'équation : $2x + 5 = 13$. Quelle est la valeur de $x$ ?",
            "image": "",
            "answers": ["$x = 3$", "$x = 4$", "$x = 5$", "$x = 6$"],
            "correct": 2
        },
        {
            "title": "Addition de fractions",
            "text": "Quel est le résultat de $\\frac{3}{4} + \\frac{1}{2}$ ?",
            "image": "",
            "answers": ["$\\frac{4}{6}$", "$\\frac{5}{4}$", "$\\frac{1}{1}$", "$\\frac{1}{4}$"],
            "correct": 2
        },
        {
            "title": "Géométrie - Aire d'un cercle",
            "text": "Quelle est l'aire d'un cercle de rayon $r = 5$ ? (Utilisez $\\pi = 3.14$)",
            "image": "",
            "answers": ["$78.5$", "$31.4$", "$15.7$", "$25.0$"],
            "correct": 1
        },
        {
            "title": "Puissances",
            "text": "Quelle est la valeur de $x^2$ lorsque $x = 4$ ?",
            "image": "",
            "answers": ["$8$", "$16$", "$12$", "$6$"],
            "correct": 2
        },
        {
            "title": "Racines carrées",
            "text": "Quelle est la valeur de $\\sqrt{64}$ ?",
            "image": "",
            "answers": ["$6$", "$7$", "$8$", "$9$"],
            "correct": 3
        },
        {
            "title": "Pourcentages",
            "text": "Si un article coûte $50$€ et qu'il est soldé à $20\\%$ de réduction, quel est le nouveau prix ?",
            "image": "",
            "answers": ["$30$€", "$40$€", "$45$€", "$35$€"],
            "correct": 2
        },
        {
            "title": "Équation du second degré",
            "text": "Quelle est la solution de l'équation $x^2 - 9 = 0$ ?",
            "image": "",
            "answers": ["$x = 3$ ou $x = -3$", "$x = 9$", "$x = 0$", "$x = 3$ uniquement"],
            "correct": 1
        },
        {
            "title": "Géométrie - Périmètre d'un rectangle",
            "text": "Quel est le périmètre d'un rectangle de longueur $l = 8$ et de largeur $w = 5$ ?",
            "image": "",
            "answers": ["$13$", "$26$", "$40$", "$20$"],
            "correct": 2
        },
        {
            "title": "Multiplication de fractions",
            "text": "Quel est le résultat de $\\frac{2}{3} \\times \\frac{3}{4}$ ?",
            "image": "",
            "answers": ["$\\frac{5}{7}$", "$\\frac{6}{12}$", "$\\frac{1}{2}$", "$\\frac{2}{4}$"],
            "correct": 3
        },
        {
            "title": "Addition de nombres négatifs",
            "text": "Quel est le résultat de $(-5) + (-3)$ ?",
            "image": "",
            "answers": ["$-8$", "$-2$", "$2$", "$8$"],
            "correct": 1
        },
        {
            "title": "Division simple",
            "text": "Quel est le résultat de $\\frac{15}{3}$ ?",
            "image": "",
            "answers": ["$3$", "$5$", "$12$", "$18$"],
            "correct": 2
        },
        {
            "title": "Géométrie - Aire d'un triangle",
            "text": "Quelle est l'aire d'un triangle de base $b = 6$ et de hauteur $h = 4$ ? (Formule : $A = \\frac{1}{2} \\times b \\times h$)",
            "image": "",
            "answers": ["$10$", "$12$", "$24$", "$20$"],
            "correct": 2
        },
        {
            "title": "Simplification d'expression algébrique",
            "text": "Simplifiez l'expression : $3x + 2x - x$",
            "image": "",
            "answers": ["$4x$", "$5x$", "$6x$", "$x$"],
            "correct": 1
        },
        {
            "title": "Problème de proportion",
            "text": "Si $\\frac{2}{5}$ d'un nombre vaut $10$, quel est ce nombre ?",
            "image": "",
            "answers": ["$20$", "$25$", "$15$", "$30$"],
            "correct": 2
        },
        {
            "title": "Soustraction de fractions",
            "text": "Quel est le résultat de $\\frac{5}{6} - \\frac{1}{3}$ ?",
            "image": "",
            "answers": ["$\\frac{4}{3}$", "$\\frac{1}{2}$", "$\\frac{1}{3}$", "$\\frac{4}{6}$"],
            "correct": 2
        },
        {
            "title": "Racine cubique",
            "text": "Quelle est la valeur de $\\sqrt[3]{27}$ ?",
            "image": "",
            "answers": ["$3$", "$9$", "$6$", "$27$"],
            "correct": 1
        },
        {
            "title": "Équation avec fractions",
            "text": "Résolvez : $\\frac{x}{2} = 7$. Quelle est la valeur de $x$ ?",
            "image": "",
            "answers": ["$x = 3.5$", "$x = 14$", "$x = 9$", "$x = 5$"],
            "correct": 2
        },
        {
            "title": "Géométrie - Volume d'un cube",
            "text": "Quel est le volume d'un cube dont le côté mesure $a = 3$ ? (Formule : $V = a^3$)",
            "image": "",
            "answers": ["$9$", "$27$", "$18$", "$12$"],
            "correct": 2
        },
        {
            "title": "Problème de moyenne",
            "text": "Quelle est la moyenne des nombres $4$, $6$, $8$ et $10$ ?",
            "image": "",
            "answers": ["$6$", "$7$", "$8$", "$9$"],
            "correct": 2
        }
    ]
    
    for i, q_data in enumerate(questions_data):
        question = Question(
            title=q_data["title"], 
            text=q_data["text"], 
            position=i+1, 
            image=q_data["image"]
        )
        db.session.add(question)
        db.session.flush()
        
        for j, answer_text in enumerate(q_data["answers"]):
            is_correct = (j + 1 == q_data["correct"])
            answer = Answer(question_id=question.id, text=answer_text, is_correct=is_correct, order=j)
            db.session.add(answer)
    
    db.session.commit()
    return True

def init_database():
    """Initialize database schema.
    
    Creates all database tables defined in models.py.
    Should be called before running the application.
    """
    with app.app_context():
        db.create_all()

if __name__ == "__main__":
    init_database()
    app.run(debug=True, host='0.0.0.0', port=5000)
