from datetime import datetime
from sqlalchemy import Integer, String, ForeignKey, Column, Table, Double
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import DeclarativeBase
from typing import List, Optional

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(30))
    password: Mapped[str] = mapped_column(String(30))
    is_university: Mapped[bool] = mapped_column()
    user_organizations: Mapped[List["Organization_Roles"]] = relationship(back_populates="organization_users")

class Organization(Base):
    __tablename__ = "organizations"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    org_roles: Mapped[List["Organization_Roles"]] = relationship()
    university_id: Mapped[int] = mapped_column(ForeignKey("universities.id"))
    university: Mapped["University"] = relationship()
    reservation: Mapped["Reservation"] = relationship(back_populates="organization")

class Organization_Roles(Base):
    __tablename__ = "organizations_roles"
    id: Mapped[int] = mapped_column(primary_key=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"))
    organization: Mapped["Organization"] = relationship(back_populates="org_roles")
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    organization_users: Mapped[List["User"]] = relationship(back_populates="user_organizations")
    is_admin: Mapped[bool] = mapped_column()

class University(Base):
    __tablename__ = "universities"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    plots: Mapped[List["Plot"]] = relationship()
    organizations: Mapped["Organization"] = relationship(back_populates="university")
    event: Mapped["University_Event"] = relationship(back_populates="university")

class Plot(Base):
    __tablename__ = "plots"
    id: Mapped[int] = mapped_column(primary_key=True)
    university_id: Mapped[int] = mapped_column(ForeignKey("universities.id"))
    points: Mapped[List["Point"]] = relationship()
    
class Point(Base):
    __tablename__ = "points"
    id: Mapped[int] = mapped_column(primary_key=True)
    #either plotID or reservation must have a value, it either maps to the boundary (plot_id), or an org space(reservation)
    plot_id: Mapped[Optional[int]] = mapped_column(ForeignKey("plots.id"))
    reservation_id: Mapped[Optional[int]] = mapped_column(ForeignKey("reservations.id"))
    latitude: Mapped[float] = mapped_column()
    longitude: Mapped[float] = mapped_column()
    
class Reservation(Base):
    __tablename__ = "reservations"
    id: Mapped[int] = mapped_column(primary_key=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"))
    organization: Mapped["Organization"] = relationship(back_populates="reservation")
    event_id: Mapped[int] = mapped_column(ForeignKey("university_events.id"))
    event: Mapped["University_Event"] = relationship()
    points: Mapped[List["Point"]] = relationship()
    number_of_people: Mapped[int] = mapped_column()

class University_Event(Base):
    __tablename__ = "university_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    university_id: Mapped[int] = mapped_column(ForeignKey("universities.id"))
    university: Mapped["University"] = relationship(back_populates="event")
    event_created: Mapped[datetime] = mapped_column()
    event_registration_start_time: Mapped[datetime] = mapped_column()
    event_registration_end_time: Mapped[datetime] = mapped_column()
    event_start_time: Mapped[datetime] = mapped_column()
    event_end_time: Mapped[datetime] = mapped_column()
