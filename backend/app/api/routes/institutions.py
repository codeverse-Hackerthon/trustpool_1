import uuid
from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_active_user,require_roles
from app.core.database import get_db
from app.models.institution import Institution,VerificationStatus
from app.models.verification import InstitutionVerificationHistory
from app.models.user import User,UserRole
from app.schemas.platform import InstitutionCreate,InstitutionReview
from app.services.security import utcnow
router=APIRouter(prefix="/institutions",tags=["Institutions"])
def out(m,d):return {"success":True,"message":m,"data":d}
def serial(x):return {"id":str(x.id),"name":x.name,"institution_type":x.institution_type.value,"email_domain":x.email_domain,"address":x.address,"contact_email":x.contact_email,"verification_status":x.verification_status.value}
@router.get("")
def list_verified(_:User=Depends(get_current_active_user),db:Session=Depends(get_db)):return out("Institutions retrieved",[serial(x) for x in db.scalars(select(Institution).where(Institution.verification_status==VerificationStatus.VERIFIED)).all()])
@router.get("/pending")
def pending(_:User=Depends(require_roles(UserRole.ADMIN)),db:Session=Depends(get_db)):return out("Pending institutions retrieved",[serial(x) for x in db.scalars(select(Institution).where(Institution.verification_status==VerificationStatus.PENDING)).all()])
@router.post("",status_code=201)
def create(p:InstitutionCreate,_:User=Depends(get_current_active_user),db:Session=Depends(get_db)):
    x=Institution(**p.model_dump(),verification_status=VerificationStatus.PENDING);db.add(x);db.commit();db.refresh(x);return out("Institution submitted for review",serial(x))
@router.get("/{institution_id}")
def get(institution_id:uuid.UUID,_:User=Depends(get_current_active_user),db:Session=Depends(get_db)):
    x=db.get(Institution,institution_id)
    if not x:raise HTTPException(404,"Institution not found")
    return out("Institution retrieved",serial(x))
@router.put("/{institution_id}")
def update(institution_id:uuid.UUID,p:InstitutionCreate,user:User=Depends(get_current_active_user),db:Session=Depends(get_db)):
    x=db.get(Institution,institution_id)
    if not x:raise HTTPException(404,"Institution not found")
    if user.role is not UserRole.ADMIN and user.institution_id!=x.id:raise HTTPException(403,"You are not authorized to update this institution")
    for k,v in p.model_dump().items():setattr(x,k,v)
    x.verification_status=VerificationStatus.PENDING;db.commit();return out("Institution update submitted for review",serial(x))
@router.patch("/{institution_id}/verify")
def verify(institution_id:uuid.UUID,p:InstitutionReview,admin:User=Depends(require_roles(UserRole.ADMIN)),db:Session=Depends(get_db)):
    if p.status not in (VerificationStatus.VERIFIED,VerificationStatus.REJECTED):raise HTTPException(422,"Verification status must be VERIFIED or REJECTED")
    x=db.get(Institution,institution_id)
    if not x:raise HTTPException(404,"Institution not found")
    x.verification_status=p.status;db.add(InstitutionVerificationHistory(institution_id=x.id,decided_by=admin.id,decision=p.status.value,notes=p.notes,decided_at=utcnow()));db.commit();return out("Institution review recorded",serial(x))
