from flask import Blueprint, request, jsonify, session
import jwt
from datetime import datetime, timedelta
from app.services.services import create_user
from app.db.db import Session
auth_bp = Blueprint('auth', __name__)

# Simulated user data stored in memory
@auth_bp.route('/signup', methods=['POST'])
def signup():
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role_id = bool(data.get('role_id'))  # Assuming you specify the role ID in the request
        # Create a new SQLAlchemy session
        print(name, email, password, role_id)
        session = Session()
        try:
            # Call create_user function and pass in the session
            new_user = create_user(session, name=name, email=email, password=password, is_university=role_id)
            session.commit()
            return jsonify({'message': 'User created successfully', 'user_id': new_user.id}), 201
        except Exception as e:
            # Handle any errors that occur during user creation
            session.rollback()
            return jsonify({'error': str(e)}), 500
        finally:
            # Close the session to release resources
            session.close()


@auth_bp.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
            # Generate token with user tier
        payload = {
            'email': email,
            'tier': users[email]['tier'],
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(payload, 'your_secret_key_here', algorithm='HS256')
        session['token'] = token  # Save token in session for subsequent requests
        return jsonify({'token': token}), 200
        #else
       # return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['GET'])
def logout():
    # Clear token from session on logout
    session.pop('token', None)
    return jsonify({'message': 'Logged out successfully'}), 200
