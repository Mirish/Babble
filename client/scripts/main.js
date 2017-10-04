var http = require('http');
var url =  require('url');
var fs = require('fs');

var messages = ["testing"];
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

http.createServer(function (req, res) {
    // parse URL
   var url_parts = url.parse(req.url);
   console.log(url_parts);
   if(url_parts.pathname == '/') {
      // file serving
      fs.readFile('client/index.html', function(err, data) {
         res.end(data);
      });
   } else if(url_parts.pathname.substr(0, 5) == '/poll') {
      var count = url_parts.pathname.replace(/[^0-9]*/, '');
      console.log(count);
      if(messages.length > count) {
        res.end(JSON.stringify( {
          count: messages.length,
          append: messages.slice(count).join("\n")+"\n"
        }));
      } else {
        clients.push(res);
      }
  }else if(url_parts.pathname.substr(0, 5) == '/msg/') {
    // message receiving
    var msg = unescape(url_parts.pathname.substr(5));
    messages.push(msg);
    while(clients.length > 0) {
      var client = clients.pop();
      client.end(JSON.stringify( {
        count: messages.length,
        append: msg+"\n"
      }));
    }
    res.end();
  }else if(url_parts.pathname.includes(".css") || url_parts.pathname.includes(".png") || url_parts.pathname.includes(".jpg")
   || url_parts.pathname.includes(".js") || url_parts.pathname.includes(".html") ) {
    fs.readFile( __dirname+"/../"+url_parts.pathname, function(err, data) {
        console.log(err);
        console.log(data);
         res.end(data);
      });
  }
}).listen(8080, 'localhost');
console.log('Server running.');
/*http.createServer(function (req, res) {
   res.end("Hello world");
}).listen(8080, 'localhost');
console.log('Server running.');*/
//http.createServer(onRquest).listen(8888);
//console.log("server is now rnning");