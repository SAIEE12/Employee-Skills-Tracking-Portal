from sqlalchemy.orm import Session
from typing import List, Optional
from ..db import crud
from ..schemas.skill import SkillCreate, SkillUpdate, SkillResponse

class SkillService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_skill(self, skill_data: SkillCreate) -> SkillResponse:
        """Create a new skill."""
        db_skill = crud.create_skill(
            db=self.db,
            name=skill_data.name,
            category=skill_data.category,
            description=skill_data.description,
            domain_id=skill_data.domain_id
        )
        return SkillResponse.model_validate(db_skill)
    
    def get_skill(self, skill_id: str) -> Optional[SkillResponse]:
        """Get skill by ID."""
        db_skill = crud.get_skill(self.db, skill_id)
        if db_skill:
            return SkillResponse.model_validate(db_skill)
        return None
    
    def get_skills(self, skip: int = 0, limit: int = 100) -> List[SkillResponse]:
        """Get all skills."""
        db_skills = crud.get_skills(self.db, skip, limit)
        return [SkillResponse.model_validate(skill) for skill in db_skills]
    
    def get_skills_by_category(self, category: str) -> List[SkillResponse]:
        """Get skills by category."""
        db_skills = crud.get_skills(self.db)
        return [
            SkillResponse.model_validate(skill) 
            for skill in db_skills 
            if skill.category == category
        ]
    
    def get_skills_by_domain(self, domain_id: str) -> List[SkillResponse]:
        """Get skills by domain."""
        db_skills = crud.get_skills_by_domain(self.db, domain_id)
        return [SkillResponse.model_validate(skill) for skill in db_skills]
    
    def update_skill(self, skill_id: str, skill_data: SkillUpdate) -> Optional[SkillResponse]:
        """Update skill."""
        db_skill = crud.update_skill(self.db, skill_id, **skill_data.model_dump(exclude_unset=True))
        if db_skill:
            return SkillResponse.model_validate(db_skill)
        return None
    
    def delete_skill(self, skill_id: str) -> bool:
        """Delete skill."""
        return crud.delete_skill(self.db, skill_id) 