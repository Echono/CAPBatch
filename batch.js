const execute = async (service, actions, batch_id) => {

    // Check if necessary params is present
    if(!service, !actions || actions.length <= 0) {
        throw new Error("batch.execute: Necessary values were not present. Please check your params and try again");
    }

    // Create payload variable and deteremine batch identifier
    const batchIdentifier = batch_id ? `batch_${batch_id}` : 'batch';
    let payload = ``;

    // Construct payload from actions
    for(const action of actions) {
        payload += action;
    }

    // End batch call
    payload += `--${batchIdentifier}--`;

    // Send batch to service
    const response = await service.send({
        method: 'POST',
        path: `/$batch`,
        headers: { 
            'Content-Type': 'multipart/mixed;boundary=' + batchIdentifier,
            'Accept': 'multipart/mixed'
        },
        data: payload
    })

    // Construct json objects of responses
    const result = _extractJSONObjects(response);

    return result;

}

const GET = (endpoint, batch_id) => {
    const header = {
        batch_id: batch_id,
        content: {
            "Content-Type": "application/http",
            "Content-Transfer-Encoding": "binary"
        }
    }
    const payload = {
        method: "GET",
        endpoint: endpoint,
        content: {
            "sap-contextid-accept": "header",
            "Accept": "application/json",
            "Accept-Language": "en",
            "DataServiceVersion": "2.0",
            "MaxDataServiceVersion": "2.0",
            "X-Requested-With": "XMLHttpRequest"
        }
    }
    return _construct(header, payload);
}

const POST = (endpoint, changeset_id, payload) => {
    // if(!endpoint, !changeset_id) {
    //     throw new Error('Some required parameters were not present. Please check your params and try again');
    // }
    // const changesetHeaders = {
    //     changeset_id: changeset_id,
    //     content: {
    //         "Content-Type": "application/http", 
    //         "Content-Transfer-Encoding": "binary" 
    //     }
    // }
    // const payload = {
    //     method: "POST",
    //     endpoint: endpoint,
    //     content: {
    //         "sap-contextid-accept": "header",
    //         "Accept": "application/json",
    //         "Accept-Language": "en",
    //         "DataServiceVersion": "2.0",
    //         "MaxDataServiceVersion": "2.0",
    //         "X-Requested-With": "XMLHttpRequest"
    //     }
    // }
}

const DELETE = (params) => {

}

const PUT = (endpoint, changeset_id, batch_id) => {

}

const _construct = (header, payload) => {
    let batchConstruct = ``;

    // Create header
    batchConstruct += `--batch${header.batch_id ? "_header.batch_id" : ""}\r\n`;
    batchConstruct += _loopContent(header.content);
    batchConstruct += `\r\n`;

    // Create payload
    batchConstruct += `${payload.method} ${payload.endpoint} HTTP/1.1\r\n`;
    batchConstruct += _loopContent(payload.content);
    batchConstruct += `\r\n\r\n`;

    return batchConstruct;
}

const _loopContent = (content) => {
    let result = ``;
    for(let i = 0; i < Object.keys(content).length; i++) {
        const currentProperty = Object.getOwnPropertyNames(content)[i];
        result += `${currentProperty}: ${content[currentProperty]}\r\n`;
    }
    return result;
}

const _extractJSONObjects = (inputString) => {
    const jsonObjects = [];
    let currentObject = '';
    let braceCount = 0;
    let inObject = false;
    for (let i = 0; i < inputString.length; i++) {
        const char = inputString[i];
        if (char === '{') {
            if (!inObject) {
                inObject = true; // Start of a new JSON object
                currentObject = '';
            }
            braceCount++;
        }
        if (inObject) {
            currentObject += char;
        }
        if (char === '}') {
            braceCount--;
            if (braceCount === 0 && inObject) {
                // Complete JSON object detected
                try {
                    jsonObjects.push(JSON.parse(currentObject)); // Validate JSON
                } catch (e) {
                    // Skip invalid JSON
                }
                inObject = false; // Reset for the next object
            }
        }
    }
    return jsonObjects;
}

module.exports = {
    execute,
    GET,
    POST,
    DELETE,
    PUT
}