from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
import numpy as np
from sklearn.cluster import DBSCAN
from scipy.spatial import cKDTree
from scipy.sparse.csgraph import connected_components
from scipy.sparse import csr_matrix

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

class DBSCANRequest(BaseModel):
    data: List[List[float]]

    eps: float = 0.5
    min_samples: int = 5
    metric: str = "euclidean"
    algorithm: str = "auto"
    leaf_size: int = 30
    p: Optional[int] = None
    n_jobs: Optional[int] = None


@app.post("/dbscan")
def run_dbscan(req: DBSCANRequest):

    X = np.array(req.data)

    db = DBSCAN(
        eps=req.eps,
        min_samples=req.min_samples,
        metric=req.metric,
        algorithm=req.algorithm,
        leaf_size=req.leaf_size,
        p=req.p,
        n_jobs=req.n_jobs,
    ).fit(X)

    labels = db.labels_

    clusters = {}
    noise = []

    for idx, label in enumerate(labels):
        if label == -1:
            noise.append(idx)
        else:
            clusters.setdefault(label, []).append(idx)

    cluster_list = [clusters[k] for k in sorted(clusters.keys())]

    return {
        "clusters": cluster_list,
        "noise": noise,
        "params": {
            "eps": req.eps,
            "min_samples": req.min_samples,
            "metric": req.metric,
            "algorithm": req.algorithm,
            "leaf_size": req.leaf_size,
            "p": req.p,
            "n_jobs": req.n_jobs
        }
    }

class BallQueryRequest(BaseModel):
    data: List[List[float]]
    radius: float = 0.05


# ------------------------------
# SciPy Ball Query + Graph Clustering
# ------------------------------

def scipy_ball_query_clusters(points, radius):
    N = len(points)

    # KDTree do SciPy (muito rápido)
    tree = cKDTree(points)

    # matriz esparsa de distância (todas conexões dentro do raio)
    # Retorna matriz (sparse) onde A[i, j] = distância entre i e j se < radius
    dist_matrix = tree.sparse_distance_matrix(
        tree,
        max_distance=radius,
        output_type='coo_matrix'
    )

    # Transformar em grafo não-direcionado (adjacência)
    # Usa 1s porque não precisamos da distância
    row = dist_matrix.row
    col = dist_matrix.col
    data = np.ones(len(row), dtype=np.uint8)

    graph = csr_matrix((data, (row, col)), shape=(N, N))

    # Componentes conectadas = clusters
    n_components, labels = connected_components(
        csgraph=graph,
        directed=False
    )

    clusters = []
    for comp_id in range(n_components):
        members = np.where(labels == comp_id)[0].tolist()
        clusters.append(members)

    return clusters


# ------------------------------
# FastAPI route
# ------------------------------

@app.post("/ballquery")
def run_ballquery(req: BallQueryRequest):

    X = np.array(req.data)

    clusters = scipy_ball_query_clusters(
        X,
        radius=req.radius
    )

    noise = []  # opcional adicionar política de noise

    return {
        "clusters": clusters,
        "noise": noise,
        "params": {
            "radius": req.radius
        }
    }
