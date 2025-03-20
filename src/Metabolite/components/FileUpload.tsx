// components/FileUpload.tsx
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import { FileUploadProps } from "../types";

interface FileType {
  id: string;
  label: string;
  description: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, files }) => {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleFileChange =
    (fileType: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        onFileUpload(fileType, file);
      }
    };

  const handleDragOver =
    (fileType: string) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragOverId(fileType);
    };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOverId(null);
  };

  const handleDrop =
    (fileType: string) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragOverId(null);

      const file = event.dataTransfer.files?.[0];
      if (file) {
        // Validate file type
        if (file.type === "text/csv" || file.name.endsWith(".csv")) {
          onFileUpload(fileType, file);
        } else {
          // Could add error handling/messaging here
          console.error("Invalid file type. Please upload a CSV file.");
        }
      }
    };

  const fileTypes: FileType[] = [
    {
      id: "metaboliteInfo",
      label: "Metabolite Information (CSV)",
      description:
        "Contains metadata about metabolites (metabolite_id, subclass)",
    },
    {
      id: "correlations",
      label: "Metabolite Correlations (CSV)",
      description:
        "Contains pairs of strongly correlated metabolites (correlation > 0.8)",
    },
    {
      id: "gwasData",
      label: "GWAS Data (CSV)",
      description: "Contains genome-wide association study results",
    },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload Dataset Files
      </Typography>
      <Typography variant="body1" paragraph>
        Please upload the following CSV files to continue:
      </Typography>

      <Grid container spacing={2}>
        {fileTypes.map((fileType) => (
          <Grid item xs={12} md={4} key={fileType.id}>
            <Paper
              elevation={2}
              sx={(theme) => ({
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                backgroundColor: files[fileType.id as keyof typeof files]
                  ? theme.palette.action.disabledBackground
                  : theme.palette.background.paper,
              })}
            >
              <Typography variant="subtitle1" gutterBottom>
                {fileType.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {fileType.description}
              </Typography>

              <Box sx={{ flexGrow: 1 }}>
                {files[fileType.id as keyof typeof files] ? (
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={files[fileType.id as keyof typeof files]?.name}
                        secondary={`Size: ${((files[fileType.id as keyof typeof files]?.size || 0) / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100px",
                      border: `2px dashed ${dragOverId === fileType.id ? "#4caf50" : "#ccc"}`,
                      borderRadius: 1,
                      mb: 2,
                      backgroundColor:
                        dragOverId === fileType.id
                          ? "rgba(76, 175, 80, 0.1)"
                          : "transparent",
                      transition: "all 0.3s ease",
                    }}
                    onDragOver={handleDragOver(fileType.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop(fileType.id)}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      {dragOverId === fileType.id
                        ? "Drop to upload"
                        : "Drag and drop CSV file here or click Upload File"}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "center", mt: "auto" }}
              >
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  color={
                    files[fileType.id as keyof typeof files]
                      ? "success"
                      : "primary"
                  }
                >
                  {files[fileType.id as keyof typeof files]
                    ? "Change File"
                    : "Upload File"}
                  <input
                    type="file"
                    accept=".csv"
                    hidden
                    onChange={handleFileChange(fileType.id)}
                  />
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Note: All files must be in CSV format. Files can be uploaded using the
          button or by dragging and dropping directly onto the upload area.
        </Typography>
      </Box>
    </Box>
  );
};

export default FileUpload;
