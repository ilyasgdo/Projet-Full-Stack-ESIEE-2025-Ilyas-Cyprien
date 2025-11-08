#!/usr/bin/env python3
"""
Standalone script to initialize the database with pre-made mathematics questions.

Usage:
    python init_math_questions.py

This script will:
1. Check if the database already has questions
2. If empty, populate it with 15 mathematics questions containing LaTeX
3. If questions exist, ask for confirmation before clearing and repopulating
"""

import sys
import os

# Add the current directory to the path so we can import app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db, init_math_questions
from models import Question, Answer, Participation

def main():
    """Main function to initialize math questions."""
    with app.app_context():
        # Ensure database tables exist
        db.create_all()
        
        # Check if questions already exist
        existing_count = Question.query.count()
        
        if existing_count > 0:
            print(f"\n⚠️  Warning: Database already contains {existing_count} question(s).")
            response = input("Do you want to clear existing questions and add math questions? (yes/no): ").strip().lower()
            
            if response not in ['yes', 'y']:
                print("Operation cancelled. Database unchanged.")
                return
            
            # Clear existing data
            print("\nClearing existing questions...")
            Answer.query.delete()
            Question.query.delete()
            Participation.query.delete()
            db.session.commit()
            print("Existing data cleared.")
        
        # Initialize math questions
        print("\n" + "="*50)
        print("Initializing database with mathematics questions...")
        print("="*50 + "\n")
        
        success = init_math_questions()
        
        if success:
            print("\n" + "="*50)
            print("✅ Successfully initialized database with math questions!")
            print("="*50)
            print(f"\nYou can now start the Flask app and use these questions.")
        else:
            print("\n⚠️  Database initialization was skipped (questions already exist).")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

