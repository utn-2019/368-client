cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    onBtnClicked (event,data) {
        if('mobile' === data){
            //cc.sys.openURL('http://www.baidu.com')
            // console.log(cc.custom.global.httpServer)
            // console.log(cc.custom.httpHelper)
            // 测试http
            cc.custom.httpHelper.get('/guest/regist',null,function(rst){
                cc.custom.global.userInfo.token = rst.token
                console.log(cc.custom.global.userInfo.token)
                cc.custom.httpHelper.get('/player/info',null,function(rst){
                    cc.custom.global.userInfo.account = rst
                    console.log(cc.custom.global.userInfo)
                    cc.sys.localStorage.setItem("globalData",cc.custom.global);
                })
            })

            // 测试socket
            // cc.custom.socketHelper.connect(function(data){
            //     console.log(data)
            // })

        }
        if('wechat' === data){
            cc.director.loadScene('HallScene')

            // cc.custom.socketHelper.addHandler("client_join",function(data){
            //     console.log(data)
            // })
            // cc.custom.socketHelper.addHandler("client_message",function(data){
            //     console.log(data)
            // })
            // cc.custom.socketHelper.addHandler("client_game",function(data){
            //     console.log(data)
            // })
            // cc.custom.socketHelper.addHandler("client_frame",function(data){
            //     console.log(data)
            // })

            // cc.custom.socketHelper.send('join',{token:cc.custom.global.userInfo.token, roomId:'123456'})
            // cc.custom.socketHelper.send('message')
            // cc.custom.socketHelper.send('game')
            // cc.custom.socketHelper.send('frame')
        }
    }
});
