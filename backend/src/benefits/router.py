from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from io import BytesIO

router = APIRouter()
db = {}


@router.post("/benefit/")
async def create_benefit(benefit: str, file: UploadFile = File(...)):
    content = await file.read()
    db[1] = {'name': benefit, 'content': content}
    return {"id": 1}


@router.get("/benefit/{benefit_id}")
async def read_benefit(benefit_id: int):
    benefit = db.get(benefit_id)
    if not benefit:
        raise HTTPException(status_code=404, detail="Benefit not found")

    # Возвращаем имя льготы и поток с изображением
    return {
        "name": benefit.get('name'),
        "photo": f"/benefit/photo/{benefit_id}"  # Возвращаем URL для получения изображения
    }


@router.get("/benefit/photo/{benefit_id}")
async def get_photo(benefit_id: int):
    benefit = db.get(benefit_id)
    if not benefit:
        raise HTTPException(status_code=404, detail="Benefit not found")

    return StreamingResponse(BytesIO(benefit['content']), media_type="image/jpeg")  # Укажите правильный media_type


# С фотками вроде разобрались
