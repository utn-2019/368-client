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
        _current: {
            default: null,
            type: String,
        },

        //游戏列表节点
        gameListNode: {
            default: null,
            type: cc.Node,
        },
        //房间列表节点
        roomListNode: {
            default: null,
            type: cc.Node,
        }
    },

    _switchGame(){
        // 游戏切换
        if(!this.gameListNode) return
        let children = this.gameListNode.children

        children.forEach(element => {
            let mask = element.getChildByName('select_mask')
            if(element.name == this._current){
                mask.active = true
            }else{
                mask.active = false
            }
        });

        // let mask = node.getChildByName('select_mask')
        // mask.active = true
    },
    _switchRoomList(){
        // 房间列表切换
        if(!this.roomListNode)return

        let roomListChildren = this.roomListNode.children;
        roomListChildren.forEach(element=>{
            //console.log(element.name)
            if(element.name == this._current){
                element.active = true
            }else{
                element.active = false
            }
        })
    },
    _switchCreateRoomBtn(node){
        // 创建/加入房间按钮
    },

    start () {
        this._current = cc.custom.currentGame
        if(this._current){
            this._switchGame()
            this._switchRoomList()
        }
    },

    onBtnBackClick() {
        cc.director.loadScene('HallScene')
    },

    onBtnGameClick() {
        if(this._current == 'HB'){
            cc.director.loadScene('GameScene_hongbao')
        }
        if(this._current == 'BMW'){
            cc.director.loadScene('GameScene_BMW')
        }
        
    },

    onBtnGameNameClick(event,data) {
        this._current = data;
        this._switchGame()
        this._switchRoomList()
    },

});
