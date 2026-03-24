from fastapi import FastAPI
from routers.upload import router as upload_router
from routers.optimize import router as optimize_router

app = FastAPI()

app.include_router(upload_router)
app.include_router(optimize_router)

@app.get("/health")
def health():
    return {"status": "ok"}