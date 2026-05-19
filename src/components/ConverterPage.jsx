import React from 'react';
import { Card, CardContent, Typography, FormControl, InputLabel, Select,
         MenuItem, TextField, Button, Box, Alert, Chip } from '@mui/material';
import { useConverter } from '../hooks/useConverter';

const CATEGORIES = ['LENGTH','WEIGHT','VOLUME','TEMPERATURE'];

/**
 * UC20 - Converter Page Component
 * Concepts: JSX, State, Props, Controlled Inputs, Event Handling,
 *           Conditional Rendering, Material UI.
 */
export default function ConverterPage() {
  const { category, setCategory, value, setValue, fromUnit, setFromUnit,
          toUnit, setToUnit, result, error, convert, units } = useConverter();

  const handleCategoryChange = (e) => {
    setCategory(e.target.value); setFromUnit(''); setToUnit('');
  };

  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          Unit Converter
        </Typography>

        {/* Category */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select value={category} label="Category" onChange={handleCategoryChange}>
            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>

        {/* Value */}
        <TextField
          fullWidth label="Value" type="number" value={value} sx={{ mb: 2 }}
          onChange={e => setValue(e.target.value)}
          inputProps={{ step: 'any' }}
        />

        {/* Units row */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>From</InputLabel>
            <Select value={fromUnit} label="From" onChange={e => setFromUnit(e.target.value)}>
              {units.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Typography variant="h5" color="text.secondary">→</Typography>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>To</InputLabel>
            <Select value={toUnit} label="To" onChange={e => setToUnit(e.target.value)}>
              {units.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Button variant="contained" size="large" fullWidth onClick={convert}>
          Convert
        </Button>

        {/* Conditional Rendering */}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {result !== null && (
          <Box sx={{ mt: 3, p: 3, bgcolor: '#eff6ff', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} color="primary">
              {result}
            </Typography>
            <Chip label={toUnit} color="primary" sx={{ mt: 1 }} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
