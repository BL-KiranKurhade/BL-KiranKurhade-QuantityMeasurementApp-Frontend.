import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, List, ListItem, ListItemText,
  Button, Divider, Box, Chip,
} from '@mui/material';
import { measurementApi } from '../services/api';  // fixed: was MeasurementService (did not exist)

/**
 * UC20 — Measurement History component (uses measurementApi from services/api.js).
 * Demonstrates: States and Lifecycle, Axios, Rendering, Async.
 */
export default function HistoryPage() {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await measurementApi.getAll();
      setMeasurements(Array.isArray(data) ? data : data.content || []);
    } catch (e) {
      setError('Could not reach the API — showing demo data');
      setMeasurements([
        { id: 1, value: 1.0,  unit: 'ft',  category: 'LENGTH' },
        { id: 2, value: 500,  unit: 'g',   category: 'WEIGHT' },
        { id: 3, value: 2.5,  unit: 'l',   category: 'VOLUME' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await measurementApi.delete(id);
      setMeasurements(prev => prev.filter(m => m.id !== id));
    } catch {
      setMeasurements(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Measurement History</Typography>
          <Button variant="outlined" onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </Button>
        </Box>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        <List>
          {measurements.map((m, i) => (
            <React.Fragment key={m.id}>
              <ListItem
                secondaryAction={
                  <Button size="small" color="error" onClick={() => handleDelete(m.id)}>
                    Delete
                  </Button>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography fontWeight={600}>{m.value}</Typography>
                      <Chip label={m.unit} size="small" variant="outlined" />
                    </Box>
                  }
                  secondary={m.category}
                />
              </ListItem>
              {i < measurements.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {measurements.length === 0 && !loading && (
            <ListItem>
              <ListItemText primary="No measurements found." />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  );
}
