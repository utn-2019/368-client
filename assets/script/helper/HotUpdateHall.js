// Custom manifest removed the following assets:
// 1. res/raw-assets/2a/2a40e5e7-4c4a-4350-9e5d-76757755cdd2.png
// 2. res/raw-assets/2d/2d86a854-63c4-4b90-8b88-a4328b8526c2.png
// So when custom manifest used, you should be able to find them in downloaded remote assets
var customManifestStr = JSON.stringify({
    "packageUrl": "http://192.168.2.32:8000/update/hall/",
    "remoteManifestUrl": "http://192.168.2.32:8000/update/hall/project.manifest",
    "remoteVersionUrl": "http://192.168.2.32:8000/update/hall/version.manifest",
    "version": "0.0.1",
    "assets": {},
    "searchPaths": []
});
// var customManifestStr = JSON.stringify({
//     "packageUrl": "http://368.yuuyoo.com/update/hall/",
//     "remoteManifestUrl": "http://368.yuuyoo.com/update/hall/project.manifest",
//     "remoteVersionUrl": "http://368.yuuyoo.com/update/hall/version.manifest",
//     "version": "0.0.1",
//     "assets": {},
//     "searchPaths": []
// });

// var customManifestStr = JSON.stringify({
//     "packageUrl": "http://192.168.43.67:8000/update/hall/",
//     "remoteManifestUrl": "http://192.168.43.67:8000/update/hall/project.manifest",
//     "remoteVersionUrl": "http://192.168.43.67:8000/update/hall/version.manifest",
//     "version": "0.0.1",
//     "assets": {},
//     "searchPaths": []
// });

