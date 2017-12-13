import dl from "./download.js";
import lz4dec from "./lz4.js";

export default {
    install(Vue){
        // 全局属性
        Vue.prototype.event = new Vue({}); // 全局事件总站
        Vue.prototype.bgm = new Audio(); // 背景音乐
        Vue.prototype.enterSe = new Audio("./asset/sound/se/se_common_enter.mp3"); // 确认音效
        Vue.prototype.cancelSe = new Audio("./asset/sound/se/se_common_cancel.mp3"); // 取消音效

        // 全局方法
        Vue.prototype.dl = dl; // 下载
        Vue.prototype.lz4dec = lz4dec; // lz4解压
        Vue.prototype.playSe = function(se){ // 播放音效
            se.currentTime = 0;
            se.play();
        };
        Vue.prototype.createCardBackgroundTask = function(cardIdArr){
            let task = [];
            for(let i = 0; i < cardIdArr.length; i++){
                task.push([`https://hoshimoriuta.kirara.ca/spread/${cardIdArr[i]}.png`, getPath(`./public/img/card/bg_${cardIdArr[i]}.png`)]);
            }
            return task;
        };
    }
};
