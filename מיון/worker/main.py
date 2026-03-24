from kafka import KafkaConsumer
from ocr import parse_receipt
from mongo import save_receipt
import json
import base64

consumer = KafkaConsumer(
    "receipts",
    bootstrap_servers="kafka:9092",
    value_deserializer=lambda v: json.loads(v.decode())
)

for msg in consumer:
    image = base64.b64decode(msg.value["image"])
    data = parse_receipt(image)
    save_receipt(data)