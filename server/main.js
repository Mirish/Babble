var http = require('http');
var url =  require('url');
var fs = require('fs');
var md5 = require('md5');
var messagesutil = require('./messages-util');
var clientutil = require('./clients-util');

//console.log(messagesutil);
var clients = [];
var StatClient = [];
var globalcounter = 0;
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
res.setHeader('Access-Control-Allow-Methods', "POST,GET,PUT,DELETE");
//res.setHeader("content-type", "application/json");
    // parse URL
var url_parts = url.parse(req.url); 
if(url_parts.pathname.substr(0, 9) == '/messages') {
      switch(req.method){
            case "GET":
            {
              var queryArray = url_parts.query.split("=");
              var Num = parseInt(queryArray[1]);
              if( queryArray[0] == "counter" && isNaN(Num) == false){
                // check if we have new messages
                if( messagesutil.getNumberOfMessages() > Num){
                  res.statusCode = 200;
                  res.end(JSON.stringify({ 
                      "type": 0, // incremental
                      "msgs" : messagesutil.getMessages(Num)
                    }
                  ));
                }else{
                  clients.push(res); // save the connection for long polling
                  //console.log("Add response object");
                }
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


                    //console.log("Message written");
                    
                     while(clients.length > 0 ){
                        var SingleClient = clients.pop();
                        SingleClient.statusCode = 200;
                        SingleClient.end(
                          JSON.stringify({ 
                              "type": 0, // incremental
                              "msgs" : messagesutil.getMessages(messagesutil.getMessages(messagesutil.getNumberOfMessages()-1))
                            }
                          )
                        );
                      }


                    LongPollingGetStatResponse();


                });
            }
            break;
            case "OPTIONS":
            {
              var del = req.rawHeaders[11]; // for edge & firefox
              if(del != "DELETE" ){
                del = req.rawHeaders[5]; // for chrome
              }

              switch(del){
                  case 'DELETE':
                  {
                      console.log("delete message");
                      //get message id number
                      var splitparts = url_parts.pathname.split("/");
                      var id = parseInt(splitparts[2]);
                      if(isNaN(id)){
                        res.statusCode = 400;
                        res.end();
                        return;
                      }
                      // Delete one message
                      messagesutil.deleteMessage(id);
                      
                      res.statusCode = 200;
                      res.end();

                      while(clients.length > 0 ){
                        var SingleClient = clients.pop();
                        SingleClient.statusCode = 200;
                        SingleClient.end(
                          JSON.stringify({ 
                              "type": 1, // all
                              "msgs" : messagesutil.getMessages(0)
                            }
                          ));
                      }

                      LongPollingGetStatResponse();

                  }
                  break;
                  default:
                  {
                    res.statusCode = 405; // not allowed
                    res.end();
                  }
                  break;
              }
              
            
            }
            break;
          }
  }else if(url_parts.pathname.substr(0, 6) == '/stats') {
    switch(req.method){
      case "GET":
      {
        //console.log("getStat command")
        StatClient.push( res);
      }
      break;
      case "POST":
      {
          LongPollingGetStatResponse();
      }
      break;
      default:
      {
        res.statusCode = 405;
        res.end();
      }
      break;
    }
  }else if(url_parts.pathname.substr(0, 10) == '/connected') {
    
    switch(req.method){
      case "POST": // connected
      {
        clientutil.AddConnectedClient();
         console.log("user connected");
        res.statusCode = 200;
        res.end();
        LongPollingGetStatResponse();

      }
      break;
      case "OPTIONS":
      {
        switch(req.rawHeaders[5]){
          case "DELETE":
          {
              clientutil.removeConnectedClient();
              console.log("user disconnected");
              res.statusCode = 200;
              res.end();
              LongPollingGetStatResponse();
          }
          break;
          default:
          {
            res.statusCode = 405; // not allowed
            res.end();
          }
          break;
        }
              
      }
      break;
    }
  }else{
    res.statusCode = 404;
    res.end();
  }
}
//http.createServer(ServerHandle).listen(9000, '192.168.0.85');
http.createServer(ServerHandle).listen(9000, 'localhost');
console.log('Server running.');

function LongPollingGetStatResponse(){
//console.log("Curr StatClient size: " + StatClient.length);
 while(StatClient.length > 0 ){
    var SingleClient = StatClient.pop();
    SingleClient.statusCode = 200;
    SingleClient.end(JSON.stringify(
        {
          "users": clientutil.getNumberOfConnectedUsers(),
          "messages": messagesutil.getNumberOfMessages(),
        }
      )
    );
  }
}
