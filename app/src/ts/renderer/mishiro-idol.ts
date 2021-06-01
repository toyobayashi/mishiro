import ProgressBar from '../../vue/component/ProgressBar.vue'
import TabSmall from '../../vue/component/TabSmall.vue'
import InputText from '../../vue/component/InputText.vue'

// import { MasterData } from '../main/on-master-read'
import { Vue, Component } from 'vue-property-decorator'
import type { DownloadPromise, ProgressInfo } from 'mishiro-core'
import { unpackTexture2D } from './unpack-texture-2d'

import getPath from '../common/get-path'
import configurer from './config'
import { getCardHash } from './ipc-back'
import type { MishiroConfig } from '../main/config'
const { /* ipcRenderer,  */shell } = window.node.electron
const fs = window.node.fs
const path = window.node.path
const { cardDir, voiceDir } = getPath

@Component({
  components: {
    ProgressBar,
    TabSmall,
    InputText
  }
})
export default class extends Vue {
  dler = new this.core.Downloader()
  cardDownloadPromise: DownloadPromise<string> | null = null
  voice: HTMLAudioElement = new Audio()
  voiceDisable: boolean = false
  queryString: string = ''
  searchResult: any[] = []
  activeCard: any = {}
  activeCardPlus: any = {}
  information: any = {}
  imgProgress: number = 0
  eventCard: any[] = []
  currentPractice: string = 'idol.after'
  practice: { before: string, after: string } = {
    before: 'idol.before',
    after: 'idol.after'
  }

  created (): void {
    this.dler.setProxy(configurer.get('proxy') ?? '')
    this.event.$on('optionSaved', (options: MishiroConfig) => {
      this.dler.setProxy(options.proxy ?? '')
    })
  }

  // @Prop({ default: () => ({}), type: Object }) master!: MasterData

  blood (v: any): string {
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
  }

  hand (v: any): string {
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
  }

