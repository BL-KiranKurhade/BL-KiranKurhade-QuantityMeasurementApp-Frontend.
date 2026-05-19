/**
 * UC20 - Custom Hook: useConverter
 * Concepts: Reusable UI logic/hooks, State & controlled inputs.
 */
import { useState, useCallback } from 'react';

const UNITS_DATA = {
  LENGTH:      [{id:'mm',name:'Millimetre',f:1/25.4},{id:'cm',name:'Centimetre',f:1/2.54},
                {id:'in',name:'Inch',f:1},{id:'ft',name:'Foot',f:12},{id:'yd',name:'Yard',f:36},{id:'m',name:'Metre',f:39.3701}],
  WEIGHT:      [{id:'g',name:'Gram',f:1},{id:'kg',name:'Kilogram',f:1000},{id:'lb',name:'Pound',f:453.59},{id:'oz',name:'Ounce',f:28.35}],
  VOLUME:      [{id:'ml',name:'Millilitre',f:1},{id:'l',name:'Litre',f:1000},{id:'gal',name:'Gallon',f:3785.41}],
  TEMPERATURE: [{id:'C',name:'Celsius'},{id:'F',name:'Fahrenheit'},{id:'K',name:'Kelvin'}],
};

function convertTemp(v, from, to) {
  let c;
  if (from==='C') c=v; else if (from==='F') c=(v-32)*5/9; else c=v-273.15;
  if (to==='C') return c; if (to==='F') return c*9/5+32; return c+273.15;
}

export function useConverter() {
  const [category, setCategory] = useState('');
  const [value, setValue]       = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit]     = useState('');
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

  const units = category ? (UNITS_DATA[category] || []) : [];

  const convert = useCallback(() => {
    setError(''); setResult(null);
    if (!value || isNaN(+value)) { setError('Enter a valid number'); return; }
    if (!category) { setError('Select a category'); return; }
    if (!fromUnit || !toUnit) { setError('Select both units'); return; }

    try {
      let res;
      if (category === 'TEMPERATURE') {
        res = convertTemp(+value, fromUnit, toUnit);
      } else {
        const u = UNITS_DATA[category];
        const from = u.find(x => x.id === fromUnit);
        const to   = u.find(x => x.id === toUnit);
        res = (+value * from.f) / to.f;
      }
      setResult(+(res.toFixed(8)));
    } catch(e) { setError(e.message); }
  }, [value, category, fromUnit, toUnit]);

  return { category, setCategory, value, setValue, fromUnit, setFromUnit,
           toUnit, setToUnit, result, error, convert, units };
}
