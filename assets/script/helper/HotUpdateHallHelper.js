cc.Class({
    extends: cc.Component,

    properties: {
        // _storagePath: '',
        // _am: null,

        tipLable: {
            type: cc.Label,
            default: null,
        },
        perLable: {
            type: cc.Label,
            default: null,
        },
        progressBar: {
            type: cc.ProgressBar,
            default: null,
        }
    },

    // onLoad () {},

    start () {
        //this.checkUpdate()
    },

    afterHotUpdate: function(){
        cc.director.loadScene('LoginScene')
    },
 
    _initAssetsManager: function(){
        this.tipLable.string = '_initAssetsManager'
        this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + "update/hall" );

        let versionCompare = function(versionA,versionB){
            cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            this._currentVersion = versionA ;
            this._latestVersion  = versionB ;
            let rst = 0
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) { 
                    continue;  
                }else { 
                    rst = a - b; 
                    break
                }
            }
            if(rst == 0){
                if (vB.length > vA.length) {  
                    rst = -1; 
                }
            }

            if(rst < 0){
                jsb.fileUtils.removeDirectory(this._storagePath);
            }

            return rst
        }

        this._am = new jsb.AssetsManager('', this._storagePath , versionCompare.bind(this) );
    },

    checkUpdate: function(){
        if ( !cc.sys.isNative){
            this.afterHotUpdate();
            return;
        }

        this.tipLable.string = 'checkUpdate'
        this._initAssetsManager()
        /**
         * 
         * 由于下载过程中仍然有小概率可能由于网络原因或其他网络库的问题导致下载的文件内容有问题，所以我们提供了用户文件校验接口，在文件下载完成后热更新管理器会调用这个接口（用户实现的情况下），如果返回 true 表示文件正常，返回 false 表示文件有问题
         * 
         */
        let verifyCb = function(path, asset){
            // Setup the verification callback, but we don't have md5 check function yet, so only print some message
            // Return true if the verification passed, otherwise return false
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            if (compressed) {
                cc.log(("Verification passed : " + relativePath));
                return true;
            }
            else {
                cc.log(("Verification passed : " + relativePath + ' (' + expectedMD5 + ')'));
                return true;
            }
        }
        this._am.setVerifyCallback(verifyCb)
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this._am.setMaxConcurrentTask( 5);
        }
        this._checkUpdate()
    },

    _checkUpdate: function(){
        this.tipLable.string = '_checkUpdate'
        //let hotUpdateUrl = cc.custom.global.hotUpdateServer
        let hotUpdateUrl = 'http://192.168.2.19:8000/update/hall'
        let customManifestStr = JSON.stringify({
            "packageUrl": hotUpdateUrl,
            "remoteManifestUrl": hotUpdateUrl + "/project.manifest",
            "remoteVersionUrl": hotUpdateUrl + "/version.manifest",
            "version": "0.0.1",
            // "version": cc.custom.global.version,
            "assets": {},
            "searchPaths": []
        });

        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            cc.log('AAAAAA Failed to load local manifest ...')
            var manifest = new jsb.Manifest(customManifestStr, this._storagePath);
            this._am.loadLocalManifest(manifest, this._storagePath);
        }
        this._am.setEventCallback(this._checkUpdateCb.bind(this));
        this._am.checkUpdate();
    },

    _checkUpdateCb: function(event){
        this.tipLable.string = '_checkUpdateCb'
        let doUpdate = false
        this.tipLable.string = event.getEventCode()
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.tipLable.string = jsb.EventAssetsManager.ALREADY_UP_TO_DATE
                this.tipLable.string = "已经是最新版";
                this.afterHotUpdate()
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                this.tipLable.string = jsb.EventAssetsManager.NEW_VERSION_FOUND
                this.progressBar.progress = 0 ;
                doUpdate = true
                break;
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.tipLable.string = "下载失败，请检查网络";
                break;
            default:
        }
        this._assetsMgr.setEventCallback(null);
        if(doUpdate){
            this.hotUpdate();
        }
    },

    hotUpdate: function(){
        this.tipLable.string = 'hotUpdate'
        if(this._am){
            this._am.setEventCallback(this._hotUpdateCb.bind(this))
            if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
                this._am.loadLocalManifest(this._storagePath);
            }
            this._am.update();
        }
    },

    _hotUpdateCb: function(){
        this.tipLable.string = '_hotUpdateCb'
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                this.progressBar.progress = event.getPercent();
                // this.lbPer.string = event.getDownloadedBytes() + ' / ' + event.getTotalBytes();
                let per = (event.getPercent() * 100).toFixed(2)  ;
                this.perLable.string  = per + '%';
                //this.lbInfo.string = '已下载文件: ' + event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                this.tipLable.string = '资源加载中,精彩即将开启···';
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.tipLable.string = '更新完成：' + event.getMessage();
                // needRestart = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.tipLable.string = '已经是最新版';
                // failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                 this.tipLable.string = '更新失败： ' + event.getMessage();
                // this._updating = false;
                // this._canRetry = true;
                // failed = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this._faildRes = event.getAssetId();
                this.tipLable.string = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                // failed = true;
                break;
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.tipLable.string = 'ERROR_NO_LOCAL_MANIFEST';
                break
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                this.tipLable.string = 'ERROR_DOWNLOAD_MANIFEST';
                break
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.tipLable.string = 'ERROR_PARSE_MANIFEST';
                break
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.tipLable.string = '下载失败，请检查网络';
                // failed = true;
                break;
        }

        this._am.setEventCallback(null);

        var searchPaths = jsb.fileUtils.getSearchPaths();
        var newPaths = this._am.getLocalManifest().getSearchPaths();
        Array.prototype.unshift(searchPaths, newPaths);
        jsb.fileUtils.setSearchPaths(searchPaths);

        // cc.custom.global.version = this._am.getRemoteManifest().getVersion()
        console.log('update to version:' + this._am.getRemoteManifest().getVersion())
        //cc.sys.localStorage.setItem("globalData", cc.custom.global);

        cc.audioEngine.stopAll();
        cc.game.restart();
    }


    // update (dt) {},
});
