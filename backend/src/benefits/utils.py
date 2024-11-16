from fastapi import UploadFile, File, HTTPException, Depends

from src.users.helper import get_active_payload


async def validate_file(photo: UploadFile = File(..., media_type='image')):
    if not photo.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File type not supported. Please upload images.")
    return await photo.read()

async def get_user_payload(user_inf=Depends(get_active_payload)):
    return user_inf