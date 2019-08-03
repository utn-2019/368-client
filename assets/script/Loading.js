cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.custom = {}
        //cc.sys.localStorage.setItem("GameLocalData", gameLocalData);
        let globalData = cc.sys.localStorage.getItem("globalData");
        if(globalData){
            cc.custom.global = globalData
        }else{
            cc.custom.global = require("GlobalHelper");
            cc.custom.global.httpServer = 'http://127.0.0.1:3000'
            cc.custom.global.socketServer = 'http://127.0.0.1:9000'
            cc.custom.global.hotUpdateServer = 'http://127.0.0.1:8000'
            cc.custom.httpHelper = require('HttpHelper');
            cc.custom.socketHelper = require('SocketHelper');
            cc.custom.utilHelper = require('UtilHelper');
        }
    },

    start () {
        //cc.director.loadScene('LoginScene');
        //let hotUpdateHallHelper = this.getComponent('HotUpdateHallHelper')
        //hotUpdateHallHelper.checkUpdate()
    },

    // update (dt) {},
});
