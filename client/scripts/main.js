//localStorage.setItem("david","hello");
//alert(localStorage.getItem("david"));

var babble = {
  currentMessage : "",
  userInfo: { 
    name : "",
    email : "",
  },
};
var NumOfMsgCounter = 0;

function setAnonymous(){
  babble.userInfo.name = "Anonymous";
  babble.userInfo.email = "Anonymous";
  babble.register(babble.userInfo);
}

function setUser(){
  //var userInfo = new Object();
  babble.userInfo.email = (document.getElementById("EmailID")).value;
  babble.userInfo.name = (document.getElementById("FullNameID")).value;
  babble.register(babble.userInfo);
  window.location.href = window.location.href.split("#")[0];
}
/**** Send new messages */
function SendNewMsg(){
  //console.log( document.getElementById('newMessageTextID').value );
    var SendData = {
      name: babble.userInfo.name,
      email: babble.userInfo.email,
      message: document.getElementById('newMessageTextID').value,
      timestamp: new Date().getTime()
    }

  babble.postMessage(SendData,HandlePostMessagesResponse)
}

/*********** get messages *********/
function getMessagesFromServer(num){
  babble.getMessages(num,HandleGetMessagesResponse);
}
/************ delete messages *****************/
function deleteMessage(id){
 babble.deleteMessage(id,HandleDeleteMessagesResponse);
}
/****************** Client API ********************************/

babble.register = function(userInfo){

  if(userInfo != null && userInfo.name != null && userInfo.email != null && userInfo.name != "" && userInfo.email != ""  ){
    localStorage.setItem("babble",JSON.stringify(babble)); 
    hidePopUp();

    getMessagesFromServer(NumOfMsgCounter);
    babble.getStats(HandleStatResponse); 
    
    window.setTimeout(function(){
        //send connected user message
        var connectedPost = new XMLHttpRequest();
        connectedPost.open('POST', 'http://localhost:9000/connected');
        connectedPost.send();
    },500);
  }
}

babble.getStats = function(callback){
 var StatRequest = new XMLHttpRequest();
  StatRequest.open('GET', 'http://localhost:9000/stats');
  StatRequest.addEventListener('loadend',
    function(e){ 
      callback( JSON.parse(StatRequest.response)  );
    }
  );
  StatRequest.send();
}

babble.postMessage = function(message, callback)
{
  var MessagePostRequest = new XMLHttpRequest();
  MessagePostRequest.open('POST', 'http://localhost:9000/messages');
  MessagePostRequest.addEventListener('loadend',
    function(e){
      if(MessagePostRequest.status == 200){
        var  res = MessagePostRequest.response;
        callback("");
      }

    }
  );
  MessagePostRequest.send(JSON.stringify(message));

}

babble.getMessages = function(counter, callback){
  var getMsgRequest = new XMLHttpRequest();
  getMsgRequest.open('GET', 'http://localhost:9000/messages?counter='+counter);
  getMsgRequest.addEventListener('loadend',
    function(e){ 
      callback( JSON.parse(getMsgRequest.response)  );
    }
  );
  getMsgRequest.send();
}

babble.deleteMessage = function(id, callback){
    var delMsg = new XMLHttpRequest();
    delMsg.open('DELETE', 'http://localhost:9000/messages/'+id);
    delMsg.addEventListener('loadend',
      function(e){ 
        callback( JSON.parse(delMsg.response)  );
      }
    );
    delMsg.send();
}

/****************** END Client API ********************************/



// help function to hide popup
function hidePopUp(){
  document.getElementById("popup1").style.display = "none";
}



/* response handlers */
function HandleStatResponse(obj){
  document.getElementById("usersCounter").innerHTML  = obj.users;
  document.getElementById("msgCounter").innerHTML = obj.messages;

  //long polling req
  babble.getStats(HandleStatResponse); 
}

function HandlePostMessagesResponse(response){
  document.getElementById('newMessageTextID').value = "";
}

