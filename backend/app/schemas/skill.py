from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SkillBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    domain_id: str

class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    domain_id: Optional[str] = None

class SkillResponse(SkillBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 