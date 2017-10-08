var http = require('http');
var url =  require('url');
var fs = require('fs');
var md5 = require('md5');
var messagesutil = require('./messages-util');
var clientutil = require('./clients-util');

//console.log(messagesutil);
var clients = [];
//404 response
function send404reponse(response)
{
    response.writeHead(404, {"Console-type": "text/plain"});
    response.write("Error 404 : page not found");
    response.end();
}
//handle a user request
/*function onRquest(request, response)
{
    if (request.method == "GET" && request.url == "/")
    {
        response.writeHead(200, {"Console-type": "text/html"});
        fs.createReadStream("./file.html").pipe(response);
    }
    else
    {
        send404reponse(response);
    }
}*/

function ServerHandle(req, res) {

//res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
res.setHeader('Access-Control-Allow-Origin','*');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
    // parse URL
var url_parts = url.parse(req.url); 
if(url_parts.pathname.substr(0, 9) == '/messages') {
      switch(req.method){
            case "GET":
            {
              var queryArray = url_parts.query.split("=");
              var Num = parseInt(queryArray[1]);
              if( queryArray[0] == "counter" && isNaN(Num) == false){
                res.statusCode = 200;
                res.end(JSON.stringify(messagesutil.getMessages(Num)));
              }else{
                res.statusCode = 400; // bad request
                res.end();
              }

            }
            break;
            case "POST":
            {
                 req.setEncoding('utf8');
                 req.on('data',chunk =>{
                    var Answer = JSON.parse(chunk);
                    
                    if( Answer.name == null || Answer.name == "" || Answer.email == null || Answer.email == ""||
                      Answer.message == null || Answer.message == "" || Answer.timestamp == null || Answer.timestamp == ""){
                        res.statusCode = 400; // bad request
                        res.end();
                        return;
                    }
                    messagesutil.addMessage(Answer);

                    res.statusCode = 200;
                    res.end();
                });
            }
            break;
          }
  }else if(url_parts.pathname.substr(0, 6) == '/stats') {
    switch(req.method){
      case "GET":
      {
        res.statusCode = 200;
        res.end(
          JSON.stringify({
          "messages": messagesutil.getNumberOfMessages(),
          "users": clientutil.getNumberOfConnectedUsers(),
          })
        );
      }
      break;
    }
  }else if(url_parts.pathname.substr(0, 10) == '/connected') {
    
    switch(req.method){
      case "POST": // connected
      {
        clientutil.AddConnectedClient();
      }
      break;
      case "OPTIONS":
      {
        switch(req.rawHeaders[5]){
          case "DELETE":
          {
              clientutil.removeConnectedClient();
          }
          break;
        }
              
      }
      break;
    }
  }
}
http.createServer(ServerHandle).listen(9000, '192.168.0.85');
http.createServer(ServerHandle).listen(9000, 'localhost');
console.log('Server running.');
