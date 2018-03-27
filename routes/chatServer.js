"use strict";
var http = require('http');
var readline = require('readline');

var history = [];

/**
 * to escape input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 Web Socket code
 */
var webSocketServer = require('websocket').server;
var webSocketsServerPort = 1337;

var server = http.createServer(function(request, response) {
    // this is the HTTP server code
});

server.listen(webSocketsServerPort, function() {
    console.log(" Web Socket Server is listening on port " + webSocketsServerPort);
});

var wsServer = new webSocketServer({
    httpServer: server
});
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from source ' + request.origin + '.');

    var connection = request.accept(null, request.origin);

    console.log((new Date()) + ' Connection accepted from a user.');

    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    // user sent some message
    connection.on('message', function(message) {
        // to accept only text
        if (message.type === 'utf8') {
            console.log('Received Message from User:' + message.utf8Data);

            var obj = {
                time: (new Date()).getTime(),
                text: htmlEntities(message.utf8Data),
                align: "right"
            };
            history.push(obj);
            history = history.slice(-100);
            var json = JSON.stringify({ type:'user_message', data: obj });
            connection.sendUTF(json);

            // to read the practitioner message from console
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question('Enter your response: ', function(answer) {
                // console.log('Thank you for your valuable feedback:', answer);
                var obj = {
                    time: (new Date()).getTime(),
                    text: htmlEntities(answer),
                    align: "left"
                };
                history.push(obj);
                history = history.slice(-100);
                var json = JSON.stringify({ type:'response_message', data: obj });
                connection.sendUTF(json);
                rl.close();
            });

            //for AI driven rules
            // var hashMap = {};
            // hashMap["headache"] = "Have you taken any mid-term exam?";
            // hashMap["exercising"] = "Do you want me to setup General Checkup?";
            // hashMap["drowsy"] = "Do you feel flu symptoms - like Cold & Fever?";
            // hashMap["stressed"] = "Are you taking looking for any summer interships?";
            // hashMap["lonely"] = "Are you Techie?";
            // console.log('message is',message);
            // var messageArray = message.utf8Data.split(" ");
            // for(var i = 0; i <messageArray.length; i++){
            //     if(messageArray[i] in hashMap){
            //         var obj = {
            //             time: (new Date()).getTime(),
            //             text: htmlEntities(hashMap[messageArray[i]]),
            //             align: "left"
            //         };
            //         history.push(obj);
            //         history = history.slice(-100);
            //         var json = JSON.stringify({ type:'response_message', data: obj });
            //         connection.sendUTF(json);
            //         break;
            //     }
            // }
        }
    });
});