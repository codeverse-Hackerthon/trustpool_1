from sqlalchemy import func,select
from sqlalchemy.orm import Session
from app.models.booking import Booking,BookingStatus
def score(db:Session,user_id,resource_id):
 usage=db.scalar(select(func.count()).select_from(Booking).where(Booking.user_id==user_id,Booking.status.in_([BookingStatus.APPROVED,BookingStatus.ACTIVE,BookingStatus.COMPLETED]))) or 0
 return {"score":max(0.0,100.0-usage*10),"reasons":[f"Previous completed/approved usage count: {usage}","Lower recent usage receives a higher priority"]}
