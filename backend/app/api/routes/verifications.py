import uuid
from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_active_user,require_roles
from app.core.database import get_db
from app.models.user import User,UserRole
from app.models.verification import UserVerification,VerificationState
from app.schemas.platform import VerificationCreate,VerificationReview
from app.services.security import utcnow
router=APIRouter(prefix="/verifications",tags=["Verifications"])
def serial(x,include_document=False):
 d={"id":str(x.id),"user_id":str(x.user_id),"verification_type":x.verification_type.value,"title":x.title,"description":x.description,"status":x.status.value,"expires_at":x.expires_at.isoformat() if x.expires_at else None,"reviewer_notes":x.reviewer_notes}
 if include_document:d["document_url"]=x.document_url
 return d
@router.post("",status_code=201)
def submit(p:VerificationCreate,user:User=Depends(get_current_active_user),db:Session=Depends(get_db)):
 x=UserVerification(user_id=user.id,verification_type=p.verification_type,title=p.title,description=p.description,document_url=str(p.document_url) if p.document_url else None,expires_at=p.expires_at,submitted_at=utcnow());db.add(x);db.commit();db.refresh(x);return {"success":True,"message":"Verification submitted","data":serial(x,True)}
@router.get("/me")
def mine(user:User=Depends(get_current_active_user),db:Session=Depends(get_db)):return {"success":True,"data":[serial(x,True) for x in db.scalars(select(UserVerification).where(UserVerification.user_id==user.id)).all()]}
@router.get("/pending")
def pending(_:User=Depends(require_roles(UserRole.ADMIN)),db:Session=Depends(get_db)):return {"success":True,"data":[serial(x,True) for x in db.scalars(select(UserVerification).where(UserVerification.status==VerificationState.PENDING)).all()]}
@router.get("/{verification_id}")
def get(verification_id:uuid.UUID,user:User=Depends(get_current_active_user),db:Session=Depends(get_db)):
 x=db.get(UserVerification,verification_id)
 if not x or (x.user_id!=user.id and user.role is not UserRole.ADMIN):raise HTTPException(404,"Verification not found")
 return {"success":True,"data":serial(x,x.user_id==user.id or user.role is UserRole.ADMIN)}
@router.patch("/{verification_id}/review")
def review(verification_id:uuid.UUID,p:VerificationReview,admin:User=Depends(require_roles(UserRole.ADMIN)),db:Session=Depends(get_db)):
 x=db.get(UserVerification,verification_id)
 if not x:raise HTTPException(404,"Verification not found")
 if x.user_id==admin.id:raise HTTPException(403,"Users cannot review their own verification")
 if p.status not in (VerificationState.APPROVED,VerificationState.REJECTED):raise HTTPException(422,"Review status must be APPROVED or REJECTED")
 if p.status is VerificationState.REJECTED and not p.reviewer_notes:raise HTTPException(422,"Rejected verifications require reviewer notes")
 x.status=p.status;x.reviewed_by=admin.id;x.reviewer_notes=p.reviewer_notes;x.reviewed_at=utcnow();db.commit();return {"success":True,"message":"Verification reviewed","data":serial(x,True)}
