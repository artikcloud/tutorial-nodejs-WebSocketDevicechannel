'use strict;';

let ConfigWSRegistrationInfo = require('./config.json');

let WebSocket = require('ws');

/**
* setting query parameter "ack=true" will send an acknowledge message
* for every message sent.
*/
const websocketUrl = "wss://api.artik.cloud/v1.1/websocket?ack=true";


console.log("Connecting to url: ", websocketUrl);
let ws = new WebSocket(websocketUrl);

/**
 * Websocket 'open' listener
 */
ws.on('open', function() {
    console.log('Websocket connection is open ...');
    sendRegistrationMessage();
});

/**
 * Websocket 'message' listener
 */
ws.on('message', function(data, flags) {
    console.log('Received message: %s\n', data);

    let message = JSON.parse(data);

    if (message.type === 'action') {
        handleAction(message);
    }

    if (message.type === 'ping') {
        // handle ping
    }

    // handle other types of messages
    // Note: other messages may not contain a type attribute
});

/**
 * Websocket 'close' listener
 */
ws.on('close', function() {
    console.log('Websocket connection is closed ...');
});


/**
 * Sends the registration payload after making websocket connection
 *
 * @param {object} config configuration file
 */
function sendRegistrationMessage() {
    let payload = {
        'type': 'register',
        'sdid': ConfigWSRegistrationInfo.deviceID,
        'authorization': 'bearer ' + ConfigWSRegistrationInfo.deviceToken,
        'cid': getTimeMillis(),
    };

    console.log(
        'Sending register message payload: %s',
        JSON.stringify(payload));

    sendMessage(payload);
}

/**
* Sends message to cloud to update the device field.
*
* @param {object} data contains the key and value to update
*/
function updateDeviceField(data) {
    let payload = {
        'sdid': ConfigWSRegistrationInfo.deviceID,
        'data': data,
        'cid': getTimeMillis(),
    };

    sendMessage(payload, 'Send message and update field:');
}

/**
* Sends a device channel message to the cloud
*
* @param {object} payload contains the device key/value 
* to be updated (ie:  {deviceField: value})
*
* @param {string} prefix for console output
*/
function sendMessage(payload, prefix='Send message:\n') {
    console.log(prefix, JSON.stringify(payload));

    ws.send(JSON.stringify(payload), {
        binary: false,
        mask: true,
    });
}


/**
* Handler after receiving an action.  
* Updates the device 'state' field to the cloud.
* 
* @param {object} response contains a list of actions 
* called on the device. 
* 
   //Example message with type: action

   {
   "type":"action","cts":1451436813630,"ts":1451436813631,
   "mid":"37e1d61b61b74a3ba962726cb3ef62f1",
   "sdid”:”1abe...”,
   "ddid”:”2abc...”,
   "data":{"actions":[{"name":"setOn","parameters":{}}]},
   "ddtid":"dtf3cdb9880d2e418f915fb9252e267051",
   "uid":"3abc...”,
   "boid”:”4abc...",
   “mv":1
   }

*/
function handleAction(response) {
    let actions = response.data.actions;

    actions.forEach(function(action) {
        switch (action.name.toUpperCase()) {
            case 'SETON':
                updateDeviceField({state: true});
                break;

            case 'SETOFF':
                updateDeviceField({state: false});
                break;

            default:
                console.log('Unknown action for device');
        }
    });
}


/**
* Helper to generate a unix timestamp value
*
* @return {number} timestamp
*/
function getTimeMillis() {
    return parseInt(Date.now().toString());
}
