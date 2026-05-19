/**
 * UC19 - Converter Class
 * Concepts: Classes, Exception Handling, Method Design.
 */
'use strict';

class Converter {
    convert(value, category, fromUnit, toUnit) {
        if (!value || isNaN(value))       throw new Error('Please enter a valid numeric value');
        if (!category)                    throw new Error('Please select a category');
        if (!fromUnit || !toUnit)         throw new Error('Please select both units');

        const cat = UNITS[category];
        if (!cat) throw new Error(`Unknown category: ${category}`);

        const result = cat.convert(parseFloat(value), fromUnit, toUnit);
        return {
            input:    parseFloat(value),
            fromUnit, toUnit, category,
            result:   Math.round(result * 1e8) / 1e8,   // precision
            formatted: result.toFixed(6).replace(/\.?0+$/, '')
        };
    }
}

const converter = new Converter();
