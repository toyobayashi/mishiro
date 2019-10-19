import modalMixin from './modal-mixin'
import ProgressBar from '../../vue/component/ProgressBar.vue'
import TabSmall from '../../vue/component/TabSmall.vue'
import InputRadio from '../../vue/component/InputRadio.vue'
import InputText from '../../vue/component/InputText.vue'
import privateStatus from './calculator-data'

import Component, { mixins } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
// import { MasterData } from '../main/on-master-read'

const { ipcRenderer } = window.node.electron

@Component({
  components: {
    ProgressBar,
    TabSmall,
    InputRadio,
    InputText
  }
})
export default class extends mixins(modalMixin) {
  modalWidth = '920px'
  isCounting = false // 是否正在进行体力计时
  currentEventTab = 'ATAPON' // 当前活动计算板块
  stamina = 0 // 已恢复的stamina，以秒记
  staminaSpeed = 300 // 恢复速度，以秒记
  staminaTimer: NodeJS.Timer | number = 0 // 计时器开关
  eventType: any = {
    1: 'ATAPON',
    2: 'CARAVAN',
    3: 'MEDLEY',
    5: 'TOUR'
  }

  publicStatus: any = {
    plv: '1',
    stamina: '0',
    exp: '0'
  }

  privateStatus: any = privateStatus

  // @Prop({ default: () => ({}), type: Object }) master: MasterData
  @Prop({ default: new Date().getTime() }) time: number

  get eventData (): any {
    return this.$store.state.master.eventData /*  ? this.master.eventData : {} */
  }

  get userLevel (): any[] {
    return this.$store.state.master.userLevel
  }

  get timeOffset (): number {
    return this.$store.state.master.timeOffset || 0
  }

  get eventTimeTotal (): number {
    if (!this.eventData) return 1
    return new Date(this.eventData.event_end).getTime() - new Date(this.eventData.event_start).getTime()
  }

  get eventTimeGone (): number {
    if (!this.eventData) return 0
    return this.time - (new Date(this.eventData.event_start).getTime() - this.timeOffset)
  }

  get eventTimeLeft (): number {
    return this.eventTimeTotal - this.eventTimeGone > 0 ? this.eventTimeTotal - this.eventTimeGone : 0
  }

  get eventTimePercent (): number {
    return this.eventTimeGone / this.eventTimeTotal > 1 ? 100 : 100 * this.eventTimeGone / this.eventTimeTotal
  }

  get maxStamina (): number {
    if (!this.publicStatus.plv || !this.userLevel) return 0
    return this.userLevel.filter((level: any) => Number(level.level) === Number(this.publicStatus.plv))[0].stamina
  }

  get maxExp (): number {
    if (!this.publicStatus.plv || !this.userLevel || Number(this.publicStatus.plv) === 300) return Infinity
    return this.userLevel.filter((level) => Number(level.level) === Number(this.publicStatus.plv))[0].exp
  }

  get staminaPercent (): number {
    if (this.stamina && this.maxStamina) return 100 * this.stamina / (this.maxStamina * this.staminaSpeed)
    return 0
  }

  get staminaTimeLeft (): string {
    if (this.stamina && this.maxStamina) return this.timeFormate(1000 * (this.maxStamina * this.staminaSpeed - this.stamina))
    return '00:00'
  }

  @Watch('eventData')
  eventDataWatchHandler (v: any): void {
    if (v.type === 6) this.currentEventTab = 'ATAPON'
    else this.currentEventTab = this.eventType[v.type]
  }

  toggle (eventType: string): void {
    // console.log(eventType)
    this.currentEventTab = eventType
  }

  stopCount (): void {
    this.playSe(this.cancelSe)
    this.isCounting = false
    clearInterval(this.staminaTimer as NodeJS.Timer)
    this.stamina = 0
  }

  startCount (): void {
    this.playSe(this.enterSe)
    if (!isNaN(this.publicStatus.stamina) && this.publicStatus.stamina < this.maxStamina * this.staminaSpeed) {
      this.stamina = this.publicStatus.stamina * this.staminaSpeed
      if (this.stamina >= this.maxStamina * this.staminaSpeed) return
      this.isCounting = true
      this.staminaTimer = setInterval(() => {
        this.stamina++
        this.publicStatus.stamina = Math.floor(this.stamina / this.staminaSpeed)
        if (this.stamina >= this.maxStamina * this.staminaSpeed) {
          clearInterval(this.staminaTimer as NodeJS.Timer)
          this.isCounting = false
          ipcRenderer.send('flash')
          this.event.$emit('alert', this.$t('home.msg'), this.$t('home.stmnFull'))
        }
      }, 1000)
    }
  }

