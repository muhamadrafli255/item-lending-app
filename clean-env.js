
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.');
files.forEach(file => {
    if (file.includes('.env') && file !== '.env') {
        console.log(`Deleting ghost file: "${file}"`);
        fs.unlinkSync(file);
    }
});