cc.Class({
    extends: cc.Component,

    properties: {
        // panel: UpdatePanel,
        manifestUrl: {
            type: cc.Asset,
            default: null
        },
        // updateUI: cc.Node,
        _updating: false,
        _canRetry: false,
        _storagePath: '',

        _tipLabel: null,
        _progressBar: null,
        _tipPer: null,
    },

    next: function(){
        cc.director.loadScene('LoginScene');
    },

    checkCb: function (event) {
        cc.log(this._am.getLocalManifest())
        cc.log('Code: ' + event.getEventCode());
        let hasNewVersion = false
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                //this.panel.info.string = "No local manifest file found, hot update skipped.";
                cc.log('No local manifest file found, hot update skipped.')
                this._tipLabel.string = '文件被破坏，卸载并重新下载'
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                //this.panel.info.string = "Fail to download manifest file, hot update skipped.";
                cc.log('Fail to download manifest file, hot update skipped.')
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                //this.panel.info.string = "Already up to date with the latest remote version.";
                cc.log('Already up to date with the latest remote version.')
                this._tipLabel.string = '已是最新版本，正在进入...'
                this.next()
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                // this.panel.info.string = 'New version found, please try to update.';
                // this.panel.checkBtn.active = false;
                // this.panel.fileProgress.progress = 0;
                // this.panel.byteProgress.progress = 0;
                cc.log('New version found, please try to update.')
                this._tipLabel.string = '发现新版本，开始更新...'
                cc.find('Canvas/content/progressBar').active = true
                this._tipPer.string = '0%'
                hasNewVersion = true
                break;
            default:
                return;
        }
        
        this._am.setEventCallback(null);
        this._checkListener = null;
        this._updating = false;

        if(hasNewVersion){
            this.hotUpdate()
        }
    },

    updateCb: function (event) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                // this.panel.info.string = 'No local manifest file found, hot update skipped.';
                cc.log('No local manifest file found, hot update skipped.')
                this._tipLabel.string = '文件被破坏，卸载并重新下载'
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                // this.panel.byteProgress.progress = event.getPercent();
                // this.panel.fileProgress.progress = event.getPercentByFile();

                // this.panel.fileLabel.string = event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                // this.panel.byteLabel.string = event.getDownloadedBytes() + ' / ' + event.getTotalBytes();
                cc.log(event.getDownloadedBytes() + ' / ' + event.getTotalBytes())
                var msg = event.getMessage();
                if (msg) {
                    cc.log('Updated file: ' + msg)
                    // this.panel.info.string = 'Updated file: ' + msg;
                    // cc.log(event.getPercent()/100 + '% : ' + msg);
                }
                this._progressBar.progress = event.getPercent()
                this._tipPer.string = (event.getPercent().toFixed(4) * 100) + '%'
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                cc.log('Fail to download manifest file, hot update skipped.')
                // this.panel.info.string = 'Fail to download manifest file, hot update skipped.';
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log('Already up to date with the latest remote version.')
                // this.panel.info.string = 'Already up to date with the latest remote version.';
                this._tipLabel.string = '已是最新版本，正在进入...'
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                cc.log('Update finished. ' + event.getMessage())
                // this.panel.info.string = 'Update finished. ' + event.getMessage();
                this._tipLabel.string = '更新完成，即将重启...'
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                cc.log('Update failed. ' + event.getMessage())
                // this.panel.info.string = 'Update failed. ' + event.getMessage();
                // this.panel.retryBtn.active = true;
                this._tipLabel.string = '更新失败...'
                this._updating = false;
                this._canRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                cc.log('Asset update error: ' + event.getAssetId() + ', ' + event.getMessage())
                this._tipLabel.string = '更新失败...'
                // this.panel.info.string = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                cc.log(event.getMessage())
                this._tipLabel.string = '更新失败...'
                // this.panel.info.string = event.getMessage();
                break;
            default:
                break;
        }

        if (failed) {
            this._am.setEventCallback(null);
            this._updateListener = null;
            this._updating = false;
        }

        if (needRestart) {
            this._am.setEventCallback(null);
            this._updateListener = null;
            // Prepend the manifest's search path
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            cc.log(JSON.stringify(newPaths));
            Array.prototype.unshift.apply(searchPaths, newPaths);
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            //cc.log('version:' + this._am.getRemoteManifest().getVersion())

            cc.audioEngine.stopAll();
            cc.game.restart();
        }
    },

    loadCustomManifest: function () {
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            var manifest = new jsb.Manifest(customManifestStr, this._storagePath);
            this._am.loadLocalManifest(manifest, this._storagePath);
            // this.panel.info.string = 'Using custom manifest';
            cc.log('Using custom manifest')
        }
    },
    
    retry: function () {
        if (!this._updating && this._canRetry) {
            // this.panel.retryBtn.active = false;
            this._canRetry = false;
            
            cc.log('Retry failed Assets...')
            // this.panel.info.string = 'Retry failed Assets...';
            this._am.downloadFailedAssets();
        }
    },
    
    checkUpdate: function () {
        if (this._updating) {
            cc.log('Checking or updating ...')
            // this.panel.info.string = 'Checking or updating ...';
            return;
        }
        this.loadCustomManifest()
        // if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
        //     // Resolve md5 url
        //     var url = this.manifestUrl.nativeUrl;
        //     if (cc.loader.md5Pipe) {
        //         url = cc.loader.md5Pipe.transformURL(url);
        //     }
        //     this._am.loadLocalManifest(url);
        // }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            // this.panel.info.string = 'Failed to load local manifest ...';
            cc.log('Failed to load local manifest ...')
            return;
        }
        this._am.setEventCallback(this.checkCb.bind(this));

        this._am.checkUpdate();
        this._updating = true;
    },

    hotUpdate: function () {
        if (this._am && !this._updating) {
            this._am.setEventCallback(this.updateCb.bind(this));

            this.loadCustomManifest()
            // if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            //     // Resolve md5 url
            //     var url = this.manifestUrl.nativeUrl;
            //     if (cc.loader.md5Pipe) {
            //         url = cc.loader.md5Pipe.transformURL(url);
            //     }
            //     this._am.loadLocalManifest(url);
            // }

            this._failCount = 0;
            this._am.update();
            // this.panel.updateBtn.active = false;
            this._updating = true;
        }
    },
    
    show: function () {
        // if (this.updateUI.active === false) {
        //     this.updateUI.active = true;
        // }
    },

    // use this for initialization
    onLoad: function () {
        // Hot update is only available in Native build
        if (!cc.sys.isNative) {
            return;
        }
        this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'blackjack-remote-asset');
        cc.log('Storage path for remote asset : ' + this._storagePath);

        // Setup your own version compare handler, versionA and B is versions in string
        // if the return value greater than 0, versionA is greater than B,
        // if the return value equals 0, versionA equals to B,
        // if the return value smaller than 0, versionA is smaller than B.
        this.versionCompareHandle = function (versionA, versionB) {
            cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                }
                else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            }
            else {
                return 0;
            }
        };

        // Init with empty manifest url for testing custom manifest
        this._am = new jsb.AssetsManager('', this._storagePath, this.versionCompareHandle);

        var panel = this.panel;
        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this._am.setVerifyCallback(function (path, asset) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            if (compressed) {
                cc.log("Verification passed : " + relativePath)
                // panel.info.string = "Verification passed : " + relativePath;
                return true;
            }
            else {
                cc.log("Verification passed : " + relativePath + ' (' + expectedMD5 + ')')
                // panel.info.string = "Verification passed : " + relativePath + ' (' + expectedMD5 + ')';
                return true;
            }
        });
 
        cc.log('Hot update is ready, please check or directly update.')
        // this.panel.info.string = 'Hot update is ready, please check or directly update.';

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            this._am.setMaxConcurrentTask(2);
            // this.panel.info.string = "Max concurrent tasks count have been limited to 2";
            cc.log('Max concurrent tasks count have been limited to 2')
        }
        
        // this.panel.fileProgress.progress = 0;
        // this.panel.byteProgress.progress = 0;
        this._tipLabel = cc.find('Canvas/content/tipLb').getComponent(cc.Label)
        this._progressBar = cc.find('Canvas/content/progressBar/loading').getComponent(cc.ProgressBar)
        this._tipPer = cc.find('Canvas/content/progressBar/perLb').getComponent(cc.Label)

        this._tipLabel.string = '系统检测,正在获取远程版本...'
        this._progressBar.progress = 0
        this._tipPer.string = '0'
    },

    start: function(){
        if(!cc.sys.isNative){
            this.next()
            return
        }
        this.checkUpdate()
       //cc.find('Canvas/content/progressBar').active = true
    },

    onBtnClick: function(){
        cc.log(this._tipPer.string)
        this._tipPer.string = parseFloat(this._tipPer.string) + 0.4
        this._progressBar.progress += 0.004
    },

    onDestroy: function () {
        if (this._updateListener) {
            this._am.setEventCallback(null);
            this._updateListener = null;
        }
    }
});