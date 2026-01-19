from pydantic import BaseModel
from typing import Optional
from enum import Enum


class NodeType(str, Enum):
    BOOK = "Book"
    AUTHOR = "Author"
    ERA = "Era"
    MOVEMENT = "Movement"
    CHARACTER = "Character"
    PLOT = "Plot"


class RelationType(str, Enum):
    WRITTEN_BY = "WRITTEN_BY"
    BELONGS_TO_ERA = "BELONGS_TO_ERA"
    BELONGS_TO_MOVEMENT = "BELONGS_TO_MOVEMENT"
    HAS_CHARACTER = "HAS_CHARACTER"
    HAS_PLOT = "HAS_PLOT"
    SIMILAR_TO = "SIMILAR_TO"
    INFLUENCED = "INFLUENCED"


# Book schemas
class BookCreate(BaseModel):
    title: str
    publication_year: Optional[int] = None
    genre: Optional[str] = None
    description: Optional[str] = None


class BookUpdate(BaseModel):
    title: Optional[str] = None
    publication_year: Optional[int] = None
    genre: Optional[str] = None
    description: Optional[str] = None


class BookResponse(BaseModel):
    id: str
    title: str
    publication_year: Optional[int] = None
    genre: Optional[str] = None
    description: Optional[str] = None


# Author schemas
class AuthorCreate(BaseModel):
    name: str
    birth_year: Optional[int] = None
    death_year: Optional[int] = None
    nationality: Optional[str] = None


class AuthorUpdate(BaseModel):
    name: Optional[str] = None
    birth_year: Optional[int] = None
    death_year: Optional[int] = None
    nationality: Optional[str] = None


class AuthorResponse(BaseModel):
    id: str
    name: str
    birth_year: Optional[int] = None
    death_year: Optional[int] = None
    nationality: Optional[str] = None


# Era schemas
class EraCreate(BaseModel):
    name: str
    start_year: Optional[int] = None
    end_year: Optional[int] = None


class EraResponse(BaseModel):
    id: str
    name: str
    start_year: Optional[int] = None
    end_year: Optional[int] = None


# Movement schemas
class MovementCreate(BaseModel):
    name: str
    description: Optional[str] = None


class MovementResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None


# Character schemas
class CharacterCreate(BaseModel):
    name: str
    traits: Optional[str] = None


class CharacterResponse(BaseModel):
    id: str
    name: str
    traits: Optional[str] = None


# Plot schemas
class PlotCreate(BaseModel):
    name: str
    description: Optional[str] = None


class PlotResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None


# Relationship schemas
class RelationshipCreate(BaseModel):
    source_id: str
    target_id: str
    relation_type: RelationType
    properties: Optional[dict] = None


class RelationshipResponse(BaseModel):
    id: str
    source_id: str
    target_id: str
    relation_type: str
    properties: Optional[dict] = None


# Graph schemas for 3D visualization
class GraphNode(BaseModel):
    id: str
    label: str
    type: NodeType
    properties: dict


class GraphLink(BaseModel):
    source: str
    target: str
    type: str
    properties: Optional[dict] = None


class GraphData(BaseModel):
    nodes: list[GraphNode]
    links: list[GraphLink]
