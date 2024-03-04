import { Vue, Component } from 'vue-property-decorator'
import InputText from '../../vue/component/InputText.vue'
import type { ServerResponse } from 'mishiro-core'
import { unpackTexture2D } from './unpack-texture-2d'
import { getProfile } from './ipc'
import getPath from '../common/get-path'
import configurer from './config'
import { getEmblemHash, getIconHash } from './ipc-back'
import type { MishiroConfig } from '../main/config'
import { error } from './log'

// /* const template =  */require('../../res/banner.svg')
const { existsSync, readFileSync, remove } = window.node.fs

const { iconDir, emblemDir } = getPath
// const { join } = window.node.path

function createSVGElement (data: string): Document {
  const parser = new DOMParser()
  const svg = parser.parseFromString(data, 'image/svg+xml')
  return svg
}

// const iconB64 = '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'

// const emblemB64 = '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'

class BannerRenderer {
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D | null
  svg: Document

  constructor (canvasid: string) {
    this.canvas = document.getElementById(canvasid) as HTMLCanvasElement
    this.ctx = this.canvas && this.canvas.getContext('2d')
    this.svg = createSVGElement(readFileSync(getPath('main/banner.svg'), 'utf8'))
    // document.body.append(this.svg)
  }

  render (data: any, icon: string, emblem: string, callback?: () => void): void {
    const root = this.svg
    const xlink = 'http://www.w3.org/1999/xlink'

    // setIcon('chihiro2x.png')
    setIcon('data:image/png;base64,' + (icon || ''))
    setEmblem('data:image/png;base64,' + (emblem || ''))

    function setText (id: string, value: string, grp: boolean = false): boolean {
      let dom
      if (grp) {
        dom = root.querySelectorAll(`g#${id}>text>tspan`)
      } else {
        dom = root.querySelectorAll(`text#${id}>tspan`)
      }
      if (dom) {
        for (let i = 0; i < dom.length; i++) {
          while (dom[i].childNodes.length) {
            dom[i].removeChild(dom[i].childNodes[0])
          }
          dom[i].innerHTML = value
        }
        return true
      }

      return false
    }

    function setIcon (href: string): void {
      root.querySelector('image#icon')!.setAttributeNS(xlink, 'xlink:href', href)
    }

    function setEmblem (href: string): void {
      root.querySelector('image#emblem')!.setAttributeNS(xlink, 'xlink:href', href)
    }

    setText('level', data.level.toString())
    setText('prp', data.prp.toString())
    if (data.fan >= 10000) {
      setText('fan', `${Math.floor(data.fan / 10000)}万人`)
    } else {
      setText('fan', `${data.fan}人`)
    }
    if (!data.id) {
      root.querySelector('g#gameid_grp')!.setAttribute('style', 'display: none')
    } else {
      root.querySelector('g#gameid_grp')!.removeAttribute('style')
      setText('gameid', data.id.toString())
    }
    setText('name', data.name.toString())
    setText('comment', data.comment.toString(0))

    Object.keys(data.cleared).forEach((k) => {
      const v = data.cleared[k]
      setText('cl_' + k, v.toString(), true)
    })
    Object.keys(data.full_combo).forEach((k) => {
      const v = data.full_combo[k]
      setText('fc_' + k, v.toString(), true)
    })

    setText('cardlevel', data.leader_card.level.toString(), true)

    if (data.emblem_ex_value) {
      setText('emblem-rank', data.emblem_ex_value.toString())
    } else {
      setText('emblem-rank', '')
    }

    (['f', 'e', 'd', 'c', 'b', 'a', 's', 'ss', 'sss']).forEach((rank, i) => {
      if ((i + 1) !== data.rank && !(rank === 'sss' && data.rank === 100)) {
        // root.querySelectorAll(`g#rk_${rank}`)[0].innerHTML = ''
        root.querySelector(`g#rk_${rank}`)!.setAttribute('style', 'display: none')
      } else {
        root.querySelector(`g#rk_${rank}`)!.removeAttribute('style')
      }
    })

    if (this.canvas && this.ctx) {
      const ctx = this.ctx
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      const svgXml = (new XMLSerializer()).serializeToString(this.svg)
      const img = new Image()
      img.src = 'data:image/svg+xml;base64,' + Buffer.from(svgXml).toString('base64')
      img.onload = function () {
        ctx.drawImage(img, 0, 0)
        callback && callback.call(this)
      }
    }
  }
}

@Component({
  components: {
    InputText
  }
})
export default class extends Vue {
  queryString: string = '646406677'
  renderer: BannerRenderer | null
  isSearching: boolean = false
  dler = new this.core.Downloader()

  created (): void {
    this.dler.setProxy(configurer.get('proxy') ?? '')
    this.event.$on('optionSaved', (options: MishiroConfig) => {
      this.dler.setProxy(options.proxy ?? '')
    })
  }

  openOrigin (): void {
    window.node.electron.shell.openExternal('https://deresute.me/').catch(err => {
      console.error(err)
      error(`COMMU openExternal: ${err.stack}`)
    })
  }

