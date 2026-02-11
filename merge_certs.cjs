const fs = require('fs');
const path = require('path');

const directory = './public/words';
const outputFile = 'certificate_AWS.json';

const files = [
    { name: 'certificate_AWS_CLF-C02.json', level: 1 },
    { name: 'certificate_AWS_SAA-C03.json', level: 2 },
    { name: 'certificate_AWS_DVA-C02.json', level: 3 },
    { name: 'certificate_AWS_SOA-C02.json', level: 4 }
];

let mergedData = [];

files.forEach(file => {
    const filePath = path.join(directory, file.name);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        try {
            const data = JSON.parse(content);
            const dataWithUpdatedLevel = data.map(item => ({
                ...item,
                level: file.level
            }));
            mergedData = mergedData.concat(dataWithUpdatedLevel);
            console.log(`Processed ${file.name}: ${data.length} items, set to level ${file.level}`);
        } catch (e) {
            console.error(`Error parsing ${file.name}:`, e);
        }
    } else {
        console.warn(`File not found: ${file.name}`);
    }
});

fs.writeFileSync(path.join(directory, outputFile), JSON.stringify(mergedData, null, 4), 'utf8');
console.log(`Successfully merged ${mergedData.length} items into ${outputFile}`);
