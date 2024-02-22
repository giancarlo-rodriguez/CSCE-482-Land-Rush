from app.db.db import Session
from app.models.models import User, Organization, University, Plot, Point, Reservation, University_Event

# User services
def get_user_by_id(session: Session, user_id: int) -> User:
    """Get a user by their ID."""
    return session.query(User).filter(User.id == user_id).first()

def get_users(session: Session) -> list[User]:
    """Get all users."""
    return session.query(User).all()

def create_user(session: Session, name: str, email: str, password: str, is_university: bool) -> User:
    """Create a new user."""
    user = User(name=name, email=email, password=password, is_university=is_university)
    session.add(user)
    session.commit()
    return user

# Similar functions for other models: Organization, Role, University, etc.
def update_user(session: Session, user_id: int, **kwargs) -> User:
    """Update user attributes."""
    user = get_user_by_id(session, user_id)
    if user:
        for key, value in kwargs.items():
            setattr(user, key, value)
        session.commit()
    return user

def delete_user(session: Session, user_id: int) -> None:
    """Delete a user."""
    user = get_user_by_id(session, user_id)
    if user:
        session.delete(user)
        session.commit()

# Similar update and delete functions for other models.

# Additional functions for more complex queries or operations:

def get_user_organizations(session: Session, user_id: int) -> list[Organization]:
    """Get organizations associated with a user."""
    user = get_user_by_id(session, user_id)
    if user:
        return user.organizations
    return []

def get_plot_by_id(session: Session, plot_id: int) -> Plot:
    """Get a plot by its ID."""
    return session.query(Plot).filter(Plot.id == plot_id).first()

# Add more functions as needed for your specific use cases.
# name = "walter"
# email = "walter@tamu.edu"
# password = "Chilling"
# is_university = True
# session = Session()
# user = create_user(session, name, email, password, is_university)
