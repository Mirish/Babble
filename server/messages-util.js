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
            message: allusersMessages[i].message,
            id: allusersMessages[i].id,
          }

          // the test requires only id and message - without and email & timestamp & name
          if( allusersMessages[i].name != undefined){
            obj.name = allusersMessages[i].name;
          }
          if( allusersMessages[i].timestamp != undefined){
            obj.timestamp = allusersMessages[i].timestamp;
          }
          if( allusersMessages[i].email != undefined){
            obj.pichash = md5(allusersMessages[i].email);
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

