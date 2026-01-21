declare module 'd3-force-3d' {
  export function forceLink<NodeType = any, LinkType = any>(): {
    distance(d: number | ((link: LinkType) => number)): any;
    strength(s: number | ((link: LinkType) => number)): any;
    id(fn: (node: NodeType) => string): any;
  };

  export function forceManyBody<NodeType = any>(): {
    strength(s: number | ((node: NodeType) => number)): any;
    distanceMax(d: number): any;
    distanceMin(d: number): any;
  };

  export function forceCenter<NodeType = any>(x?: number, y?: number, z?: number): any;
}
