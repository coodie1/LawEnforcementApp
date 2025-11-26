import { useState, useEffect, useCallback } from 'react';
import API from '../api';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Button, Stack, IconButton, Box, Card, CardContent, CardActionArea, TextField, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import SearchIcon from '@mui/icons-material/Search';
import GenericFormDialog from './GenericFormDialog';

function GenericCollectionTable({ collectionName }) {
  // Modes: 'selection' (initial), 'read' (view only), 'write' (manage/search/delete)
  const [viewMode, setViewMode] = useState('selection');
  const [data, setData] = useState([]);
  // --- NEW STATE FOR SEARCH ---
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [headers, setHeaders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(null);

  // Reset state when switching collections
  useEffect(() => {
    setViewMode('selection');
    setData([]);
    setSearchTerm(''); // Clear search on collection change
  }, [collectionName]);

  const fetchData = useCallback(() => {
    if (viewMode === 'selection') return;
    setIsLoading(true);
    API.get(`/dynamic/${collectionName.toLowerCase()}`)
      .then(response => {
        const fetchedData = response.data;
        setData(fetchedData);
        if (fetchedData.length > 0) {
          // Auto-detect headers, excluding complex objects and mongo version key
          const firstItem = fetchedData[0];
          const detectedHeaders = Object.keys(firstItem).filter(key => 
              (typeof firstItem[key] !== 'object' || firstItem[key] === null) && key !== '__v' && key !== '_id'
          );
          // Always put ID first if it exists, then the rest
          setHeaders(['_id', ...detectedHeaders]);
        }
        setIsLoading(false);
      })
      .catch(err => { console.error(err); setIsLoading(false); });
  }, [collectionName, viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateOpen = () => { setDialogData({}); setDialogOpen(true); };
  const handleEditOpen = (rowData) => { setDialogData(rowData); setDialogOpen(true); };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item permanently?')) {
      try { await API.delete(`/dynamic/${collectionName}/${id}`); fetchData(); } catch (error) { alert("Could not delete item."); }
    }
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // --- SEARCH LOGIC ---
  // Filter data based on search term. Checks ALL string/number fields in a row.
  const filteredData = data.filter((row) => {
      if (!searchTerm) return true; // Show all if no search
      const lowerTerm = searchTerm.toLowerCase();
      // Check if ANY value in the row contains the search term
      return Object.values(row).some(value => 
          value !== null && 
          value !== undefined && 
          value.toString().toLowerCase().includes(lowerTerm)
      );
  });


  // --- RENDER 1: SELECTION SCREEN (Requirement 1) ---
  if (viewMode === 'selection') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom> {capitalize(collectionName)} Module </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}> Please select mode: </Typography>
        <Stack direction="row" spacing={4} justifyContent="center">
          <Card sx={{ minWidth: 200, textAlign: 'center', border: '1px solid #ddd' }}>
            <CardActionArea onClick={() => setViewMode('read')} sx={{ p: 3 }}>
              <VisibilityIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6">View Only</Typography>
            </CardActionArea>
          </Card>
          <Card sx={{ minWidth: 200, textAlign: 'center', border: '1px solid #ddd', backgroundColor: '#f9fbe7' }}>
             <CardActionArea onClick={() => setViewMode('write')} sx={{ p: 3 }}>
              <BuildIcon color="secondary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6">Manage Records</Typography>
              <Typography variant="body2">(Create, Search, Update, Delete)</Typography>
            </CardActionArea>
          </Card>
        </Stack>
      </Box>
    );
  }

  // --- RENDER 2: DATA TABLE SCREEN ---
  if (isLoading && data.length === 0) return <CircularProgress style={{ margin: '20px' }} />;

  return (
    <Paper sx={{ width: '95%', margin: '20px auto', p: 2 }}>
      {/* HEADER STACK */}
      <Stack spacing={2} mb={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h6">
                    {capitalize(collectionName)} ({viewMode === 'read' ? 'View Only' : 'Managing'})
                  </Typography>
                  <Button size="small" onClick={() => setViewMode('selection')}>Switch Mode</Button>
              </Stack>
              {/* Create Button only in 'write' mode (Requirement 2 strategy) */}
              {viewMode === 'write' && (
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateOpen}>Create New</Button>
              )}
          </Stack>

          {/* SEARCH BAR - Only in 'write' mode (Requirement 3) */}
          {viewMode === 'write' && (
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by any field to find records to edit or delete..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
              }}
              size="small"
              sx={{ backgroundColor: '#f9f9f9' }}
            />
          )}
      </Stack>

      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header} style={{ fontWeight: 'bold', backgroundColor: '#eee' }}>
                  {header === '_id' ? 'ID' : header.toUpperCase()}
                </TableCell>
              ))}
              {viewMode === 'write' && <TableCell style={{ fontWeight: 'bold', backgroundColor: '#eee' }}>ACTIONS</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* USE FILTERED DATA HERE */}
            {filteredData.map((row, index) => (
              <TableRow hover key={row._id || index}>
                {headers.map((header) => (
                  <TableCell key={header} sx={{maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {typeof row[header] === 'object' && row[header] !== null ? JSON.stringify(row[header]) : row[header]}
                  </TableCell>
                ))}
                {/* Actions only in 'write' mode */}
                {viewMode === 'write' && (
                    <TableCell>
                        <IconButton color="primary" size="small" onClick={() => handleEditOpen(row)}><EditIcon /></IconButton>
                        <IconButton color="error" size="small" onClick={() => handleDelete(row._id)}><DeleteIcon /></IconButton>
                    </TableCell>
                )}
              </TableRow>
            ))}
            {filteredData.length === 0 && !isLoading && (
                <TableRow><TableCell colSpan={headers.length + 1} align="center">No records found matching your search.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <GenericFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        collectionName={collectionName}
        initialData={dialogData}
        onSuccess={fetchData}
      />
    </Paper>
  );
}

export default GenericCollectionTable;