function HandleGetMessagesResponse(response){
  var OL = document.getElementById('msgOL');
  //alert(JSON.stringify(response));
 
 if( response.type == 1){ // all
    //remove all messages
      while(OL.childNodes.length > 0){
        OL.removeChild(OL.firstChild)
      }
      // change counter to 0 to poll all the messages
      NumOfMsgCounter = 0;  
  }

  // display all messages
  for(var i =0 ; i < response.msgs.length ; i++,NumOfMsgCounter++){
      currentmessage = response.msgs[i];
      OL.appendChild(get_li_For_msg(currentmessage.id,currentmessage.name,currentmessage.pichash,currentmessage.message,currentmessage.timestamp));
    }

  // long polling call
  getMessagesFromServer(NumOfMsgCounter); 
}

// Help function to create single message
function get_li_For_msg(id,name,pic,messagetext,timestamp){
 var MsgDate = new Date(timestamp );

 var node = document.createElement("li");
  var localid = id*10;
 var deleteCode = "";
 if( babble.userInfo.name == name && babble.userInfo.name != "Anonymous"){
   var newid = localid+1;
   deleteCode += "<div class=\"deleteMessageDiv\" tabindex=\""+newid+"\"><button onclick=\"deleteMessage("+id+")\" class=\"deleteButton\" aria-label=\"close_"+id+"\"><img src=\"images/delete-icon.png\" alt\"\"></button></div>";
 }
 var localpic = ""
 if( name == "Anonymous"){
    localpic="images/anonymous.png";
 }else{
  localpic="https://www.gravatar.com/avatar/"+pic+"?s=30";
 }

 var localtime = +MsgDate.getHours()+":"+MsgDate.getMinutes();
 //node.innerHTML += ; 
 node.innerHTML = "<div class=\"SingleMsg\" ><div class=\"SingleMessageImage\"><img class=\"ProfileImage\" src=\""+localpic+"\"></div> <div class=\"SingleMessageTextBox\" tabindex=\""+localid+"\"><div><div class=\"messageNameAndTimeDiv\"><cite class=\"SingleMessageUsernameText\">"+name+"</cite> <time class=\"SingleMessageTimeText\" datetime=\""+localtime+"\">"+localtime+"</time></div>"+deleteCode+"</div><div class=\"SingleMessageMessageBox\">"+messagetext+"</div> </div> </div><br>";
 return node;
}

function HandleDeleteMessagesResponse(res){

}

/* page on load event */
window.onload = function(){ 
  var localBabble = localStorage.getItem("babble");
  localBabble = JSON.parse(localBabble);
  //var FoundPopUpUrl = window.location.href.includes("#popup1");
  
  if( localBabble == null ||localBabble.userInfo == null || localBabble.userInfo.name == "" ||localBabble.userInfo.name == "Anonymous" ){
    document.getElementById('PopUpButton').click();
  }else{
    // load correct data at page load
    babble.userInfo.name = localBabble.userInfo.name;
    babble.userInfo.email = localBabble.userInfo.email;


    getMessagesFromServer(NumOfMsgCounter);
    babble.getStats(HandleStatResponse); 
    
    window.setTimeout(function(){
      if( performance.navigation.type == 0 ){ // if the page was entered using url 
        //send connected user message
        var connectedPost = new XMLHttpRequest();
        connectedPost.open('POST', 'http://localhost:9000/connected');
        connectedPost.send();
      }else{
          // to read the first time the stat if the user was connected already and refreshed the page
          var StatRequest = new XMLHttpRequest();
          StatRequest.open('POST', 'http://localhost:9000/stats');
          StatRequest.addEventListener('loadend',
            function(e){ 
              HandleStatResponse( JSON.parse(StatRequest.response)  );
            }
          );
          StatRequest.send();
      }

    },500);


  }


};
function discconnect(){
  var disconnectedPUT = new XMLHttpRequest();
  disconnectedPUT.open('DELETE', 'http://localhost:9000/connected');
  disconnectedPUT.addEventListener('load',
            function(e){ 
                //alert("test");
            }
          );
  disconnectedPUT.timeout = 500;
  disconnectedPUT.send();
  return 3+1+5+4+5+4;
}

window.addEventListener('beforeunload', function () {
  var x = discconnect();

  return null;
});




  //alert(performance.navigation.type);

/*
window.addEventListener("unload", function(e){
  var connectedPUT = new XMLHttpRequest();
  connectedPUT.open('DELETE', 'http://localhost:9000/connected');
  connectedPUT.send();
}, true);
*/



