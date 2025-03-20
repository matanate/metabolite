// types.ts
export interface MetaboliteInfo {
  id: string;
  subclass: string;
  name: string;
}

export interface MetaboliteInfoMap {
  [id: string]: MetaboliteInfo;
}

export interface GwasDataPoint {
  id: string;
  name: string;
  snp: string;
  position: number;
  lod: number;
  subclass: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  subclass: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface ProcessedData {
  metaboliteInfo: MetaboliteInfoMap;
  networkData: NetworkData;
  gwasData: GwasDataPoint[];
}

export interface MetaboliteDetail {
  id: string;
  name: string;
  subclass?: string;
  snp?: string;
  position?: number;
  lod?: number;
}

export interface FileUploadProps {
  onFileUpload: (fileType: string, file: File) => void;
  files: {
    metaboliteInfo: File | null;
    correlations: File | null;
    gwasData: File | null;
  };
}

export interface ManhattanPlotProps {
  data: GwasDataPoint[];
  metaboliteInfo: MetaboliteInfoMap;
  onMetaboliteSelect: (metabolite: MetaboliteDetail) => void;
  selectedMetabolite: MetaboliteDetail | null;
}

export interface NetworkGraphProps {
  data: NetworkData;
  metaboliteInfo: MetaboliteInfoMap;
  onMetaboliteSelect: (metabolite: MetaboliteDetail) => void;
  selectedMetabolite: MetaboliteDetail | null;
}

export interface ChartPoint {
  x: number;
  y: number;
  metabolite_id: string;
  metabolite_name: string;
  snp: string;
  subclass: string;
  position: number;
  lod: number;
}

export interface ForceGraphNode {
  id: string;
  metabolite_name: string;
  subclass: string;
  color: string;
  x?: number;
  y?: number;
}

export interface ForceGraphLink {
  source: string;
  target: string;
}

export interface ForceGraphData {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
}
