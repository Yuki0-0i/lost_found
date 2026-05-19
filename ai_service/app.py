"""
失物招领系统 - AI 智能匹配微服务
使用 sentence-transformers 计算文本向量相似度
"""

import os
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

import logging
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lost&Found AI Match Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
logger.info(f"Loading model: {MODEL_NAME} ...")
model = SentenceTransformer(MODEL_NAME)
logger.info("Model loaded successfully")


class ItemInput(BaseModel):
    id: int
    name: str = ""
    description: str = ""
    category: str = ""
    location: str = ""
    type: str = ""


class MatchRequest(BaseModel):
    query: str
    items: list[ItemInput]


def build_item_text(item: ItemInput) -> str:
    parts = []
    if item.name:
        parts.append(item.name)
    if item.category:
        parts.append(f"分类:{item.category}")
    if item.description:
        parts.append(item.description)
    if item.location:
        parts.append(f"地点:{item.location}")
    type_label = "丢失" if item.type == "LOST" else "捡到"
    parts.append(f"类型:{type_label}")
    return " ".join(parts)


def make_reason(query: str, item: ItemInput, score: float) -> str:
    query_lower = query.lower()
    reasons = []
    if item.name and any(w in item.name.lower() for w in query_lower.split()):
        reasons.append(f"名称匹配「{item.name}」")
    if item.category and any(w in query_lower for w in item.category):
        reasons.append(f"分类一致「{item.category}」")
    if item.description and any(w in query_lower for w in item.description.lower().split()):
        reasons.append("描述相似")
    if item.location and any(w in query_lower for w in item.location):
        reasons.append(f"地点相关「{item.location}」")
    if not reasons:
        reasons.append("语义相似度较高")
    return "；".join(reasons)


@app.get("/")
def root():
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/match")
def match_items(req: MatchRequest):
    query = req.query.strip()
    items = req.items

    if not query:
        return {"results": []}
    if not items:
        return {"results": []}

    query_text = query
    item_texts = [build_item_text(item) for item in items]

    all_texts = [query_text] + item_texts
    embeddings = model.encode(all_texts, convert_to_numpy=True, normalize_embeddings=True)

    query_vec = embeddings[0]
    item_vecs = embeddings[1:]
    scores = np.dot(item_vecs, query_vec)

    top_k = min(5, len(items))
    top_indices = np.argsort(scores)[-top_k:][::-1]

    results = []
    for idx in top_indices:
        item = items[idx]
        score = float(scores[idx])
        score_pct = round(max(0, min(100, score * 100)), 1)
        results.append({
            "itemId": item.id,
            "name": item.name,
            "category": item.category,
            "location": item.location,
            "type": item.type,
            "score": score_pct,
            "reason": make_reason(query, item, score),
        })

    logger.info(f"Query: '{query}' -> {len(results)} results, top score: {results[0]['score']}%")
    return {"results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
