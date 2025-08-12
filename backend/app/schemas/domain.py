from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DomainBase(BaseModel):
    name: str
    description: Optional[str] = None

class DomainCreate(DomainBase):
    pass

class DomainUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class DomainResponse(DomainBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class DomainWithSkills(DomainResponse):
    skills: List["SkillResponse"] = []

# Import at the end to avoid circular imports
from .skill import SkillResponse
DomainWithSkills.model_rebuild() 