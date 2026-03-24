from pymongo import MongoClient

client = MongoClient("mongodb://mongodb:27017")
db = client.receipts

def save_receipt(data):
    db.receipts.insert_one(data)