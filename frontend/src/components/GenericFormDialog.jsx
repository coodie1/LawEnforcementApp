import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, CircularProgress, Alert } from '@mui/material';
import API from '../api';

function GenericFormDialog({ open, onClose, collectionName, initialData, onSuccess }) {
  const [formData, setFormData] = useState({});
  const [schemaFields, setSchemaFields] = useState([]); // Stores field definitions (name, type)
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!initialData?._id;

  // 1. When dialog opens, load schema AND set initial data
  useEffect(() => {
    if (open && collectionName) {
      setIsLoadingSchema(true);
      setError('');
      // Fetch schema definition from backend
      API.get(`/dynamic/${collectionName.toLowerCase()}/schema`)
        .then(response => {
          setSchemaFields(response.data);
          setIsLoadingSchema(false);
        })
        .catch(err => {
          console.error("Schema fetch error:", err);
          setError("Could not load form definitions.");
          setIsLoadingSchema(false);
        });

      // Initialize form data (if editing, use existing data; otherwise empty)
      setFormData(initialData || {});
    }
  }, [open, collectionName, initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      // Clean up data: Ensure empty strings for dates/numbers are sent as null so Mongo doesn't error
      const cleanedData = { ...formData };
      schemaFields.forEach(field => {
          if (cleanedData[field.name] === '' && (field.type === 'Date' || field.type === 'Number')) {
              cleanedData[field.name] = null;
          }
      });

      if (isEditMode) {
        // UPDATE existing
        await API.put(`/dynamic/${collectionName}/${initialData._id}`, cleanedData);
      } else {
        // CREATE new
        await API.post(`/dynamic/${collectionName}`, cleanedData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving data:", error);
      alert(`Failed to save data: ${error.response?.data || error.message}`);
    }
  };

  // Helper to format date strings for HTML input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        // Ensure valid date before formatting
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    } catch (e) { return ''; }
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? `Edit ${collectionName.slice(0, -1)}` : `Create New ${collectionName.slice(0, -1)}`}</DialogTitle>
      <DialogContent dividers>
        {isLoadingSchema ? (
           <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ) : error ? (
           <Alert severity="error">{error}</Alert>
        ) : (
        <Box component="form" sx={{ mt: 1 }}>
          {/* Loop through schema fields and render smart inputs */}
          {schemaFields.map((field) => {
            const label = field.name.charAt(0).toUpperCase() + field.name.slice(1).replace(/([A-Z])/g, ' $1').trim(); // Make nice labels like "firstName" -> "First Name"
            let inputType = 'text';
            let inputValue = formData[field.name] || '';

            // Determine input type based on Mongoose schema type
            if (field.type === 'Date') {
                inputType = 'date';
                inputValue = formatDateForInput(inputValue);
            } else if (field.type === 'Number') {
                inputType = 'number';
            }

            return (
            <TextField
              key={field.name}
              margin="normal"
              label={label}
              name={field.name}
              type={inputType}
              value={inputValue}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              required={field.required}
              // For date inputs, shrink label so it doesn't overlap placeholder
              InputLabelProps={inputType === 'date' ? { shrink: true } : undefined}
            />
          )})}
        </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isLoadingSchema || !!error}>
          {isEditMode ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GenericFormDialog;