  calculate (): void {
    this.playSe(this.enterSe)
    if (this.currentEventTab === 'ATAPON') {
      this.ataponCal()
    } else if (this.currentEventTab === 'TOUR') {
      this.tourCal()
    } else if (this.currentEventTab === 'MEDLEY') {
      this.medleyCal()
    } else if (this.currentEventTab === 'CARAVAN') {
      this.caravanCal()
    } else {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.hope'))
    }
  }

  clear (): void {
    this.playSe(this.cancelSe)
    if (this.currentEventTab === 'ATAPON') {
      // clearInterval(this.privateStatus['1'].timer)
      for (const key in this.privateStatus['1'].output) {
        if (key === 'gameTime') this.privateStatus['1'].output[key] = '00:00'
        else this.privateStatus['1'].output[key] = 0
      }
    } else if (this.currentEventTab === 'TOUR') {
      for (const key in this.privateStatus['5'].output) {
        if (key === 'gameTime') this.privateStatus['5'].output[key] = '00:00'
        else this.privateStatus['5'].output[key] = 0
      }
    } else if (this.currentEventTab === 'MEDLEY') {
      for (const key in this.privateStatus['3'].output) {
        if (key === 'gameTime') this.privateStatus['3'].output[key] = '00:00'
        else this.privateStatus['3'].output[key] = 0
      }
    } else if (this.currentEventTab === 'CARAVAN') {
      for (const key in this.privateStatus['2'].output) {
        if (key === 'gameTime') this.privateStatus['2'].output[key] = '00:00'
        else if (key === 'extraRewardOdds') this.privateStatus['2'].output[key] = '0/0/0/0/0'
        else if (key === 'cardRewardOdds') this.privateStatus['2'].output[key] = '0.00/0.00'
        else this.privateStatus['2'].output[key] = 0
      }
    } else {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.hope'))
    }
  }

  timeFormate (t: number): string {
    const day = Math.floor(t / 1000 / 60 / 60 / 24)
    const hour = Math.floor(t / 1000 / 60 / 60 % 24)
    const minute = Math.floor(t / 1000 / 60 % 60)
    const second = Math.floor(t / 1000 % 60)
    return `${day ? `${day}日` : ''}${day ? (hour >= 10 ? `${hour}:` : `0${hour}:`) : (hour ? (hour >= 10 ? `${hour}:` : `0${hour}:`) : '')}${minute >= 10 ? minute : `0${minute}`}:${second >= 10 ? second : `0${second}`}`
  }

  getExp (plv: number | string): number {
    if (plv >= 300) return Infinity
    return this.userLevel.filter((level) => Number(level.level) === Number(plv))[0].exp
  }

  getMaxStamina (plv: number | string): number {
    return this.userLevel.filter((level) => Number(level.level) === Number(plv))[0].stamina
  }

  getLevelUpTimes (liveTimes: number, expPerTime: number, currentExp: number | string): number {
    let levelUp = 0
    let gotExp = liveTimes * expPerTime + Number(currentExp)
    let tempLevel = this.publicStatus.plv
    // console.log('gotExp = ' + (liveTimes * expPerTime))
    while (gotExp >= this.getExp(tempLevel)) {
      gotExp = gotExp - this.getExp(tempLevel)
      tempLevel++
      levelUp++
    }
    return levelUp
  }

