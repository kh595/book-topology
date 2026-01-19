from fastapi import APIRouter, Depends, HTTPException
from app.database.connection import get_db
from app.models.schemas import BookCreate, BookUpdate, BookResponse

router = APIRouter()


@router.post("/", response_model=BookResponse)
async def create_book(book: BookCreate, db=Depends(get_db)):
    query = """
    CREATE (b:Book {
        id: randomUUID(),
        title: $title,
        publication_year: $publication_year,
        genre: $genre,
        description: $description
    })
    RETURN b
    """
    result = db.run(query,
                    title=book.title,
                    publication_year=book.publication_year,
                    genre=book.genre,
                    description=book.description)
    record = result.single()
    if record:
        node = record["b"]
        return BookResponse(
            id=node["id"],
            title=node["title"],
            publication_year=node["publication_year"],
            genre=node["genre"],
            description=node["description"]
        )
    raise HTTPException(status_code=500, detail="Failed to create book")


@router.get("/", response_model=list[BookResponse])
async def get_books(db=Depends(get_db)):
    query = "MATCH (b:Book) RETURN b"
    result = db.run(query)
    books = []
    for record in result:
        node = record["b"]
        books.append(BookResponse(
            id=node["id"],
            title=node["title"],
            publication_year=node.get("publication_year"),
            genre=node.get("genre"),
            description=node.get("description")
        ))
    return books


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(book_id: str, db=Depends(get_db)):
    query = "MATCH (b:Book {id: $id}) RETURN b"
    result = db.run(query, id=book_id)
    record = result.single()
    if record:
        node = record["b"]
        return BookResponse(
            id=node["id"],
            title=node["title"],
            publication_year=node.get("publication_year"),
            genre=node.get("genre"),
            description=node.get("description")
        )
    raise HTTPException(status_code=404, detail="Book not found")


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(book_id: str, book: BookUpdate, db=Depends(get_db)):
    updates = []
    params = {"id": book_id}

    if book.title is not None:
        updates.append("b.title = $title")
        params["title"] = book.title
    if book.publication_year is not None:
        updates.append("b.publication_year = $publication_year")
        params["publication_year"] = book.publication_year
    if book.genre is not None:
        updates.append("b.genre = $genre")
        params["genre"] = book.genre
    if book.description is not None:
        updates.append("b.description = $description")
        params["description"] = book.description

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    query = f"MATCH (b:Book {{id: $id}}) SET {', '.join(updates)} RETURN b"
    result = db.run(query, **params)
    record = result.single()
    if record:
        node = record["b"]
        return BookResponse(
            id=node["id"],
            title=node["title"],
            publication_year=node.get("publication_year"),
            genre=node.get("genre"),
            description=node.get("description")
        )
    raise HTTPException(status_code=404, detail="Book not found")


@router.delete("/{book_id}")
async def delete_book(book_id: str, db=Depends(get_db)):
    query = "MATCH (b:Book {id: $id}) DETACH DELETE b RETURN count(b) as deleted"
    result = db.run(query, id=book_id)
    record = result.single()
    if record and record["deleted"] > 0:
        return {"message": "Book deleted successfully"}
    raise HTTPException(status_code=404, detail="Book not found")
