// components/ManhattanPlot.tsx
import { Box, Button, Typography } from "@mui/material";
import type { ActiveElement, ChartEvent, TooltipItem } from "chart.js";
import {
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import React, { useEffect, useRef, useState } from "react";
import { Scatter } from "react-chartjs-2";

import { ChartPoint, ManhattanPlotProps } from "../types";

// Register required components and zoom plugin
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  zoomPlugin,
);

export const getColorForSubclass = (() => {
  const colorMap: Record<string, string> = {};
  const colors = [
    "rgba(255, 99, 132, 0.7)",
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)",
    "rgba(255, 159, 64, 0.7)",
    "rgba(199, 199, 199, 0.7)",
    "rgba(83, 102, 255, 0.7)",
    "rgba(255, 99, 255, 0.7)",
    "rgba(0, 162, 172, 0.7)",
    "rgba(0, 0, 0, 0.7)",
    "rgba(103, 242, 100, 0.7)",
    "rgba(173, 216, 230, 0.7)",
    "rgba(216, 174, 173, 0.7)",
    "rgba(230, 185, 216, 0.7)",
    "rgba(141, 216, 173, 0.7)",
    "rgba(173, 216, 141, 0.7)",
    "rgba(185, 230, 216, 0.7)",
    "rgba(216, 141, 173, 0.7)",
    "rgba(141, 185, 230, 0.7)",
    "rgba(230, 141, 216, 0.7)",
    "rgba(216, 230, 173, 0.7)",
  ];

  return (subclass: string) => {
    if (!colorMap[subclass]) {
      const index = Object.keys(colorMap).length % colors.length;
      colorMap[subclass] = colors[index];
    }
    return colorMap[subclass];
  };
})();

interface Dataset {
  label: string;
  data: ChartPoint[];
  backgroundColor: string;
  pointRadius: number;
  pointHoverRadius: number;
}

const ManhattanPlot: React.FC<ManhattanPlotProps> = ({
  data,
  metaboliteInfo,
  onMetaboliteSelect,
  selectedMetabolite,
}) => {
  const [chartData, setChartData] = useState<ChartData<"scatter"> | null>(null);
  const [chartOptions, setChartOptions] =
    useState<ChartOptions<"scatter"> | null>(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Group data by subclass for different colors
    const datasets: Record<string, Dataset> = {};
    data.forEach((point) => {
      const subclass = point.subclass || "Unknown";
      if (!datasets[subclass]) {
        datasets[subclass] = {
          label: subclass,
          data: [],
          backgroundColor: getColorForSubclass(subclass),
          pointRadius: 4,
          pointHoverRadius: 6,
        };
      }
      datasets[subclass].data.push({
        x: point.position,
        y: point.lod,
        metabolite_id: point.id,
        snp: point.snp,
        subclass: point.subclass,
        position: point.position,
        lod: point.lod,
        metabolite_name: metaboliteInfo[point.id]?.name,
      });
    });

    setChartData({
      datasets: Object.values(datasets),
    });
  }, [data, metaboliteInfo, onMetaboliteSelect]);

  useEffect(() => {
    const min = Math.min(...data.map((p) => p.position));
    const exp = Math.floor(Math.log10(min) / 3) * 3;
    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: `Genomic Position (10^${exp})`,
          },
          ticks: {
            callback: (value: string | number) =>
              ((value as number) / 10 ** exp).toLocaleString(),
          },
        },
        y: {
          title: {
            display: true,
            text: "LOD Score",
          },
        },
      },
      plugins: {
        tooltip: {
          mode: "nearest",
          intersect: true,
          callbacks: {
            title: () => `Metabolite:`,
            label: (item: TooltipItem<"scatter">) => {
              const point = item.raw as ChartPoint;
              return [
                `ID: ${point.metabolite_id}`,
                `Name: ${point.metabolite_name}`,
                `LOD: ${point.lod.toFixed(2)}`,
                `Position: ${point.position.toLocaleString()}`,
                `SNP: ${point.snp}`,
                `Subclass: ${point.subclass || "Unknown"}`,
              ];
            },
          },
        },
        legend: {
          position: "right",
          fullSize: true,
          title: {
            display: true,
            text: "Metabolite Subclasses",
          },
          labels: {
            usePointStyle: true,
          },
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy",
          },
          pan: {
            enabled: true,
            mode: "xy",
          },
        },
      },
      onClick: (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
          const clickedElement = elements[0];
          const datasetIndex = clickedElement.datasetIndex;
          const index = clickedElement.index;
          const dataItem = chartData?.datasets[datasetIndex].data[
            index
          ] as ChartPoint;
          onMetaboliteSelect({
            id: dataItem.metabolite_id,
            subclass: dataItem.subclass,
            snp: dataItem.snp,
            position: dataItem.position,
            lod: dataItem.lod,
            name: dataItem.metabolite_name,
          });
        }
      },
    });
  }, [chartData]);

  if (!chartData || !chartOptions) {
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
          Loading Manhattan Plot...
        </Typography>
      </Box>
    );
  }

  // Optional: Add a button to reset zoom
  const handleResetZoom = () => {
    if (chartRef.current) {
      // @ts-ignore
      chartRef.current.resetZoom();
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ height: 400 }}>
        <Scatter ref={chartRef} data={chartData} options={chartOptions} />
      </Box>
      <Button
        variant="outlined"
        size="small"
        onClick={handleResetZoom}
        sx={{ mt: 1 }}
      >
        Reset Zoom
      </Button>
    </Box>
  );
};

export default ManhattanPlot;