  ptCount (times: number, use: number, levelUp: number, typeCode: string, loginStamina?: number): void {
    // console.log(times, use, levelUp, typeCode, loginStamina)
    let levelStamina = 0
    let tempLevel = Number(this.publicStatus.plv)
    const speed = this.staminaSpeed
    const currentStaminaSeconds = this.stamina

    let stmn = 0
    let seconds = 0
    for (let i = 0; i < levelUp; i++) {
      tempLevel++
      levelStamina = levelStamina + this.getMaxStamina(tempLevel)
    }
    if (loginStamina) {
      stmn = Math.ceil((times * use * speed - currentStaminaSeconds) / speed) - levelStamina - loginStamina
      seconds = times * use * speed - currentStaminaSeconds - levelStamina * speed - loginStamina * speed
    } else {
      stmn = Math.ceil((times * use * speed - currentStaminaSeconds) / speed) - levelStamina
      seconds = times * use * speed - currentStaminaSeconds - levelStamina * speed
    }

    this.privateStatus[typeCode].output.requireStamina = stmn > 0 ? stmn : 0
    this.privateStatus[typeCode].output.gameTime = this.timeFormate(seconds > 0 ? seconds * 1000 : 0)

    let extraStamina = 0
    if (seconds > this.eventTimeLeft / 1000) {
      extraStamina = Math.ceil((seconds - this.eventTimeLeft / 1000) / speed)
    }
    this.privateStatus[typeCode].output.extraStamina = extraStamina
  }

  mounted (): void {
    this.$nextTick(() => {
      this.event.$on('openCal', () => {
        this.show = true
        this.visible = true
      })
    })
  }

  ataponCal (): void {
    const curExp = Number(this.publicStatus.exp)
    const curItem = Number(this.privateStatus['1'].input.itemNumber.model)
    const curPt = Number(this.privateStatus['1'].input.currentPt.model)
    const tarPt = Number(this.privateStatus['1'].input.targetPt.model)
    const comDi = this.privateStatus['1'].input.commonDifficulty.model.split(' ')
    const evtDi = this.privateStatus['1'].input.eventDifficulty.model.split(' ')
    const cb = Number(this.privateStatus['1'].input.commonTimes.model)
    const eb = Number(this.privateStatus['1'].input.eventTimes.model)

    const cGet = Number(comDi[1])
    const eUse = Number(evtDi[0])
    const eGet = Number(evtDi[1])

    let dateOffset = new Date(this.time + this.eventTimeLeft + this.timeOffset).getDate() - new Date(this.time + this.timeOffset).getDate()
    if (dateOffset < 0) dateOffset += new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const loginItem = 300 * dateOffset
    // console.log('loginItem = ' + loginItem)
    const reqPt = (tarPt - curPt) > 0 ? tarPt - curPt : 0

    let eventLiveTimes = 0
    let commonLiveTimes = 0
    let reqItem = 0
    // 对道具列方程：commonLiveTimes * cb * cGet + curItem + loginItem = eventLiveTimes * eUse * eb
    // 对pt列方程：  commonLiveTimes * cGet + eventLiveTimes * eGet * eb = reqPt
    if (Math.floor((loginItem + Number(curItem)) / eUse / eb) >= Math.ceil(reqPt / eGet / eb)) {
      eventLiveTimes = Math.ceil(reqPt / eGet / eb)
      commonLiveTimes = 0
      reqItem = 0
      // console.log('pt = ' + (commonLiveTimes * cGet + eventLiveTimes * eGet * eb))
    } else {
      commonLiveTimes = (reqPt * eUse - eGet * (Number(curItem) + loginItem)) / (cb * cGet * eGet + cGet * eUse)
      eventLiveTimes = (commonLiveTimes * cb * cGet + Number(curItem) + loginItem) / (eUse * eb)
      // 先向上取整eventLiveTimes，用取整后的eventLiveTimes再算一次commonLiveTimes，再对commonLiveTimes向上取整
      eventLiveTimes = Math.ceil(eventLiveTimes)
      commonLiveTimes = Math.ceil((eventLiveTimes * eUse * eb - loginItem - Number(curItem)) / (cGet * cb))
      // 修正eventLiveTimes溢出
      if ((commonLiveTimes * cGet + eventLiveTimes * eGet * eb - reqPt) / eGet / eb >= 1) {
        eventLiveTimes = eventLiveTimes - 1
      }
      reqItem = eventLiveTimes * eUse * eb - loginItem - curItem
      // 修正commonLiveTimes溢出
      if ((commonLiveTimes * cGet + eventLiveTimes * eGet * eb - reqPt) / cGet >= 1 && (commonLiveTimes * cGet * cb - reqItem) / cGet / cb >= 1) {
        commonLiveTimes = commonLiveTimes - Math.floor((commonLiveTimes * cGet + eventLiveTimes * eGet * eb - reqPt) / cGet)
      }
      // console.log('pt = ' + (commonLiveTimes * cGet + eventLiveTimes * eGet * eb))
    }

    // 算可升级次数及体力
    let levelUp = 0
    let gotExp = commonLiveTimes * Number(comDi[2]) + eventLiveTimes * Number(evtDi[2]) + Number(curExp)
    let tempLevel = Number(this.publicStatus.plv)
    // console.log('gotExp = ' + (gotExp - Number(curExp)))
    while (gotExp >= this.getExp(tempLevel)) {
      gotExp = gotExp - this.getExp(tempLevel)
      tempLevel++
      levelUp++
    }
    this.privateStatus['1'].output.levelUp = levelUp
    this.privateStatus['1'].output.requirePt = reqPt
    this.privateStatus['1'].output.requireItem = reqItem > 0 ? reqItem : 0
    this.privateStatus['1'].output.commonLiveTimes = commonLiveTimes
    this.privateStatus['1'].output.eventLiveTimes = eventLiveTimes
    this.privateStatus['1'].output.bonusItem = loginItem

    this.ptCount(commonLiveTimes, comDi[0] * cb, levelUp, '1')
    /* clearInterval(this.privateStatus['1'].timer)
    this.privateStatus['1'].timer = setInterval(() => {
      this.ptCount(commonLiveTimes, comDi[0] * cb, levelUp, '1')
    }, 1000) */
  }

