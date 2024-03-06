import VueI18n from 'vue-i18n'
import type { MishiroAudio } from '../audio'

declare module 'vue/types/vue' {
  interface Vue {
    _i18n: { _vm: VueI18n }
    event: Vue

    // bgm: HTMLAudioElement
    bgm: MishiroAudio
    enterSe: HTMLAudioElement
    cancelSe: HTMLAudioElement

    core: typeof import('mishiro-core')

    createCardIconTask: (cardIdArr: number[]) => string[][]
    handleClientError: (err: Error, ignore?: boolean) => void
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
    acb2mp3: (acbPath: string, rename?: string, onProgress?: (current: number, total: number, prog: import('mishiro-core').ProgressInfo) => void) => Promise<string>
    acb2wav: (acbPath: string, rename?: string, onProgress?: (current: number, total: number, filename: string) => void) => Promise<string>
    acb2aac: (acbPath: string, rename?: string, onProgress?: (current: number, total: number, prog: import('mishiro-core').ProgressInfo) => void) => Promise<string>
    // Downloader: typeof Downloader
  }
}
