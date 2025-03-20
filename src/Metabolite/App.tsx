// App.tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Modal,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import FileUpload from "./components/FileUpload";
import ManhattanPlot from "./components/ManhattanPlot";
import NetworkGraph from "./components/NetworkGraph";
import { MetaboliteDetail, MetaboliteInfo, ProcessedData } from "./types";
import DataProcessor from "./utils/DataProcessor";

function App() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [files, setFiles] = useState<{
    metaboliteInfo: File | null;
    correlations: File | null;
    gwasData: File | null;
  }>({
    metaboliteInfo: null,
    correlations: null,
    gwasData: null,
  });
  const [processedData, setProcessedData] = useState<ProcessedData | null>(
    null,
  );
  const [selectedMetabolite, setSelectedMetabolite] =
    useState<MetaboliteDetail | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const steps = ["Upload CSV Files", "View Interactive Plots"];

  const handleFileUpload = (fileType: string, file: File) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fileType]: file,
    }));
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!files.metaboliteInfo || !files.correlations || !files.gwasData) {
        alert("Please upload all required files");
        return;
      }

      try {
        const data = await DataProcessor.processFiles(
          files.metaboliteInfo,
          files.correlations,
          files.gwasData,
        );
        setProcessedData(data);
        setActiveStep(1);
      } catch (error) {
        alert("Error processing files: " + (error as Error).message);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setProcessedData(null);
  };

  const handleMetaboliteSelect = (metabolite: MetaboliteDetail) => {
    setSelectedMetabolite(metabolite);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Metabolomics Dashboard
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper elevation={3} sx={{ p: 3 }}>
          {activeStep === 0 ? (
            <FileUpload onFileUpload={handleFileUpload} files={files} />
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Interactive Metabolomics Visualization
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card elevation={2} sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Manhattan Plot (GWAS Data)
                      </Typography>
                      {processedData && (
                        <ManhattanPlot
                          data={processedData.gwasData}
                          metaboliteInfo={processedData.metaboliteInfo}
                          onMetaboliteSelect={handleMetaboliteSelect}
                          selectedMetabolite={selectedMetabolite}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card elevation={2} sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Metabolite Correlation Network
                      </Typography>
                      {processedData && (
                        <NetworkGraph
                          data={processedData.networkData}
                          metaboliteInfo={processedData.metaboliteInfo}
                          onMetaboliteSelect={handleMetaboliteSelect}
                          selectedMetabolite={selectedMetabolite}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="contained"
              color="secondary"
            >
              Back
            </Button>
            <Button
              disabled={activeStep === steps.length - 1}
              onClick={handleNext}
              variant="contained"
              color="primary"
            >
              Next
            </Button>
          </Box>
        </Paper>

        <Modal
          open={modalOpen}
          onClose={handleModalClose}
          aria-labelledby="metabolite-details"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography
              id="modal-title"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Metabolite Details
            </Typography>
            {selectedMetabolite && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>ID:</strong> {selectedMetabolite.id}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Name:</strong>{" "}
                  {selectedMetabolite.name || "Not specified"}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Subclass:</strong>{" "}
                  {selectedMetabolite.subclass || "Not specified"}
                </Typography>
                {selectedMetabolite.snp && (
                  <Typography variant="body1" gutterBottom>
                    <strong>SNP:</strong> {selectedMetabolite.snp}
                  </Typography>
                )}
                {selectedMetabolite.position && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Position:</strong> {selectedMetabolite.position}
                  </Typography>
                )}
                {selectedMetabolite.lod && (
                  <Typography variant="body1" gutterBottom>
                    <strong>LOD Score:</strong>{" "}
                    {selectedMetabolite.lod.toFixed(2)}
                  </Typography>
                )}
              </Box>
            )}
            <Button
              onClick={handleModalClose}
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Close
            </Button>
          </Box>
        </Modal>
      </Box>
    </Container>
  );
}

export default App;
