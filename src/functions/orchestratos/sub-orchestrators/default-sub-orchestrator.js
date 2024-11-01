const df = require("durable-functions");

df.app.orchestration("DefaultSubOrchestrator", function* (context) {
    
   const config = context.df.getInput();
   const step = config.step;
   let results = config.results;

   if (step.metaData.isArray) {
    if (results && Object.keys(results).length > 0) {
       if (step.metaData.batchSize) {
          const batchSize = step.metaData.batchSize ?? 1;

          let batchResults = [];
          for (let i = 0; i < results.length; i += batchSize) { // batchwise processing
             const batch = results.slice(i, i + batchSize);

             // ---------------fan-out/fan-in-------------
             const tasks = batch.map((result) =>
                context.df.callActivity(getActivityFunctionForUseCase(step.type, step.connectorType), {
                   metaData: step.metaData,
                   result,
                })
             );

             const batchResult = yield context.df.Task.all(tasks);
             // ---------------fan-out/fan-in-------------

             batchResults = batchResults.concat(batchResult);
          }
          return { results: batchResults }

       } else { 
          results = yield context.df.callActivity(getActivityFunctionForUseCase(step.type, step.connectorType), {
             metaData: step.metaData,
             results,
          });

          return results;
       }
    }
 } else {


    results = yield context.df.callActivity(getActivityFunctionForUseCase(step.type, step.connectorType), {
       metaData: step.metaData,
       results,
    });

    return results;
    
}

    
});


function getActivityFunctionForUseCase(type, connectorType) {
    if(type == "connector") {
        switch(connectorType) {
            case "API":
                return "FetchDataFromApi"
            case "FileStore":
                // implementation for specific connector type
                break;
        }
       } else {
            // Handle other types
       }
}
   