import { useState, useEffect, useCallback } from 'react';
import { Graph3D } from './components/Graph3D/Graph3D';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { DetailPanel } from './components/DetailPanel/DetailPanel';
import { BookForm } from './components/BookForm/BookForm';
import { GraphSettings, type GraphSettingsValues } from './components/GraphSettings';
import { fetchGraphData, searchNodes } from './services/api';
import type { GraphData, GraphNode, NodeType, RelationType } from './types';

const defaultGraphSettings: GraphSettingsValues = {
  linkWidth: 3,
  linkOpacity: 0.7,
  nodeSpread: 200,
};

function App() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphSettings, setGraphSettings] = useState<GraphSettingsValues>(defaultGraphSettings);

  const loadGraphData = useCallback(async (nodeTypes?: NodeType[], relationTypes?: RelationType[]) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGraphData(nodeTypes, relationTypes);
      setGraphData(data);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  const handleFilterChange = (nodeTypes: NodeType[], relationTypes: RelationType[]) => {
    loadGraphData(nodeTypes, relationTypes);
  };

  const handleSearch = async (query: string) => {
    const results = await searchNodes(query);
    return results;
  };

  const handleSelectSearchResult = (nodeId: string) => {
    setHighlightNodeId(nodeId);
    setFocusNodeId(nodeId);
    setTimeout(() => {
      setHighlightNodeId(null);
      setFocusNodeId(null);
    }, 3000);
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const handleNodeSelect = (nodeId: string) => {
    const node = graphData.nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setHighlightNodeId(nodeId);
      setTimeout(() => setHighlightNodeId(null), 2000);
    }
  };

  const handleDataChange = () => {
    loadGraphData();
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 200,
            color: 'white',
            fontSize: '18px',
          }}
        >
          로딩 중...
        </div>
      )}

      {error && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 200,
            color: '#e74c3c',
            fontSize: '16px',
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(0,0,0,0.8)',
            borderRadius: '8px',
            maxWidth: '400px',
          }}
        >
          {error}
        </div>
      )}

      <Graph3D
        data={graphData}
        onNodeClick={handleNodeClick}
        highlightNodeId={highlightNodeId}
        focusNodeId={focusNodeId}
        settings={graphSettings}
      />

      <FilterPanel
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onSelectSearchResult={handleSelectSearchResult}
      >
        <GraphSettings settings={graphSettings} onChange={setGraphSettings} />
      </FilterPanel>

      {selectedNode && (
        <DetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onNodeSelect={handleNodeSelect}
        />
      )}

      <BookForm onDataChange={handleDataChange} />
    </div>
  );
}

export default App;
