import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { Configurer } from '../js/common/config';

declare module 'vue/types/vue' {
  interface Vue {
    _i18n: { _vm: VueI18n }
    event: Vue
    playSe: (se: HTMLAudioElement) => void
    bgm: HTMLAudioElement
    enterSe: HTMLAudioElement
    cancelSe: HTMLAudioElement
    lz4dec: (input: string, output?: string) => string
    configurer: Configurer
    createCardIconTask: (cardIdArr: number[]) => string[][]

    getBgmUrl: (hash: string) => string
    getLiveUrl: (hash: string) => string
    getVoiceUrl: (hash: string) => string
    getAcbUrl: (bORl: string, hash: string) => string
    getUnityUrl: (hash: string) => string
    getDbUrl: (hash: string) => string
    getCardUrl: (id: string | number) => string
    getIconUrl: (id: string | number) => string
  }
}
