from flask import Flask
from app.routes import routes_bp
from app.auth.auth import auth_bp
def create_app():
    app = Flask(__name__)
    app.secret_key = 'your_secret_key_here'
    # Register the routes Blueprint
    app.register_blueprint(routes_bp)
    app.register_blueprint(auth_bp)
    return app
