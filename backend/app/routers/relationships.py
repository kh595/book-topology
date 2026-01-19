from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.database.connection import get_db
from app.models.schemas import (
    RelationshipCreate, RelationshipResponse,
    EraCreate, EraResponse,
    MovementCreate, MovementResponse,
    CharacterCreate, CharacterResponse,
    PlotCreate, PlotResponse
)
import json

router = APIRouter()


# Era endpoints
@router.post("/eras", response_model=EraResponse)
async def create_era(era: EraCreate, db=Depends(get_db)):
    query = """
    CREATE (e:Era {
        id: randomUUID(),
        name: $name,
        start_year: $start_year,
        end_year: $end_year
    })
    RETURN e
    """
    result = db.run(query, name=era.name, start_year=era.start_year, end_year=era.end_year)
    record = result.single()
    if record:
        node = record["e"]
        return EraResponse(
            id=node["id"],
            name=node["name"],
            start_year=node.get("start_year"),
            end_year=node.get("end_year")
        )
    raise HTTPException(status_code=500, detail="Failed to create era")


@router.get("/eras", response_model=list[EraResponse])
async def get_eras(db=Depends(get_db)):
    query = "MATCH (e:Era) RETURN e"
    result = db.run(query)
    return [EraResponse(
        id=r["e"]["id"],
        name=r["e"]["name"],
        start_year=r["e"].get("start_year"),
        end_year=r["e"].get("end_year")
    ) for r in result]


# Movement endpoints
@router.post("/movements", response_model=MovementResponse)
async def create_movement(movement: MovementCreate, db=Depends(get_db)):
    query = """
    CREATE (m:Movement {
        id: randomUUID(),
        name: $name,
        description: $description
    })
    RETURN m
    """
    result = db.run(query, name=movement.name, description=movement.description)
    record = result.single()
    if record:
        node = record["m"]
        return MovementResponse(
            id=node["id"],
            name=node["name"],
            description=node.get("description")
        )
    raise HTTPException(status_code=500, detail="Failed to create movement")


@router.get("/movements", response_model=list[MovementResponse])
async def get_movements(db=Depends(get_db)):
    query = "MATCH (m:Movement) RETURN m"
    result = db.run(query)
    return [MovementResponse(
        id=r["m"]["id"],
        name=r["m"]["name"],
        description=r["m"].get("description")
    ) for r in result]


# Character endpoints
@router.post("/characters", response_model=CharacterResponse)
async def create_character(character: CharacterCreate, db=Depends(get_db)):
    query = """
    CREATE (c:Character {
        id: randomUUID(),
        name: $name,
        traits: $traits
    })
    RETURN c
    """
    result = db.run(query, name=character.name, traits=character.traits)
    record = result.single()
    if record:
        node = record["c"]
        return CharacterResponse(
            id=node["id"],
            name=node["name"],
            traits=node.get("traits")
        )
    raise HTTPException(status_code=500, detail="Failed to create character")


@router.get("/characters", response_model=list[CharacterResponse])
async def get_characters(db=Depends(get_db)):
    query = "MATCH (c:Character) RETURN c"
    result = db.run(query)
    return [CharacterResponse(
        id=r["c"]["id"],
        name=r["c"]["name"],
        traits=r["c"].get("traits")
    ) for r in result]


# Plot endpoints
@router.post("/plots", response_model=PlotResponse)
async def create_plot(plot: PlotCreate, db=Depends(get_db)):
    query = """
    CREATE (p:Plot {
        id: randomUUID(),
        name: $name,
        description: $description
    })
    RETURN p
    """
    result = db.run(query, name=plot.name, description=plot.description)
    record = result.single()
    if record:
        node = record["p"]
        return PlotResponse(
            id=node["id"],
            name=node["name"],
            description=node.get("description")
        )
    raise HTTPException(status_code=500, detail="Failed to create plot")


@router.get("/plots", response_model=list[PlotResponse])
async def get_plots(db=Depends(get_db)):
    query = "MATCH (p:Plot) RETURN p"
    result = db.run(query)
    return [PlotResponse(
        id=r["p"]["id"],
        name=r["p"]["name"],
        description=r["p"].get("description")
    ) for r in result]


# Relationship creation
@router.post("/connect", response_model=RelationshipResponse)
async def create_relationship(rel: RelationshipCreate, db=Depends(get_db)):
    query = f"""
    MATCH (a {{id: $source_id}}), (b {{id: $target_id}})
    CREATE (a)-[r:{rel.relation_type.value} {{id: randomUUID()}}]->(b)
    SET r += $properties
    RETURN r, a.id as source, b.id as target
    """
    result = db.run(query,
                    source_id=rel.source_id,
                    target_id=rel.target_id,
                    properties=rel.properties or {})
    record = result.single()
    if record:
        return RelationshipResponse(
            id=record["r"]["id"],
            source_id=record["source"],
            target_id=record["target"],
            relation_type=rel.relation_type.value,
            properties=rel.properties
        )
    raise HTTPException(status_code=404, detail="Source or target node not found")


@router.delete("/connect/{relationship_id}")
async def delete_relationship(relationship_id: str, db=Depends(get_db)):
    query = """
    MATCH ()-[r {id: $id}]-()
    DELETE r
    RETURN count(r) as deleted
    """
    result = db.run(query, id=relationship_id)
    record = result.single()
    if record and record["deleted"] > 0:
        return {"message": "Relationship deleted successfully"}
    raise HTTPException(status_code=404, detail="Relationship not found")


# Import data from JSON
@router.post("/import")
async def import_data(file: UploadFile = File(...), db=Depends(get_db)):
    content = await file.read()
    data = json.loads(content)

    imported = {"books": 0, "authors": 0, "relationships": 0}

    # Import authors
    for author in data.get("authors", []):
        author_data = {
            "name": author.get("name"),
            "birth_year": author.get("birth_year"),
            "death_year": author.get("death_year"),
            "nationality": author.get("nationality")
        }
        query = """
        MERGE (a:Author {name: $name})
        SET a.id = coalesce(a.id, randomUUID()),
            a.birth_year = $birth_year,
            a.death_year = $death_year,
            a.nationality = $nationality
        """
        db.run(query, **author_data)
        imported["authors"] += 1

    # Import books
    for book in data.get("books", []):
        book_data = {
            "title": book.get("title"),
            "publication_year": book.get("publication_year"),
            "genre": book.get("genre"),
            "description": book.get("description")
        }
        query = """
        MERGE (b:Book {title: $title})
        SET b.id = coalesce(b.id, randomUUID()),
            b.publication_year = $publication_year,
            b.genre = $genre,
            b.description = $description
        """
        db.run(query, **book_data)
        imported["books"] += 1

    # Import relationships
    for rel in data.get("relationships", []):
        rel_type = rel.get("type", "SIMILAR_TO")
        # Handle both title and name for matching
        source = rel["source"]
        target = rel["target"]
        query = f"""
        MATCH (a) WHERE a.name = $source OR a.title = $source
        MATCH (b) WHERE b.name = $target OR b.title = $target
        MERGE (a)-[r:{rel_type}]->(b)
        SET r.id = coalesce(r.id, randomUUID())
        """
        db.run(query, source=source, target=target)
        imported["relationships"] += 1

    return {"message": "Import completed", "imported": imported}
