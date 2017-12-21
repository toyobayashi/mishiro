import lz4dec from "./lz4.js";
import getPath from "./getPath.js";
import configurer from "./config.js";

const getBgmUrl = hash => `http://storage.game.starlight-stage.jp/dl/resources/High/Sound/Common/b/${hash}`;
const getLiveUrl = hash => `http://storage.game.starlight-stage.jp/dl/resources/High/Sound/Common/l/${hash}`;
const getAcbUrl = (bORl, hash) => `http://storage.game.starlight-stage.jp/dl/resources/High/Sound/Common/${bORl}/${hash}`;
const getUnityUrl = hash => `http://storage.game.starlight-stage.jp/dl/resources/High/AssetBundles/Android/${hash}`;
const getDbUrl = hash => `http://storage.game.starlight-stage.jp/dl/resources/Generic/${hash}`;
const getCardUrl = id => `https://hoshimoriuta.kirara.ca/spread/${id}.png`;
const getIconUrl = id => `https://hoshimoriuta.kirara.ca/icon_card/${id}.png`;

export default {
    install(Vue){
        // 全局属性
        Vue.prototype.event = new Vue({}); // 全局事件总站
        Vue.prototype.bgm = new Audio(); // 背景音乐
        Vue.prototype.enterSe = new Audio("./asset/sound/se/se_common_enter.mp3"); // 确认音效
        Vue.prototype.cancelSe = new Audio("./asset/sound/se/se_common_cancel.mp3"); // 取消音效
        Vue.prototype.configurer = configurer;

        // 全局方法
        Vue.prototype.lz4dec = lz4dec; // lz4解压
        Vue.prototype.playSe = function(se){ // 播放音效
            se.currentTime = 0;
            se.play();
        };
        Vue.prototype.createCardBackgroundTask = function(cardIdArr){
            let task = [];
            for(let i = 0; i < cardIdArr.length; i++){
                task.push([getCardUrl(cardIdArr[i]), getPath(`./public/img/card/bg_${cardIdArr[i]}.png`)]);
            }
            return task;
        };
        Vue.prototype.createCardIconTask = function(cardIdArr){
            let task = [];
            for(let i = 0; i < cardIdArr.length; i++){
                task.push([getIconUrl(cardIdArr[i]), getPath(`./public/img/icon/card_${cardIdArr[i]}_m.png`)]);
            }
            return task;
        };
        Vue.prototype.getBgmUrl = getBgmUrl;
        Vue.prototype.getLiveUrl = getLiveUrl;
        Vue.prototype.getAcbUrl = getAcbUrl;
        Vue.prototype.getUnityUrl = getUnityUrl;
        Vue.prototype.getDbUrl = getDbUrl;
        Vue.prototype.getCardUrl = getCardUrl;
        Vue.prototype.getIconUrl = getIconUrl;
    }
};
