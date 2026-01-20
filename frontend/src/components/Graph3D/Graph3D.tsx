import { useEffect, useRef } from 'react';
import ForceGraph3D from '3d-force-graph';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { GraphData, GraphNode } from '../../types';

interface Graph3DProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  highlightNodeId?: string | null;
  focusNodeId?: string | null;
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

export function Graph3D({ data, onNodeClick, highlightNodeId, focusNodeId }: Graph3DProps) {
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

        if (n.type === 'Book') {
          nodeEl.innerHTML = `<span style="margin-right:3px;opacity:0.7">📖</span>${n.label}`;
          nodeEl.style.color = 'rgba(179, 229, 252, 0.9)';
          nodeEl.style.fontSize = '10px';
          nodeEl.style.fontWeight = 'normal';
          nodeEl.style.backgroundColor = 'rgba(13, 71, 161, 0.3)';
          nodeEl.style.border = '1px solid rgba(79, 195, 247, 0.4)';
          nodeEl.style.borderRadius = '3px';
          nodeEl.style.padding = '2px 6px';
        } else {
          nodeEl.innerHTML = `<span style="margin-right:4px">✍️</span>${n.label}`;
          nodeEl.style.color = '#fff59d';
          nodeEl.style.fontSize = '13px';
          nodeEl.style.fontWeight = 'bold';
          nodeEl.style.backgroundColor = 'rgba(130, 80, 20, 0.85)';
          nodeEl.style.border = '2px solid #ffb74d';
          nodeEl.style.borderRadius = '20px';
          nodeEl.style.padding = '4px 10px';
        }

        nodeEl.style.whiteSpace = 'nowrap';
        nodeEl.style.boxShadow = n.type === 'Book' ? 'none' : '0 2px 8px rgba(0,0,0,0.4)';
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
        const isHighlighted = n.id === highlightNodeId;

        if (n.type === 'Book') {
          nodeEl.innerHTML = `<span style="margin-right:3px;opacity:${isHighlighted ? '1' : '0.7'}">📖</span>${n.label}`;
          nodeEl.style.color = isHighlighted ? '#ffffff' : 'rgba(179, 229, 252, 0.9)';
          nodeEl.style.fontSize = isHighlighted ? '14px' : '10px';
          nodeEl.style.fontWeight = isHighlighted ? 'bold' : 'normal';
          nodeEl.style.backgroundColor = isHighlighted ? 'rgba(79, 195, 247, 0.8)' : 'rgba(13, 71, 161, 0.3)';
          nodeEl.style.border = isHighlighted ? '2px solid #ffffff' : '1px solid rgba(79, 195, 247, 0.4)';
          nodeEl.style.borderRadius = '3px';
          nodeEl.style.padding = isHighlighted ? '4px 8px' : '2px 6px';
        } else {
          nodeEl.innerHTML = `<span style="margin-right:4px">✍️</span>${n.label}`;
          nodeEl.style.color = isHighlighted ? '#ffffff' : '#fff59d';
          nodeEl.style.fontSize = isHighlighted ? '16px' : '13px';
          nodeEl.style.fontWeight = 'bold';
          nodeEl.style.backgroundColor = isHighlighted ? 'rgba(255, 255, 255, 0.3)' : 'rgba(130, 80, 20, 0.85)';
          nodeEl.style.border = isHighlighted ? '3px solid #ffffff' : '2px solid #ffb74d';
          nodeEl.style.borderRadius = '20px';
          nodeEl.style.padding = isHighlighted ? '5px 12px' : '4px 10px';
        }

        nodeEl.style.whiteSpace = 'nowrap';
        nodeEl.style.boxShadow = isHighlighted ? '0 0 20px rgba(255,255,255,0.8)' : (n.type === 'Book' ? 'none' : '0 2px 8px rgba(0,0,0,0.4)');
        return new CSS2DObject(nodeEl);
      });
    }
  }, [highlightNodeId]);

  // Focus camera on specific node
  useEffect(() => {
    if (graphRef.current && focusNodeId) {
      const graphData = graphRef.current.graphData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const node = graphData.nodes.find((n: any) => n.id === focusNodeId);
      if (node && node.x !== undefined) {
        const distance = 150;
        const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
        graphRef.current.cameraPosition(
          {
            x: (node.x || 0) * distRatio,
            y: (node.y || 0) * distRatio,
            z: (node.z || 0) * distRatio,
          },
          { x: node.x, y: node.y, z: node.z },
          1500
        );
      }
    }
  }, [focusNodeId]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
    />
  );
}
