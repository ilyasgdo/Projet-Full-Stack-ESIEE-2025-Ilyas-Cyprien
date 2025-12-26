#!/bin/sh
# Entrypoint script for quiz-api
# Initializes the database tables if they don't exist

echo "Initializing database tables..."
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('Database initialized!')"

echo "Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
