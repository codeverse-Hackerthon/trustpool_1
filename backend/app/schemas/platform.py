import uuid
from datetime import date, datetime, time
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator
from app.models.institution import InstitutionType, VerificationStatus
from app.models.resource import ResourceStatus, ResourceType
from app.models.verification import VerificationState, VerificationType
class ProfileUpdate(BaseModel):
    model_config=ConfigDict(extra="forbid"); full_name:str|None=Field(None,min_length=1,max_length=255); phone_number:str|None=Field(None,max_length=32); profile_image_url:HttpUrl|None=None
class InstitutionCreate(BaseModel):
    model_config=ConfigDict(extra="forbid"); name:str=Field(min_length=1,max_length=255); institution_type:InstitutionType; email_domain:str|None=None; address:str|None=None; contact_email:str|None=None
class InstitutionReview(BaseModel): status: VerificationStatus; notes:str|None=None
class VerificationCreate(BaseModel):
    model_config=ConfigDict(extra="forbid"); verification_type:VerificationType; title:str=Field(min_length=1,max_length=255); description:str|None=None; document_url:HttpUrl|None=None; expires_at:datetime|None=None
class VerificationReview(BaseModel): status:VerificationState; reviewer_notes:str|None=None
class ImageInput(BaseModel): url:HttpUrl; alt_text:str|None=None; position:int=Field(0,ge=0); is_cover:bool=False
class AvailabilityInput(BaseModel):
    weekday:int=Field(ge=0,le=6); opens_at:time; closes_at:time; timezone:str="UTC"
    @model_validator(mode="after")
    def hours(self):
        if self.opens_at>=self.closes_at: raise ValueError("Opening time must be before closing time.")
        return self
class ResourceCreate(BaseModel):
    model_config=ConfigDict(extra="forbid"); name:str=Field(min_length=1,max_length=255); description:str|None=Field(None,max_length=10000); category:str=Field(min_length=1,max_length=100); resource_type:ResourceType; institution_id:uuid.UUID|None=None; location:str|None=None; capacity:int|None=Field(None,gt=0); usage_instructions:str|None=None; specifications:dict=Field(default_factory=dict); rules:dict=Field(default_factory=dict); deposit_amount:float=Field(0,ge=0); min_booking_minutes:int|None=Field(None,gt=0); max_booking_minutes:int|None=Field(None,gt=0); advance_booking_days:int|None=Field(None,ge=0); requires_approval:bool=True; requires_training:bool=False; required_verification_types:list[str]=Field(default_factory=list); institution_only:bool=False; is_public:bool=True; images:list[ImageInput]=Field(default_factory=list); availability_windows:list[AvailabilityInput]=Field(default_factory=list)
    @model_validator(mode="after")
    def durations(self):
        if self.min_booking_minutes and self.max_booking_minutes and self.min_booking_minutes>self.max_booking_minutes: raise ValueError("Minimum duration cannot exceed maximum duration.")
        return self
class ResourceUpdate(ResourceCreate): pass
class StatusUpdate(BaseModel): status:ResourceStatus
class Pagination(BaseModel): page:int; page_size:int; total_items:int; total_pages:int
