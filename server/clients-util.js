
var CurrentConnectedUser = 0;
module.exports = {
    
    AddConnectedClient : function(){
        CurrentConnectedUser++;
    },
    removeConnectedClient : function(){
        CurrentConnectedUser--;
        if( CurrentConnectedUser < 0){
            CurrentConnectedUser = 0;
        }
    },
    getNumberOfConnectedUsers : function(){
        return CurrentConnectedUser;
    }
};