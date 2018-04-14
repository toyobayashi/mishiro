import lz4dec from './lz4'
import getPath from '../common/get-path'
import configurer from '../common/config'
import Vue, { VueConstructor } from 'Vue'

const gameHostBase = 'http://storage.game.starlight-stage.jp/dl/resources'
const imgHostBase = 'https://truecolor.kirara.ca'
const getBgmUrl = (hash: string) => `${gameHostBase}/High/Sound/Common/b/${hash}`
const getLiveUrl = (hash: string) => `${gameHostBase}/High/Sound/Common/l/${hash}`
const getVoiceUrl = (hash: string) => `${gameHostBase}/High/Sound/Common/v/${hash}`
const getAcbUrl = (bORl: string, hash: string) => `${gameHostBase}/High/Sound/Common/${bORl}/${hash}`
const getUnityUrl = (hash: string) => `${gameHostBase}/High/AssetBundles/Android/${hash}`
const getDbUrl = (hash: string) => `${gameHostBase}/Generic/${hash}`
const getCardUrl = (id: string | number) => `${imgHostBase}/spread/${id}.png`
const getIconUrl = (id: string | number) => `${imgHostBase}/icon_card/${id}.png`

export default {
  install (Vue: VueConstructor<Vue>) {
    // 全局属性
    Vue.prototype.event = new Vue({}) // 全局事件总站
    Vue.prototype.bgm = new Audio() // 背景音乐
    Vue.prototype.enterSe = new Audio('./asset/sound/se.asar/se_common_enter.mp3') // 确认音效
    Vue.prototype.cancelSe = new Audio('./asset/sound/se.asar/se_common_cancel.mp3') // 取消音效
    Vue.prototype.configurer = configurer

    // 全局方法
    Vue.prototype.lz4dec = lz4dec // lz4解压
    Vue.prototype.playSe = function (se: HTMLAudioElement) { // 播放音效
      se.currentTime = 0
      setTimeout(() => {
        se.play()
      }, 0)
    }
    Vue.prototype.createCardBackgroundTask = function (cardIdArr: number[]) {
      let task = []
      for (let i = 0; i < cardIdArr.length; i++) {
        task.push([getCardUrl(cardIdArr[i]), getPath(`./public/img/card/bg_${cardIdArr[i]}.png`)])
      }
      return task
    }
    Vue.prototype.createCardIconTask = function (cardIdArr: number[]) {
      let task = []
      for (let i = 0; i < cardIdArr.length; i++) {
        task.push([getIconUrl(cardIdArr[i]), getPath(`./public/img/icon/card_${cardIdArr[i]}_m.png`)])
      }
      return task
    }
    Vue.prototype.getBgmUrl = getBgmUrl
    Vue.prototype.getLiveUrl = getLiveUrl
    Vue.prototype.getVoiceUrl = getVoiceUrl
    Vue.prototype.getAcbUrl = getAcbUrl
    Vue.prototype.getUnityUrl = getUnityUrl
    Vue.prototype.getDbUrl = getDbUrl
    Vue.prototype.getCardUrl = getCardUrl
    Vue.prototype.getIconUrl = getIconUrl
  }
}
