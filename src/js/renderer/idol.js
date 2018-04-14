import ProgressBar from '../../vue/component/ProgressBar.vue'
import TabSmall from '../../vue/component/TabSmall.vue'
import InputText from '../../vue/component/InputText.vue'
import Downloader from './downloader.js'
import getPath from '../common/get-path.ts'
import fs from 'fs'
import path from 'path'
import { ipcRenderer, shell } from 'electron'
const dler = new Downloader()

export default {
  components: {
    ProgressBar,
    TabSmall,
    InputText
  },
  data () {
    return {
      voice: new Audio(),
      queryString: '',
      searchResult: [],
      activeCard: {},
      activeCardPlus: {},
      information: {},
      imgProgress: 0,
      eventCard: [],
      currentPractice: 'idol.after',
      practice: {
        before: 'idol.before',
        after: 'idol.after'
      }
    }
  },
  props: {
    'master': {
      type: Object,
      require: true
    }
  },
  computed: {
    cardData () {
      return this.master.cardData
    },
    voiceManifest () {
      return this.master.voiceManifest
    },
    rarity () {
      switch (this.information.rarity) {
        case 1:
          return 'N'
        case 2:
          return 'N+'
        case 3:
          return 'R'
        case 4:
          return 'R+'
        case 5:
          return 'SR'
        case 6:
          return 'SR+'
        case 7:
          return 'SSR'
        case 8:
          return 'SSR+'
        default:
          return ''
      }
    },
    hp () {
      if (this.information.hp_min && this.information.hp_max && this.information.bonus_hp) {
        return this.information.hp_min + '～' + this.information.hp_max + ' (+' + this.information.bonus_hp + ')'
      } else {
        return ''
      }
    },
    vocal () {
      if (this.information.vocal_min && this.information.vocal_max && this.information.bonus_vocal) {
        return this.information.vocal_min + '～' + this.information.vocal_max + ' (+' + this.information.bonus_vocal + ')'
      } else {
        return ''
      }
    },
    dance () {
      if (this.information.dance_min && this.information.dance_max && this.information.bonus_dance) {
        return this.information.dance_min + '～' + this.information.dance_max + ' (+' + this.information.bonus_dance + ')'
      } else {
        return ''
      }
    },
    visual () {
      if (this.information.visual_min && this.information.visual_max && this.information.bonus_visual) {
        return this.information.visual_min + '～' + this.information.visual_max + ' (+' + this.information.bonus_visual + ')'
      } else {
        return ''
      }
    },
    solo () {
      if (this.information.solo_live !== undefined) {
        if (this.information.solo_live == 0) {
          return this.$t('idol.nashi')
        } else {
          return 'お願い！シンデレラ'
        }
      } else {
        return ''
      }
    }
  },
  methods: {
    query () {
      this.searchResult.length = 0
      this.playSe(this.enterSe)
      if (this.queryString) {
        for (let i = 0; i < this.cardData.length; i++) {
          const card = this.cardData[i]
          if (card.name.indexOf('＋') !== card.name.length - 1) {
            const re = new RegExp(this.queryString)
            if (re.test(card.name)) {
              this.searchResult.push(this.cardData[i])
              continue
            }
            if (re.test(card.charaData.name_kana)) {
              this.searchResult.push(this.cardData[i])
              continue
            }
            if (re.test(card.chara_id)) {
              this.searchResult.push(this.cardData[i])
              continue
            }
            if (re.test(card.id)) {
              this.searchResult.push(this.cardData[i])
              continue
            }
          }
        }
      } else {
        this.searchResult = [].concat(this.cardData.filter(card => (card.id == this.eventCard[0] || card.id == this.eventCard[1])))
      }
    },
    selectedIdol (card) {
      if (this.activeCard.id != card.id) {
        this.playSe(this.enterSe)
        this.activeCard = card
        this.information = card
        for (let i = 0; i < this.cardData.length; i++) {
          if (this.cardData[i].id == card.id + 1) {
            this.activeCardPlus = this.cardData[i]
            break
          }
        }

        this.currentPractice = 'idol.before'
        if (navigator.onLine) {
          this.changeBackground(card)
        }
      }
    },
    async changeBackground (card) {
      this.imgProgress = 0
      dler.stop()
      if (Number(card.rarity) > 4) {
        if (!fs.existsSync(getPath(`./public/img/card/bg_${card.id}.png`))) {
          let result = await this.downloadCard(card.id)
          this.imgProgress = 0
          if (result) {
            this.event.$emit('idolSelect', card.id)
          }
        } else {
          this.event.$emit('idolSelect', card.id)
        }
      } else {
        this.event.$emit('noBg')
      }
    },
    async downloadVoice () {
      this.playSe(this.enterSe)
      /* const charaData = this.master.charaData
      let voiceChara = []
      for (let i = 0; i < charaData.length; i++) {
        if (charaData[i].voice && charaData[i].chara_id > 2) voiceChara.push(charaData[i].chara_id)
      }
      for (let i = 0; i < voiceChara.length; i++) {
        let charaVoice = this.voiceManifest.filter(row => row.name === `v/chara_${voiceChara[i]}.acb`)[0]
        try {
          await dler.download(
            this.getVoiceUrl(charaVoice.hash),
            getPath(`./public/asset/sound/voiceacb/chara_${voiceChara[i]}.acb`),
            prog => { this.imgProgress = 100 / voiceChara.length * i + prog.loading / voiceChara.length }
          )
        } catch (e) {
          console.log(e)
        }
      }
      let acbs = fs.readdirSync(getPath('./public/asset/sound/voiceacb'))
      acbs.forEach((v, i) => {
        acbs[i] = path.join(getPath('./public/asset/sound/voiceacb'), v)
      })
      ipcRenderer.send('titleVoiceDec', acbs) */
      if (this.activeCard.charaData.voice) {
        let charaDl = null
        let cardDl = null
        let id = this.currentPractice === 'idol.after' ? this.activeCardPlus.id : this.activeCard.id
        let cid = this.activeCard.chara_id
        let cardVoice = this.voiceManifest.filter(row => row.name === `v/card_${id}.acb`)
        let charaVoice = this.voiceManifest.filter(row => row.name === `v/chara_${cid}.acb`)
        let cardDir = getPath(`./public/asset/sound/voice/card_${id}`)
        let charaDir = getPath(`./public/asset/sound/voice/chara_${cid}`)
        let cardExist = fs.existsSync(cardDir)
        let charaExist = fs.existsSync(charaDir)
        if (!charaExist) {
          fs.mkdirSync(charaDir)
          let hash = charaVoice[0].hash
          try {
            this.$refs.voiceBtn.setAttribute('disabled', 'disabled')
            charaDl = await dler.download(
              this.getVoiceUrl(hash),
              getPath(`./public/asset/sound/voice/chara_${cid}/chara_${cid}.acb`),
              prog => { this.imgProgress = prog.loading / 4 }
            )
            this.imgProgress = 25
            // ipcRenderer.send('acb', getPath(`./public/asset/sound/voice/chara_${cid}/chara_${cid}.acb`))
          } catch (errorPath) {
            this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
          }
        }
        if (!cardExist) {
          fs.mkdirSync(cardDir)
          let hash = cardVoice[0].hash
          try {
            // this.$refs.voiceBtn.setAttribute('disabled', 'disabled')
            cardDl = await dler.download(
              this.getVoiceUrl(hash),
              getPath(`./public/asset/sound/voice/card_${id}/card_${id}.acb`),
              prog => { this.imgProgress = prog.loading / 4 + 25 }
            )
            // if (cardDl) {
            this.imgProgress = 50
            // }
          } catch (errorPath) {
            this.$refs.voiceBtn.removeAttribute('disabled')
            this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
          }
        }

        if (charaDl && cardDl) {
          ipcRenderer.send('voiceDec', [charaDl, cardDl])
        } else if (!charaDl && cardDl) {
          ipcRenderer.send('voiceDec', [cardDl])
        } else if (charaDl && !cardDl) {
          ipcRenderer.send('voiceDec', [charaDl])
        } else {
          if (charaDl === null && cardDl === null) {
            let cardVoiceFiles = fs.readdirSync(cardDir)
            for (let i = 0; i < cardVoiceFiles.length; i++) {
              cardVoiceFiles[i] = path.join(cardDir, cardVoiceFiles[i])
            }
            let charaVoiceFiles = fs.readdirSync(charaDir)
            for (let i = 0; i < charaVoiceFiles.length; i++) {
              charaVoiceFiles[i] = path.join(charaDir, charaVoiceFiles[i])
            }
            let voiceFiles = charaVoiceFiles.concat(cardVoiceFiles)
            this.voice.src = voiceFiles[Math.floor(voiceFiles.length * Math.random())]
            this.voice.play()
          }
        }
      } else {
        this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('idol.noVoice'))
      }
    },
    async downloadCard (id, progressing) {
      let downloadResult = false
      try {
        downloadResult = await dler.download(
          this.getCardUrl(id),
          getPath(`./public/img/card/bg_${id}.png`),
          (progressing || (prog => { this.imgProgress = prog.loading }))
        )
      } catch (errorPath) {
        this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
      }
      return downloadResult
    },
    toggle (practice) {
      switch (practice) {
        case 'idol.before':
          this.information = this.activeCard
          if (navigator.onLine) {
            this.changeBackground(this.activeCard)
          }
          break
        case 'idol.after':
          this.information = this.activeCardPlus
          if (navigator.onLine) {
            this.changeBackground(this.activeCardPlus)
          }
          break
        default:
          break
      }
    },
    opendir () {
      this.playSe(this.enterSe)
      if (!fs.existsSync(getPath('./public/img/card'))) {
        fs.mkdirSync(getPath('./public/img/card'))
      }
      shell.openExternal(getPath('./public/img/card'))
    }
  },
  filters: {
    hand (v) {
      switch (v) {
        case 3001:
          return '右'
        case 3002:
          return '左'
        case 3003:
          return '両'
        default:
          return ''
      }
    },
    blood (v) {
      switch (v) {
        case 2001:
          return 'A'
        case 2002:
          return 'B'
        case 2003:
          return 'AB'
        case 2004:
          return 'O'
        default:
          return ''
      }
    },
    threesize (v) {
      if (v[0] === undefined || v[1] === undefined || v[2] === undefined) {
        return ''
      } else if (v[0] >= 1000 && v[1] >= 1000 && v[2] >= 1000) {
        return '？/？/？'
      } else {
        return v[0] + '/' + v[1] + '/' + v[2]
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.event.$on('eventBgReady', (id) => {
        if (id % 2 === 0) {
          this.currentPractice = 'idol.after'
          for (let i = 0; i < this.cardData.length; i++) {
            if (this.cardData[i].id == id - 1) {
              this.activeCard = this.cardData[i]
              continue
            }
            if (this.cardData[i].id == id) {
              this.activeCardPlus = this.cardData[i]
              this.information = this.cardData[i]
              break
            }
          }
        } else {
          this.currentPractice = 'idol.before'
          for (let i = 0; i < this.cardData.length; i++) {
            if (this.cardData[i].id == id) {
              this.activeCard = this.cardData[i]
              this.information = this.cardData[i]
              continue
            }
            if (this.cardData[i].id == id + 1) {
              this.activeCardPlus = this.cardData[i]
              break
            }
          }
        }
      })
      this.event.$on('eventRewardCard', cardId => {
        this.eventCard = cardId
        this.searchResult = [].concat(this.cardData.filter(card => (card.id == cardId[0] || card.id == cardId[1])))
      })
      this.event.$on('enterKey', (block) => {
        if (block === 'idol') {
          this.query()
        }
      })
      ipcRenderer.on('voiceEnd', event => {
        this.imgProgress = 0
        this.$refs.voiceBtn.removeAttribute('disabled')
      })
      ipcRenderer.on('singleHca', (event, cur, total) => {
        this.imgProgress = 50 + 50 * cur / total
      })
    })
  }
}
