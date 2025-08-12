from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

# Association table for User-Skill relationship
user_skills = Table(
    "user_skills",
    Base.metadata,
    Column("user_id", String, ForeignKey("users.id"), primary_key=True),
    Column("skill_id", String, ForeignKey("skills.id"), primary_key=True),
    Column("proficiency_level", Integer, default=1),  # 1-5 scale
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    Column("updated_at", DateTime(timezone=True), onupdate=func.now())
)

class Domain(Base):
    __tablename__ = "domains"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    skills = relationship("Skill", back_populates="domain")
    users = relationship("User", back_populates="domain")

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # employee, trainer, manager, super-user
    avatar = Column(String, nullable=True)
    department = Column(String, nullable=True)
    experience = Column(Integer, nullable=True)
    domain_id = Column(String, ForeignKey("domains.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    domain = relationship("Domain", back_populates="users")
    scores = relationship("Score", foreign_keys="Score.employee_id", back_populates="employee")
    trainer_scores = relationship("Score", foreign_keys="Score.trainer_id", back_populates="trainer")
    notifications = relationship("Notification", back_populates="user")
    learning_paths = relationship("LearningPath", foreign_keys="LearningPath.employee_id", back_populates="employee")
    assigned_learning_paths = relationship("LearningPath", foreign_keys="LearningPath.assigned_by", back_populates="assigned_by_user")
    skills = relationship("Skill", secondary=user_skills, back_populates="users")

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    domain_id = Column(String, ForeignKey("domains.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    domain = relationship("Domain", back_populates="skills")
    scores = relationship("Score", back_populates="skill")
    users = relationship("User", secondary=user_skills, back_populates="skills")

class Score(Base):
    __tablename__ = "scores"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    employee_id = Column(String, ForeignKey("users.id"), nullable=False)
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False)
    score = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    trainer_id = Column(String, ForeignKey("users.id"), nullable=False)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    employee = relationship("User", foreign_keys=[employee_id], back_populates="scores")
    skill = relationship("Skill", back_populates="scores")
    trainer = relationship("User", foreign_keys=[trainer_id], back_populates="trainer_scores")

class LearningPath(Base):
    __tablename__ = "learning_paths"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    employee_id = Column(String, ForeignKey("users.id"), nullable=False)
    assigned_by = Column(String, ForeignKey("users.id"), nullable=False)
    assigned_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    employee = relationship("User", foreign_keys=[employee_id], back_populates="learning_paths")
    assigned_by_user = relationship("User", foreign_keys=[assigned_by], back_populates="assigned_learning_paths")
    steps = relationship("LearningStep", back_populates="learning_path")

class LearningStep(Base):
    __tablename__ = "learning_steps"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    learning_path_id = Column(String, ForeignKey("learning_paths.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    skill_type = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    completed_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    learning_path = relationship("LearningPath", back_populates="steps")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # feedback, status_change, learning_path, assessment
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notifications") 