const df = require('durable-functions');
const axios = require("axios");

df.app.activity('TransformData', {
    handler: (input) => {
        // Example transformation logic (customize as needed)
        // Here, we assume input is an array of objects and we transform it
        const drivers = input.results.MRData.StandingsTable.StandingsLists[0].DriverStandings.map(driver => ({
            position: driver.position,
            name: `${driver.Driver.givenName} ${driver.Driver.familyName}`,
            nationality: driver.Driver.nationality
        }));
        // if (Math.random() < 0.8) {  // 80% chance to fail
        //     throw new Error("Simulated failure");
        // }
        return drivers; // Return the transformed dataset
    },
});