export default function () {
  let curExp = Number(this.publicStatus.exp)
  let curAd = Number(this.privateStatus['5'].input.currentAudience.model)
  let tarAd = Number(this.privateStatus['5'].input.targetAudience.model)
  let useArr = this.privateStatus['5'].input.areaStamina.model.split(' ')
  let liveOption = this.privateStatus['5'].input.liveOption.model

  let dateOffset = new Date(this.time + this.eventTimeLeft + this.master.timeOffset).getDate() - new Date(this.time + this.master.timeOffset).getDate()
  if (dateOffset < 0) dateOffset += new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  let loginStamina = 50 * dateOffset
  // console.log('loginItem = ' + loginItem)
  let reqAd = (tarAd - curAd) > 0 ? tarAd - curAd : 0

  let liveTimes = Math.ceil(reqAd / (useArr[2] * (1 + 0.015 * useArr[1] + Number(liveOption))))
  if (liveTimes < 0) liveTimes = 0

  let levelUp = this.getLevelUpTimes(liveTimes, useArr[3], curExp)

  this.privateStatus['5'].output.levelUp = levelUp
  this.privateStatus['5'].output.requireAudience = reqAd
  this.privateStatus['5'].output.eventLiveTimes = liveTimes > 0 ? liveTimes : 0
  this.privateStatus['5'].output.bonusStamina = loginStamina
  this.ptCount(liveTimes, Number(useArr[0]), levelUp, '5', loginStamina)
}
