import { useState } from 'react';
import type { NodeType, RelationType } from '../../types';
import { NODE_COLORS, RELATION_LABELS } from '../../types';
import './FilterPanel.css';

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

interface FilterPanelProps {
  onFilterChange: (nodeTypes: NodeType[], relationTypes: RelationType[]) => void;
  onSearch: (query: string) => void;
}

export function FilterPanel({ onFilterChange, onSearch }: FilterPanelProps) {
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<Set<NodeType>>(new Set(NODE_TYPES));
  const [selectedRelationTypes, setSelectedRelationTypes] = useState<Set<RelationType>>(
    new Set(RELATION_TYPES)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
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
            <button type="submit">검색</button>
          </form>

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
        </>
      )}
    </div>
  );
}
