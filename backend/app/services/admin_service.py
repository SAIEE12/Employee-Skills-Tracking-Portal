from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from ..db import crud
from ..schemas.admin import UserCreateWithSkills, UserFilter, StatsResponse, UserSkillAssignment
from ..schemas.employee import UserResponse, UserWithSkills
from ..utils.password import get_password_hash
from ..db.models import User, Skill, Domain, user_skills

class AdminService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_user_with_skills(self, user_data: UserCreateWithSkills) -> UserWithSkills:
        """Create a new user with assigned skills."""
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        db_user = crud.create_user(
            db=self.db,
            email=user_data.email,
            name=user_data.name,
            hashed_password=hashed_password,
            role=user_data.role,
            department=user_data.department,
            experience=user_data.experience,
            domain_id=user_data.domain_id
        )
        
        # Assign skills
        if user_data.skill_ids:
            self._assign_skills_to_user(db_user.id, user_data.skill_ids)
        
        # Return user with skills
        return self.get_user_with_skills(db_user.id)
    
    def get_users_with_filters(self, filters: UserFilter) -> List[UserWithSkills]:
        """Get users with optional domain and skills filtering."""
        query = self.db.query(User)
        
        if filters.domain_id:
            query = query.filter(User.domain_id == filters.domain_id)
        
        if filters.role:
            query = query.filter(User.role == filters.role)
        
        if filters.department:
            query = query.filter(User.department == filters.department)
        
        if filters.skill_ids:
            # Filter users who have at least one of the specified skills
            query = query.join(user_skills).filter(user_skills.c.skill_id.in_(filters.skill_ids))
        
        users = query.offset(filters.skip).limit(filters.limit).all()
        
        return [self.get_user_with_skills(user.id) for user in users]
    
    def get_user_with_skills(self, user_id: str) -> Optional[UserWithSkills]:
        """Get user with their skills and domain information."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        # Get user skills
        skills = self.db.query(Skill).join(user_skills).filter(user_skills.c.user_id == user_id).all()
        
        # Get domain
        domain = None
        if user.domain_id:
            domain = self.db.query(Domain).filter(Domain.id == user.domain_id).first()
        
        # Build response
        user_data = UserResponse.model_validate(user)
        skills_data = [{"id": skill.id, "name": skill.name, "category": skill.category, "description": skill.description, "domain_id": skill.domain_id} for skill in skills]
        domain_data = {"id": domain.id, "name": domain.name, "description": domain.description} if domain else None
        
        return UserWithSkills(
            **user_data.model_dump(),
            skills=skills_data,
            domain=domain_data
        )
    
    def get_stats(self) -> StatsResponse:
        """Get dashboard statistics."""
        # Count totals
        total_users = self.db.query(func.count(User.id)).scalar()
        total_skills = self.db.query(func.count(Skill.id)).scalar()
        total_domains = self.db.query(func.count(Domain.id)).scalar()
        
        # Users by role
        users_by_role = {}
        role_counts = self.db.query(User.role, func.count(User.id)).group_by(User.role).all()
        for role, count in role_counts:
            users_by_role[role] = count
        
        # Skills by domain
        skills_by_domain = {}
        domain_skill_counts = self.db.query(Domain.name, func.count(Skill.id)).join(Skill).group_by(Domain.name).all()
        for domain_name, count in domain_skill_counts:
            skills_by_domain[domain_name] = count
        
        return StatsResponse(
            total_users=total_users,
            total_skills=total_skills,
            total_domains=total_domains,
            users_by_role=users_by_role,
            skills_by_domain=skills_by_domain
        )
    
    def _assign_skills_to_user(self, user_id: str, skill_ids: List[str]):
        """Assign skills to a user."""
        # Remove existing skills
        self.db.execute(user_skills.delete().where(user_skills.c.user_id == user_id))
        
        # Add new skills
        for skill_id in skill_ids:
            self.db.execute(user_skills.insert().values(
                user_id=user_id,
                skill_id=skill_id
            ))
        
        self.db.commit() 