  threesize (v: any): string {
    if (!v) return ''
    if (v[0] === undefined || v[1] === undefined || v[2] === undefined) {
      return ''
    } else if (v[0] >= 1000 && v[1] >= 1000 && v[2] >= 1000) {
      return '？/？/？'
    } else {
      return `${v[0]}/${v[1]}/${v[2]}`
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get table () {
    return [
      [
        { text: this.$t('idol.id') },
        { text: this.information.id },
        { text: this.$t('idol.okurigana') },
        { text: this.information.charaData && this.information.charaData.name_kana }
      ],
      [
        { text: this.$t('idol.card_name') },
        { text: this.information.name },
        { text: this.$t('idol.name') },
        { text: this.information.charaData && this.information.charaData.name }
      ],
      [
        { text: this.$t('idol.chara_id') },
        { text: this.information.chara_id },
        { text: this.$t('idol.age') },
        { text: this.information.charaData && this.information.charaData.age }
      ],
      [
        { text: this.$t('idol.rarity') },
        { text: this.rarity },
        { text: this.$t('idol.height') },
        { text: this.information.charaData && this.information.charaData.height }
      ],
      [
        { text: this.$t('idol.hp'), class: 'hp' },
        { text: this.hp, class: 'hp' },
        { text: this.$t('idol.weight') },
        { text: this.information.charaData && this.information.charaData.weight }
      ],
      [
        { text: this.$t('idol.vocal'), class: 'vocal' },
        { text: this.vocal, class: 'vocal' },
        { text: this.$t('idol.birth') },
        { text: this.information.charaData && (`${this.information.charaData.birth_month}月${this.information.charaData.birth_day}日`) }
      ],
      [
        { text: this.$t('idol.dance'), class: 'dance' },
        { text: this.dance, class: 'dance' },
        { text: this.$t('idol.blood') },
        { text: this.blood(this.information.charaData && this.information.charaData.blood_type) }
      ],
      [
        { text: this.$t('idol.visual'), class: 'visual' },
        { text: this.visual, class: 'visual' },
        { text: this.$t('idol.handedness') },
        { text: this.hand(this.information.charaData && this.information.charaData.hand) }
      ],
      [
        { text: this.$t('idol.solo_live') },
        { text: this.solo },
        { text: this.$t('idol.threesize') },
        { text: this.threesize(this.information.charaData && [this.information.charaData.body_size_1, this.information.charaData.body_size_2, this.information.charaData.body_size_3]) }
      ],
      [
        { text: this.$t('idol.skill_name') },
        { text: this.information.skill && this.information.skill.skill_name },
        { text: this.$t('idol.hometown') },
        { text: this.information.charaData && this.information.charaData.hometown }
      ],
      [
        { text: this.information.skill && this.information.skill.explain, colspan: '2', class: 'text-left' },
        { text: this.$t('idol.constellation'), width: '15%' },
        { text: this.information.charaData && this.information.charaData.seiza }
      ],
      [
        { text: this.$t('idol.leader_skill_name') },
        { text: this.information.leaderSkill && this.information.leaderSkill.name },
        { text: this.$t('idol.voice') },
        { text: (this.information.charaData && this.information.charaData.voice) || this.$t('idol.nashi') }
      ],
      [
        { text: this.information.leaderSkill && this.information.leaderSkill.explain, colspan: '2', class: 'text-left' },
        { text: this.$t('idol.favorite'), width: '15%' },
        { text: this.information.charaData && this.information.charaData.favorite }
      ]
    ]
  }

  get cardData (): any[] {
    return this.$store.state.master.cardData || []
  }

  get voiceManifest (): any[] {
    return this.$store.state.master.voiceManifest || []
  }

  get rarity (): string {
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
  }

  get hp (): string {
    if (this.information.hp_min && this.information.hp_max && this.information.bonus_hp) {
      return `${this.information.hp_min}～${this.information.hp_max} (+${this.information.bonus_hp})`
    } else {
      return ''
    }
  }

  get vocal (): string {
    if (this.information.vocal_min && this.information.vocal_max && this.information.bonus_vocal) {
      return `${this.information.vocal_min}～${this.information.vocal_max} (+${this.information.bonus_vocal})`
    } else {
      return ''
    }
  }

  get dance (): string {
    if (this.information.dance_min && this.information.dance_max && this.information.bonus_dance) {
      return `${this.information.dance_min}～${this.information.dance_max} (+${this.information.bonus_dance})`
    } else {
      return ''
    }
  }

  get visual (): string {
    if (this.information.visual_min && this.information.visual_max && this.information.bonus_visual) {
      return `${this.information.visual_min}～${this.information.visual_max} (+${this.information.bonus_visual})`
    } else {
      return ''
    }
  }

  get solo (): string {
    if (this.information.solo_live !== undefined) {
      if (Number(this.information.solo_live) === 0) {
        return this.$t('idol.nashi') as string
      } else {
        return 'お願い！シンデレラ'
      }
    } else {
      return ''
    }
  }

  query (): void {
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
      this.searchResult = this.cardData.filter(card => {
        return this.eventCard.includes(Number(card.id))
      })
    }
  }

  selectedIdol (card: any): void {
    if (Number(this.activeCard.id) !== Number(card.id)) {
      this.playSe(this.enterSe)
      this.activeCard = card
      this.information = card
      for (let i = 0; i < this.cardData.length; i++) {
        if (Number(this.cardData[i].id) === Number(card.id) + 1) {
          this.activeCardPlus = this.cardData[i]
          break
        }
      }

      this.currentPractice = 'idol.before'
      if (navigator.onLine) {
        this.changeBackground(card).catch(err => console.log(err))
      }
    }
  }

  async changeBackground (card: any): Promise<void> {
    this.imgProgress = 0
    this.cardDownloadPromise?.download.abort()
    if (Number(card.rarity) > 4) {
      if (!fs.existsSync(cardDir(`bg_${card.id}.png`))) {
        try {
          const result = await this.downloadCard(card.id, 'idolSelect')
          if (result/*  && result !== 'await ipc' */) {
            this.imgProgress = 0
            this.event.$emit('idolSelect', card.id)
          }
        } catch (errorPath) {
          this.event.$emit('alert', this.$t('home.errorTitle'), (this.$t('home.downloadFailed') as string) + '<br/>' + (errorPath as string))
          throw errorPath
        }
      } else {
        this.event.$emit('idolSelect', card.id)
      }
    } else {
      this.event.$emit('noBg')
    }
  }

  async downloadVoice (): Promise<void> {
    this.playSe(this.enterSe)
    if (this.activeCard.charaData.voice) {
      let charaDl = null
      let cardDl = null
      const id = this.currentPractice === 'idol.after' ? this.activeCardPlus.id : this.activeCard.id
      const cid = this.activeCard.chara_id
      const cardVoice = this.voiceManifest.filter(row => row.name === `v/card_${id}.acb`)
      const charaVoice = this.voiceManifest.filter(row => row.name === `v/chara_${cid}.acb`)
      const cardDir = voiceDir(`card_${id}`)
      const charaDir = voiceDir(`chara_${cid}`)
      const cardExist = fs.existsSync(cardDir)
      const charaExist = fs.existsSync(charaDir)
      if (!charaExist) {
        fs.mkdirsSync(charaDir)
        const hash = charaVoice[0].hash
        try {
          this.voiceDisable = true
          // charaDl = await this.dler.downloadOne(
          //   this.getVoiceUrl(hash),
          //   voiceDir(`chara_${cid}`, `chara_${cid}.acb`),
          //   prog => { this.imgProgress = prog.loading / 4 }
          // )
          charaDl = await this.dler.downloadSound(
            'v',
            hash,
            voiceDir(`chara_${cid}`, `chara_${cid}.acb`),
            prog => { this.imgProgress = prog.loading / 4 }
          )
          this.imgProgress = 25
        } catch (errorPath) {
          fs.removeSync(charaDir)
          this.voiceDisable = false
          this.event.$emit('alert', this.$t('home.errorTitle'), (this.$t('home.downloadFailed') as string) + '<br/>' + (errorPath as string))
          return
        }
      }
      if (!cardExist) {
        fs.mkdirsSync(cardDir)
        const hash = cardVoice[0].hash
        try {
          // cardDl = await this.dler.downloadOne(
          //   this.getVoiceUrl(hash),
          //   voiceDir(`card_${id}`, `card_${id}.acb`),
          //   prog => { this.imgProgress = prog.loading / 4 + 25 }
          // )
          cardDl = await this.dler.downloadSound(
            'v',
            hash,
            voiceDir(`card_${id}`, `card_${id}.acb`),
            prog => { this.imgProgress = 25 + prog.loading / 4 }
          )
          // if (cardDl) {
          this.imgProgress = 50
          // }
        } catch (errorPath) {
          fs.removeSync(cardDir)
          this.voiceDisable = false
          this.event.$emit('alert', this.$t('home.errorTitle'), (this.$t('home.downloadFailed') as string) + '<br/>' + (errorPath as string))
          return
        }
      }

      if (charaDl && cardDl) {
        await this.voiceDecode([charaDl, cardDl])
      } else if (!charaDl && cardDl) {
        await this.voiceDecode([cardDl])
      } else if (charaDl && !cardDl) {
        await this.voiceDecode([charaDl])
      } else {
        if (charaDl === null && cardDl === null) {
          const cardVoiceFiles = fs.readdirSync(cardDir)
          for (let i = 0; i < cardVoiceFiles.length; i++) {
            cardVoiceFiles[i] = path.join(cardDir, cardVoiceFiles[i])
          }
          const charaVoiceFiles = fs.readdirSync(charaDir)
          for (let i = 0; i < charaVoiceFiles.length; i++) {
            charaVoiceFiles[i] = path.join(charaDir, charaVoiceFiles[i])
          }
          const voiceFiles = charaVoiceFiles.concat(cardVoiceFiles)

          const localSource = voiceFiles[Math.floor(voiceFiles.length * Math.random())]
          this.voice.src = process.env.NODE_ENV === 'production' ? localSource : ('/' + path.relative(getPath('..'), localSource).replace(new RegExp('\\' + path.sep, 'g'), '/'))
          this.voice.play().catch(err => console.log(err))
        }
      }
    } else {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('idol.noVoice'))
    }
  }

