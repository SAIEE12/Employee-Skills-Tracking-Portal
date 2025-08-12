from sqlalchemy.orm import Session
from typing import List, Optional
from ..db import crud
from ..schemas.domain import DomainCreate, DomainUpdate, DomainResponse

class DomainService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_domain(self, domain_data: DomainCreate) -> DomainResponse:
        """Create a new domain."""
        db_domain = crud.create_domain(
            db=self.db,
            name=domain_data.name,
            description=domain_data.description
        )
        return DomainResponse.model_validate(db_domain)
    
    def get_domain(self, domain_id: str) -> Optional[DomainResponse]:
        """Get domain by ID."""
        db_domain = crud.get_domain(self.db, domain_id)
        if db_domain:
            return DomainResponse.model_validate(db_domain)
        return None
    
    def get_domains(self, skip: int = 0, limit: int = 100) -> List[DomainResponse]:
        """Get all domains."""
        db_domains = crud.get_domains(self.db, skip, limit)
        return [DomainResponse.model_validate(domain) for domain in db_domains]
    
    def update_domain(self, domain_id: str, domain_data: DomainUpdate) -> Optional[DomainResponse]:
        """Update domain."""
        db_domain = crud.update_domain(self.db, domain_id, **domain_data.model_dump(exclude_unset=True))
        if db_domain:
            return DomainResponse.model_validate(db_domain)
        return None
    
    def delete_domain(self, domain_id: str) -> bool:
        """Delete domain."""
        return crud.delete_domain(self.db, domain_id) 