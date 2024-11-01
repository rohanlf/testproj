const { app } = require('@azure/functions');
const df = require('durable-functions');
// require("./activity-functions/fetch-data");
// require("./activity-functions/transform-data");
// require("./activity-functions/save-as-file");
require("./orchestratos/MainOrchestrator");

app.http('OrchestratorHttpStart', {
    route: 'MainOrchestrator',
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    extraInputs: [df.input.durableClient()],
    handler: async (request, context) => {
        // Initialize an array to hold the chunks of data
        // Create a reader from the readable stream
        const reader = request.body.getReader();
        const chunks = [];
        let jsonData;
        try {
            let done = false;

            // Read the stream in chunks
            while (!done) {
                const { value, done: isDone } = await reader.read();
                if (value) {
                    chunks.push(value); // Collect the data chunks
                }
                done = isDone;
            }

            // Concatenate the chunks into a single Uint8Array
            const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0));
            let offset = 0;
            for (const chunk of chunks) {
                buffer.set(chunk, offset);
                offset += chunk.byteLength;
            }

            // Convert the buffer to string and then parse it as JSON
            const jsonString = new TextDecoder().decode(buffer);
            jsonData = JSON.parse(jsonString);

        } catch (error) {
            context.log(`Error reading stream: ${error.message}`);
        }
       
        const client = df.getClient(context);
        const instanceId = await client.startNew("MainOrchestrator", { input: jsonData });

        context.log(`Started orchestration with ID = '${instanceId}'.`);

        return client.createCheckStatusResponse(request, instanceId);
    },
});