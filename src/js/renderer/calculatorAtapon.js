export default function () {
  let curExp = Number(this.publicStatus.exp)
  let curItem = Number(this.privateStatus['1'].input.itemNumber.model)
  let curPt = Number(this.privateStatus['1'].input.currentPt.model)
  let tarPt = Number(this.privateStatus['1'].input.targetPt.model)
  let comDi = this.privateStatus['1'].input.commonDifficulty.model.split(' ')
  let evtDi = this.privateStatus['1'].input.eventDifficulty.model.split(' ')
  let cb = Number(this.privateStatus['1'].input.commonTimes.model)
  let eb = Number(this.privateStatus['1'].input.eventTimes.model)

  let cGet = Number(comDi[1])
  let eUse = Number(evtDi[0])
  let eGet = Number(evtDi[1])

  let dateOffset = new Date(this.time + this.eventTimeLeft).getDate() - new Date().getDate()
  if (dateOffset < 0) dateOffset += new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  let loginItem = 300 * dateOffset
  // console.log('loginItem = ' + loginItem)
  let reqPt = (tarPt - curPt) > 0 ? tarPt - curPt : 0

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

  this.ptCount(commonLiveTimes, comDi[0] * cb, levelUp, '1')
  /* clearInterval(this.privateStatus['1'].timer)
  this.privateStatus['1'].timer = setInterval(() => {
    this.ptCount(commonLiveTimes, comDi[0] * cb, levelUp, '1')
  }, 1000) */
}
