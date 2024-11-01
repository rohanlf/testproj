const df = require('durable-functions');
const fs = require('fs');
df.app.activity('SaveAsFile', {
    handler: async (input) => {
        try {
            // Convert data to JSON string
            const jsonData = JSON.stringify(input.results, null, 2); // Pretty print with 2 spaces indentation

            // Define the path where the file will be saved
            fs.writeFileSync(input.metaData.filePath, jsonData, 'utf8');
            console.log('File has been saved:', JSON.stringify(input.metaData.filePath));
        } catch (err) {
            console.error('Error writing file:', err);
        }
    },
});