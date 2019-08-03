cc.Class({
    extends: cc.Component,

    properties: {
        track: {
            type: cc.Node,
            default: null,
        },

        carIndex: 0,
        totalNum: 0,

        betArea: {
            type: cc.Node,
            default: null,
        },

        // betAreaShape: 'rect',
        betAreaIndex: 0,

        prefab_chip_1: {
            type: cc.Prefab,
            default: null,
        },
        prefab_chip_10: {
            type: cc.Prefab,
            default: null,
        },
        prefab_chip_50: {
            type: cc.Prefab,
            default: null,
        },
        prefab_chip_100: {
            type: cc.Prefab,
            default: null,
        },
        prefab_chip_300: {
            type: cc.Prefab,
            default: null,
        },

        head: {
            type: cc.Node,
            default: null,
        },
        players: {
            type: cc.Node,
            default: null,
        },
        zhuang: {
            type: cc.Node,
            default: null,
        },
        timer: {
            type: cc.Node,
            default: null,
        },
        tip: {
            type: cc.Node,
            default: null,
        },
        //定时器
        _timer: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.game.on(cc.game.EVENT_HIDE, function () {
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            cc.audioEngine.resumeAll();
        });
    },

    start () {
        //this.turn()
        //cc.AudioManager.resumeBGM();
        //var clip = cc.url.raw("resources/BMWGame/Sound/bgm_bmw.mp3");
        //cc.audioEngine.play(audio,true,1.0);
        //cc.audioEngine.playMusic(clip, true)

        cc.loader.loadRes('BMWGame/Sound/bgm_bmw', cc.AudioClip, function (err, audioClip) {
            cc.audioEngine.playMusic(audioClip, true)
        });
    },

    onDestroy: function(){
        cc.audioEngine.stopAll()
        if(this._timer){
            clearInterval(this._timer)
        }
    },

    /**
     * 获取庄头像世界坐标
     */
    getZhuangPosition: function(){
        var rst = this.zhuang.convertToWorldSpaceAR(cc.v2(0, 0));
        //console.log('head:' + rst.x + ':' + rst.y)
        return rst
    },

    /**
     * 添加左侧走势记录
     */
    makeRecord: function(){
        var recordsNode = cc.find('Canvas/content/middle/left/records/view/content')
        var records = recordsNode.children

        var logo
        //console.log(this.betAreaIndex)
        switch(this.betAreaIndex){
            case 0: 
                logo = '05'
                break;
            case 1: 
                logo = '03'
                break;
            case 2:  
                logo = '04'
                break;
            case 3:
                logo = '08'
                break;
            case 4: 
                logo = '07'
                break;
            case 5: 
                logo = '06'
                break;
            case 6: 
                logo = '10'
                break;
            case 7: 
                logo = '09'
                break;
        }

        var record = records[0]
        
        var copy = cc.instantiate(record)
        cc.loader.loadRes('BMWGame/Texture/BMW',cc.SpriteAtlas,function(err,spriteAtlas){
            copy.getComponent(cc.Sprite).spriteFrame = spriteAtlas.getSpriteFrame(logo)
        })
        copy.parent = recordsNode
        copy.setSiblingIndex(0)
        record.removeAllChildren()

        if(records.length > 10){
            records.pop()
        }
        console.log(records.length)
    },

    /**
     * 显示结果数字
     */
    showWinNum: function(){
        var winLabelAtHead = this.head.getChildByName('winLabel')
        var animationAtHead = this.head.getComponent(cc.Animation)
        winLabelAtHead.active = true
        animationAtHead.onShowFinished = function(){
            winLabelAtHead.active = false
        }
        animationAtHead.play('winLabel')

        var winLabelAtZhuang = this.zhuang.parent.getChildByName('winLabel')
        var animationAtZhuang = this.zhuang.parent.getComponent(cc.Animation)
        winLabelAtZhuang.active = true
        animationAtZhuang.onShowFinished = function(){
            winLabelAtZhuang.active = false
        }
        animationAtZhuang.play('winLabel')
    },

    /**
     * 每个区域筹码流转逻辑
     * @param {*} betArea 
     */
    chipsMoveByArea: function(betArea){
        var chips = betArea.children

        var zhuangNodePosition = betArea.convertToNodeSpaceAR(this.getZhuangPosition())
        
        chips.forEach(chip => {
            var index = betArea.getSiblingIndex()
            var move
            var moveToPlayes = cc.moveTo(0.4,betArea.convertToNodeSpaceAR(this.getPlayersPosition()))
            if(index == this.betArea.getSiblingIndex()){
                var move = cc.sequence(cc.delayTime(1.8),moveToPlayes)   
            }else{
                var moveToZhuang = cc.moveTo(0.4,zhuangNodePosition)
                var moveToWin = cc.moveTo(0.4,betArea.convertToNodeSpaceAR(this.betArea.convertToWorldSpaceAR(this.getPositionAtBetArea())))
                var move = cc.sequence(moveToZhuang,cc.delayTime(0.5),moveToWin,cc.delayTime(0.5),moveToPlayes)   
            }
            chip.runAction(move)
        });
    },

    /**
     * 步骤六：播放筹码流转
     */
    chipsMove: function(){
        if(this.betArea == null) return
        var betAreas = this.betArea.parent.children
        betAreas.forEach(betArea => {
            this.chipsMoveByArea(betArea)
        });

        // 左侧添加记录，加减分
        this.makeRecord()
        this.showWinNum()

        this._timer = setTimeout(()=>{
            
            betAreas.forEach(area => {
                area.removeAllChildren();
            })
            clearTimeout(this._timer)
        },4000)
        
    },

    /**
     * 步骤五：进入结算阶段，结算数据准备
     */
    enterResult: function(){
        //console.log('countResult')
        var mo = this.carIndex % 8
        var media
        switch(mo){
            case 0: 
                this.betAreaIndex = 7
                media = 'bmw_result_1.mp3'
                break;
            case 1: 
                this.betAreaIndex = 6
                media = 'bmw_result_2.mp3'
                break;
            case 2: 
                this.betAreaIndex = 5
                media = 'bmw_result_3.mp3'
                break;
            case 3: 
                this.betAreaIndex = 4
                media = 'bmw_result_4.mp3'
                break;
            case 4: 
                this.betAreaIndex = 3
                media = 'bmw_result_5.mp3'
                break;
            case 5: 
                this.betAreaIndex = 2
                media = 'bmw_result_6.mp3'
                break;
            case 6: 
                this.betAreaIndex = 1
                media = 'bmw_result_7.mp3'
                break;
            case 7: 
                this.betAreaIndex = 0
                media = 'bmw_result_8.mp3'
                break;
        }

        var audio = cc.url.raw("resources/BMWGame/Sound/" + media);
        cc.audioEngine.playEffect(audio,false);

        //console.log('betAreaIndex:' + this.betAreaIndex)

        var betParent = cc.find('Canvas/content/middle/center/table/bet')
        this.betArea = betParent.children[this.betAreaIndex]
        //console.log(betParent)

        var clothParent = cc.find('Canvas/content/middle/center/table/cloth')
        //console.log(clothParent)
        var cloths = clothParent.children
        cloths.forEach(e => {
            var index = e.getSiblingIndex()
            var cloth = e.getChildByName('clickcloth')
            if(index == this.betAreaIndex){
                cloth.active = true
            }else{
                cloth.active = false
            }
        });

        audio = cc.url.raw("resources/BMWGame/Sound/rewards.mp3");
        cc.audioEngine.playEffect(audio,false);

        this.chipsMove()
    },

    /**
     * 步骤四：播放跑动动画
     */
    turn(){
        var cars = this.track.children;
        var index = this.carIndex;
        //console.log('index:' + index)
        var total = this.totalNum
        var i = 0
        var audio = cc.url.raw("resources/BMWGame/Sound/circle.mp3");

        var func = ()=> {
            var car = cars[index]
            if(!car) return
            var animation = car.getComponent(cc.Animation)
            if(i == total){
                var bg = car.getChildByName('bg')
                bg.opacity = 255
                animation.onCount = function(){
                    this.enterResult()
                }.bind(this)
                animation.play('CarStop')
                clearInterval(this._timer)

                // console.log('carIndex: ' + this.carIndex)
                return
            }else{
                animation.play('CarBg')
                if(i==6){
                    clearInterval(this._timer)
                    //timer = setInterval(func,2000/(total-10))
                    this._timer = setInterval(func,30)
                }
                if(i==total-6){
                    clearInterval(this._timer)
                    this._timer = setInterval(func,200)
                }
            }   
            cc.audioEngine.playEffect(audio,false);
            index ++
            i++
             
            if(index >= cars.length){
                 index = 0
             }

             //console.log('index:' + index)
             this.carIndex = index
             //console.log('catIndex:' + _this.carIndex)
        }

        this._timer = setInterval(func,200)
    },

    // update (dt) {},

    onTurn(){
        this.turn()
    },

    /**
     * 步骤三： 播放停止下注动画
     */
    stopBet: function(){
        // var startNode = this.tip.getChildByName('start')
        var stopNode = cc.find('Canvas/content/tip/stop')
        stopNode.active = true
        // console.log(stopNode)
        var animation = stopNode.getComponent(cc.Animation)
        // console.log(animation)
        animation.betStop = function(){
            this.turn()
            // console.log('bet stop')
        }.bind(this)
        animation.play("TipStop")

        var audio = cc.url.raw("resources/BMWGame/Sound/stopBet.mp3");
        cc.audioEngine.playEffect(audio,false);
    },

    /**
     * 步骤二： 下注到计时
     */
    chipTime: function(){
        this.timer.active = true
        var timeLabel = this.timer.getChildByName('time').getComponent(cc.Label)
        var num = 10;
        timeLabel.string = num
        this._timer = setInterval(function(){
            num --;
            timeLabel.string = num
            if(num == 0){
                this.stopBet()
                clearInterval(this._timer)
                this.timer.active = false
            }
        }.bind(this),1000)
    },

    /**
     * 流程入口
     * 步骤一： 播放开始下注动画
     */
    startBet: function(){
        // var startNode = this.tip.getChildByName('start')
        var startNode = cc.find('Canvas/content/tip/start')
        startNode.active = true
        // console.log(startNode)
        var animation = startNode.getComponent(cc.Animation)
        // console.log(animation)
        animation.betStart = function(){
            this.chipTime()
            // console.log('bet start')
        }.bind(this)
        animation.play("TipStart")
        
        //播放间效
        var audio = cc.url.raw("resources/BMWGame/Sound/startBet.mp3");
        cc.audioEngine.playEffect(audio,false);
    },

    /**
     * 设置按钮事件
     */
    onSet(){
        this.startBet()
        // console.log(this.carIndex)
    },

    /**
     * 指定下注区域
     * @param {*} event 
     * @param {*} data 
     */
    onTableClick(event,data) {
        // console.log('onTableClick')
        // console.log(event)
        var part = event.target
        var parent = part.parent
        var children = parent.children
        this.betAreaShape = data
        this.betAreaIndex = part.getSiblingIndex()
        var table = parent.parent
        var betArea = table.getChildByName('bet').children[this.betAreaIndex]

        children.forEach(element => {
            // console.log(element)
            var betCloth = element.getChildByName('clickcloth')
            //var betArea = element.getChildByName('betArea')
            if(element == part){
                betCloth.active = true
                this.betArea = betArea
            }else{
                betCloth.active = false
            }
        });
    },

    /**
     * 获取用户世界坐标
     */
    getHeadPosition(){
        var rst = this.head.convertToWorldSpaceAR(cc.v2(0, 0));
        //console.log('head:' + rst.x + ':' + rst.y)
        return rst
    },

    /**
     * 获取当前指定区域随机节点坐标
     */
    getPositionAtBetArea(){
        var rst
        if(this.betAreaIndex % 4 == 3){
            rst = cc.v2((Math.random()-0.5) * 2 * 30 - 20 ,(Math.random()-0.5) * 2 * 30)
        }else{
            rst = cc.v2((Math.random()-0.5) * 2 * 30,(Math.random()-0.5) * 2 * 30)
        }

        return rst
    },

    /**
     * 点击筹码下注
     * @param {*} event 
     * @param {*} data 
     */
    onChipClick(event,data){
        // var node = event.target
        // var btn = node.getComponent(cc.Button)
        // btn.color = cc.color(124, 124, 124)
        // btn.enabled = false
        //console.log(data)
        if(!this.betArea){
            console.log('请先选中下注区域')
            return
        }

        var chip 
        if(data == '1'){
            chip = cc.instantiate(this.prefab_chip_1)
        }
        if(data == '10'){
            chip = cc.instantiate(this.prefab_chip_10)
        }
        if(data == '50'){
            chip = cc.instantiate(this.prefab_chip_50)
        }
        if(data == '100'){
            chip = cc.instantiate(this.prefab_chip_100)
        }
        if(data == '300'){
            chip = cc.instantiate(this.prefab_chip_300)
        }
        chip.setParent(this.betArea)
        chip.scale = 0.4

        // 移动需要先把位置转化到同一参照节点下
        // 先把plays的坐标转化到世界坐标，再转化到betArea节点下的坐标
        // 同一参照节点为betArea
        var headPosition = this.getHeadPosition()
        var startPosition = this.betArea.convertToNodeSpaceAR(headPosition)
        chip.position = startPosition

        var endPosition = this.getPositionAtBetArea();
        var moveTo = cc.moveTo(0.4,endPosition)
        var rotateBy = cc.rotateBy(0.2,360)
        chip.runAction(cc.sequence(moveTo,rotateBy))

        var audio = cc.url.raw("resources/BMWGame/Sound/betSound.mp3");
        cc.audioEngine.playEffect(audio,false);
        //console.log(this.betArea)
    },

    /**
     * 获取玩家列表世界坐标
     */
    getPlayersPosition(){
        //console.log(this.players)
        return this.players.convertToWorldSpaceAR(cc.v2(0, 0));
    },


    /**
     * 模拟玩家下注
     * @param {s} event 
     * @param {*} data 
     */
    onPlayersClick(event,data){
        if(!this.betArea){
            console.log('请先选中下注区域')
            return
        }

        var chip = cc.instantiate(this.prefab_chip_1)
        chip.parent = this.betArea
        chip.scale = 0.4
        
        // 移动需要先把位置转化到同一参照节点下
        // 先把plays的坐标转化到世界坐标，再转化到betArea节点下的坐标
        // 同一参照节点为betArea
        var playersPosition = this.getPlayersPosition()
        var startPosition = this.betArea.convertToNodeSpaceAR(playersPosition);
        chip.position = startPosition

        var endPosition = this.getPositionAtBetArea();
        var moveTo = cc.moveTo(0.4,endPosition)
        var rotateBy = cc.rotateBy(0.2,360)
        chip.runAction(cc.sequence(moveTo,rotateBy))
    },
    
    onBetStart: function(){
        // console.log('start bet')
    },

    onBtnReturnClick: function(){
        cc.director.loadScene('HallScene')
    },
});
