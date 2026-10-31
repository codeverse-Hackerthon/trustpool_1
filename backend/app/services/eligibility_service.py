from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.institution import VerificationStatus
from app.models.resource import Resource
from app.models.user import AccountStatus, User
from app.models.verification import UserVerification, VerificationState
def evaluate_eligibility(db:Session,user:User,resource:Resource)->dict:
    reasons=[]; missing=[]; now=datetime.now(timezone.utc)
    if user.account_status is not AccountStatus.ACTIVE: reasons.append("Account is not active")
    if resource.institution_only and user.institution_id!=resource.institution_id: reasons.append("Resource is restricted to its institution"); missing.append("INSTITUTION_ASSOCIATION")
    if resource.institution_only and resource.institution and resource.institution.verification_status is not VerificationStatus.VERIFIED: reasons.append("Institution is not verified")
    for kind in resource.required_verification_types:
        valid=db.scalar(select(UserVerification).where(UserVerification.user_id==user.id,UserVerification.verification_type==kind,UserVerification.status==VerificationState.APPROVED,(UserVerification.expires_at.is_(None)) | (UserVerification.expires_at>now)))
        if not valid: reasons.append(f"Required {kind} is not verified"); missing.append(kind)
    return {"eligible":not reasons,"reasons":reasons,"missing_requirements":missing,"verification_status":"APPROVED" if not missing else "PENDING"}
