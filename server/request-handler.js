/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var url = require('url');

//  ====================================================================
//  Globals
//  ====================================================================
var messageObj = {results: []};
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};
var headers = defaultCorsHeaders;


//  ====================================================================
//  Request Handler Function
//  ====================================================================
var requestHandler = function(request, response) {
  
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  
  var address = url.parse(request.url).path;

  //  ====================================================================
  //  Handle Invalid Endpoint Requests
  //  ====================================================================
  
  if (address === '/classes/rooms' || address === '/classes/users') {
    response.writeHead(418, headers);
    return response.end();
  } else if (address !== '/classes/messages') {
    response.writeHead(404, headers);
    return response.end();
  }

  //  ====================================================================
  //  Handle OPTIONS Requests
  //  ====================================================================
  
  // always return success to OPTIONS requests
  if (request.method === 'OPTIONS') {
    var statusCode = 200;
    headers['Content-Type'] = 'application/json';
    response.writeHead(statusCode, headers);
    response.end();


  //  ====================================================================
  //  Handle GET Requests
  //  ====================================================================
  } else if (request.method === 'GET') {

    var statusCode = 200;
    headers['Content-Type'] = 'application/json';
    response.writeHead(statusCode, headers);
    // response.write(JSON.stringify(messageObj));
    response.end(JSON.stringify(messageObj));


  //  ====================================================================
  //  Handle POST Requests
  //  ====================================================================

  } else if (request.method === 'POST') {

    let body = '';
    // buffer the readable stream
    request.on('data', (chunk) => body += chunk);
    
    // when stream is done buffering, store the message and 
    request.on('end', () => {
      try {
        let receivedData = JSON.parse(body);
        if (!receivedData.username || !receivedData.message || !receivedData.roomname || !receivedData.createdAt) { // if doesn't have username, text, roomname, createdAt
          throw 'Required data property is missing';
        } 
        messageObj.results.push(receivedData);
        // responding to client
        headers['Content-Type'] = 'application/json';
        response.writeHead(201, headers);
        response.success = 'Updated Successfully';
        response.end();
      } catch (er) {
        response.writeHead(400, headers);
        response.end('error');
      }
    });
  }
};



exports.requestHandler = requestHandler;


  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/


    // .writeHead() writes to the request line and headers of the response,
    // which includes the status and all headers.
    // response.writeHead(statusCode, headers);

    // Make sure to always call response.end() - Node may not send
    // anything back to the client until you do. The string you pass to
    // response.end() will be the body of the response - i.e. what shows
    // up in the browser.
    //
    // response.write(JSON.stringify(messageObj));
    // Calling .end "flushes" the response's internal buffer, forcing
    // node to actually send all the data over to the client.
    // response.end();

