import { useEffect, useRef } from 'react';
import ForceGraph3D from '3d-force-graph';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { GraphData, GraphNode } from '../../types';

interface GraphSettings {
  linkWidth: number;
  linkOpacity: number;
  nodeSpread: number;
}

interface Graph3DProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  highlightNodeId?: string | null;
  focusNodeId?: string | null;
  settings?: GraphSettings;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForceGraph3DInstance = any;

const defaultSettings: GraphSettings = {
  linkWidth: 3,
  linkOpacity: 0.7,
  nodeSpread: 200,
};

export function Graph3D({ data, onNodeClick, highlightNodeId, focusNodeId, settings = defaultSettings }: Graph3DProps) {
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
    css2DRenderer.domElement.style.zIndex = '1';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const graph = (ForceGraph3D as any)({ extraRenderers: [css2DRenderer] })(containerRef.current)
      .backgroundColor('#0a0a1a')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .nodeThreeObject((node: any) => {
        const n = node as GraphNode;
        const nodeEl = document.createElement('div');

        // Calculate link count for this node
        const graphData = graph.graphData();
        const linkCount = graphData.links.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (l: any) => l.source?.id === n.id || l.target?.id === n.id || l.source === n.id || l.target === n.id
        ).length;

        if (n.type === 'Book') {
          // Scale font size based on link count (min 10px, max 28px) - bigger range
          const fontSize = Math.min(28, Math.max(10, 10 + linkCount * 3));
          nodeEl.innerHTML = `<span style="margin-right:4px">📖</span>${n.label}`;
          nodeEl.style.color = '#e1f5fe';
          nodeEl.style.fontSize = `${fontSize}px`;
          nodeEl.style.fontWeight = linkCount > 3 ? '700' : '500';
          nodeEl.style.backgroundColor = `rgba(0, 30, 60, ${Math.min(0.7, 0.25 + linkCount * 0.07)})`;
          nodeEl.style.border = linkCount > 5 ? '1px solid rgba(79, 195, 247, 0.5)' : 'none';
          nodeEl.style.borderRadius = '4px';
          nodeEl.style.padding = linkCount > 3 ? '4px 10px' : '2px 6px';
          nodeEl.style.textShadow = '0 1px 3px rgba(0,0,0,0.9)';
        } else {
          // Authors also scale by connections
          const fontSize = Math.min(18, Math.max(12, 12 + linkCount * 0.5));
          nodeEl.innerHTML = `<span style="margin-right:5px">✍️</span>${n.label}`;
          nodeEl.style.color = '#ffe082';
          nodeEl.style.fontSize = `${fontSize}px`;
          nodeEl.style.fontWeight = '600';
          nodeEl.style.backgroundColor = `rgba(50, 30, 0, ${Math.min(0.7, 0.35 + linkCount * 0.03)})`;
          nodeEl.style.border = '1px solid rgba(255, 183, 77, 0.4)';
          nodeEl.style.borderRadius = '14px';
          nodeEl.style.padding = '3px 8px';
          nodeEl.style.textShadow = '0 1px 3px rgba(0,0,0,0.9)';
        }

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
      .linkWidth(settings.linkWidth)
      .linkOpacity(settings.linkOpacity)
      .linkDirectionalParticles(0)
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

        // Calculate link count for this node
        const graphData = graphRef.current.graphData();
        const linkCount = graphData.links.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (l: any) => l.source?.id === n.id || l.target?.id === n.id || l.source === n.id || l.target === n.id
        ).length;

        if (n.type === 'Book') {
          const baseFontSize = Math.min(28, Math.max(10, 10 + linkCount * 3));
          const fontSize = isHighlighted ? baseFontSize + 6 : baseFontSize;
          nodeEl.innerHTML = `<span style="margin-right:4px">📖</span>${n.label}`;
          nodeEl.style.color = isHighlighted ? '#ffffff' : '#e1f5fe';
          nodeEl.style.fontSize = `${fontSize}px`;
          nodeEl.style.fontWeight = isHighlighted ? 'bold' : (linkCount > 3 ? '700' : '500');
          nodeEl.style.backgroundColor = isHighlighted ? 'rgba(79, 195, 247, 0.7)' : `rgba(0, 30, 60, ${Math.min(0.7, 0.25 + linkCount * 0.07)})`;
          nodeEl.style.border = isHighlighted ? '2px solid #ffffff' : (linkCount > 5 ? '1px solid rgba(79, 195, 247, 0.5)' : 'none');
          nodeEl.style.borderRadius = '4px';
          nodeEl.style.padding = isHighlighted ? '5px 12px' : (linkCount > 3 ? '4px 10px' : '2px 6px');
          nodeEl.style.textShadow = '0 1px 3px rgba(0,0,0,0.9)';
        } else {
          const baseFontSize = Math.min(18, Math.max(12, 12 + linkCount * 0.5));
          const fontSize = isHighlighted ? baseFontSize + 4 : baseFontSize;
          nodeEl.innerHTML = `<span style="margin-right:5px">✍️</span>${n.label}`;
          nodeEl.style.color = isHighlighted ? '#ffffff' : '#ffe082';
          nodeEl.style.fontSize = `${fontSize}px`;
          nodeEl.style.fontWeight = isHighlighted ? 'bold' : '600';
          nodeEl.style.backgroundColor = isHighlighted ? 'rgba(255, 183, 77, 0.7)' : `rgba(50, 30, 0, ${Math.min(0.7, 0.35 + linkCount * 0.03)})`;
          nodeEl.style.border = isHighlighted ? '2px solid #ffffff' : '1px solid rgba(255, 183, 77, 0.4)';
          nodeEl.style.borderRadius = '14px';
          nodeEl.style.padding = isHighlighted ? '5px 12px' : '3px 8px';
          nodeEl.style.textShadow = '0 1px 3px rgba(0,0,0,0.9)';
        }

        nodeEl.style.whiteSpace = 'nowrap';
        nodeEl.style.boxShadow = isHighlighted ? '0 0 15px rgba(255,255,255,0.6)' : 'none';
        return new CSS2DObject(nodeEl);
      });
    }
  }, [highlightNodeId]);

  // Update link visual properties when settings change
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current
        .linkWidth(settings.linkWidth)
        .linkOpacity(settings.linkOpacity);
    }
  }, [settings.linkWidth, settings.linkOpacity]);

  // Update node spread using d3AlphaDecay and warmup ticks
  useEffect(() => {
    if (graphRef.current && data.nodes.length > 0) {
      // Use d3VelocityDecay to control how fast nodes settle
      // Lower values = nodes spread out more before settling
      const decay = Math.max(0.1, 1 - settings.nodeSpread / 500);
      graphRef.current.d3VelocityDecay(decay);

      // Adjust charge force strength if available
      const chargeForce = graphRef.current.d3Force('charge');
      if (chargeForce && typeof chargeForce.strength === 'function') {
        chargeForce.strength(-settings.nodeSpread * 3);
      }

      // Adjust link distance if available
      const linkForce = graphRef.current.d3Force('link');
      if (linkForce && typeof linkForce.distance === 'function') {
        linkForce.distance(settings.nodeSpread * 0.5);
      }

      // Reheat simulation to apply changes
      if (graphRef.current.d3ReheatSimulation) {
        graphRef.current.d3ReheatSimulation();
      }
    }
  }, [settings.nodeSpread, data.nodes.length]);

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
