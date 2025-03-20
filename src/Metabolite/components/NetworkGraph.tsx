// components/NetworkGraph.tsx
import { Box, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

import { ForceGraphData, ForceGraphNode, NetworkGraphProps } from "../types";
import { getColorForSubclass } from "./ManhattanPlot";

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  data,
  metaboliteInfo,
  onMetaboliteSelect,
  selectedMetabolite,
}) => {
  const [graphData, setGraphData] = useState<ForceGraphData | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 500, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;

    // Format data for ForceGraph
    const formattedData: ForceGraphData = {
      nodes: data.nodes.map((node) => ({
        id: node.id,
        metabolite_name: node.name,
        subclass: node.subclass,
        color: getColorForSubclass(node.subclass),
      })),
      links: data.edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
      })),
    };

    setGraphData(formattedData);
  }, [data]);

  useEffect(() => {
    // Update dimensions when component mounts
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setDimensions({
        width: offsetWidth,
        height: offsetHeight,
      });
    }

    // Set up resize listener
    const handleResize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({
          width: offsetWidth,
          height: offsetHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Highlight selected metabolite if present

    if (selectedMetabolite && graphRef.current && graphData) {
      const node = graphData.nodes.find((n) => n.id === selectedMetabolite.id);
      if (
        node &&
        "x" in node &&
        "y" in node &&
        node.x !== undefined &&
        node.y !== undefined
      ) {
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(2, 1000);
      }
    }
  }, [selectedMetabolite, graphData]);

  if (!graphData) {
    return (
      <Box
        sx={{
          height: 400,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Loading Network Graph...
        </Typography>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ height: 400, width: "100%" }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel={(node) =>
          `${(node as ForceGraphNode).id} (${(node as ForceGraphNode).metabolite_name})`
        }
        nodeColor={(node) =>
          selectedMetabolite &&
          (node as ForceGraphNode).id === selectedMetabolite.id
            ? "#FF0000"
            : (node as ForceGraphNode).color
        }
        nodeRelSize={6}
        linkWidth={1}
        linkColor={() => "rgba(0,0,0,0.2)"}
        onNodeClick={(node) => {
          onMetaboliteSelect({
            id: (node as ForceGraphNode).id,
            name: (node as ForceGraphNode).metabolite_name,
            subclass: (node as ForceGraphNode).subclass,
          });
        }}
      />
    </Box>
  );
};

export default NetworkGraph;
