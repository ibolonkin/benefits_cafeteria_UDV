from fastapi import UploadFile, File, HTTPException

async def validate_file(photo: UploadFile = File(..., media_type='image/' )):
    if not photo.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File type not supported. Please upload images.")
    return await photo.read()