const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

module.exports = function() {
    // Read the CSV file from the root directory
    const csvFilePath = path.join(__dirname, '..', 'books.csv');
    let fileContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Strip BOM (Byte Order Mark) if it exists. Airtable/Excel exports often add this,
    // which makes the first column key "﻿Title" instead of "Title".
    if (fileContent.charCodeAt(0) === 0xFEFF) {
        fileContent = fileContent.slice(1);
    }
    
    // Parse the CSV
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });
    
    return records;
};
