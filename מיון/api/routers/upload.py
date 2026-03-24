from fastapi import APIRouter, UploadFile
from services.kafka_producer import send_to_kafka
import base64

router = APIRouter()

@router.post("/upload")
async def upload(file: UploadFile):
    content = await file.read()
    encoded = base64.b64encode(content).decode()

    send_to_kafka({"image": encoded})
    return {"status": "queued"}