  async voiceDecode (acbs: string[]): Promise<void> {
    let hcaFiles: string[] = []
    const hcaDirs: string[] = []
    for (let i = 0; i < acbs.length; i++) {
      const acb = acbs[i]
      const files = await this.core.audio.acb2hca(acb)
      hcaDirs.push(files.dirname || path.dirname(files[0]))
      hcaFiles = [...hcaFiles, ...files]
    }
    for (let i = 0; i < hcaFiles.length; i++) {
      await this.core.audio.hca2mp3(hcaFiles[i], path.join(path.dirname(hcaFiles[i]), '..', path.parse(hcaFiles[i]).name + '.mp3'))
      this.imgProgress = 50 + 50 * (i + 1) / hcaFiles.length
    }
    Promise.all([Promise.all(acbs.map(acb => fs.remove(acb))), Promise.all(hcaDirs.map(hcaDir => fs.remove(hcaDir)))]).then(() => {
      this.imgProgress = 0
      this.voiceDisable = false
    }).catch(err => console.log(err))
  }

  async downloadCard (id: number | string, _data?: any, progressing?: (prog: ProgressInfo) => void): Promise<string> {
    let downloadResult: string = ''

    if (!fs.existsSync(cardDir(`bg_${id}.png`))) {
      const card = configurer.get('card')
      try {
        if (!card || card === 'default') {
          // let hash: string = ipcRenderer.sendSync('searchManifest', `card_bg_${id}.unity3d`)[0].hash
          const hash = await getCardHash(id)
          this.cardDownloadPromise = this.dler.downloadAsset(
            hash,
            cardDir(`card_bg_${id}`),
            (progressing || (prog => { this.imgProgress = prog.loading }))
          )
          downloadResult = await this.cardDownloadPromise
          this.cardDownloadPromise = null
          if (downloadResult) {
            this.imgProgress = 99.99
            fs.removeSync(cardDir(`card_bg_${id}`))
            await unpackTexture2D(cardDir(`card_bg_${id}.unity3d`))
            return cardDir(`bg_${id}.png`)
          } else {
            // throw new Error('abort')
            return ''
          }
        } else {
          this.cardDownloadPromise = this.dler.downloadSpread(
            id.toString(),
            cardDir(`bg_${id}.png`),
            (progressing || (prog => { this.imgProgress = prog.loading }))
          )
          downloadResult = await this.cardDownloadPromise
          this.cardDownloadPromise = null
          return downloadResult
        }
      } catch (_err) {
        if (_err.message !== 'abort') {
          this.cardDownloadPromise = this.dler.downloadSpread(
            id.toString(),
            cardDir(`bg_${id}.png`),
            (progressing || (prog => { this.imgProgress = prog.loading }))
          )
          downloadResult = await this.cardDownloadPromise
          this.cardDownloadPromise = null
          return downloadResult
        } else {
          throw _err
        }
      }
    }
    return cardDir(`bg_${id}.png`)
  }

