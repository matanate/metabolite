# Metabolomics Dashboard

This React application provides an interactive dashboard for exploring metabolomic data. It visualizes metabolite data in two coordinated plots: a Manhattan plot for GWAS data and a network graph for metabolite correlations.

## Features

- **CSV File Upload**: Upload metabolite information, correlations, and GWAS data
- **Manhattan Plot**: Visualize GWAS results with genomic positions and LOD scores
- **Correlation Network**: Explore relationships between metabolites in a force-directed graph
- **Interactive Selection**: Click on data points to view detailed information
- **Synchronized Highlights**: Selections in one plot are reflected in the other plot

## Live Demo

You can explore the live demo of the application here: [Metabolomics Dashboard Live Demo](https://metabolite.atedgimatan.com)

## Setup Instructions

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone this repository:

```
git clone [repository-url]
cd metabolomics-dashboard
```

2. Install dependencies:

```
npm install
# or
yarn install
```

3. Start the development server:

```
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Required Dependencies

- React
- Material-UI (@mui/material, @mui/icons-material)
- chart.js, chartjs-plugin-zoom and react-chartjs-2 (for Manhattan Plot)
- react-force-graph-2d (for Network Graph)
- papaparse (for CSV parsing)

## Usage

1. **Upload CSV Files**:

   - Upload the metabolite information CSV (containing metabolite_id and subclass)
   - Upload the metabolite correlations CSV (containing metabolite_1 and metabolite_2)
   - Upload the GWAS data CSV (containing metabolite_id, snp, position, and lod)

2. **Interact with Visualizations**:
   - Click on data points in the Manhattan plot to view metabolite details
   - Click on nodes in the network graph to highlight related metabolites
   - View detailed information in the popup modal

## Implementation Details

### Data Processing

The application processes CSV files client-side using PapaParse. Metabolite information is used to enrich the GWAS data and network graph. The network graph is constructed from correlation data, with nodes representing metabolites and edges representing correlations.

### Visualization Implementation

- **Manhattan Plot**: Implemented using react-chartjs-2 (Scatter)

  - X-axis: Genomic position
  - Y-axis: LOD score
  - Points colored by metabolite subclass

- **Network Graph**: Implemented using react-force-graph-2d
  - Nodes represent metabolites (colored by subclass)
  - Edges represent correlations between metabolites
  - Force-directed layout for intuitive relationship visualization

### Inter-Plot Communication

The application features synchronized visualizations where clicking on a data point in either plot selects the corresponding metabolite. The selected metabolite is highlighted in both plots, and a modal displays detailed information about the selected metabolite.

### Data Assumptions

- All CSV files have headers matching the expected column names
- Metabolite IDs are consistent across all files
- Correlation data includes only pairs with correlation > 0.8
- GWAS data includes numeric position and LOD values

### Libraries Used

- **Material-UI**: For modern, responsive UI components
- **chart.js/react-chartjs-2**: For the Manhattan plot visualization
- **react-force-graph-2d**: For the network graph visualization
- **PapaParse**: For CSV parsing
