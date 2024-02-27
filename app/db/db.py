import email
from multiprocessing import Event
from sqlalchemy import create_engine
from app.models.models import Base
from sqlalchemy.orm import sessionmaker
import datetime

engine = create_engine("sqlite+pysqlite:///:memory:", echo=True)
print("hit")
Base.metadata.create_all(engine)
print("engine starting...")
Session = sessionmaker(bind=engine)
print("session binded")