  toggle (practice: string): void {
    switch (practice) {
      case 'idol.before':
        this.information = this.activeCard
        if (navigator.onLine) {
          this.changeBackground(this.activeCard).catch(err => console.log(err))
        }
        break
      case 'idol.after':
        this.information = this.activeCardPlus
        if (navigator.onLine) {
          this.changeBackground(this.activeCardPlus).catch(err => console.log(err))
        }
        break
      default:
        break
    }
  }

  opendir (): void {
    this.playSe(this.enterSe)
    const dir = cardDir()
    if (!fs.existsSync(dir)) fs.mkdirsSync(dir)
    if (window.node.process.platform === 'win32') {
      shell.openExternal(dir).catch(err => console.log(err))
    } else {
      shell.showItemInFolder(dir + '/.')
    }
  }

  mounted (): void {
    this.$nextTick(() => {
      this.event.$on('eventBgReady', (id: number) => {
        if (id % 2 === 0) {
          this.currentPractice = 'idol.after'
          for (let i = 0; i < this.cardData.length; i++) {
            if (Number(this.cardData[i].id) === id - 1) {
              this.activeCard = this.cardData[i]
              continue
            }
            if (Number(this.cardData[i].id) === id) {
              this.activeCardPlus = this.cardData[i]
              this.information = this.cardData[i]
              break
            }
          }
        } else {
          this.currentPractice = 'idol.before'
          for (let i = 0; i < this.cardData.length; i++) {
            if (Number(this.cardData[i].id) === id) {
              this.activeCard = this.cardData[i]
              this.information = this.cardData[i]
              continue
            }
            if (Number(this.cardData[i].id) === id + 1) {
              this.activeCardPlus = this.cardData[i]
              break
            }
          }
        }
      })
      this.event.$on('eventRewardCard', (cardId: number[]) => {
        this.eventCard = cardId
        this.searchResult = this.cardData.filter(card => {
          return cardId.includes(Number(card.id))
        })
      })
      this.event.$on('enterKey', (block: string) => {
        if (block === 'idol') {
          this.query()
        }
      })
    })
  }
}
