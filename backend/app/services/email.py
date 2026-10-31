import logging
from pathlib import Path

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def queue_security_email(recipient: str, kind: str, token: str) -> bool:
    """Extension point for an email provider; intentionally never logs a token."""
    settings = get_settings()
    if not settings.email_provider:
        if settings.app_env == "development" and settings.dev_email_outbox_path:
            outbox = Path(settings.dev_email_outbox_path)
            outbox.parent.mkdir(parents=True, exist_ok=True)
            with outbox.open("a", encoding="utf-8") as file:
                file.write(f"{kind}|{recipient}|{token}\n")
            logger.info("%s email written to the configured development outbox", kind)
            return True
        logger.info("%s email requested for %s; no provider configured", kind, recipient)
        return False
    # Provider integration belongs here once credentials are configured.
    logger.info("%s email queued for %s", kind, recipient)
    return False
