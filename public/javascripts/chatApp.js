$(function () {
    "use strict";
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    // if user is running mozilla then use it's built-in WebSocket
    // window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Your browser does not support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    /**
     * open connection
     */
    var connection = new WebSocket('ws://127.0.0.1:1337');

    /**
     * on connection open
     */
    connection.onopen = function () {
        input.removeAttr('disabled');
    };

    /**
     * on connection error
     */
    connection.onerror = function (error) {
        content.html($('<p>', { text: 'Server connection error'}));
    };

    /**
     *  on message enter
     */
    connection.onmessage = function (message) {
        //to check whether the JSON is valid or not
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('Not a valid JSON: ', message.data);
            return;
        }
        if (json.type === 'history') {
            //to show the previous messages
            for (var i=0; i < json.data.length; i++) {
                appendMessage(json.data[i].text, new Date(json.data[i].time),json.data[i].align);
            }
        } else if (json.type === 'user_message') {
            //to show the user message
            appendMessage(json.data.text, new Date(json.data.time), json.data.align);
        } else if (json.type === 'response_message') {
            //to show the GP message
            input.removeAttr('disabled');
            appendMessage(json.data.text, new Date(json.data.time), json.data.align);
        } else {
            console.log('Error', json);
        }
    };

    /**
     * Send message when user presses Enter key
     */
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            // to send the message
            connection.send(msg);
            $(this).val('');
            input.attr('disabled', 'disabled');
        }
    });

    $('#sendButton').click(function(){
        var msg = $('#input').val();
        if (!msg) {
            return;
        }
        // to send the message
        connection.send(msg);
        $('#input').val('');
        input.attr('disabled', 'disabled');
    });

    /**
     * Add message to the chat window
     */
    function appendMessage(message, date, alignment) {
        if(alignment === "right"){
            content.append('<p style="text-align:right"><span class="userMessage">You - ' +
                + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
                + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
                + '</br>' + message + '</span></p>');
            updateScroll();
        } else {
            content.append('<p style="text-align: left"><span class="responseMessage">GP - ' +
                +(date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
                + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
                + '</br> ' + message + '</span></p>');
            updateScroll();
        }
    }

    /**
     * Scroll to the bottom of the content page
     */
    function updateScroll(){
        var element = $('#content');
        var height =  element[0].scrollHeight;
        element.scrollTop(height);
    }
});