import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`medical-records-tabpanel-${index}`}
      aria-labelledby={`medical-records-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MedicalRecords = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = 'medical-records';
      
      if (user.roles.includes('ROLE_PATIENT')) {
        endpoint = `medical-records/patient/${user.username}`;
      }

      const response = await fetch(`http://localhost:8080/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch medical records');
      }

      const data = await response.json();
      setRecords(data);
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setError('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
              Medical Records
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Records" />
                <Tab label="Medications" />
                <Tab label="Lab Results" />
                <Tab label="Documents" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Diagnosis</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No medical records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.createdAt)}</TableCell>
                          <TableCell>{record.doctorName || 'Unknown Doctor'}</TableCell>
                          <TableCell>{record.diagnosis}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.status}
                              color={record.status === 'ACTIVE' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewDetails(record)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Medication</TableCell>
                      <TableCell>Dosage</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.flatMap(record => record.medications || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No medications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      records.flatMap(record =>
                        (record.medications || []).map((medication, index) => (
                          <TableRow key={`${record.id}-med-${index}`}>
                            <TableCell>{medication.name}</TableCell>
                            <TableCell>{medication.dosage}</TableCell>
                            <TableCell>{medication.frequency}</TableCell>
                            <TableCell>{medication.duration}</TableCell>
                            <TableCell>
                              <Chip
                                label={medication.status}
                                color={medication.status === 'ACTIVE' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Test Name</TableCell>
                      <TableCell>Result</TableCell>
                      <TableCell>Reference Range</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.flatMap(record => record.labResults || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No lab results found
                        </TableCell>
                      </TableRow>
                    ) : (
                      records.flatMap(record =>
                        (record.labResults || []).map((lab, index) => (
                          <TableRow key={`${record.id}-lab-${index}`}>
                            <TableCell>{lab.testName}</TableCell>
                            <TableCell>{lab.result} {lab.unit}</TableCell>
                            <TableCell>{lab.referenceRange}</TableCell>
                            <TableCell>{formatDate(lab.testDate)}</TableCell>
                            <TableCell>
                              <Chip
                                label={lab.status}
                                color={lab.status === 'COMPLETED' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>File Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Uploaded By</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.flatMap(record => record.documents || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No documents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      records.flatMap(record =>
                        (record.documents || []).map((doc, index) => (
                          <TableRow key={`${record.id}-doc-${index}`}>
                            <TableCell>{doc.fileName}</TableCell>
                            <TableCell>{doc.description}</TableCell>
                            <TableCell>{doc.uploadedBy}</TableCell>
                            <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                href={doc.fileUrl}
                                target="_blank"
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Medical Record Details
          <Typography variant="subtitle2" color="text.secondary">
            {selectedRecord && formatDate(selectedRecord.createdAt)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Doctor</Typography>
                <Typography>{selectedRecord.doctorName || 'Unknown Doctor'}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Diagnosis</Typography>
                <Typography>{selectedRecord.diagnosis}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Symptoms</Typography>
                <Typography>{selectedRecord.symptoms || 'Not specified'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Notes</Typography>
                <Typography>{selectedRecord.notes || 'No notes'}</Typography>
              </Grid>

              {selectedRecord.vitalSigns && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Vital Signs</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Temperature" 
                        secondary={`${selectedRecord.vitalSigns.temperature}°C`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Blood Pressure" 
                        secondary={`${selectedRecord.vitalSigns.bloodPressureSystolic}/${selectedRecord.vitalSigns.bloodPressureDiastolic} mmHg`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Heart Rate" 
                        secondary={`${selectedRecord.vitalSigns.heartRate} bpm`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Respiratory Rate" 
                        secondary={`${selectedRecord.vitalSigns.respiratoryRate} breaths/min`}
                      />
                    </ListItem>
                  </List>
                </Grid>
              )}

              {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Medications</Typography>
                  <List dense>
                    {selectedRecord.medications.map((med, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={med.name}
                          secondary={`${med.dosage}, ${med.frequency}, ${med.duration}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MedicalRecords; 