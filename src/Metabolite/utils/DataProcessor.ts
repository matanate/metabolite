// utils/DataProcessor.ts
import Papa from "papaparse";

import {
  GwasDataPoint,
  MetaboliteInfoMap,
  NetworkData,
  ProcessedData,
} from "../types";

interface MetaboliteInfoRow {
  metabolite_id: string;
  name: string;
  subclass?: string;
}

interface CorrelationRow {
  metabolite_1: string;
  metabolite_2: string;
}

interface GwasDataRow {
  metabolite_id: string;
  snp: string;
  position: number;
  lod: number;
}

class DataProcessor {
  static async processFiles(
    metaboliteInfoFile: File,
    correlationsFile: File,
    gwasDataFile: File,
  ): Promise<ProcessedData> {
    try {
      const [metaboliteInfo, correlations, gwasData] = await Promise.all([
        this.parseCSV<MetaboliteInfoRow>(metaboliteInfoFile),
        this.parseCSV<CorrelationRow>(correlationsFile),
        this.parseCSV<GwasDataRow>(gwasDataFile),
      ]);

      // Process metabolite info to create a lookup map
      const metaboliteInfoMap = this.createMetaboliteInfoMap(metaboliteInfo);

      // Process network data
      const networkData = this.processNetworkData(
        correlations,
        metaboliteInfoMap,
      );

      // Process GWAS data
      const processedGwasData = this.processGwasData(
        gwasData,
        metaboliteInfoMap,
      );

      return {
        metaboliteInfo: metaboliteInfoMap,
        networkData,
        gwasData: processedGwasData,
      };
    } catch (error) {
      console.error("Error processing files:", error);
      throw new Error("Failed to process CSV files");
    }
  }

  static async parseCSV<T>(file: File): Promise<T[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error(
              "Error parsing CSV file. Problematic lines:",
              results.errors.map((error) => error.row),
            );
            reject(new Error("Error parsing CSV file"));
          } else {
            resolve(results.data as T[]);
          }
        },
        error: (error) => {
          console.error("Error parsing CSV file:", error);
          reject(error);
        },
      });
    });
  }

  static createMetaboliteInfoMap(
    metaboliteInfo: MetaboliteInfoRow[],
  ): MetaboliteInfoMap {
    const metaboliteInfoMap: MetaboliteInfoMap = {};

    metaboliteInfo.forEach((row) => {
      // Skip rows with missing metabolite_id
      if (!row.metabolite_id) return;

      metaboliteInfoMap[row.metabolite_id] = {
        id: row.metabolite_id,
        name: row.name,
        subclass: row.subclass || "Unknown",
      };
    });

    return metaboliteInfoMap;
  }

  static processNetworkData(
    correlations: CorrelationRow[],
    metaboliteInfoMap: MetaboliteInfoMap,
  ): NetworkData {
    // Create nodes and edges for the network
    const nodes = new Set<string>();
    const edges: { source: string; target: string }[] = [];

    correlations.forEach((row) => {
      if (!row.metabolite_1 || !row.metabolite_2) return;

      nodes.add(row.metabolite_1);
      nodes.add(row.metabolite_2);

      edges.push({
        source: row.metabolite_1,
        target: row.metabolite_2,
      });
    });

    // Convert nodes to array with metadata
    const nodeArray = Array.from(nodes).map((id) => {
      const info = metaboliteInfoMap[id] || {
        id,
        subclass: "Unknown",
        name: "Unknown",
      };
      return {
        id,
        subclass: info.subclass,
        name: info.name,
      };
    });

    return {
      nodes: nodeArray,
      edges,
    };
  }

  static processGwasData(
    gwasData: GwasDataRow[],
    metaboliteInfoMap: MetaboliteInfoMap,
  ): GwasDataPoint[] {
    return gwasData
      .map((row) => {
        const metaboliteInfo = metaboliteInfoMap[row.metabolite_id] || {
          id: row.metabolite_id,
          subclass: "Unknown",
          name: "Unknown",
        };

        return {
          id: row.metabolite_id,
          name: metaboliteInfo.name,
          snp: row.snp,
          position: row.position,
          lod: row.lod,
          subclass: metaboliteInfo.subclass,
        };
      })
      .filter((row) => row.position && row.lod); // Filter out rows with missing data
  }
}

export default DataProcessor;
