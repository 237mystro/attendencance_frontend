import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, IconButton, InputLabel, MenuItem, Select,
  Skeleton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography
} from '@mui/material';
import { Add, Delete, Download, Folder, Refresh } from '@mui/icons-material';
import { apiRequest } from '../../utils/api';

const CATEGORIES = [
  { value: 'contract', label: 'Contract' },
  { value: 'id', label: 'ID / Passport' },
  { value: 'timesheet', label: 'Timesheet' },
  { value: 'other', label: 'Other' }
];

const categoryColor = (c) => {
  if (c === 'contract') return 'primary';
  if (c === 'id') return 'secondary';
  if (c === 'timesheet') return 'warning';
  return 'default';
};

const fmtSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentVault = () => {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');

  const [empFilter, setEmpFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: '', title: '', description: '', category: 'other' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef();

  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams();
      if (empFilter) qs.set('employeeId', empFilter);
      if (catFilter) qs.set('category', catFilter);
      const data = await apiRequest(`/documents?${qs}`);
      if (data?.success) setDocuments(data.data || []);
      else setError(data?.message || 'Failed to load documents.');
    } catch {
      setError('Network error while loading documents.');
    } finally {
      setLoading(false);
    }
  }, [empFilter, catFilter]);

  useEffect(() => {
    apiRequest('/employees').then(d => {
      if (d?.success) setEmployees(d.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null);
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleUpload = async () => {
    setFormError('');
    if (!form.employeeId) { setFormError('Please select an employee.'); return; }
    if (!form.title.trim()) { setFormError('Please enter a document title.'); return; }
    if (!selectedFile) { setFormError('Please select a file to upload.'); return; }

    try {
      setUploading(true);
      const fileBase64 = await toBase64(selectedFile);
      const data = await apiRequest('/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          fileBase64,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size
        })
      });
      if (data?.success) {
        setSnack('Document uploaded successfully.');
        setUploadOpen(false);
        setForm({ employeeId: '', title: '', description: '', category: 'other' });
        setSelectedFile(null);
        load();
      } else {
        setFormError(data?.message || 'Upload failed.');
      }
    } catch (err) {
      setFormError(err.message || 'Upload error.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const data = await apiRequest(`/documents/${deleteDialog._id}`, { method: 'DELETE' });
      if (data?.success) {
        setSnack('Document deleted.');
        setDeleteDialog(null);
        load();
      } else {
        setSnack(data?.message || 'Failed to delete.');
      }
    } catch {
      setSnack('Network error.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {snack && <Alert severity="info" onClose={() => setSnack('')} sx={{ mb: 2 }}>{snack}</Alert>}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight={700}>Document Vault</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" startIcon={<Refresh />} onClick={load} disabled={loading} variant="outlined">Refresh</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setUploadOpen(true)}>Upload Document</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Employee</InputLabel>
          <Select value={empFilter} label="Filter by Employee" onChange={e => setEmpFilter(e.target.value)}>
            <MenuItem value="">All Employees</MenuItem>
            {employees.map(emp => (
              <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select value={catFilter} label="Filter by Category" onChange={e => setCatFilter(e.target.value)}>
            <MenuItem value="">All Categories</MenuItem>
            {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} height={52} sx={{ borderRadius: 1 }} />)}
            </Box>
          ) : documents.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Folder sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">No documents found. Upload one to get started.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 620 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell>By</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map(doc => (
                    <TableRow key={doc._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{doc.employeeId?.name || '—'}</TableCell>
                      <TableCell>
                        <Tooltip title={doc.description || doc.title}>
                          <span>{doc.title}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
                          color={categoryColor(doc.category)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{fmtSize(doc.fileSize)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {new Date(doc.createdAt).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell>{doc.uploadedBy?.name || '—'}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Download / View">
                            <IconButton size="small" component="a" href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Download fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteDialog(doc)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onClose={() => { setUploadOpen(false); setFormError(''); }} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <FormControl fullWidth required>
              <InputLabel>Employee</InputLabel>
              <Select value={form.employeeId} label="Employee" onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}>
                {employees.map(emp => (
                  <MenuItem key={emp._id} value={emp._id}>{emp.name} — {emp.position}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Document title"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description (optional)"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category" onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </Select>
            </FormControl>
            <Box>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Button variant="outlined" onClick={() => fileInputRef.current?.click()} fullWidth>
                {selectedFile ? selectedFile.name : 'Choose File (PDF, Word, Image)'}
              </Button>
              {selectedFile && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {fmtSize(selectedFile.size)}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setUploadOpen(false); setFormError(''); setSelectedFile(null); }} variant="outlined">Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <Add />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog?.title}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)} variant="outlined">Cancel</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <Delete />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentVault;
