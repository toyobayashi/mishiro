import Vue from 'vue'
import Vuex from 'vuex'

import { MasterData } from './back/on-master-read'

const { ipcRenderer } = window.node.electron

Vue.use(Vuex)

export enum Action {
  SET_RES_VER = 'SET_RES_VER',
  SET_LATEST_RES_VER = 'SET_LATEST_RES_VER',
  SET_MASTER = 'SET_MASTER',
  SET_BATCH_DOWNLOADING = 'SET_BATCH_DOWNLOADING',
  SET_BATCH_STATUS = 'SET_BATCH_STATUS',
}

const store = new Vuex.Store<{
  resVer: number
  latestResVer: number
  master: Partial<MasterData>
  // batchDownloading: boolean
  batchStatus: {
    name: string
    status: string
    curprog: number
    totalprog: number
  }
}>({
  state: {
    resVer: -1,
    latestResVer: -1,
    master: {},

    // batchDownloading: false,
    batchStatus: {
      name: '',
      status: '',
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
      state.batchStatus.curprog = status.curprog ?? 0
      state.batchStatus.totalprog = status.totalprog ?? 0
    }
  }
})

// ipcRenderer.on('setBatchDownloading', (_event, payload) => {
//   store.commit(Action.SET_BATCH_DOWNLOADING, payload)
// })

ipcRenderer.on('setBatchStatus', (_event, status) => {
  store.commit(Action.SET_BATCH_STATUS, status)
})

export function setResVer (resVer: number): void {
  store.commit(Action.SET_RES_VER, resVer)
}

export function setLatestResVer (resVer: number): void {
  store.commit(Action.SET_LATEST_RES_VER, resVer)
}

export function setMaster (master: MasterData): void {
  store.commit(Action.SET_MASTER, master)
}

export default store
