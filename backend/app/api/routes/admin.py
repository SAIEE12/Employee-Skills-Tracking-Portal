from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ...db.session import get_db
from ...schemas.admin import UserCreateWithSkills, UserFilter, StatsResponse
from ...schemas.domain import DomainResponse
from ...schemas.skill import SkillResponse
from ...schemas.employee import UserWithSkills
from ...services.admin_service import AdminService
from ...services.domain_service import DomainService
from ...services.skill_service import SkillService
from ...api.dependencies import get_current_manager

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/domains", response_model=List[DomainResponse])
def get_domains(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all domains."""
    service = DomainService(db)
    return service.get_domains(skip, limit)

@router.get("/skills", response_model=List[SkillResponse])
def get_skills(
    domain_id: Optional[str] = Query(None, description="Filter skills by domain"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get skills with optional domain filtering."""
    if domain_id:
        service = SkillService(db)
        return service.get_skills_by_domain(domain_id)
    else:
        service = SkillService(db)
        return service.get_skills(skip, limit)

@router.get("/users", response_model=List[UserWithSkills])
def get_users(
    domain_id: Optional[str] = Query(None, description="Filter by domain"),
    skill_ids: Optional[List[str]] = Query(None, description="Filter by skills"),
    role: Optional[str] = Query(None, description="Filter by role"),
    department: Optional[str] = Query(None, description="Filter by department"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_manager)
):
    """Get users with optional filtering."""
    filters = UserFilter(
        domain_id=domain_id,
        skill_ids=skill_ids,
        role=role,
        department=department,
        skip=skip,
        limit=limit
    )
    service = AdminService(db)
    return service.get_users_with_filters(filters)

@router.post("/users", response_model=UserWithSkills)
def create_user(
    user_data: UserCreateWithSkills,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_manager)
):
    """Create a new user with skills."""
    service = AdminService(db)
    return service.create_user_with_skills(user_data)

@router.get("/stats", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_manager)
):
    """Get dashboard statistics."""
    service = AdminService(db)
    return service.get_stats() 