  caravanCal (): void {
    const curExp = Number(this.publicStatus.exp)
    const curMdl = Number(this.privateStatus['2'].input.currentMedal.model)
    const tarMdl = Number(this.privateStatus['2'].input.targetMedal.model)
    const comDi = this.privateStatus['2'].input.commonDifficulty.model.split(' ')
    const starRank = this.privateStatus['2'].input.starRank.model

    let tsuikaritsu = 0

    let dateOffset = new Date(this.time + this.eventTimeLeft + this.timeOffset).getDate() - new Date(this.time + this.timeOffset).getDate()
    if (dateOffset < 0) dateOffset += new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const loginStamina = 50 * dateOffset

    let zero = 0
    let one = 0
    let two = 0
    let three = 0
    let four = 0
    let avrMdl = 0
    let kaiSRshutsugen = 0
    let jouiSRshutsugen = 0

    if (starRank <= 15) {
      tsuikaritsu = Number(changeDecimal((starRank * 0.1 + 1.0) * 0.4 * comDi[2], 2, 'round'))

      zero = (1 - tsuikaritsu) * (1 - tsuikaritsu)
      one = 2 * tsuikaritsu * (1 - tsuikaritsu)
      two = tsuikaritsu * tsuikaritsu
      three = 0
      four = 0
      avrMdl = comDi[1] * one * 0.85 + comDi[1] * two * 1.37
      kaiSRshutsugen = one * 0.02 + two * 0.12
      jouiSRshutsugen = one * 0.01 + two * 0.03
    } else {
      tsuikaritsu = Number(changeDecimal((0.2 * (starRank - 15)) * comDi[2], 2, 'round'))

      zero = 0
      one = 0
      two = (1 - tsuikaritsu) * (1 - tsuikaritsu)
      three = 2 * tsuikaritsu * (1 - tsuikaritsu)
      four = tsuikaritsu * tsuikaritsu
      avrMdl = comDi[1] * two * 1.37 + comDi[1] * three * 2.22 + comDi[1] * four * 2.74
      kaiSRshutsugen = two * 0.12 + three * 0.14 + four * 0.24
      jouiSRshutsugen = two * 0.03 + three * 0.04 + four * 0.06
    }

    const reqMdl = (tarMdl - curMdl) > 0 ? tarMdl - curMdl : 0

    let liveTimes = Math.ceil((tarMdl - curMdl) / avrMdl)
    if (liveTimes < 0) liveTimes = 0

    zero = Math.round(zero * 100)
    one = Math.round(one * 100)
    two = Math.round(two * 100)
    three = Math.round(three * 100)
    four = Math.round(four * 100)
    avrMdl = Math.round(avrMdl)
    kaiSRshutsugen = Number(changeDecimal(kaiSRshutsugen * liveTimes, 2, 'round'))
    jouiSRshutsugen = Number(changeDecimal(jouiSRshutsugen * liveTimes, 2, 'round'))

    const levelUp = this.getLevelUpTimes(liveTimes, comDi[3], curExp)

    this.privateStatus['2'].output.levelUp = levelUp
    this.privateStatus['2'].output.extraRewardOdds = `${zero}/${one}/${two}/${three}/${four}`
    this.privateStatus['2'].output.cardRewardOdds = `${jouiSRshutsugen}/${kaiSRshutsugen}`
    this.privateStatus['2'].output.averageMedal = avrMdl
    this.privateStatus['2'].output.requireMedal = reqMdl
    this.privateStatus['2'].output.commonLiveTimes = liveTimes > 0 ? liveTimes : 0
    this.privateStatus['2'].output.bonusStamina = loginStamina
    this.ptCount(liveTimes, Number(comDi[0]), levelUp, '2', loginStamina)
  }

