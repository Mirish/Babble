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

/****************** Client API ********************************/

babble.register = function(userInfo){

  if(userInfo != null && userInfo.name != null && userInfo.email != null && userInfo.name != "" && userInfo.email != ""  ){
    localStorage.setItem("babble",JSON.stringify(babble)); 
    hidePopUp();
  }

  
  /*
  var StatRequest = new XMLHttpRequest();
  StatRequest.open('POST', 'http://localhost:9000/register');

  StatRequest.addEventListener('loadend',function(e){

      localStorage.setItem("babble",JSON.stringify(babble)); 
      
      babble.getStats(HandleStatResponse);
    }
  );
  StatRequest.send(JSON.stringify(userInfo));
  */
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
  MessagePostRequest.addEventListener('load',
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

/****************** END Client API ********************************/



// help function to hide popup
function hidePopUp(){
  document.getElementById("popup1").style.display = "none";
}



/* response handlers */
function HandleStatResponse(obj){
  document.getElementById("usersCounter").innerHTML  = obj.users;
  document.getElementById("msgCounter").innerHTML = obj.messages;
 

}

function HandlePostMessagesResponse(response){
  document.getElementById('newMessageTextID').value = "";
}

function HandleGetMessagesResponse(response){
  var OL = document.getElementById('msgOL');
  for(var i =0 ; i < response.length ; i++,NumOfMsgCounter++){
    OL.appendChild(get_li_For_msg(response[i].name,response[i].pichash,response[i].message,response[i].timestamp));
  }
  //
  
}

// Help function to create single message
function get_li_For_msg(name,pic,messagetext,timestamp){
 var MsgDate = new Date(timestamp );

 var node = document.createElement("li");
 node.innerHTML = "<div class=\"SingleMsg\"> <div class=\"SingleMessageImage\"><img class=\"ProfileImage\" src=\"https://www.gravatar.com/avatar/"+pic+"?s=30\"> </div> <div class=\"SingleMessageTextBox\"> <div> <label class=\"SingleMessageUsernameText\">"+name+"</label> <label class=\"SingleMessageTimeText\">"+MsgDate.getHours()+":"+MsgDate.getMinutes()+"</label> </div> <div class=\"SingleMessageMessageBox\">"+messagetext+"</div> </div> </div><br>";
 return node;
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
  }

  window.setInterval(function(){
    babble.getStats(HandleStatResponse); 
    getMessagesFromServer(NumOfMsgCounter); 
  }, 300);

  //send connected user message
  var connectedPost = new XMLHttpRequest();
  connectedPost.open('POST', 'http://localhost:9000/connected');
  connectedPost.send();
};

window.addEventListener("beforeunload", function(e){
  var connectedPUT = new XMLHttpRequest();
  connectedPUT.open('DELETE', 'http://localhost:9000/connected');
  connectedPUT.send();
}, true);


