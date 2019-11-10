import { PluginFunction } from 'vue'

const { ipcRenderer } = window.node.electron
const fs = window.node.fs
const path = window.node.path

const { iconDir } = window.preload.getPath

// const gameHostBase = 'http://storage.game.starlight-stage.jp/dl/resources'
const imgHostBase = 'https://truecolor.kirara.ca'
// const getBgmUrl = (hash: string) => `${gameHostBase}/High/Sound/Common/b/${hash}`
// const getLiveUrl = (hash: string) => `${gameHostBase}/High/Sound/Common/l/${hash}`
// const getVoiceUrl = (hash: string) => `${gameHostBase}/High/Sound/Common/v/${hash}`
// const getAcbUrl = (bORl: string, hash: string) => `${gameHostBase}/High/Sound/Common/${bORl}/${hash}`
// const getUnityUrl = (hash: string) => `${gameHostBase}/High/AssetBundles/Android/${hash}`
// const getDbUrl = (hash: string) => `${gameHostBase}/Generic/${hash}`
// const getCardUrl = (id: string | number) => `${imgHostBase}/spread/${id}.png`
const getIconUrl = (id: string | number): string => `${imgHostBase}/icon_card/${id}.png`

const install: PluginFunction<undefined> = function (Vue) {
  // 全局属性
  Vue.prototype.event = new Vue({}) // 全局事件总站
  Vue.prototype.bgm = new Audio() // 背景音乐
  Vue.prototype.enterSe = new Audio('../../asset/se.asar/se_common_enter.mp3') // 确认音效
  Vue.prototype.cancelSe = new Audio('../../asset/se.asar/se_common_cancel.mp3') // 取消音效
  Vue.prototype.configurer = window.preload.configurer
  Vue.prototype.core = window.node.mishiroCore
  Vue.prototype.updater = window.preload.updater

  // 全局方法
  Vue.prototype.playSe = function (se: HTMLAudioElement) { // 播放音效
    se.currentTime = 0
    setTimeout(() => {
      se.play().catch(err => console.log(err))
    }, 0)
  }
  // Vue.prototype.createCardBackgroundTask = function (cardIdArr: number[]) {
  //   let task = []
  //   for (let i = 0; i < cardIdArr.length; i++) {
  //     task.push([getCardUrl(cardIdArr[i]), cardDir(`bg_${cardIdArr[i]}.png`)])
  //   }
  //   return task
  // }
  Vue.prototype.createCardIconTask = function (cardIdArr: number[]) {
    const task = []
    for (let i = 0; i < cardIdArr.length; i++) {
      task.push([getIconUrl(cardIdArr[i]), iconDir(`card_${cardIdArr[i]}_m.png`)])
    }
    return task
  }
  // Vue.prototype.getBgmUrl = getBgmUrl
  // Vue.prototype.getLiveUrl = getLiveUrl
  // Vue.prototype.getVoiceUrl = getVoiceUrl
  // Vue.prototype.getAcbUrl = getAcbUrl
  // Vue.prototype.getUnityUrl = getUnityUrl
  // Vue.prototype.getDbUrl = getDbUrl
  // Vue.prototype.getCardUrl = getCardUrl
  Vue.prototype.getIconUrl = getIconUrl
  Vue.prototype.mainWindowId = ipcRenderer.sendSync('mainWindowId')
  Vue.prototype.acb2mp3 = async function (acbPath: string, rename?: string, onProgress?: (current: number, total: number, prog: import('mishiro-core').ProgressInfo) => void) {
    const mp3list = await window.node.mishiroCore.audio.acb2mp3(acbPath, undefined, onProgress)
    const mp3 = mp3list[0]
    const dest = path.join(path.dirname(acbPath), rename || path.basename(mp3))
    const awbPath = path.join(path.dirname(acbPath), path.parse(acbPath).name + '.awb')
    await fs.move(mp3, dest)
    await Promise.all([
      fs.remove(path.dirname(mp3)),
      fs.remove(acbPath),
      fs.existsSync(awbPath) ? fs.remove(awbPath) : Promise.resolve()
    ])
    return dest
  }
}

export default {
  install
}
