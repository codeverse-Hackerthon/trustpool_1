"""Database seeding script for TrustPool demo data.

Populates:
- Primary Institution
- 3 Personas: Student (Alex Rivera), Owner (Dr. Sarah Chen), Admin (Marcus Vance)
- Additional student / owner accounts
- Diverse resource catalog (Equipment, Space, Lab)
- Availability windows & images
- Real sample bookings across all lifecycle states (PENDING, APPROVED, ACTIVE, COMPLETED)
- Condition reports & incidents
- Notifications & waitlist entries
"""
from __future__ import annotations

import datetime
from datetime import time, timedelta, timezone
import uuid

from app.core.database import get_session_factory
from app.models.auth_token import RefreshToken
from app.models.booking import Booking, BookingStatus, WaitlistEntry, WaitlistStatus
from app.models.incident import (
    ConditionReport,
    Incident,
    IncidentSeverity,
    IncidentStatus,
    IncidentType,
    ReportType,
)
from app.models.institution import Institution, InstitutionType, VerificationStatus
from app.models.notification import Notification, NotificationType
from app.models.resource import Resource, ResourceStatus, ResourceType
from app.models.resource_detail import ResourceAvailability, ResourceImage
from app.models.user import AccountStatus, User, UserRole
from app.services.security import hash_password, utcnow


# Static deterministic UUIDs so they can be referenced consistently
INSTITUTION_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
STUDENT_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")
OWNER_ID = uuid.UUID("33333333-3333-3333-3333-333333333333")
ADMIN_ID = uuid.UUID("44444444-4444-4444-4444-444444444444")
STUDENT_2_ID = uuid.UUID("55555555-5555-5555-5555-555555555555")

RES_CAMERA_ID = uuid.UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
RES_PRINTER_ID = uuid.UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
RES_STUDIO_ID = uuid.UUID("cccccccc-cccc-cccc-cccc-cccccccccccc")
RES_VR_ID = uuid.UUID("dddddddd-dddd-dddd-dddd-dddddddddddd")
RES_GPU_ID = uuid.UUID("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee")

BOOKING_ACTIVE_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
BOOKING_APPROVED_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")
BOOKING_PENDING_ID = uuid.UUID("00000000-0000-0000-0000-000000000003")
BOOKING_COMPLETED_ID = uuid.UUID("00000000-0000-0000-0000-000000000004")


