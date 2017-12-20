var url = require('url');
var fs = require('fs');

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
  
  var address = url.parse(request.url).pathname;
  console.log('address', address);
  //  ====================================================================
  //  Handle Invalid Endpoint Requests
  //  ====================================================================

  // Essentially a makeshift router.
  if (address === '/') {
    fs.readFile('../client/index.html', function(err, data) {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(data);
      response.end();
    });
  } else if (address === '/styles/styles.css') {
    fs.readFile('../client/styles/styles.css', function(err, data) {
      response.writeHead(200, {'Content-Type': 'text/css'});
      response.write(data);
      response.end();
    });
  } else if (address === '/scripts/app.js') {
    fs.readFile('../client/scripts/app.js', function(err, data) {
      response.writeHead(200, {'Content-Type': 'application/javascript'});
      response.write(data);
      response.end();
    });
  } else if (address === '/classes/rooms' || address === '/classes/users') {
    response.writeHead(418, headers);
    return response.end();
  } else if (address !== '/classes/messages') {
    response.writeHead(404, headers);
    return response.end();
  } else {

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
          // parse the body into a message object
          let receivedData = JSON.parse(body);
          // check if required fields are present on the message
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
  }
};

// exports request handler function so that it can be imported using 'require' in other files.
exports.requestHandler = requestHandler;
