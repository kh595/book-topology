import { useEffect, useRef } from 'react';
import ForceGraph3D from '3d-force-graph';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { GraphData, GraphNode } from '../../types';

interface Graph3DProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  highlightNodeId?: string | null;
}

// Generate color from string (for author-based coloring)
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForceGraph3DInstance = any;

export function Graph3D({ data, onNodeClick, highlightNodeId }: Graph3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraph3DInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create CSS2D renderer for text labels
    const css2DRenderer = new CSS2DRenderer();
    css2DRenderer.setSize(
      containerRef.current.clientWidth || window.innerWidth,
      containerRef.current.clientHeight || window.innerHeight
    );
    css2DRenderer.domElement.style.position = 'absolute';
    css2DRenderer.domElement.style.top = '0';
    css2DRenderer.domElement.style.pointerEvents = 'none';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const graph = (ForceGraph3D as any)({ extraRenderers: [css2DRenderer] })(containerRef.current)
      .backgroundColor('#0a0a1a')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .nodeThreeObject((node: any) => {
        const n = node as GraphNode;
        const nodeEl = document.createElement('div');
        nodeEl.textContent = n.label;
        nodeEl.style.color = n.type === 'Book' ? '#4fc3f7' : stringToColor(n.label);
        nodeEl.style.fontSize = n.type === 'Book' ? '10px' : '12px';
        nodeEl.style.fontWeight = n.type === 'Author' ? 'bold' : 'normal';
        nodeEl.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        nodeEl.style.padding = '2px 4px';
        nodeEl.style.borderRadius = '3px';
        nodeEl.style.whiteSpace = 'nowrap';
        return new CSS2DObject(nodeEl);
      })
      .nodeThreeObjectExtend(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .linkColor((link: any) => {
        const l = link as { type?: string };
        if (l.type === 'WRITTEN_BY') return '#ffb74d';
        if (l.type === 'SIMILAR_TO') return '#4fc3f7';
        return '#90a4ae';
      })
      .linkWidth(2)
      .linkOpacity(0.8)
      .linkDirectionalParticles(2)
      .linkDirectionalParticleWidth(2)
      .linkDirectionalParticleSpeed(0.005)
      .linkDirectionalParticleColor(() => '#ffffff')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .onNodeClick((node: any) => {
        if (onNodeClick) {
          onNodeClick(node as GraphNode);
        }
        const distance = 100;
        const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
        graph.cameraPosition(
          {
            x: (node.x || 0) * distRatio,
            y: (node.y || 0) * distRatio,
            z: (node.z || 0) * distRatio,
          },
          node as { x: number; y: number; z: number },
          1000
        );
      });

    graphRef.current = graph;

    const handleResize = () => {
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;
      graph.width(width);
      graph.height(height);
      css2DRenderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      graph._destructor?.();
    };
  }, []);

  useEffect(() => {
    if (graphRef.current && data) {
      graphRef.current.graphData({
        nodes: data.nodes.map((n) => ({ ...n })),
        links: data.links.map((l) => ({ ...l })),
      });
    }
  }, [data]);

  // Highlight effect for selected node
  useEffect(() => {
    if (graphRef.current && highlightNodeId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      graphRef.current.nodeThreeObject((node: any) => {
        const n = node as GraphNode;
        const nodeEl = document.createElement('div');
        nodeEl.textContent = n.label;
        const isHighlighted = n.id === highlightNodeId;
        nodeEl.style.color = isHighlighted ? '#ffffff' : (n.type === 'Book' ? '#4fc3f7' : stringToColor(n.label));
        nodeEl.style.fontSize = n.type === 'Book' ? '10px' : '12px';
        nodeEl.style.fontWeight = isHighlighted || n.type === 'Author' ? 'bold' : 'normal';
        nodeEl.style.backgroundColor = isHighlighted ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.6)';
        nodeEl.style.padding = '2px 4px';
        nodeEl.style.borderRadius = '3px';
        nodeEl.style.whiteSpace = 'nowrap';
        nodeEl.style.border = isHighlighted ? '2px solid #ffffff' : 'none';
        return new CSS2DObject(nodeEl);
      });
    }
  }, [highlightNodeId]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
    />
  );
}
