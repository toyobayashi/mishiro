import Vue from 'vue'
import Vuex from 'vuex'

import type { MasterData } from './back/on-master-read'
import type { BGM, Live } from './back/resolve-audio-manifest'

// const { ipcRenderer } = window.node.electron

Vue.use(Vuex)

export enum Action {
  SET_RES_VER = 'SET_RES_VER',
  SET_LATEST_RES_VER = 'SET_LATEST_RES_VER',
  SET_MASTER = 'SET_MASTER',
  SET_BATCH_DOWNLOADING = 'SET_BATCH_DOWNLOADING',
  SET_BATCH_STATUS = 'SET_BATCH_STATUS',
  SET_AUDIO_LIST = 'SET_AUDIO_LIST',
}

const store = new Vuex.Store<{
  resVer: number
  latestResVer: number
  master: Partial<MasterData>
  audioListData: BGM[] | Live[]
  // batchDownloading: boolean
  batchStatus: {
    name: string
    status: string
    status2: string
    curprog: number
    totalprog: number
  }
}>({
  state: {
    resVer: -1,
    latestResVer: -1,
    master: {},
    audioListData: [],

    // batchDownloading: false,
    batchStatus: {
      name: '',
      status: '',
      status2: '',
      curprog: 0,
      totalprog: 0
    }
  },
  mutations: {
    [Action.SET_RES_VER] (state, payload) {
      state.resVer = payload
    },
    [Action.SET_LATEST_RES_VER] (state, payload) {
      state.latestResVer = payload
    },
    [Action.SET_MASTER] (state, payload) {
      state.master = payload
    },
    // [Action.SET_BATCH_DOWNLOADING] (state, payload) {
    //   state.batchDownloading = payload
    // },
    [Action.SET_BATCH_STATUS] (state, status) {
      state.batchStatus.name = status.name ?? ''
      state.batchStatus.status = status.status ?? ''
      state.batchStatus.status2 = status.status2 ?? ''
      state.batchStatus.curprog = status.curprog ?? 0
      state.batchStatus.totalprog = status.totalprog ?? 0
    },
    [Action.SET_AUDIO_LIST] (state, list) {
      state.audioListData = list
    }
  }
})

// ipcRenderer.on('setBatchDownloading', (_event, payload) => {
//   store.commit(Action.SET_BATCH_DOWNLOADING, payload)
// })

// ipcRenderer.on('setBatchStatus', (_event, status) => {
//   store.commit(Action.SET_BATCH_STATUS, status)
// })

export function setResVer (resVer: number): void {
  store.commit(Action.SET_RES_VER, resVer)
}

export function setLatestResVer (resVer: number): void {
  store.commit(Action.SET_LATEST_RES_VER, resVer)
}

export function setMaster (master: MasterData): void {
  store.commit(Action.SET_MASTER, master)
  setAudioList(master.bgmManifest)
}

export function setAudioList (list: BGM[] | Live[]): void {
  store.commit(Action.SET_AUDIO_LIST, list)
}

export default store
