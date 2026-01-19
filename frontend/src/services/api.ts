import type { GraphData, Book, Author } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchGraphData(
  nodeTypes?: string[],
  relationTypes?: string[]
): Promise<GraphData> {
  const params = new URLSearchParams();
  if (nodeTypes?.length) params.set('node_types', nodeTypes.join(','));
  if (relationTypes?.length) params.set('relation_types', relationTypes.join(','));

  const queryString = params.toString();
  const url = queryString ? `${API_BASE}/graph?${queryString}` : `${API_BASE}/graph`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch graph data');
  return response.json();
}

export async function searchNodes(query: string) {
  const response = await fetch(`${API_BASE}/graph/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Search failed');
  return response.json();
}

export async function getNeighbors(nodeId: string) {
  const response = await fetch(`${API_BASE}/graph/neighbors/${nodeId}`);
  if (!response.ok) throw new Error('Failed to get neighbors');
  return response.json();
}

// Books API
export async function createBook(book: Omit<Book, 'id'>): Promise<Book> {
  const response = await fetch(`${API_BASE}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
  if (!response.ok) throw new Error('Failed to create book');
  return response.json();
}

export async function getBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE}/books`);
  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
}

export async function deleteBook(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete book');
}

// Authors API
export async function createAuthor(author: Omit<Author, 'id'>): Promise<Author> {
  const response = await fetch(`${API_BASE}/authors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(author),
  });
  if (!response.ok) throw new Error('Failed to create author');
  return response.json();
}

export async function getAuthors(): Promise<Author[]> {
  const response = await fetch(`${API_BASE}/authors`);
  if (!response.ok) throw new Error('Failed to fetch authors');
  return response.json();
}

// Relationships API
export async function createRelationship(
  sourceId: string,
  targetId: string,
  relationType: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/relationships/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_id: sourceId,
      target_id: targetId,
      relation_type: relationType,
    }),
  });
  if (!response.ok) throw new Error('Failed to create relationship');
}

// Import API
export async function importData(file: File): Promise<{ imported: Record<string, number> }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/relationships/import`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to import data');
  return response.json();
}
