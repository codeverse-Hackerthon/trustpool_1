from fastapi import HTTPException, UploadFile, status
from app.core.config import get_settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024

async def upload_image(file: UploadFile, folder: str) -> dict[str, str]:
    settings = get_settings()
    if not settings.cloudinary_cloud_name or not settings.cloudinary_api_key or not settings.cloudinary_api_secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Image storage is not configured.")
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, and WebP images are supported.")
    content = await file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds the 10 MB upload limit.")
    import cloudinary
    import cloudinary.uploader
    cloudinary.config(cloud_name=settings.cloudinary_cloud_name, api_key=settings.cloudinary_api_key.get_secret_value(), api_secret=settings.cloudinary_api_secret.get_secret_value(), secure=True)
    try:
        result = cloudinary.uploader.upload(content, folder=f"trustpool/{folder}", resource_type="image", allowed_formats=["jpg", "jpeg", "png", "webp"])
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Image upload failed.") from exc
    return {"url": result["secure_url"], "asset_id": result["public_id"]}