def seed_database():
    session = get_session_factory()()
    try:
        # Check if already seeded
        existing_user = session.get(User, STUDENT_ID)
        if existing_user:
            print("Database already has seed data. Skipping seed.")
            return

        print("Seeding database...")
        now = utcnow()

        # 1. Institution
        inst = Institution(
            id=INSTITUTION_ID,
            name="State University of Technology",
            institution_type=InstitutionType.UNIVERSITY,
            email_domain="university.edu",
            address="100 Innovation Way, Campus Tech Park",
            contact_email="admin@trustpool.edu",
            verification_status=VerificationStatus.VERIFIED,
        )
        session.add(inst)
        session.flush()

        # 2. Users (Password: Password123! - satisfies 12+ chars, upper, lower, number)
        common_password_hash = hash_password("Password123!")

        student = User(
            id=STUDENT_ID,
            full_name="Alex Rivera",
            email="alex.rivera@university.edu",
            hashed_password=common_password_hash,
            role=UserRole.STUDENT,
            phone_number="+1 (555) 234-5678",
            profile_image_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            institution_id=INSTITUTION_ID,
            account_status=AccountStatus.ACTIVE,
            email_verified=True,
        )

        owner = User(
            id=OWNER_ID,
            full_name="Dr. Sarah Chen",
            email="sarah.chen@university.edu",
            hashed_password=common_password_hash,
            role=UserRole.OWNER,
            phone_number="+1 (555) 876-5432",
            profile_image_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
            institution_id=INSTITUTION_ID,
            account_status=AccountStatus.ACTIVE,
            email_verified=True,
        )

        admin = User(
            id=ADMIN_ID,
            full_name="Marcus Vance",
            email="admin@trustpool.edu",
            hashed_password=common_password_hash,
            role=UserRole.ADMIN,
            phone_number="+1 (555) 999-0000",
            profile_image_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            institution_id=INSTITUTION_ID,
            account_status=AccountStatus.ACTIVE,
            email_verified=True,
        )

        student2 = User(
            id=STUDENT_2_ID,
            full_name="Taylor Brooks",
            email="taylor.brooks@university.edu",
            hashed_password=common_password_hash,
            role=UserRole.STUDENT,
            phone_number="+1 (555) 456-7890",
            profile_image_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
            institution_id=INSTITUTION_ID,
            account_status=AccountStatus.ACTIVE,
            email_verified=True,
        )

        session.add_all([student, owner, admin, student2])
        session.flush()

        # 3. Resources
        camera = Resource(
            id=RES_CAMERA_ID,
            name="Sony FX3 Cinema Camera Kit",
            description="Full-frame cinema line camera with 24-70mm f/2.8 GM zoom lens, 3x NP-FZ100 batteries, dual CFexpress cards, and Pelican case.",
            category="equipment",
            resource_type=ResourceType.EQUIPMENT,
            owner_id=OWNER_ID,
            institution_id=INSTITUTION_ID,
            location="Media Arts Center, Studio 204",
            capacity=1,
            status=ResourceStatus.ACTIVE,
            deposit_amount=50.00,
            min_booking_minutes=60,
            max_booking_minutes=480,
            advance_booking_days=14,
            requires_approval=True,
            requires_training=False,
            is_public=True,
            rules={"guidelines": "Return with all lens caps on. Battery recharge required before check-in."},
            specifications={"sensor": "Full-frame 4K 120p", "mount": "Sony E-mount", "codec": "XAVC S-I 10-bit 4:2:2"},
        )
        camera.images.append(
            ResourceImage(
                url="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
                alt_text="Sony FX3 Cinema Camera Kit",
                position=0,
                is_cover=True,
            )
        )
        for day in range(7):
            camera.availability_windows.append(
                ResourceAvailability(weekday=day, opens_at=time(8, 0), closes_at=time(20, 0), timezone="UTC")
            )

        printer = Resource(
            id=RES_PRINTER_ID,
            name="Bambu Lab X1-Carbon 3D Printer",
            description="High-speed dual-extrusion desktop 3D printer with 16-color AMS capability, carbon fiber printing, and lidar bed leveling.",
            category="lab",
            resource_type=ResourceType.EQUIPMENT,
            owner_id=OWNER_ID,
            institution_id=INSTITUTION_ID,
            location="Makerspace Innovation Hub, Bench 04",
            capacity=2,
            status=ResourceStatus.ACTIVE,
            deposit_amount=0.00,
            min_booking_minutes=30,
            max_booking_minutes=360,
            advance_booking_days=7,
            requires_approval=False,
            requires_training=True,
            required_verification_types=["SAFETY_TRAINING"],
            is_public=True,
            rules={"filament": "Only verified campus PLA / PETG approved."},
            specifications={"build_volume": "256x256x256 mm", "max_temp": "300C", "speed": "500 mm/s"},
        )
        printer.images.append(
            ResourceImage(
                url="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
                alt_text="Bambu Lab 3D Printer",
                position=0,
                is_cover=True,
            )
        )
        for day in range(7):
            printer.availability_windows.append(
                ResourceAvailability(weekday=day, opens_at=time(9, 0), closes_at=time(21, 0), timezone="UTC")
            )

        studio = Resource(
            id=RES_STUDIO_ID,
            name="Acoustic Soundstage Studio B",
            description="Floating-room acoustic isolation studio equipped with Genelec monitoring, 4x Shure SM7B mics, and multi-track recording console.",
            category="room",
            resource_type=ResourceType.SPACE,
            owner_id=OWNER_ID,
            institution_id=INSTITUTION_ID,
            location="Media Arts Center, Room 112",
            capacity=6,
            status=ResourceStatus.ACTIVE,
            deposit_amount=0.00,
            min_booking_minutes=60,
            max_booking_minutes=240,
            advance_booking_days=10,
            requires_approval=True,
            requires_training=False,
            is_public=True,
            rules={"food": "No open drinks or food inside the acoustic room."},
            specifications={"noise_floor": "NC-15", "mics": "4x Shure SM7B", "console": "Rodecaster Pro II"},
        )
        studio.images.append(
            ResourceImage(
                url="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
                alt_text="Acoustic Soundstage Studio",
                position=0,
                is_cover=True,
            )
        )
        for day in range(7):
            studio.availability_windows.append(
                ResourceAvailability(weekday=day, opens_at=time(10, 0), closes_at=time(22, 0), timezone="UTC")
            )

        vr_rig = Resource(
            id=RES_VR_ID,
            name="VR & Spatial Computing Rig (Vision Pro + Quest 3)",
            description="Spatial prototyping station featuring Apple Vision Pro development headset, Meta Quest 3, and dedicated RTX 4090 workstation.",
            category="lab",
            resource_type=ResourceType.EQUIPMENT,
            owner_id=OWNER_ID,
            institution_id=INSTITUTION_ID,
            location="Interactive Computing Lab, Room 305",
            capacity=2,
            status=ResourceStatus.ACTIVE,
            deposit_amount=20.00,
            min_booking_minutes=60,
            max_booking_minutes=180,
            advance_booking_days=5,
            requires_approval=True,
            requires_training=False,
            is_public=True,
            rules={"supervision": "Use clean microfiber wipes for optical lenses."},
            specifications={"headsets": "Apple Vision Pro 512GB, Meta Quest 3", "pc": "RTX 4090 / 64GB RAM"},
        )
        vr_rig.images.append(
            ResourceImage(
                url="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
                alt_text="VR Spatial Rig",
                position=0,
                is_cover=True,
            )
        )
        for day in range(7):
            vr_rig.availability_windows.append(
                ResourceAvailability(weekday=day, opens_at=time(8, 0), closes_at=time(18, 0), timezone="UTC")
            )

        gpu_node = Resource(
            id=RES_GPU_ID,
            name="High-Performance NVIDIA H100 Compute Node",
            description="Dedicated AI training and batch processing server node equipped with 8x NVIDIA H100 80GB SXM5 GPUs and Slurm queue scheduler.",
            category="facility",
            resource_type=ResourceType.EQUIPMENT,
            owner_id=OWNER_ID,
            institution_id=INSTITUTION_ID,
            location="Campus Data Center, Rack 14",
            capacity=1,
            status=ResourceStatus.ACTIVE,
            deposit_amount=0.00,
            min_booking_minutes=60,
            max_booking_minutes=720,
            advance_booking_days=14,
            requires_approval=True,
            requires_training=False,
            is_public=True,
            rules={"workload": "Academic research models only; mining or commercial loads strictly prohibited."},
            specifications={"gpu": "8x NVIDIA H100 80GB", "interconnect": "3.2 Tbps InfiniBand"},
        )
        gpu_node.images.append(
            ResourceImage(
                url="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
                alt_text="Compute Node Server",
                position=0,
                is_cover=True,
            )
        )
        for day in range(7):
            gpu_node.availability_windows.append(
                ResourceAvailability(weekday=day, opens_at=time(0, 0), closes_at=time(23, 59), timezone="UTC")
            )

        session.add_all([camera, printer, studio, vr_rig, gpu_node])
        session.flush()

        # 4. Bookings
        booking_active = Booking(
            id=BOOKING_ACTIVE_ID,
            user_id=STUDENT_ID,
            resource_id=RES_CAMERA_ID,
            start_at=now - timedelta(hours=1),
            end_at=now + timedelta(hours=3),
            purpose="Documentary project interview shoot for Senior Capstone.",
            status=BookingStatus.ACTIVE,
            requires_approval=True,
            decided_by=OWNER_ID,
            checked_in_at=now - timedelta(minutes=50),
        )

        booking_approved = Booking(
            id=BOOKING_APPROVED_ID,
            user_id=STUDENT_ID,
            resource_id=RES_PRINTER_ID,
            start_at=now + timedelta(days=1, hours=2),
            end_at=now + timedelta(days=1, hours=5),
            purpose="Rapid prototyping of drone aerodynamic chassis.",
            status=BookingStatus.APPROVED,
            requires_approval=False,
        )

        booking_pending = Booking(
            id=BOOKING_PENDING_ID,
            user_id=STUDENT_2_ID,
            resource_id=RES_STUDIO_ID,
            start_at=now + timedelta(days=2, hours=1),
            end_at=now + timedelta(days=2, hours=4),
            purpose="Voiceover track recording for student animation film.",
            status=BookingStatus.PENDING,
            requires_approval=True,
        )

        booking_completed = Booking(
            id=BOOKING_COMPLETED_ID,
            user_id=STUDENT_ID,
            resource_id=RES_VR_ID,
            start_at=now - timedelta(days=3, hours=4),
            end_at=now - timedelta(days=3, hours=1),
            purpose="VisionOS spatial layout user evaluation test.",
            status=BookingStatus.COMPLETED,
            requires_approval=True,
            decided_by=OWNER_ID,
            checked_in_at=now - timedelta(days=3, hours=4),
            checked_out_at=now - timedelta(days=3, hours=1),
            return_confirmed_at=now - timedelta(days=3, hours=1),
            return_confirmed_by=OWNER_ID,
            return_notes="All lenses, controllers and power accessories verified in pristine order.",
        )

        session.add_all([booking_active, booking_approved, booking_pending, booking_completed])
        session.flush()

        # 5. Condition Reports
        pre_report = ConditionReport(
            booking_id=BOOKING_ACTIVE_ID,
            resource_id=RES_CAMERA_ID,
            submitted_by=STUDENT_ID,
            report_type=ReportType.BEFORE_USE,
            overall_condition="EXCELLENT",
            description="Checked in alongside Dr. Sarah Chen at Studio 204. Lens optics clear, batteries 100% charged.",
            damage_detected=False,
            evidence_urls=["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"],
        )

        past_report = ConditionReport(
            booking_id=BOOKING_COMPLETED_ID,
            resource_id=RES_VR_ID,
            submitted_by=STUDENT_ID,
            report_type=ReportType.AFTER_USE,
            overall_condition="EXCELLENT",
            description="Vision Pro headset and Quest 3 wiped down with microfiber cloth. Returned to safe box.",
            damage_detected=False,
            evidence_urls=[],
        )

        session.add_all([pre_report, past_report])
        session.flush()

        # 6. Incident (Open incident for Owner & Admin to review)
        incident = Incident(
            resource_id=RES_PRINTER_ID,
            booking_id=None,
            reported_by=STUDENT_2_ID,
            incident_type="DAMAGE",
            title="Slight scratch on textured PEI build surface",
            description="Found a fine cosmetic scratch on the secondary plate when setting up print job. Reporting to ensure transparency.",
            severity=IncidentSeverity.LOW,
            status=IncidentStatus.OPEN,
            evidence_urls=["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"],
        )
        session.add(incident)

        # 7. Waitlist Entry
        waitlist_entry = WaitlistEntry(
            user_id=STUDENT_2_ID,
            resource_id=RES_CAMERA_ID,
            desired_start_at=now + timedelta(hours=1),
            desired_end_at=now + timedelta(hours=4),
            priority_score=85.0,
            queue_position=1,
            status=WaitlistStatus.WAITING,
        )
        session.add(waitlist_entry)

        # 8. Notifications
        n1 = Notification(
            recipient_id=STUDENT_ID,
            title="Booking Active: Sony FX3 Kit",
            message="Your reservation for 'Sony FX3 Cinema Camera Kit' is currently active until 4:00 PM.",
            notification_type=NotificationType.BOOKING_APPROVED,
            related_entity_type="booking",
            related_entity_id=BOOKING_ACTIVE_ID,
            read_at=None,
        )

        n2 = Notification(
            recipient_id=STUDENT_ID,
            title="3D Printer Reservation Approved",
            message="Your booking for 'Bambu Lab X1-Carbon 3D Printer' has been automatically confirmed for tomorrow.",
            notification_type=NotificationType.BOOKING_APPROVED,
            related_entity_type="booking",
            related_entity_id=BOOKING_APPROVED_ID,
            read_at=None,
        )

        n3 = Notification(
            recipient_id=OWNER_ID,
            title="New Booking Request",
            message="Taylor Brooks requested 'Acoustic Soundstage Studio B' for voiceover recording.",
            notification_type=NotificationType.BOOKING_REQUEST,
            related_entity_type="booking",
            related_entity_id=BOOKING_PENDING_ID,
            read_at=None,
        )

        session.add_all([n1, n2, n3])

        session.commit()
        print("Database successfully seeded with institutional demo records!")

    except Exception as exc:
        session.rollback()
        print(f"Error seeding database: {exc}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()
