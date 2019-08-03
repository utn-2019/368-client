if(window.io == null){
    window.io = require("SocketIo");
}
 
var Global = cc.Class({
    extends: cc.Component,
    statics: {
        ip:"",
        sio:null,
        isPinging:false,
        fnDisconnect:null,
        handlers:{},
        addHandler:function(event,fn){
            if(this.handlers[event]){
                console.log("event:" + event + "' handler has been registered.");
                return;
            }

            var handler = function(data){
                //console.log(event + "(" + typeof(data) + "):" + (data? data.toString():"null"));
                if(event != "disconnect" && typeof(data) == "string"){
                    data = JSON.parse(data);
                }
                fn(data);
            };
            
            this.handlers[event] = handler; 
            if(this.sio){
                console.log("register:function " + event);
                this.sio.on(event,handler);
            }
        },
        connect:function(fnConnect,fnError) {
            var self = this;
            
            var opts = {
                'reconnection':false,
                'force new connection': true,
                'transports':['websocket', 'polling']
            }
            this.sio = window.io.connect(cc.custom.global.socketServer,opts);
            this.sio.on('reconnect',function(){
                console.log('reconnection');
            });
            this.sio.on('client_connect',function(data){
                self.sio.connected = true;
                fnConnect(data);
            });
            
            this.sio.on('disconnect',function(data){
                console.log("disconnect");
                self.sio.connected = false;
                self.close();
            });
            
            this.sio.on('connect_failed',function (){
                console.log('connect_failed');
            });
            
            for(var key in this.handlers){
                var value = this.handlers[key];
                if(typeof(value) == "function"){
                    if(key == 'disconnect'){
                        this.fnDisconnect = value;
                    }
                    else{
                        console.log("register:function " + key);
                        this.sio.on(key,value);                        
                    }
                }
            }
            
            this.startHearbeat();
        },
        
        startHearbeat:function(){
            this.sio.on('client_heartbeat',function(){
                console.log('heartbeat');
                self.lastRecieveTime = Date.now();
                self.delayMS = self.lastRecieveTime - self.lastSendTime;
                console.log(self.delayMS);
            });
            this.lastRecieveTime = Date.now();
            var self = this;
            console.log(1);
            if(!self.isPinging){
                self.isPinging = true;
                cc.game.on(cc.game.EVENT_HIDE,function(){
                    self.heartbeat();
                });
                setInterval(function(){
                    if(self.sio){
                        self.heartbeat();                
                    }
                }.bind(this),5000);
                setInterval(function(){
                    if(self.sio){
                        if(Date.now() - self.lastRecieveTime > 10000){
                            self.close();
                        }         
                    }
                }.bind(this),500);
            }   
        },
        send:function(event,data){
            if(this.sio.connected){
                if(data != null && (typeof(data) == "object")){
                    data = JSON.stringify(data);
                    //console.log(data);              
                }
                if(data == null){
                    data = '';
                }
                this.sio.emit(event,data);                
            }
        },
        
        heartbeat:function(){
            if(this.sio){
                this.lastSendTime = Date.now();
                this.send('heartbeat');
            }
        },
        
        close:function(){
            console.log('close');
            this.delayMS = null;
            if(this.sio && this.sio.connected){
                this.sio.connected = false;
                this.sio.disconnect();
            }
            this.sio = null;
            if(this.fnDisconnect){
                this.fnDisconnect();
                this.fnDisconnect = null;
            }
        },
        
        test:function(fnResult){
            var fn = function(ret){
                fnResult(ret.errcode == 0);
            }
            cc.vv.http.sendRequest("/hi",null,fn,'http://' + this.ip);
        }
    },
});