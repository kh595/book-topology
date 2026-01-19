from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import books, authors, relationships, graph
from app.database.connection import neo4j_driver

app = FastAPI(
    title="Book Topology API",
    description="책들의 연결 관계를 관리하는 API",
    version="1.0.0",
    redirect_slashes=False
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://book-topology.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router, prefix="/api/books", tags=["books"])
app.include_router(authors.router, prefix="/api/authors", tags=["authors"])
app.include_router(relationships.router, prefix="/api/relationships", tags=["relationships"])
app.include_router(graph.router, prefix="/api/graph", tags=["graph"])


@app.get("/")
async def root():
    return {"message": "Book Topology API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.on_event("shutdown")
async def shutdown_event():
    neo4j_driver.close()
