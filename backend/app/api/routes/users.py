import uuid
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.platform import ProfileUpdate
from app.schemas.auth import ChangePasswordRequest
from app.services.security import hash_password,utcnow,verify_password
from app.models.auth_token import RefreshToken
from sqlalchemy import update
router=APIRouter(prefix="/users",tags=["Users"])
def wrap(message,data):return {"success":True,"message":message,"data":data}
@router.get("/me")
def me(user:User=Depends(get_current_active_user)):return wrap("Profile retrieved successfully",UserResponse.model_validate(user).model_dump(mode="json"))
@router.put("/me")
def update(p:ProfileUpdate,user:User=Depends(get_current_active_user),db:Session=Depends(get_db)):
    for k,v in p.model_dump(exclude_unset=True).items():setattr(user,k,str(v) if k=="profile_image_url" and v else v)
    db.commit();db.refresh(user);return wrap("Profile updated successfully",UserResponse.model_validate(user).model_dump(mode="json"))
@router.patch("/me/password")
def password(p:ChangePasswordRequest,user:User=Depends(get_current_active_user),db:Session=Depends(get_db)):
    if not verify_password(p.current_password,user.hashed_password):raise HTTPException(400,"Current password is incorrect.")
    user.hashed_password=hash_password(p.new_password);user.password_changed_at=utcnow();db.execute(update(RefreshToken).where(RefreshToken.user_id==user.id,RefreshToken.revoked_at.is_(None)).values(revoked_at=utcnow()));db.commit();return wrap("Password changed successfully",{})
@router.patch("/me/institution")
def institution(institution_id:uuid.UUID,user:User=Depends(get_current_active_user),db:Session=Depends(get_db)):
    user.institution_id=institution_id;db.commit();return wrap("Institution association requested",UserResponse.model_validate(user).model_dump(mode="json"))
@router.get("/{user_id}")
def public_user(user_id:uuid.UUID,_:User=Depends(get_current_active_user),db:Session=Depends(get_db)):
    user=db.get(User,user_id)
    if not user:raise HTTPException(404,"User not found")
    return wrap("User retrieved successfully",{"id":str(user.id),"full_name":user.full_name,"role":user.role.value,"institution_id":str(user.institution_id) if user.institution_id else None,"email_verified":user.email_verified})
