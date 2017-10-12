//localStorage.setItem("david","hello");
//alert(localStorage.getItem("david"));

var babble = {
  currentMessage : "",
  userInfo: { 
    name : "",
    email : "",
  },
};
var checkLItem =  localStorage.getItem("babble");
if(checkLItem == undefined || checkLItem == null){
  localStorage.setItem("babble",JSON.stringify(babble)); 
}


var NumOfMsgCounter = 0;
/** set anonymous */
function setAnonymous(){
    var obj  = {
     name : '',
     email : '',
  };
  Babble.register(obj);
}
/* set user function */
function setUser(){

  var obj  = {
     name : (document.getElementById("EmailID")).value,
    email : (document.getElementById("FullNameID")).value,
  };
  Babble.register(obj);
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

  Babble.postMessage(SendData,HandlePostMessagesResponse)
}


/****************** Client API ********************************/
window.Babble = {
    register : function(userInfo){

      if(userInfo != null && userInfo.name != null && userInfo.email != null   ){
        
          babble.userInfo.name = userInfo.name;
          babble.userInfo.email = userInfo.email;
        
        localStorage.setItem("babble",JSON.stringify(babble)); 
        hidePopUp();

        Babble.getMessages(NumOfMsgCounter,HandleGetMessagesResponse);
        Babble.getStats(HandleStatResponse); 
        
        window.setTimeout(function(){
            //send connected user message
            var connectedPost = new XMLHttpRequest();
            connectedPost.open('POST', 'http://localhost:9000/connected');
            connectedPost.send();
        },500);
      }
    },
    getStats : function(callback){
      var StatRequest = new XMLHttpRequest();
        StatRequest.open('GET', 'http://localhost:9000/stats');
        StatRequest.addEventListener('loadend',
          function(e){ 
            callback( JSON.parse(StatRequest.response)  );
          }
        );
        StatRequest.send();
      },
      postMessage : function(message, callback)
      {
        var MessagePostRequest = new XMLHttpRequest();
        MessagePostRequest.open('POST', 'http://localhost:9000/messages');
        MessagePostRequest.addEventListener('loadend',
          function(e){
            //if(MessagePostRequest.status == 200){
              var  res = MessagePostRequest.response;
              callback(JSON.parse(res));
            //}

          }
        );
        MessagePostRequest.send(JSON.stringify(message));

      },
      getMessages : function(counter, callback){
        var getMsgRequest = new XMLHttpRequest();
        getMsgRequest.open('GET', 'http://localhost:9000/messages?counter='+counter);
        getMsgRequest.addEventListener('loadend',
          function(e){ 
            callback( JSON.parse(getMsgRequest.response)  );
          }
        );
        getMsgRequest.send();
      },
      deleteMessage : function(id, callback){
          var delMsg = new XMLHttpRequest();
          delMsg.open('DELETE', 'http://localhost:9000/messages/'+id);
          delMsg.addEventListener('loadend',
            function(e){ 
              callback( JSON.parse(delMsg.response)  );
            }
          );
          delMsg.send();
      }

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
  Babble.getStats(HandleStatResponse); 
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
  Babble.getMessages(NumOfMsgCounter,HandleGetMessagesResponse);
}

// Help function to create single message
function get_li_For_msg(id,name,pic,messagetext,timestamp){
 var MsgDate = new Date(timestamp );

 var node = document.createElement("li");
  var localid = id*10;
 var deleteCode = "";
 if( babble.userInfo.name == name && babble.userInfo.name != ""){
   var newid = localid+1;
   deleteCode += "<div class=\"deleteMessageDiv\" tabindex=\""+newid+"\"><button onclick=\"Babble.deleteMessage("+id+",HandleDeleteMessagesResponse)\" class=\"deleteButton\" aria-label=\"close_"+id+"\"><img src=\"images/delete-icon.png\" alt\"\"></button></div>";
 }
 var localpic = ""
 if( name == ""){
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
  
  if( localBabble == null ||localBabble.userInfo == null || localBabble.userInfo.name == "" ){
    document.getElementById('PopUpButton').click();
  }else{
    // load correct data at page load
    babble.userInfo.name = localBabble.userInfo.name;
    babble.userInfo.email = localBabble.userInfo.email;


    Babble.getMessages(NumOfMsgCounter,HandleGetMessagesResponse);
    Babble.getStats(HandleStatResponse); 

    
    
    window.setTimeout(function(){
      if( performance.navigation.type == 0  || navigator.userAgent.indexOf("Edge") > -1){ // if the page was entered using url 
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






