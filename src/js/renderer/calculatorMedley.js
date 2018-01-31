export default function () {
  let curExp = Number(this.publicStatus.exp)
  let curPt = Number(this.privateStatus['3'].input.currentPt.model)
  let tarPt = Number(this.privateStatus['3'].input.targetPt.model)
  let evtDi = this.privateStatus['3'].input.eventDifficulty.model.split(' ')
  let hkyr = this.privateStatus['3'].input.hakoyureLevel.model.split(' ')

  let dateOffset = new Date(this.time + this.eventTimeLeft + this.master.timeOffset).getDate() - new Date(this.time + this.master.timeOffset).getDate()
  if (dateOffset < 0) dateOffset += new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  let loginStamina = 50 * dateOffset
  // console.log('loginItem = ' + loginItem)
  let reqPt = (tarPt - curPt) > 0 ? tarPt - curPt : 0

  let liveTimes = Math.ceil((tarPt - curPt) / (Number(evtDi[2]) + Number(hkyr[evtDi[0]])))
  if (liveTimes < 0) liveTimes = 0

  let levelUp = this.getLevelUpTimes(liveTimes, evtDi[3], curExp)

  this.privateStatus['3'].output.levelUp = levelUp
  this.privateStatus['3'].output.requirePt = reqPt
  this.privateStatus['3'].output.eventLiveTimes = liveTimes > 0 ? liveTimes : 0
  this.privateStatus['3'].output.bonusStamina = loginStamina
  this.ptCount(liveTimes, Number(evtDi[1]), levelUp, '3', loginStamina)
}
