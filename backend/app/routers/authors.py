from fastapi import APIRouter, Depends, HTTPException
from app.database.connection import get_db
from app.models.schemas import AuthorCreate, AuthorUpdate, AuthorResponse

router = APIRouter()


@router.post("/", response_model=AuthorResponse)
async def create_author(author: AuthorCreate, db=Depends(get_db)):
    query = """
    CREATE (a:Author {
        id: randomUUID(),
        name: $name,
        birth_year: $birth_year,
        death_year: $death_year,
        nationality: $nationality
    })
    RETURN a
    """
    result = db.run(query,
                    name=author.name,
                    birth_year=author.birth_year,
                    death_year=author.death_year,
                    nationality=author.nationality)
    record = result.single()
    if record:
        node = record["a"]
        return AuthorResponse(
            id=node["id"],
            name=node["name"],
            birth_year=node.get("birth_year"),
            death_year=node.get("death_year"),
            nationality=node.get("nationality")
        )
    raise HTTPException(status_code=500, detail="Failed to create author")


@router.get("/", response_model=list[AuthorResponse])
async def get_authors(db=Depends(get_db)):
    query = "MATCH (a:Author) RETURN a"
    result = db.run(query)
    authors = []
    for record in result:
        node = record["a"]
        authors.append(AuthorResponse(
            id=node["id"],
            name=node["name"],
            birth_year=node.get("birth_year"),
            death_year=node.get("death_year"),
            nationality=node.get("nationality")
        ))
    return authors


@router.get("/{author_id}", response_model=AuthorResponse)
async def get_author(author_id: str, db=Depends(get_db)):
    query = "MATCH (a:Author {id: $id}) RETURN a"
    result = db.run(query, id=author_id)
    record = result.single()
    if record:
        node = record["a"]
        return AuthorResponse(
            id=node["id"],
            name=node["name"],
            birth_year=node.get("birth_year"),
            death_year=node.get("death_year"),
            nationality=node.get("nationality")
        )
    raise HTTPException(status_code=404, detail="Author not found")


@router.put("/{author_id}", response_model=AuthorResponse)
async def update_author(author_id: str, author: AuthorUpdate, db=Depends(get_db)):
    updates = []
    params = {"id": author_id}

    if author.name is not None:
        updates.append("a.name = $name")
        params["name"] = author.name
    if author.birth_year is not None:
        updates.append("a.birth_year = $birth_year")
        params["birth_year"] = author.birth_year
    if author.death_year is not None:
        updates.append("a.death_year = $death_year")
        params["death_year"] = author.death_year
    if author.nationality is not None:
        updates.append("a.nationality = $nationality")
        params["nationality"] = author.nationality

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    query = f"MATCH (a:Author {{id: $id}}) SET {', '.join(updates)} RETURN a"
    result = db.run(query, **params)
    record = result.single()
    if record:
        node = record["a"]
        return AuthorResponse(
            id=node["id"],
            name=node["name"],
            birth_year=node.get("birth_year"),
            death_year=node.get("death_year"),
            nationality=node.get("nationality")
        )
    raise HTTPException(status_code=404, detail="Author not found")


@router.delete("/{author_id}")
async def delete_author(author_id: str, db=Depends(get_db)):
    query = "MATCH (a:Author {id: $id}) DETACH DELETE a RETURN count(a) as deleted"
    result = db.run(query, id=author_id)
    record = result.single()
    if record and record["deleted"] > 0:
        return {"message": "Author deleted successfully"}
    raise HTTPException(status_code=404, detail="Author not found")
