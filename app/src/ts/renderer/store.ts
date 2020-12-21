import Vue from 'vue'
import Vuex from 'vuex'

import { MasterData } from './back/on-master-read'

Vue.use(Vuex)

export enum Action {
  SET_RES_VER = 'SET_RES_VER',
  SET_LATEST_RES_VER = 'SET_LATEST_RES_VER',
  SET_MASTER = 'SET_MASTER'
}

const store = new Vuex.Store<{
  resVer: number
  latestResVer: number
  master: Partial<MasterData>
}>({
  state: {
    resVer: -1,
    latestResVer: -1,
    master: {}
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
    }
  }
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
