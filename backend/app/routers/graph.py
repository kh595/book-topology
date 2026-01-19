from fastapi import APIRouter, Depends, Query
from app.database.connection import get_db
from app.models.schemas import GraphData, GraphNode, GraphLink, NodeType
from typing import Optional

router = APIRouter()


@router.get("", response_model=GraphData)
@router.get("/", response_model=GraphData)
async def get_graph_data(
    node_types: Optional[str] = Query(None, description="Comma-separated node types to include"),
    relation_types: Optional[str] = Query(None, description="Comma-separated relation types to include"),
    db=Depends(get_db)
):
    nodes = []
    links = []

    # Parse filters
    type_filter = node_types.split(",") if node_types else None
    rel_filter = relation_types.split(",") if relation_types else None

    # Build node query
    if type_filter:
        labels = " OR ".join([f"n:{t}" for t in type_filter])
        node_query = f"MATCH (n) WHERE {labels} RETURN n, labels(n) as labels"
    else:
        node_query = "MATCH (n) RETURN n, labels(n) as labels"

    result = db.run(node_query)
    for record in result:
        node = record["n"]
        labels = record["labels"]
        node_type = labels[0] if labels else "Unknown"

        # Determine label based on node type
        if "Book" in labels:
            label = node.get("title", "Unknown Book")
        elif "Author" in labels:
            label = node.get("name", "Unknown Author")
        else:
            label = node.get("name", node.get("title", "Unknown"))

        nodes.append(GraphNode(
            id=node["id"],
            label=label,
            type=NodeType(node_type) if node_type in NodeType.__members__.values() else NodeType.BOOK,
            properties=dict(node)
        ))

    # Build relationship query
    if rel_filter:
        rel_types = "|".join(rel_filter)
        rel_query = f"MATCH (a)-[r:{rel_types}]->(b) RETURN a.id as source, b.id as target, type(r) as type, properties(r) as props"
    else:
        rel_query = "MATCH (a)-[r]->(b) RETURN a.id as source, b.id as target, type(r) as type, properties(r) as props"

    result = db.run(rel_query)
    for record in result:
        links.append(GraphLink(
            source=record["source"],
            target=record["target"],
            type=record["type"],
            properties=record["props"]
        ))

    return GraphData(nodes=nodes, links=links)


@router.get("/search")
async def search_nodes(
    query: str = Query(..., min_length=1),
    db=Depends(get_db)
):
    search_query = """
    MATCH (n)
    WHERE n.title CONTAINS $search_term OR n.name CONTAINS $search_term
    RETURN n, labels(n) as labels
    LIMIT 20
    """
    result = db.run(search_query, search_term=query)
    nodes = []
    for record in result:
        node = record["n"]
        labels = record["labels"]
        node_type = labels[0] if labels else "Unknown"

        if "Book" in labels:
            label = node.get("title", "Unknown Book")
        elif "Author" in labels:
            label = node.get("name", "Unknown Author")
        else:
            label = node.get("name", node.get("title", "Unknown"))

        nodes.append({
            "id": node["id"],
            "label": label,
            "type": node_type,
            "properties": dict(node)
        })
    return nodes


@router.get("/neighbors/{node_id}")
async def get_neighbors(node_id: str, db=Depends(get_db)):
    query = """
    MATCH (n {id: $id})-[r]-(neighbor)
    RETURN neighbor, labels(neighbor) as labels, type(r) as relation_type,
           startNode(r).id = $id as is_outgoing
    """
    result = db.run(query, id=node_id)
    neighbors = []
    for record in result:
        node = record["neighbor"]
        labels = record["labels"]
        node_type = labels[0] if labels else "Unknown"

        if "Book" in labels:
            label = node.get("title", "Unknown Book")
        elif "Author" in labels:
            label = node.get("name", "Unknown Author")
        else:
            label = node.get("name", node.get("title", "Unknown"))

        neighbors.append({
            "id": node["id"],
            "label": label,
            "type": node_type,
            "relation_type": record["relation_type"],
            "is_outgoing": record["is_outgoing"],
            "properties": dict(node)
        })
    return neighbors
