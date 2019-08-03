cc.Class({
    extends: cc.Component,

    statics: {
        httpServer: null,
        socketServer: null,
        hotUpdateServer: null,

        // 当前游戏版本
        version: '0.0.1',
        // 当前选中的游戏
        current: null,

        // 用户信息
        userInfo: {
            token: null,
            account: null,
        },

        // 房间信息
        roomInfo: {
            roomId: null,
        },

        // 游戏消息
        gameInfo:{
            // 桢编号
            frameNum: null

        },

        // 初始化数据
        initData: function(){
            
        },
    },
});
