import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';

// Default empty record structure
const defaultRecord = {
  appointmentId: '',
  patientId: '',
  doctorId: '',
  patientName: '',
  diagnosis: '',
  symptoms: '',
  notes: '',
  medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
  labResults: [], // Initialize empty array for lab results
  vitalSigns: {
    temperature: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    respiratoryRate: ''
  }
};

const AddMedicalRecord = () => {
  const { id } = useParams(); // This will be appointmentId for new records or recordId for editing
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const isEditing = location.pathname.includes('/edit/');
  const returnTo = location.state?.returnTo || '/doctor-dashboard';

  // Initialize with default record structure
  const [record, setRecord] = useState(defaultRecord);

  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  const [newLabResult, setNewLabResult] = useState({
    testName: '',
    result: '',
    unit: '',
    referenceRange: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        if (isEditing) {
          const response = await fetch(`${API_BASE_URL}/medical-records/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch medical record');
          }

          const data = await response.json();
          setRecord({
            ...defaultRecord,
            ...data,
            medications: Array.isArray(data.medications) && data.medications.length > 0
              ? data.medications
              : defaultRecord.medications,
            vitalSigns: {
              ...defaultRecord.vitalSigns,
              ...(data.vitalSigns || {})
            }
          });
        } else {
          // For new records, fetch appointment details
          const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch appointment details');
          }

          const appointmentData = await response.json();
          console.log('Fetched appointment data:', appointmentData); // Debug log

          setRecord(prev => ({
            ...defaultRecord,
            appointmentId: appointmentData.id || '',
            patientId: appointmentData.patientId || '',
            doctorId: appointmentData.doctorId || '',
            patientName: appointmentData.patientName || '',
            doctorName: appointmentData.doctorName || '',
            appointmentDate: appointmentData.date || '',
            appointmentTime: appointmentData.time || ''
          }));
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message || 'An error occurred while loading the data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVitalSignsChange = (e) => {
    const { name, value } = e.target;
    setRecord(prev => ({
      ...prev,
      vitalSigns: {
        ...(prev.vitalSigns || defaultRecord.vitalSigns),
        [name]: value
      }
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setRecord(prev => {
      const updatedMedications = [...(prev.medications || defaultRecord.medications)];
      updatedMedications[index] = {
        ...updatedMedications[index],
        [field]: value
      };
      return {
        ...prev,
        medications: updatedMedications
      };
    });
  };

  const addMedication = () => {
    setRecord(prev => ({
      ...prev,
      medications: [...(prev.medications || []), { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (index) => {
    setRecord(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleAddLabResult = () => {
    if (!newLabResult.testName) {
      setError('Test name is required');
      return;
    }

    setRecord(prev => ({
      ...prev,
      labResults: [...prev.labResults, { ...newLabResult, status: 'PENDING' }]
    }));

    setNewLabResult({
      testName: '',
      result: '',
      unit: '',
      referenceRange: '',
      notes: '',
    });
  };

  const handleRemoveLabResult = (index) => {
    setRecord(prev => ({
      ...prev,
      labResults: prev.labResults.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const endpoint = isEditing 
        ? `${process.env.REACT_APP_API_URL}/medical-records/${id}`
        : `${process.env.REACT_APP_API_URL}/medical-records`;

      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save medical record');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(returnTo);
      }, 2000);
    } catch (err) {
      console.error('Error saving medical record:', err);
      setError(err.message || 'Failed to save medical record');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            {isEditing ? 'Edit Medical Record' : 'Add Medical Record'}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate(returnTo)}
          >
            Back to Dashboard
          </Button>
        </Box>
        <Typography variant="subtitle1" gutterBottom>
          Patient: {record.patientName}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Medical record {isEditing ? 'updated' : 'created'} successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                name="diagnosis"
                value={record.diagnosis || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Symptoms"
                name="symptoms"
                value={record.symptoms || ''}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Vital Signs
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Temperature (°C)"
                    name="temperature"
                    type="number"
                    value={record.vitalSigns?.temperature || ''}
                    onChange={handleVitalSignsChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Heart Rate (bpm)"
                    name="heartRate"
                    type="number"
                    value={record.vitalSigns?.heartRate || ''}
                    onChange={handleVitalSignsChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Blood Pressure (Systolic)"
                    name="bloodPressureSystolic"
                    type="number"
                    value={record.vitalSigns?.bloodPressureSystolic || ''}
                    onChange={handleVitalSignsChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Blood Pressure (Diastolic)"
                    name="bloodPressureDiastolic"
                    type="number"
                    value={record.vitalSigns?.bloodPressureDiastolic || ''}
                    onChange={handleVitalSignsChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Respiratory Rate"
                    name="respiratoryRate"
                    type="number"
                    value={record.vitalSigns?.respiratoryRate || ''}
                    onChange={handleVitalSignsChange}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Medications
              </Typography>
              {(record.medications || [{ name: '', dosage: '', frequency: '', duration: '' }]).map((medication, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Medication Name"
                        value={medication.name || ''}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Dosage"
                        value={medication.dosage || ''}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Frequency"
                        value={medication.frequency || ''}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Duration"
                        value={medication.duration || ''}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton 
                        onClick={() => removeMedication(index)}
                        disabled={(record.medications || []).length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={addMedication}
                sx={{ mt: 1 }}
              >
                Add Medication
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Lab Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Test Name"
                    value={newLabResult.testName}
                    onChange={(e) => setNewLabResult(prev => ({ ...prev, testName: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Result"
                    value={newLabResult.result}
                    onChange={(e) => setNewLabResult(prev => ({ ...prev, result: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Unit"
                    value={newLabResult.unit}
                    onChange={(e) => setNewLabResult(prev => ({ ...prev, unit: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Reference Range"
                    value={newLabResult.referenceRange}
                    onChange={(e) => setNewLabResult(prev => ({ ...prev, referenceRange: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleAddLabResult}
                    sx={{ height: '100%' }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>

              <List>
                {(record.labResults || []).map((lab, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleRemoveLabResult(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={lab.testName}
                      secondary={`${lab.result} ${lab.unit} (Reference: ${lab.referenceRange})`}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={record.notes || ''}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(returnTo)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  color="primary"
                >
                  {isEditing ? 'Update Record' : 'Create Record'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddMedicalRecord; 