from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .dbscan import run_dbscan
from .ball_query import run_ballquery
from .optics import run_optics

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/dbscan")
def dbscan_request(req):
    return run_dbscan(req)

@app.post("/ballquery")
def ballquery_request(req):
    return run_ballquery(req)

@app.post("/optics")
def optics_request(req):
    return run_optics(req)