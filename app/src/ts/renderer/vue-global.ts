import type { PluginFunction } from 'vue'
import getPath from '../common/get-path'
import { MishiroAudio } from './audio'
import { error } from './log'
const { ipcRenderer } = window.node.electron
const fs = window.node.fs
const path = window.node.path

const { iconDir } = getPath

// const gameHostBase = 'http://storage.game.starlight-stage.jp/dl/resources'
const imgHostBase = 'https://hidamarirhodonite.kirara.ca'
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
  // Vue.prototype.bgm = new Audio() // 背景音乐
  Vue.prototype.bgm = new MishiroAudio() // 背景音乐
  Vue.prototype.enterSe = new Audio('../../asset/se.asar/se_common_enter.mp3') // 确认音效
  Vue.prototype.cancelSe = new Audio('../../asset/se.asar/se_common_cancel.mp3') // 取消音效
  Vue.prototype.core = window.node.mishiroCore

  // 全局方法
  Vue.prototype.handleClientError = function (err: Error, ignore?: boolean) {
    if (err.message.includes('Error: 203')) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.accountBannedMessage'))
    } else {
      if (!ignore) {
        this.event.$emit('alert', this.$t('home.errorTitle'), err.message)
      }
    }
  }
  Vue.prototype.playSe = function (se: HTMLAudioElement) { // 播放音效
    se.currentTime = 0
    setTimeout(() => {
      se.play().catch(err => {
        console.error(err)
        error(`playSe: ${err.stack}`)
      })
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
  Vue.prototype.acb2wav = async function (acbPath: string, rename?: string, onProgress?: (current: number, total: number, filename: string) => void) {
    const wavList = await window.node.mishiroCore.audio.acb2wav(acbPath, onProgress)
    const wav = wavList[0]
    const dest = path.join(path.dirname(acbPath), rename || path.basename(wav))
    const awbPath = path.join(path.dirname(acbPath), path.parse(acbPath).name + '.awb')
    await fs.move(wav, dest)
    await Promise.all([
      fs.remove(path.dirname(wav)),
      fs.remove(acbPath),
      fs.existsSync(awbPath) ? fs.remove(awbPath) : Promise.resolve()
    ])
    return dest
  }
  Vue.prototype.acb2aac = async function (acbPath: string, rename?: string, onProgress?: (current: number, total: number, prog: import('mishiro-core').ProgressInfo) => void) {
    const aaclist = await window.node.mishiroCore.audio.acb2aac(acbPath, undefined, onProgress)
    const aac = aaclist[0]
    const dest = path.join(path.dirname(acbPath), rename || path.basename(aac))
    const awbPath = path.join(path.dirname(acbPath), path.parse(acbPath).name + '.awb')
    await fs.move(aac, dest)
    await Promise.all([
      fs.remove(path.dirname(aac)),
      fs.remove(acbPath),
      fs.existsSync(awbPath) ? fs.remove(awbPath) : Promise.resolve()
    ])
    return dest
  }
}

export default {
  install
}
