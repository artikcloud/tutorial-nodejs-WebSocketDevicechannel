'use strict;';

let ConfigWSRegistrationInfo = require('./config.json');

let WebSocket = require('ws');

let ConfigWSConnection = {
    'scheme': 'wss',
    'domain': 'api.artik.cloud',
    'version': 'v1.1',
    'path': 'websocket',
};


/**
 * Websocket instance with connection info
 */
let ws = new WebSocket(
    getConnectionString(ConfigWSConnection));

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
* Get the connection string to connect to /live firehose endpoint 
* 
* @param {object} config websocket connection info
* @param {boolean} enableAck server sends acknowledge when messages are sent 
* @return {string} connection string url
**/
function getConnectionString(config, enableAck = true) {
    let connectionString =
        config.scheme + '://' +
        config.domain + '/' +
        config.version + '/' +
        config.path;

    connectionString += '?ack=' + enableAck;

    console.log('Connecting to: ', connectionString);

    return connectionString;
}


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
* @example
* response['data']['actions'] = [{name: setOn}]
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