  medleyCal (): void {
    const curExp = Number(this.publicStatus.exp)
    const curPt = Number(this.privateStatus['3'].input.currentPt.model)
    const tarPt = Number(this.privateStatus['3'].input.targetPt.model)
    const evtDi = this.privateStatus['3'].input.eventDifficulty.model.split(' ')
    const hkyr = this.privateStatus['3'].input.hakoyureLevel.model.split(' ')

    let dateOffset = new Date(this.time + this.eventTimeLeft + this.timeOffset).getDate() - new Date(this.time + this.timeOffset).getDate()
    if (dateOffset < 0) dateOffset += new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const loginStamina = 50 * dateOffset
    // console.log('loginItem = ' + loginItem)
    const reqPt = (tarPt - curPt) > 0 ? tarPt - curPt : 0

    let liveTimes = Math.ceil((tarPt - curPt) / (Number(evtDi[2]) + Number(hkyr[evtDi[0]])))
    if (liveTimes < 0) liveTimes = 0

    const levelUp = this.getLevelUpTimes(liveTimes, evtDi[3], curExp)

    this.privateStatus['3'].output.levelUp = levelUp
    this.privateStatus['3'].output.requirePt = reqPt
    this.privateStatus['3'].output.eventLiveTimes = liveTimes > 0 ? liveTimes : 0
    this.privateStatus['3'].output.bonusStamina = loginStamina
    this.ptCount(liveTimes, Number(evtDi[1]), levelUp, '3', loginStamina)
  }

  tourCal (): void {
    const curExp = Number(this.publicStatus.exp)
    const curAd = Number(this.privateStatus['5'].input.currentAudience.model)
    const tarAd = Number(this.privateStatus['5'].input.targetAudience.model)
    const useArr = this.privateStatus['5'].input.areaStamina.model.split(' ')
    const liveOption = this.privateStatus['5'].input.liveOption.model

    let dateOffset = new Date(this.time + this.eventTimeLeft + this.timeOffset).getDate() - new Date(this.time + this.timeOffset).getDate()
    if (dateOffset < 0) dateOffset += new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const loginStamina = 50 * dateOffset
    // console.log('loginItem = ' + loginItem)
    const reqAd = (tarAd - curAd) > 0 ? tarAd - curAd : 0

    let liveTimes = Math.ceil(reqAd / (useArr[2] * (1 + 0.015 * useArr[1] + Number(liveOption))))
    if (liveTimes < 0) liveTimes = 0

    const levelUp = this.getLevelUpTimes(liveTimes, useArr[3], curExp)

    this.privateStatus['5'].output.levelUp = levelUp
    this.privateStatus['5'].output.requireAudience = reqAd
    this.privateStatus['5'].output.eventLiveTimes = liveTimes > 0 ? liveTimes : 0
    this.privateStatus['5'].output.bonusStamina = loginStamina
    this.ptCount(liveTimes, Number(useArr[0]), levelUp, '5', loginStamina)
  }
}

function changeDecimal (x: string | number, n: number, op: string): string {
  x = parseFloat(x as string)
  let c = 1
  if (isNaN(x)) {
    return ''
  }
  for (let i = 0; i < n; i++) {
    c = c * 10
  }
  switch (op) {
    case 'round':
      x = Math.round(x * c) / c
      break
    case 'ceil':
      x = Math.ceil(x * c) / c
      break
    case 'floor':
      x = Math.floor(x * c) / c
      break
    default:
      x = Math.round(x * c) / c
      break
  }
  let xs = x.toString()
  let dp = xs.indexOf('.')
  if (dp < 0) {
    dp = xs.length
    xs += '.'
  }
  while (xs.length <= dp + n) {
    xs += '0'
  }
  return xs
}
