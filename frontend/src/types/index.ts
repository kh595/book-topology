export type NodeType = 'Book' | 'Author' | 'Era' | 'Movement' | 'Character' | 'Plot';

export type RelationType =
  | 'WRITTEN_BY'
  | 'BELONGS_TO_ERA'
  | 'BELONGS_TO_MOVEMENT'
  | 'HAS_CHARACTER'
  | 'HAS_PLOT'
  | 'SIMILAR_TO'
  | 'INFLUENCED';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  properties: Record<string, unknown>;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  properties?: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface Book {
  id: string;
  title: string;
  publication_year?: number;
  genre?: string;
  description?: string;
}

export interface Author {
  id: string;
  name: string;
  birth_year?: number;
  death_year?: number;
  nationality?: string;
}

export interface Era {
  id: string;
  name: string;
  start_year?: number;
  end_year?: number;
}

export interface Movement {
  id: string;
  name: string;
  description?: string;
}

export interface Character {
  id: string;
  name: string;
  traits?: string;
}

export interface Plot {
  id: string;
  name: string;
  description?: string;
}

export const NODE_COLORS: Record<NodeType, string> = {
  Book: '#4a90d9',
  Author: '#e74c3c',
  Era: '#f39c12',
  Movement: '#9b59b6',
  Character: '#2ecc71',
  Plot: '#1abc9c',
};

export const RELATION_LABELS: Record<RelationType, string> = {
  WRITTEN_BY: '저자',
  BELONGS_TO_ERA: '시대',
  BELONGS_TO_MOVEMENT: '사조',
  HAS_CHARACTER: '등장인물',
  HAS_PLOT: '플롯',
  SIMILAR_TO: '유사',
  INFLUENCED: '영향',
};
