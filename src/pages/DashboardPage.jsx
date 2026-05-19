import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Select, MenuItem, Button, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress,
} from '@mui/material';
import RefreshIcon    from '@mui/icons-material/Refresh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import HistoryIcon    from '@mui/icons-material/History';
import { conversionApi } from '../services/api';

// ── Constants ──────────────────────────────────────────────────────────────────
const BLUE = '#4361EE';
const TEAL = '#4ECDC4';

const CATEGORIES = [
  { id: 'LENGTH',      label: 'Length',      icon: '✏️' },
  { id: 'WEIGHT',      label: 'Weight',      icon: '⚖️'  },
  { id: 'TEMPERATURE', label: 'Temperature', icon: '🌡️' },
  { id: 'VOLUME',      label: 'Volume',      icon: '🧊'  },
];

const UNIT_CONFIG = {
  LENGTH: [
    { value: 'mm',  label: 'Millimeter'  },
    { value: 'cm',  label: 'Centimeter'  },
    { value: 'in',  label: 'Inch'        },
    { value: 'ft',  label: 'Feet'        },
    { value: 'yd',  label: 'Yard'        },
    { value: 'm',   label: 'Meters'      },
    { value: 'km',  label: 'Kilometer'   },
    { value: 'mi',  label: 'Miles'       },
  ],
  WEIGHT: [
    { value: 'mg',  label: 'Milligram'   },
    { value: 'g',   label: 'Gram'        },
    { value: 'oz',  label: 'Ounce'       },
    { value: 'lb',  label: 'Pound'       },
    { value: 'kg',  label: 'Kilogram'    },
    { value: 't',   label: 'Metric Ton'  },
  ],
  VOLUME: [
    { value: 'ml',    label: 'Milliliter'   },
    { value: 'l',     label: 'Liter'        },
    { value: 'cup',   label: 'Cup'          },
    { value: 'gal',   label: 'Gallon'       },
    { value: 'fl_oz', label: 'Fluid Ounce'  },
    { value: 'tsp',   label: 'Teaspoon'     },
    { value: 'tbsp',  label: 'Tablespoon'   },
  ],
  TEMPERATURE: [
    { value: 'C', label: 'Celsius'    },
    { value: 'F', label: 'Fahrenheit' },
    { value: 'K', label: 'Kelvin'     },
  ],
};

const BASE_FACTORS = {
  LENGTH: { mm: 0.001, cm: 0.01, in: 0.0254, ft: 0.3048, yd: 0.9144, m: 1, km: 1000, mi: 1609.344 },
  WEIGHT: { mg: 0.001, g: 1, oz: 28.3495, lb: 453.592, kg: 1000, t: 1e6 },
  VOLUME: { ml: 1, l: 1000, cup: 236.588, gal: 3785.41, fl_oz: 29.5735, tsp: 4.92892, tbsp: 14.7868 },
};

function toBase(val, unit, category) {
  if (category === 'TEMPERATURE') {
    if (unit === 'C') return val;
    if (unit === 'F') return (val - 32) * 5 / 9;
    if (unit === 'K') return val - 273.15;
  }
  return val * (BASE_FACTORS[category]?.[unit] ?? 1);
}

function fromBase(val, unit, category) {
  if (category === 'TEMPERATURE') {
    if (unit === 'C') return val;
    if (unit === 'F') return val * 9 / 5 + 32;
    if (unit === 'K') return val + 273.15;
  }
  return val / (BASE_FACTORS[category]?.[unit] ?? 1);
}

const ACTIONS = ['Comparison', 'Conversion', 'Arithmetic'];

const OPS = [
  { id: '+', label: '+' },
  { id: '-', label: '−' },
  { id: '*', label: '×' },
  { id: '/', label: '÷' },
];

// ── Shared style objects ────────────────────────────────────────────────────────
const labelSx = {
  color: '#999999',
  fontWeight: 700,
  letterSpacing: '0.08em',
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  display: 'block',
  mb: 0.5,
};

const panelSx = {
  border: '1px solid #E0E0E0',
  borderRadius: '8px',
  background: '#ffffff',
  p: 2,
};

