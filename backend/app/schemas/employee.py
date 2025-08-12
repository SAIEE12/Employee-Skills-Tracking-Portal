from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str
    department: Optional[str] = None
    experience: Optional[int] = None
    domain_id: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    experience: Optional[int] = None
    domain_id: Optional[str] = None

class UserResponse(UserBase):
    id: str
    avatar: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserWithSkills(UserResponse):
    skills: List["SkillResponse"] = []
    domain: Optional["DomainResponse"] = None

# Legacy schemas for existing routes
class EmployeeBase(BaseModel):
    email: EmailStr
    name: str
    department: Optional[str] = None
    experience: Optional[int] = None
    avatar: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    password: str

class EmployeeUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    department: Optional[str] = None
    experience: Optional[int] = None

class EmployeeResponse(EmployeeBase):
    id: str
    role: str = "employee"
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class EmployeeWithScores(EmployeeResponse):
    scores: List['ScoreResponse'] = []
    
    class Config:
        from_attributes = True

# Import at the end to avoid circular imports
from .skill import SkillResponse
from .domain import DomainResponse
from .score import ScoreResponse
UserWithSkills.model_rebuild()
EmployeeWithScores.model_rebuild() 