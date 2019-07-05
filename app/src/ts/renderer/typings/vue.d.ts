import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { Configurer } from './main'

declare module 'vue/types/vue' {
  interface Vue {
    _i18n: { _vm: VueI18n }
    event: Vue
    
    bgm: HTMLAudioElement
    enterSe: HTMLAudioElement
    cancelSe: HTMLAudioElement
    configurer: Configurer
    core: typeof import('mishiro-core')
    updater: import('electron-github-asar-updater')

    createCardIconTask: (cardIdArr: number[]) => string[][]
    playSe: (se: HTMLAudioElement) => void
    // getBgmUrl: (hash: string) => string
    // getLiveUrl: (hash: string) => string
    // getVoiceUrl: (hash: string) => string
    // getAcbUrl: (bORl: string, hash: string) => string
    // getUnityUrl: (hash: string) => string
    // getDbUrl: (hash: string) => string
    // getCardUrl: (id: string | number) => string
    getIconUrl: (id: string | number) => string
    mainWindowId: number
    acb2mp3: (acbPath: string, rename?: string) => Promise<string>
    // Downloader: typeof Downloader
  }
}
