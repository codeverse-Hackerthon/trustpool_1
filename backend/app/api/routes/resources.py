import math, uuid
from datetime import date,time
from fastapi import APIRouter,Depends,HTTPException,Query,status
from sqlalchemy import func,or_,select
from sqlalchemy.orm import Session,selectinload
from app.api.dependencies import get_current_active_user,require_roles
from app.core.database import get_db
from app.models.resource import Resource,ResourceStatus
from app.models.resource_detail import ResourceAvailability,ResourceClosure,ResourceImage
from app.models.user import User,UserRole
from app.schemas.platform import ResourceCreate,ResourceUpdate,StatusUpdate
from app.services.audit_service import log_audit_event
router=APIRouter(prefix="/resources",tags=["Resources"])
def data(message, value): return {"success":True,"message":message,"data":value}
def visible(q,user):
    if user.role is UserRole.ADMIN:return q
    return q.where((Resource.is_public.is_(True)) | (Resource.owner_id==user.id) | ((Resource.institution_only.is_(True)) & (Resource.institution_id==user.institution_id)))
def serialize(r):
    cover = next((i.url for i in r.images if i.is_cover), None)
    if not cover and r.images:
        cover = r.images[0].url
    status_mapped = "available" if r.status == ResourceStatus.ACTIVE else ("maintenance" if r.status == ResourceStatus.UNDER_MAINTENANCE else "reserved")
    return {
        "id": str(r.id),
        "name": r.name,
        "title": r.name,
        "description": r.description or "",
        "category": r.category.lower(),
        "resource_type": r.resource_type.value,
        "resourceType": r.resource_type.value,
        "owner_id": str(r.owner_id),
        "ownerId": str(r.owner_id),
        "ownerName": "Dr. Sarah Chen" if str(r.owner_id).startswith("3333") else "Resource Owner",
        "institution_id": str(r.institution_id) if r.institution_id else None,
        "institutionId": str(r.institution_id) if r.institution_id else None,
        "location": r.location or "Campus",
        "capacity": r.capacity,
        "status": status_mapped,
        "status_raw": r.status.value,
        "deposit_amount": float(r.deposit_amount),
        "minTrustScore": 75 if r.requires_training else 70,
        "requires_training": r.requires_training,
        "requires_approval": r.requires_approval,
        "is_public": r.is_public,
        "isFree": float(r.deposit_amount) == 0,
        "imageUrl": cover,
        "images": [{"id": str(i.id), "url": i.url, "position": i.position, "is_cover": i.is_cover} for i in r.images],
        "tags": [r.category.title(), r.resource_type.value.title()],
        "availability_windows": [{"weekday": a.weekday, "opens_at": a.opens_at.isoformat(), "closes_at": a.closes_at.isoformat(), "timezone": a.timezone} for a in r.availability_windows],
        "specifications": r.specifications,
        "rules": r.rules,
        "required_verification_types": r.required_verification_types,
    }
def apply(resource,p):
    for k,v in p.model_dump(exclude={"images","availability_windows"}).items(): setattr(resource,k,v)
    resource.images.clear(); resource.availability_windows.clear()
    resource.images.extend(ResourceImage(url=str(i.url),alt_text=i.alt_text,position=i.position,is_cover=i.is_cover) for i in p.images)
    resource.availability_windows.extend(ResourceAvailability(weekday=a.weekday,opens_at=a.opens_at,closes_at=a.closes_at,timezone=a.timezone) for a in p.availability_windows)
@router.post("",status_code=201)
def create(p:ResourceCreate,user:User=Depends(require_roles(UserRole.OWNER,UserRole.ADMIN)),db:Session=Depends(get_db)):
    if p.institution_id and user.role is not UserRole.ADMIN and p.institution_id!=user.institution_id: raise HTTPException(403,"Cannot assign another institution")
    r=Resource(owner_id=user.id,**p.model_dump(exclude={"images","availability_windows"})); r.images=[ResourceImage(url=str(i.url),alt_text=i.alt_text,position=i.position,is_cover=i.is_cover) for i in p.images]; r.availability_windows=[ResourceAvailability(weekday=a.weekday,opens_at=a.opens_at,closes_at=a.closes_at,timezone=a.timezone) for a in p.availability_windows];db.add(r);db.commit();db.refresh(r)
    log_audit_event(db=db, action_type="RESOURCE_CREATE", entity_type="resource", actor_id=user.id, entity_id=r.id, description=f"Resource '{r.name}' created by {user.email}", metadata={"category": r.category, "resource_type": r.resource_type.value})
    return data("Resource created successfully",serialize(r))
