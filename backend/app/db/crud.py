from sqlalchemy.orm import Session
from typing import List, Optional
from . import models
from ..utils.password import get_password_hash

# User CRUD
def get_user(db: Session, user_id: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, email: str, name: str, password: str, role: str, 
                avatar: Optional[str] = None, department: Optional[str] = None, 
                experience: Optional[int] = None, domain_id: Optional[str] = None) -> models.User:
    hashed_password = get_password_hash(password)
    db_user = models.User(
        email=email,
        name=name,
        hashed_password=hashed_password,
        role=role,
        avatar=avatar,
        department=department,
        experience=experience,
        domain_id=domain_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: str, **kwargs) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if db_user:
        for key, value in kwargs.items():
            if hasattr(db_user, key):
                setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: str) -> bool:
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False

# Domain CRUD
def get_domain(db: Session, domain_id: str) -> Optional[models.Domain]:
    return db.query(models.Domain).filter(models.Domain.id == domain_id).first()

def get_domains(db: Session, skip: int = 0, limit: int = 100) -> List[models.Domain]:
    return db.query(models.Domain).offset(skip).limit(limit).all()

def create_domain(db: Session, name: str, description: Optional[str] = None) -> models.Domain:
    db_domain = models.Domain(name=name, description=description)
    db.add(db_domain)
    db.commit()
    db.refresh(db_domain)
    return db_domain

def update_domain(db: Session, domain_id: str, **kwargs) -> Optional[models.Domain]:
    db_domain = get_domain(db, domain_id)
    if db_domain:
        for key, value in kwargs.items():
            if hasattr(db_domain, key):
                setattr(db_domain, key, value)
        db.commit()
        db.refresh(db_domain)
    return db_domain

def delete_domain(db: Session, domain_id: str) -> bool:
    db_domain = get_domain(db, domain_id)
    if db_domain:
        db.delete(db_domain)
        db.commit()
        return True
    return False

# Skill CRUD
def get_skill(db: Session, skill_id: str) -> Optional[models.Skill]:
    return db.query(models.Skill).filter(models.Skill.id == skill_id).first()

def get_skills(db: Session, skip: int = 0, limit: int = 100) -> List[models.Skill]:
    return db.query(models.Skill).offset(skip).limit(limit).all()

def get_skills_by_domain(db: Session, domain_id: str) -> List[models.Skill]:
    return db.query(models.Skill).filter(models.Skill.domain_id == domain_id).all()

def create_skill(db: Session, name: str, category: str, description: Optional[str] = None, domain_id: str = None) -> models.Skill:
    db_skill = models.Skill(name=name, category=category, description=description, domain_id=domain_id)
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

def update_skill(db: Session, skill_id: str, **kwargs) -> Optional[models.Skill]:
    db_skill = get_skill(db, skill_id)
    if db_skill:
        for key, value in kwargs.items():
            if hasattr(db_skill, key):
                setattr(db_skill, key, value)
        db.commit()
        db.refresh(db_skill)
    return db_skill

def delete_skill(db: Session, skill_id: str) -> bool:
    db_skill = get_skill(db, skill_id)
    if db_skill:
        db.delete(db_skill)
        db.commit()
        return True
    return False

# Score CRUD
def get_score(db: Session, score_id: str) -> Optional[models.Score]:
    return db.query(models.Score).filter(models.Score.id == score_id).first()

def get_scores_by_employee(db: Session, employee_id: str) -> List[models.Score]:
    return db.query(models.Score).filter(models.Score.employee_id == employee_id).all()

def get_scores(db: Session, skip: int = 0, limit: int = 100) -> List[models.Score]:
    return db.query(models.Score).offset(skip).limit(limit).all()

def create_score(db: Session, employee_id: str, skill_id: str, score: float, 
                trainer_id: str, feedback: Optional[str] = None) -> models.Score:
    db_score = models.Score(
        employee_id=employee_id,
        skill_id=skill_id,
        score=score,
        trainer_id=trainer_id,
        feedback=feedback
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score

def update_score(db: Session, score_id: str, **kwargs) -> Optional[models.Score]:
    db_score = get_score(db, score_id)
    if db_score:
        for key, value in kwargs.items():
            if hasattr(db_score, key):
                setattr(db_score, key, value)
        db.commit()
        db.refresh(db_score)
    return db_score

def delete_score(db: Session, score_id: str) -> bool:
    db_score = get_score(db, score_id)
    if db_score:
        db.delete(db_score)
        db.commit()
        return True
    return False

# Learning Path CRUD
def get_learning_path(db: Session, path_id: str) -> Optional[models.LearningPath]:
    return db.query(models.LearningPath).filter(models.LearningPath.id == path_id).first()

def get_learning_paths_by_employee(db: Session, employee_id: str) -> List[models.LearningPath]:
    return db.query(models.LearningPath).filter(models.LearningPath.employee_id == employee_id).all()

def create_learning_path(db: Session, title: str, employee_id: str, assigned_by: str) -> models.LearningPath:
    db_path = models.LearningPath(
        title=title,
        employee_id=employee_id,
        assigned_by=assigned_by
    )
    db.add(db_path)
    db.commit()
    db.refresh(db_path)
    return db_path

# Learning Step CRUD
def get_learning_step(db: Session, step_id: str) -> Optional[models.LearningStep]:
    return db.query(models.LearningStep).filter(models.LearningStep.id == step_id).first()

def get_learning_steps_by_path(db: Session, path_id: str) -> List[models.LearningStep]:
    return db.query(models.LearningStep).filter(models.LearningStep.learning_path_id == path_id).all()

def create_learning_step(db: Session, learning_path_id: str, title: str, 
                        skill_type: str, description: Optional[str] = None) -> models.LearningStep:
    db_step = models.LearningStep(
        learning_path_id=learning_path_id,
        title=title,
        skill_type=skill_type,
        description=description
    )
    db.add(db_step)
    db.commit()
    db.refresh(db_step)
    return db_step

def update_learning_step(db: Session, step_id: str, **kwargs) -> Optional[models.LearningStep]:
    db_step = get_learning_step(db, step_id)
    if db_step:
        for key, value in kwargs.items():
            if hasattr(db_step, key):
                setattr(db_step, key, value)
        db.commit()
        db.refresh(db_step)
    return db_step

# Notification CRUD
def get_notification(db: Session, notification_id: str) -> Optional[models.Notification]:
    return db.query(models.Notification).filter(models.Notification.id == notification_id).first()

def get_notifications_by_user(db: Session, user_id: str) -> List[models.Notification]:
    return db.query(models.Notification).filter(models.Notification.user_id == user_id).all()

def create_notification(db: Session, user_id: str, type: str, title: str, message: str) -> models.Notification:
    db_notification = models.Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def mark_notification_read(db: Session, notification_id: str) -> Optional[models.Notification]:
    db_notification = get_notification(db, notification_id)
    if db_notification:
        db_notification.read = True
        db.commit()
        db.refresh(db_notification)
    return db_notification 