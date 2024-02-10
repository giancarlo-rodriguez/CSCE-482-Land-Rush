from flask import Blueprint, request, jsonify, session
import jwt
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

# Simulated user data stored in memory
users = {
    'admin@example.com': {'password': 'admin', 'tier': 'admin'},
    'uni@example.com': {'password': 'university', 'tier': 'university'},
    'org@example.com': {'password': 'organization', 'tier': 'org'},
    'user@example.com': {'password': 'user', 'tier': 'user'}
}


@auth_bp.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if email in users and users[email]['password'] == password:
            # Generate token with user tier
            payload = {
                'email': email,
                'tier': users[email]['tier'],
                'exp': datetime.utcnow() + timedelta(hours=1)
            }
            token = jwt.encode(payload, 'your_secret_key_here', algorithm='HS256')
            session['token'] = token  # Save token in session for subsequent requests
            return jsonify({'token': token}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['GET'])
def logout():
    # Clear token from session on logout
    session.pop('token', None)
    return jsonify({'message': 'Logged out successfully'}), 200
