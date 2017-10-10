var md5 = require('md5');


var globalCounterMessage = 0; // message id
var allusersMessages = [];
module.exports = {
    getNumberOfMessages : function () {
      return allusersMessages.length;
    },

    addMessage :  function (newMsg) {
        newMsg.id = globalCounterMessage;
        globalCounterMessage++;
        allusersMessages.push(newMsg);
        
      return newMsg.id;
    },

    getMessages : function(counter) {
      if(counter < 0 ){
        return [];
    }
      var CurrMsgs = [];

      for(var i = counter ; i < allusersMessages.length; i++){
          var obj = {
            name: allusersMessages[i].name,
            message: allusersMessages[i].message,
            timestamp : allusersMessages[i].timestamp,
            pichash: md5(allusersMessages[i].email),
            id: allusersMessages[i].id,
          }
            CurrMsgs.push(obj);
      }

      return CurrMsgs;
    },
    deleteMessage : function (id) {
      for(var i = 0 ; i < allusersMessages.length; i++){
           if( allusersMessages[i].id == id){
                allusersMessages.splice(i,1); // remove 1 item at location i
               break;
           }
      }
    }


};