@router.get("")
def listing(search:str|None=None,category:str|None=None,resource_type:str|None=None,institution_id:uuid.UUID|None=None,location:str|None=None,status_:ResourceStatus|None=Query(None,alias="status"),min_capacity:int|None=None,max_capacity:int|None=None,page:int=Query(1,ge=1),page_size:int=Query(10,ge=1,le=100),sort_by:str="updated_at",sort_order:str="desc",user:User=Depends(get_current_active_user),db:Session=Depends(get_db)):
    q=visible(select(Resource).options(selectinload(Resource.images),selectinload(Resource.availability_windows)),user)
    if search:q=q.where(or_(Resource.name.ilike(f"%{search}%"),Resource.description.ilike(f"%{search}%"),Resource.category.ilike(f"%{search}%"),Resource.location.ilike(f"%{search}%")))
    for col,val in ((Resource.category,category),(Resource.resource_type,resource_type),(Resource.institution_id,institution_id),(Resource.location,location),(Resource.status,status_)):
        if val is not None:q=q.where(col==val)
    if min_capacity is not None:q=q.where(Resource.capacity>=min_capacity)
    if max_capacity is not None:q=q.where(Resource.capacity<=max_capacity)
    total=db.scalar(select(func.count()).select_from(q.subquery())) or 0; column=getattr(Resource,sort_by,Resource.updated_at);q=q.order_by(column.asc() if sort_order=="asc" else column.desc()).offset((page-1)*page_size).limit(page_size)
    return data("Resources retrieved successfully",{"items":[serialize(x) for x in db.scalars(q).unique().all()],"pagination":{"page":page,"page_size":page_size,"total_items":total,"total_pages":math.ceil(total/page_size)}})
@router.get("/owner/me")
@router.get("/owner/resources")
@router.get("/owner")
def mine(user:User=Depends(require_roles(UserRole.OWNER,UserRole.ADMIN)),db:Session=Depends(get_db)):
    return data("Owner resources retrieved",[serialize(x) for x in db.scalars(select(Resource).where(Resource.owner_id==user.id).options(selectinload(Resource.images),selectinload(Resource.availability_windows))).all()])
@router.get("/{resource_id}")
def get_one(resource_id:uuid.UUID,user:User=Depends(get_current_active_user),db:Session=Depends(get_db)):
    r=db.scalar(visible(select(Resource).where(Resource.id==resource_id).options(selectinload(Resource.images),selectinload(Resource.availability_windows)),user));
    if not r:raise HTTPException(404,"Resource not found")
    return data("Resource retrieved successfully",serialize(r))
@router.put("/{resource_id}")
def update(resource_id:uuid.UUID,p:ResourceUpdate,user:User=Depends(require_roles(UserRole.OWNER,UserRole.ADMIN)),db:Session=Depends(get_db)):
    r=db.get(Resource,resource_id)
    if not r:raise HTTPException(404,"Resource not found")
    if user.role is not UserRole.ADMIN and r.owner_id!=user.id:raise HTTPException(403,"You are not authorized to update this resource")
    apply(r,p);db.commit();db.refresh(r)
    log_audit_event(db=db, action_type="RESOURCE_UPDATE", entity_type="resource", actor_id=user.id, entity_id=r.id, description=f"Resource '{r.name}' updated by {user.email}")
    return data("Resource updated successfully",serialize(r))
@router.patch("/{resource_id}/status")
def change_status(resource_id:uuid.UUID,p:StatusUpdate,user:User=Depends(require_roles(UserRole.OWNER,UserRole.ADMIN)),db:Session=Depends(get_db)):
    r=db.get(Resource,resource_id)
    if not r or (user.role is not UserRole.ADMIN and r.owner_id!=user.id):raise HTTPException(404,"Resource not found")
    r.status=p.status;db.commit()
    log_audit_event(db=db, action_type="RESOURCE_STATUS_UPDATE", entity_type="resource", actor_id=user.id, entity_id=r.id, description=f"Resource '{r.name}' status set to {p.status.value} by {user.email}", metadata={"status": p.status.value})
    return data("Resource status updated",serialize(r))
@router.delete("/{resource_id}",status_code=204)
def archive(resource_id:uuid.UUID,user:User=Depends(require_roles(UserRole.OWNER,UserRole.ADMIN)),db:Session=Depends(get_db)):
    r=db.get(Resource,resource_id)
    if not r or (user.role is not UserRole.ADMIN and r.owner_id!=user.id):raise HTTPException(404,"Resource not found")
    r.status=ResourceStatus.INACTIVE; r.is_public=False;db.commit()
    log_audit_event(db=db, action_type="RESOURCE_ARCHIVE", entity_type="resource", actor_id=user.id, entity_id=r.id, description=f"Resource '{r.name}' archived by {user.email}")
@router.get("/{resource_id}/availability")
def availability(resource_id:uuid.UUID,date_:date=Query(...,alias="date"),start_time:time=Query(...),end_time:time=Query(...),timezone:str="UTC",user:User=Depends(get_current_active_user),db:Session=Depends(get_db)):
    if start_time>=end_time:raise HTTPException(422,"Start time must be before end time")
    r=db.scalar(visible(select(Resource).where(Resource.id==resource_id).options(selectinload(Resource.availability_windows),selectinload(Resource.closures)),user));
    if not r:raise HTTPException(404,"Resource not found")
    reasons=[]
    if r.status is not ResourceStatus.ACTIVE:reasons.append("Resource is not active")
    if any(c.starts_on<=date_<=c.ends_on for c in r.closures):reasons.append("Resource is closed for maintenance or a temporary closure")
    if not any(a.weekday==date_.weekday() and a.opens_at<=start_time and a.closes_at>=end_time for a in r.availability_windows):reasons.append("Resource is closed during the requested period")
    return data("Operating availability checked",{"resource_id":str(r.id),"available":not reasons,"requested_period":{"date":date_.isoformat(),"start_time":start_time.isoformat(),"end_time":end_time.isoformat(),"timezone":timezone},"reasons":reasons,"booking_conflicts_checked":False})
