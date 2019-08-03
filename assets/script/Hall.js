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
        var label =  new cc.LabelAtlas("57", "resouces/common/texture/font/gold_num_0.png",  13, 21,"0");
    },

    // update (dt) {},

    onGameIconClick(event,data){
        //console.log(data)
        cc.custom.currentGame = data
        cc.director.loadScene('RoomSelectScene')
    }
});
