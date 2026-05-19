/**
 * UC19 - Units Data Module
 * All measurement units and conversion logic in pure JS.
 * Concepts: Objects, Classes, ES9 Features.
 */
'use strict';

const UNITS = {
    LENGTH: {
        units: [
            { id: 'mm',  name: 'Millimetre', factor: 1/25.4 },
            { id: 'cm',  name: 'Centimetre', factor: 1/2.54  },
            { id: 'in',  name: 'Inch',       factor: 1.0     },
            { id: 'ft',  name: 'Foot',       factor: 12.0    },
            { id: 'yd',  name: 'Yard',       factor: 36.0    },
            { id: 'm',   name: 'Metre',      factor: 39.3701 },
            { id: 'km',  name: 'Kilometre',  factor: 39370.1 },
        ],
        convert: (value, from, to) => {
            const fromUnit = UNITS.LENGTH.units.find(u => u.id === from);
            const toUnit   = UNITS.LENGTH.units.find(u => u.id === to);
            if (!fromUnit || !toUnit) throw new Error('Unknown unit');
            return (value * fromUnit.factor) / toUnit.factor;
        }
    },
    WEIGHT: {
        units: [
            { id: 'mg',  name: 'Milligram',  factor: 0.001   },
            { id: 'g',   name: 'Gram',       factor: 1.0     },
            { id: 'kg',  name: 'Kilogram',   factor: 1000.0  },
            { id: 't',   name: 'Tonne',      factor: 1e6     },
            { id: 'lb',  name: 'Pound',      factor: 453.592 },
            { id: 'oz',  name: 'Ounce',      factor: 28.3495 },
        ],
        convert: (value, from, to) => {
            const fromU = UNITS.WEIGHT.units.find(u => u.id === from);
            const toU   = UNITS.WEIGHT.units.find(u => u.id === to);
            return (value * fromU.factor) / toU.factor;
        }
    },
    VOLUME: {
        units: [
            { id: 'ml',  name: 'Millilitre', factor: 1.0      },
            { id: 'l',   name: 'Litre',      factor: 1000.0   },
            { id: 'gal', name: 'Gallon',     factor: 3785.41  },
            { id: 'cup', name: 'Cup',        factor: 236.588  },
            { id: 'tsp', name: 'Teaspoon',   factor: 4.92892  },
        ],
        convert: (value, from, to) => {
            const fromU = UNITS.VOLUME.units.find(u => u.id === from);
            const toU   = UNITS.VOLUME.units.find(u => u.id === to);
            return (value * fromU.factor) / toU.factor;
        }
    },
    TEMPERATURE: {
        units: [
            { id: 'C', name: 'Celsius'    },
            { id: 'F', name: 'Fahrenheit' },
            { id: 'K', name: 'Kelvin'     },
        ],
        convert: (value, from, to) => {
            // Non-linear: pivot through Celsius
            let celsius;
            switch (from) {
                case 'C': celsius = value; break;
                case 'F': celsius = (value - 32) * 5/9; break;
                case 'K': celsius = value - 273.15; break;
                default: throw new Error('Unknown temp unit');
            }
            switch (to) {
                case 'C': return celsius;
                case 'F': return celsius * 9/5 + 32;
                case 'K': return celsius + 273.15;
                default: throw new Error('Unknown temp unit');
            }
        }
    }
};
