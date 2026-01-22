import { useState, type ReactNode } from 'react';
// import type { NodeType, RelationType } from '../../types';
// import { NODE_COLORS, RELATION_LABELS } from '../../types';
import './FilterPanel.css';

/* 임시 비활성화
const NODE_TYPES: NodeType[] = ['Book', 'Author', 'Era', 'Movement', 'Character', 'Plot'];
const RELATION_TYPES: RelationType[] = [
  'WRITTEN_BY',
  'BELONGS_TO_ERA',
  'BELONGS_TO_MOVEMENT',
  'HAS_CHARACTER',
  'HAS_PLOT',
  'SIMILAR_TO',
  'INFLUENCED',
];
*/

interface SearchResult {
  id: string;
  label: string;
  type: string;
}

interface FilterPanelProps {
  // onFilterChange: (nodeTypes: NodeType[], relationTypes: RelationType[]) => void;  // 임시 비활성화
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelectSearchResult: (nodeId: string) => void;
  children?: ReactNode;
}

export function FilterPanel({ onSearch, onSelectSearchResult, children }: FilterPanelProps) {
  /* 임시 비활성화
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<Set<NodeType>>(new Set(NODE_TYPES));
  const [selectedRelationTypes, setSelectedRelationTypes] = useState<Set<RelationType>>(
    new Set(RELATION_TYPES)
  );
  */
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  /* 임시 비활성화
  const toggleNodeType = (type: NodeType) => {
    const newSet = new Set(selectedNodeTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedNodeTypes(newSet);
    onFilterChange(Array.from(newSet), Array.from(selectedRelationTypes));
  };

  const toggleRelationType = (type: RelationType) => {
    const newSet = new Set(selectedRelationTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedRelationTypes(newSet);
    onFilterChange(Array.from(selectedNodeTypes), Array.from(newSet));
  };
  */

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        const results = await onSearch(searchQuery.trim());
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSelectResult = (nodeId: string) => {
    onSelectSearchResult(nodeId);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className={`filter-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? '>' : '<'}
      </button>

      {!isCollapsed && (
        <>
          <h2>Book Topology</h2>

          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="책 또는 저자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" disabled={isSearching}>
              {isSearching ? '...' : '검색'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="search-results">
              <h4>검색 결과 ({searchResults.length})</h4>
              <ul>
                {searchResults.map((result) => (
                  <li
                    key={result.id}
                    onClick={() => handleSelectResult(result.id)}
                    className="search-result-item"
                  >
                    <span className="result-type">{result.type === 'Book' ? '📖' : '✍️'}</span>
                    <span className="result-label">{result.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 노드 유형 필터 - 임시 비활성화
          <div className="filter-section">
            <h3>노드 유형</h3>
            <div className="filter-options">
              {NODE_TYPES.map((type) => (
                <label key={type} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedNodeTypes.has(type)}
                    onChange={() => toggleNodeType(type)}
                  />
                  <span className="color-dot" style={{ backgroundColor: NODE_COLORS[type] }} />
                  {type}
                </label>
              ))}
            </div>
          </div>
          */}

          {/* 관계 유형 필터 - 임시 비활성화
          <div className="filter-section">
            <h3>관계 유형</h3>
            <div className="filter-options">
              {RELATION_TYPES.map((type) => (
                <label key={type} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedRelationTypes.has(type)}
                    onChange={() => toggleRelationType(type)}
                  />
                  {RELATION_LABELS[type]}
                </label>
              ))}
            </div>
          </div>
          */}

          {children}
        </>
      )}
    </div>
  );
}