  async query (): Promise<void> {
    this.playSe(this.enterSe)
    if (!this.queryString) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('commu.notfound'))
      return
    }
    this.isSearching = true

    let res: ServerResponse
    try {
      res = await getProfile(/* '646406677' */this.queryString)
    } catch (err: any) {
      this.isSearching = false
      this.handleClientError(err)
      return
    }

    if (res.data_headers.required_res_ver !== undefined) {
      this.isSearching = false
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('commu.newVersion'))
      return
    }
    if (!res.data || res.data.length === 0) {
      this.isSearching = false
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('commu.notfound'))
      return
    }

    const data = createBannerData(res.data)
    let iconB64 = ''
    let emblemB64 = ''

    try {
      const cacheName = iconDir(`card_${data.leader_card.id}_m`)
      const emblemCache = emblemDir(`emblem_${data.emblem_id}_l`)
      if (existsSync(cacheName + '.png')) {
        iconB64 = readFileSync(cacheName + '.png').toString('base64')
      } else {
        const card = configurer.get('card')
        if (!card || card === 'default') {
          const hash = await getIconHash(data.leader_card.id)
          const asset = await this.dler.downloadAsset(hash, cacheName)
          if (asset) {
            await remove(cacheName)
            await unpackTexture2D(asset)
            iconB64 = readFileSync(cacheName + '.png').toString('base64')
          }
        } else {
          await this.dler.downloadIcon(data.leader_card.id.toString(), cacheName + '.png')
          iconB64 = readFileSync(cacheName + '.png').toString('base64')
        }
      }

      if (existsSync(emblemCache + '.png')) {
        emblemB64 = readFileSync(emblemCache + '.png').toString('base64')
      } else {
        const hash = await getEmblemHash(data.emblem_id)
        const asset = await this.dler.downloadAsset(hash, emblemCache)
        if (asset) {
          await remove(emblemCache)
          await unpackTexture2D(asset)
          emblemB64 = readFileSync(emblemCache + '.png').toString('base64')
        }
      }
    } catch (err: any) {
      console.error(err)
      this.event.$emit('alert', this.$t('home.errorTitle'), err.message)
    }
    if (!this.renderer) this.renderer = new BannerRenderer('can')

    this.renderer.render(data, iconB64, emblemB64, () => {
      this.isSearching = false
    })
  }

  save (): void {
    this.playSe(this.enterSe)
    if (!this.renderer || !this.renderer.canvas) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('commu.notfound'))
      return
    }
    this.renderer.canvas.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.download = `${this.queryString}.png`
      a.href = URL.createObjectURL(blob)
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      })
      a.dispatchEvent(event)
      a.remove()
    }, 'image/png', 1)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createBannerData (profileData: any) {
  const cleared = {
    debut: 0,
    normal: 0,
    pro: 0,
    master: 0,
    master_plus: 0
  }
  const fullCombo = {
    debut: 0,
    normal: 0,
    pro: 0,
    master: 0,
    master_plus: 0
  }
  profileData.user_live_difficulty_list.forEach((item: { clear_number: number, difficulty_type: number, full_combo_number: number, 'null': number, viewer_id: number }) => {
    if (item.difficulty_type === 1) {
      cleared.debut = item.clear_number
      fullCombo.debut = item.full_combo_number
    } else if (item.difficulty_type === 2) {
      cleared.normal = item.clear_number
      fullCombo.normal = item.full_combo_number
    } else if (item.difficulty_type === 3) {
      cleared.pro = item.clear_number
      fullCombo.pro = item.full_combo_number
    } else if (item.difficulty_type === 4) {
      cleared.master = item.clear_number
      fullCombo.master = item.full_combo_number
    } else if (item.difficulty_type === 5) {
      cleared.master_plus = item.clear_number
      fullCombo.master_plus = item.full_combo_number
    }
  })
  return {
    comment: profileData.friend_info.user_info.comment,
    cleared: cleared,
    full_combo: fullCombo,
    leader_card: {
      love: profileData.friend_info.leader_card_info.love,
      level: profileData.friend_info.leader_card_info.level,
      exp: profileData.friend_info.leader_card_info.exp,
      skill_level: profileData.friend_info.leader_card_info.skill_level,
      star_rank: profileData.friend_info.leader_card_info.star_rank,
      id: profileData.friend_info.leader_card_info.card_id
    },
    name: profileData.friend_info.user_info.name,
    level: profileData.friend_info.user_info.level,
    timestamp: Date.now(),
    rank: profileData.friend_info.user_info.producer_rank,
    album_no: profileData.album_number,
    fan: profileData.friend_info.user_info.fan,
    prp: profileData.prp,
    creation_ts: profileData.friend_info.user_info.create_time,
    commu_no: profileData.story_number,
    id: profileData.friend_info.user_info.viewer_id,
    last_login_ts: profileData.friend_info.user_info.last_login_time,
    emblem_ex_value: profileData.friend_info.user_info.emblem_ex_value,
    emblem_id: profileData.friend_info.user_info.emblem_id
  }
}
