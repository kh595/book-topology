import { useEffect, useState } from 'react';
import type { GraphNode } from '../../types';
import { NODE_COLORS, RELATION_LABELS } from '../../types';
import { getNeighbors } from '../../services/api';
import './DetailPanel.css';

interface Neighbor {
  id: string;
  label: string;
  type: string;
  relation_type: string;
  is_outgoing: boolean;
}

interface DetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
  onNodeSelect: (nodeId: string) => void;
}

export function DetailPanel({ node, onClose, onNodeSelect }: DetailPanelProps) {
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (node) {
      setLoading(true);
      getNeighbors(node.id)
        .then(setNeighbors)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [node]);

  if (!node) return null;

  const relationLabel = (type: string) =>
    RELATION_LABELS[type as keyof typeof RELATION_LABELS] || type;

  return (
    <div className="detail-panel">
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>

      <div className="detail-header">
        <span className="node-type" style={{ backgroundColor: NODE_COLORS[node.type] }}>
          {node.type}
        </span>
        <h2>{node.label}</h2>
      </div>

      <div className="detail-properties">
        {Object.entries(node.properties).map(([key, value]) => {
          if (key === 'id' || key === 'title' || key === 'name' || value == null) return null;
          return (
            <div key={key} className="property">
              <span className="property-key">{key}</span>
              <span className="property-value">{String(value)}</span>
            </div>
          );
        })}
      </div>

      <div className="detail-neighbors">
        <h3>연결된 노드</h3>
        {loading ? (
          <p className="loading">로딩 중...</p>
        ) : neighbors.length === 0 ? (
          <p className="empty">연결된 노드가 없습니다</p>
        ) : (
          <ul>
            {neighbors.map((neighbor) => (
              <li key={neighbor.id} onClick={() => onNodeSelect(neighbor.id)}>
                <span className="relation-type">
                  {neighbor.is_outgoing ? '→' : '←'} {relationLabel(neighbor.relation_type)}
                </span>
                <span className="neighbor-label">{neighbor.label}</span>
                <span className="neighbor-type" style={{ color: NODE_COLORS[neighbor.type as keyof typeof NODE_COLORS] }}>
                  {neighbor.type}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
