// import TheCombo from '../../vue/component/TheCombo.vue'
// import TheLiveGauge from '../../vue/component/TheLiveGauge.vue'
// import { liveResult, Game } from './game'
// import { Vue, Component } from 'vue-property-decorator'
// import { Event } from 'electron'

// @Component({
//   components: {
//     TheCombo,
//     TheLiveGauge
//   }
// })
// export default class extends Vue {
//   liveResult = liveResult
//   mounted () {
//     this.$nextTick(() => {
//       window.node.electron.ipcRenderer.once('start', (_event: Event, song: any, fromWindowId: number) => {
//         Game.start(song, fromWindowId)
//       })
//       Game.init()
//     })
//   }
// }