const inputStyle = {
  width: '100%',
  border: 'none',
  outline: 'none',
  fontSize: '1.9rem',
  fontWeight: 700,
  color: '#1a1a2e',
  background: 'transparent',
  fontFamily: 'inherit',
  display: 'block',
  marginTop: '4px',
  marginBottom: '4px',
  MozAppearance: 'textfield',
};

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  // ── Shared state ─────────────────────────────────────────────────────────────
  const [category, setCategory] = useState('LENGTH');
  const [action,   setAction]   = useState('Comparison');

  // ── Comparison / Conversion tab ───────────────────────────────────────────────
  const [fromVal,  setFromVal]  = useState('1');
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit,   setToUnit]   = useState('m');
  const [toResult, setToResult] = useState(null);

  // ── Arithmetic tab ────────────────────────────────────────────────────────────
  const [aVal1,    setAVal1]    = useState('1');
  const [aUnit1,   setAUnit1]   = useState('km');
  const [aOp,      setAOp]      = useState('+');
  const [aVal2,    setAVal2]    = useState('1');
  const [aUnit2,   setAUnit2]   = useState('m');
  const [aResUnit, setAResUnit] = useState('km');
  const [aResult,  setAResult]  = useState(null);
  const [aError,   setAError]   = useState('');

  // ── History ───────────────────────────────────────────────────────────────────
  const [history,  setHistory]  = useState([]);
  const [loadingH, setLoadingH] = useState(false);
  const [clearing, setClearing] = useState(false);

  // ── Fetch history ─────────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setLoadingH(true);
    try {
      const { data } = await conversionApi.getHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch { /* silent if backend down */ }
    finally { setLoadingH(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Reset units whenever category changes ─────────────────────────────────────
  useEffect(() => {
    const units = UNIT_CONFIG[category] || [];
    const u0 = units[0]?.value ?? '';
    const u1 = units[1]?.value ?? u0;
    setFromUnit(u0);  setToUnit(u1);
    setAUnit1(u0);    setAUnit2(u1);  setAResUnit(u0);
    setFromVal('1');  setAVal1('1');  setAVal2('1');
    setToResult(null); setAResult(null); setAError('');
  }, [category]);

  // ── Auto-calculate for Comparison tab (instant local + debounced backend save) ─
  useEffect(() => {
    if (action !== 'Comparison') return;
    if (!fromVal || isNaN(+fromVal)) { setToResult(null); return; }

    // Instant local result
    const base = toBase(+fromVal, fromUnit, category);
    const r    = fromBase(base, toUnit, category);
    setToResult(parseFloat(r.toFixed(6)));

    // Debounced backend save (1.2 s idle)
    const t = setTimeout(() => {
      conversionApi.convert(fromVal, fromUnit, toUnit, category)
        .then(() => fetchHistory())
        .catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [fromVal, fromUnit, toUnit, category, action, fetchHistory]);

  // ── Clear history ─────────────────────────────────────────────────────────────
  const handleClearHistory = async () => {
    setClearing(true);
    try {
      await conversionApi.clearHistory();
      setHistory([]);
    } catch { /* silent */ }
    finally { setClearing(false); }
  };

  // ── Arithmetic calculate ──────────────────────────────────────────────────────
  const handleCalculate = () => {
    setAError(''); setAResult(null);
    const v1 = parseFloat(aVal1), v2 = parseFloat(aVal2);
    if (isNaN(v1) || isNaN(v2)) { setAError('Enter valid numbers in both fields'); return; }
    if (aOp === '/' && v2 === 0) { setAError('Cannot divide by zero'); return; }

    let res;
    if (aOp === '*' || aOp === '/') {
      res = aOp === '*' ? v1 * v2 : v1 / v2;
    } else {
      const base1   = toBase(v1, aUnit1, category);
      const base2   = toBase(v2, aUnit2, category);
      const baseRes = aOp === '+' ? base1 + base2 : base1 - base2;
      res = fromBase(baseRes, aResUnit, category);
    }
    setAResult(parseFloat(res.toFixed(6)));
  };

  // ── Derived data ──────────────────────────────────────────────────────────────
  const units = UNIT_CONFIG[category] || [];

  // All-units rows for Conversion tab
  const convRows = (() => {
    if (!fromVal || isNaN(+fromVal)) return [];
    const base = toBase(+fromVal, fromUnit, category);
    return units.map(u => ({
      ...u,
      val: parseFloat(fromBase(base, u.value, category).toFixed(6)),
    }));
  })();

  // ── Reusable unit <Select> ────────────────────────────────────────────────────
  const UnitSelect = ({ value, onChange, sx }) => (
    <Select
      value={value}
      onChange={onChange}
      size="small"
      variant="standard"
      disableUnderline
      sx={{ fontSize: '0.9rem', color: '#555', minWidth: 90, ...sx }}
    >
      {units.map(u => (
        <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
      ))}
    </Select>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', background: '#EEF0F8', py: 4 }}>
      <Box sx={{ maxWidth: 820, mx: 'auto', px: 2 }}>

        {/* ── Main card ─────────────────────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #E0E0E0',
            background: '#ffffff',
            overflow: 'hidden',
            mb: 3,
          }}
        >
          <Box sx={{ p: 3 }}>

            {/* CHOOSE TYPE */}
            <Typography sx={labelSx}>Choose Type</Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1, mb: 3, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <Box
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  sx={{
                    flex: '1 1 100px',
                    textAlign: 'center',
                    py: 1.8, px: 1,
                    cursor: 'pointer',
                    borderRadius: 2,
                    background: '#ffffff',
                    border: category === cat.id
                      ? `2px solid ${TEAL}`
                      : '1px solid #E0E0E0',
                    transition: 'all 0.15s',
                    '&:hover': { border: `2px solid ${TEAL}`, background: '#F9FFFE' },
                  }}
                >
                  <Typography sx={{ fontSize: '1.7rem', lineHeight: 1.3, mb: 0.5 }}>
                    {cat.icon}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ color: category === cat.id ? '#333' : '#777' }}
                  >
                    {cat.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* CHOOSE ACTION */}
            <Typography sx={labelSx}>Choose Action</Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1, mb: 3 }}>
              {ACTIONS.map(a => (
                <Box
                  key={a}
                  onClick={() => { setAction(a); setAResult(null); setAError(''); }}
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    py: 1, px: 2,
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    border: action === a ? 'none' : '1px solid #E0E0E0',
                    background: action === a ? BLUE : '#ffffff',
                    color: action === a ? '#ffffff' : '#555555',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.15s',
                    userSelect: 'none',
                    '&:hover': {
                      background: action === a ? '#3451DE' : '#F0F3FF',
                      borderColor: BLUE,
                    },
                  }}
                >
                  {a}
                </Box>
              ))}
            </Box>

            {/* ── COMPARISON TAB ──────────────────────────────────────────── */}
            {action === 'Comparison' && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>

                {/* FROM */}
                <Box sx={{ flex: '1 1 200px', ...panelSx }}>
                  <Typography sx={labelSx}>From</Typography>
                  <input
                    type="number"
                    value={fromVal}
                    onChange={e => setFromVal(e.target.value)}
                    style={inputStyle}
                  />
                  <Box sx={{ borderTop: '1px solid #F0F0F0', pt: 1, mt: 0.5 }}>
                    <UnitSelect
                      value={fromUnit}
                      onChange={e => setFromUnit(e.target.value)}
                    />
                  </Box>
                </Box>

                {/* TO */}
                <Box sx={{ flex: '1 1 200px', ...panelSx }}>
                  <Typography sx={labelSx}>To</Typography>
                  <Typography
                    sx={{
                      fontSize: '1.9rem',
                      fontWeight: 700,
                      color: '#1a1a2e',
                      mt: '4px',
                      mb: '4px',
                      minHeight: '2.8rem',
                      lineHeight: '2.8rem',
                    }}
                  >
                    {toResult !== null ? toResult : '—'}
                  </Typography>
                  <Box sx={{ borderTop: '1px solid #F0F0F0', pt: 1, mt: 0.5 }}>
                    <UnitSelect
                      value={toUnit}
                      onChange={e => setToUnit(e.target.value)}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {/* ── CONVERSION TAB (show all units) ─────────────────────────── */}
            {action === 'Conversion' && (
              <>
                <Box sx={{ ...panelSx, display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={labelSx}>Value</Typography>
                    <input
                      type="number"
                      value={fromVal}
                      onChange={e => setFromVal(e.target.value)}
                      style={inputStyle}
                    />
                  </Box>
                  <Box sx={{ borderLeft: '1px solid #F0F0F0', pl: 2 }}>
                    <UnitSelect
                      value={fromUnit}
                      onChange={e => setFromUnit(e.target.value)}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  {convRows.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      Enter a value above to see all conversions
                    </Typography>
                  ) : convRows.map(row => (
                    <Box
                      key={row.value}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2, py: 1.2,
                        borderRadius: 1.5,
                        background: row.value === fromUnit ? '#EEF0FF' : '#FAFAFA',
                        border: `1px solid ${row.value === fromUnit ? BLUE + '33' : '#F0F0F0'}`,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {row.label}
                      </Typography>
                      <Typography
                        fontWeight={700}
                        sx={{ color: row.value === fromUnit ? BLUE : '#1a1a2e' }}
                      >
                        {row.val}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {/* ── ARITHMETIC TAB ──────────────────────────────────────────── */}
            {action === 'Arithmetic' && (
              <>
                {/* Operator selector */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2.5, alignItems: 'center' }}>
                  {OPS.map(op => (
                    <Box
                      key={op.id}
                      onClick={() => { setAOp(op.id); setAResult(null); setAError(''); }}
                      sx={{
                        width: 44, height: 44, cursor: 'pointer', borderRadius: 1.5,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem', fontWeight: 700, userSelect: 'none',
                        border: aOp === op.id ? 'none' : '1px solid #E0E0E0',
                        background: aOp === op.id ? BLUE : '#ffffff',
                        color: aOp === op.id ? '#ffffff' : '#555555',
                        transition: 'all 0.15s',
                        '&:hover': { background: aOp === op.id ? '#3451DE' : '#F0F3FF' },
                      }}
                    >
                      {op.label}
                    </Box>
                  ))}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 'auto', fontSize: '0.75rem' }}
                  >
                    {(aOp === '+' || aOp === '-')
                      ? 'Unit-aware: converts to common base'
                      : 'Raw number operation (scalar)'}
                  </Typography>
                </Box>

                {/* VALUE 1 | operator badge | VALUE 2 */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>

                  {/* Value 1 */}
                  <Box sx={{ flex: '1 1 160px' }}>
                    <Typography sx={labelSx}>Value 1</Typography>
                    <Box sx={panelSx}>
                      <input
                        type="number"
                        value={aVal1}
                        onChange={e => { setAVal1(e.target.value); setAResult(null); }}
                        onKeyDown={e => e.key === 'Enter' && handleCalculate()}
                        style={inputStyle}
                      />
                      <Box sx={{ borderTop: '1px solid #F0F0F0', pt: 0.5 }}>
                        <UnitSelect
                          value={aUnit1}
                          onChange={e => { setAUnit1(e.target.value); setAResult(null); }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Operator badge */}
                  <Box
                    sx={{
                      width: 40, height: 40, flexShrink: 0, mb: '10px',
                      borderRadius: '50%',
                      background: BLUE,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.3rem', fontWeight: 800, color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(67,97,238,0.4)',
                    }}
                  >
                    {OPS.find(o => o.id === aOp)?.label}
                  </Box>

                  {/* Value 2 */}
                  <Box sx={{ flex: '1 1 160px' }}>
                    <Typography sx={labelSx}>Value 2</Typography>
                    <Box sx={panelSx}>
                      <input
                        type="number"
                        value={aVal2}
                        onChange={e => { setAVal2(e.target.value); setAResult(null); }}
                        onKeyDown={e => e.key === 'Enter' && handleCalculate()}
                        style={inputStyle}
                      />
                      <Box sx={{ borderTop: '1px solid #F0F0F0', pt: 0.5 }}>
                        {(aOp === '+' || aOp === '-') ? (
                          <UnitSelect
                            value={aUnit2}
                            onChange={e => { setAUnit2(e.target.value); setAResult(null); }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            (scalar — no unit)
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {aError && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{aError}</Alert>
                )}

                {/* RESULT */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    borderLeft: `3px solid ${BLUE}`,
                    pl: 2.5, py: 1.5, pr: 2,
                    background: '#F5F7FF',
                    borderRadius: '0 8px 8px 0',
                    flexWrap: 'wrap',
                  }}
                >
                  <Box>
                    <Typography sx={labelSx}>Result</Typography>
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: BLUE,
                        lineHeight: 1.2,
                      }}
                    >
                      {aResult !== null ? aResult : '—'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {(aOp === '+' || aOp === '-') && (
                      <Select
                        value={aResUnit}
                        onChange={e => { setAResUnit(e.target.value); setAResult(null); }}
                        size="small"
                        sx={{
                          minWidth: 130,
                          background: '#fff',
                          fontSize: '0.9rem',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E0E0E0' },
                        }}
                      >
                        {units.map(u => (
                          <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                        ))}
                      </Select>
                    )}
                    <Button
                      variant="contained"
                      onClick={handleCalculate}
                      sx={{
                        background: BLUE,
                        boxShadow: 'none',
                        '&:hover': { background: '#3451DE', boxShadow: 'none' },
                        fontWeight: 600,
                        px: 3,
                      }}
                    >
                      Calculate
                    </Button>
                  </Box>
                </Box>
              </>
            )}

          </Box>
        </Paper>

        {/* ── History card ──────────────────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #E0E0E0',
            background: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 3 }}>

            {/* Header row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon sx={{ color: BLUE, fontSize: 20 }} />
                <Typography fontWeight={700} color="text.primary">
                  Conversion History
                </Typography>
                {history.length > 0 && (
                  <Box sx={{
                    px: 1.2, py: 0.1,
                    borderRadius: 10,
                    background: '#EEF0FF',
                    color: BLUE,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}>
                    {history.length}
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={fetchHistory}
                  disabled={loadingH || clearing}
                  sx={{
                    color: '#777',
                    '&:hover': { color: BLUE, background: '#EEF0FF' },
                  }}
                >
                  Refresh
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleClearHistory}
                  disabled={clearing || loadingH || history.length === 0}
                  sx={{
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 1.5,
                    px: 1.5,
                    '&:hover': { background: 'rgba(239,68,68,0.06)', border: '1px solid #ef4444' },
                    '&.Mui-disabled': { opacity: 0.3 },
                  }}
                >
                  {clearing ? 'Clearing…' : 'Clear History'}
                </Button>
              </Box>
            </Box>

            {/* Table */}
            {loadingH ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CircularProgress sx={{ color: BLUE }} />
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {['Input', 'From', 'To', 'Result', 'Category', 'Time'].map(col => (
                        <TableCell
                          key={col}
                          sx={{
                            background: '#F5F7FF',
                            color: '#777',
                            borderBottom: '1px solid #E0E0E0',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          align="center"
                          sx={{ py: 5, color: '#999', border: 'none', fontSize: '0.9rem' }}
                        >
                          No conversions yet — try the converter above!
                        </TableCell>
                      </TableRow>
                    ) : history.map(h => (
                      <TableRow
                        key={h.id}
                        sx={{ '&:hover': { background: '#F8F9FF' }, '& td': { borderColor: '#F0F0F0' } }}
                      >
                        <TableCell sx={{ color: '#1a1a2e', fontWeight: 600 }}>
                          {h.fromValue}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={h.fromUnit}
                            size="small"
                            sx={{
                              background: '#EEF0FF', color: BLUE,
                              border: `1px solid ${BLUE}33`, fontSize: '0.72rem', fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={h.toUnit}
                            size="small"
                            sx={{
                              background: '#E8FBF9', color: '#14B8A6',
                              border: '1px solid #14B8A633', fontSize: '0.72rem', fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: BLUE, fontWeight: 700 }}>
                          {parseFloat(h.result?.toFixed(6))}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={h.category}
                            size="small"
                            sx={{ background: '#F0F0F0', color: '#555', fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#999', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                          {h.createdAt ? new Date(h.createdAt).toLocaleString() : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

          </Box>
        </Paper>

      </Box>
    </Box>
  );
}
