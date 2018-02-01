function changeDecimal (x, n, op) {
  x = parseFloat(x)
  let c = 1
  if (isNaN(x)) {
    return false
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

export default function () {
  let curExp = Number(this.publicStatus.exp)
  let curMdl = Number(this.privateStatus['2'].input.currentMedal.model)
  let tarMdl = Number(this.privateStatus['2'].input.targetMedal.model)
  let comDi = this.privateStatus['2'].input.commonDifficulty.model.split(' ')
  let starRank = this.privateStatus['2'].input.starRank.model

  let tsuikaritsu = 0

  let dateOffset = new Date(this.time + this.eventTimeLeft + this.master.timeOffset).getDate() - new Date(this.time + this.master.timeOffset).getDate()
  if (dateOffset < 0) dateOffset += new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  let loginStamina = 50 * dateOffset

  let zero = 0
  let one = 0
  let two = 0
  let three = 0
  let four = 0
  let avrMdl = 0
  let kaiSRshutsugen = 0
  let jouiSRshutsugen = 0

  if (starRank <= 15) {
    tsuikaritsu = changeDecimal((starRank * 0.1 + 1.0) * 0.4 * comDi[2], 2, 'round')

    zero = (1 - tsuikaritsu) * (1 - tsuikaritsu)
    one = 2 * tsuikaritsu * (1 - tsuikaritsu)
    two = tsuikaritsu * tsuikaritsu
    three = 0
    four = 0
    avrMdl = comDi[1] * one * 0.85 + comDi[1] * two * 1.37
    kaiSRshutsugen = one * 0.02 + two * 0.12
    jouiSRshutsugen = one * 0.01 + two * 0.03
  } else {
    tsuikaritsu = changeDecimal((0.2 * (starRank - 15)) * comDi[2], 2, 'round')

    zero = 0
    one = 0
    two = (1 - tsuikaritsu) * (1 - tsuikaritsu)
    three = 2 * tsuikaritsu * (1 - tsuikaritsu)
    four = tsuikaritsu * tsuikaritsu
    avrMdl = comDi[1] * two * 1.37 + comDi[1] * three * 2.22 + comDi[1] * four * 2.74
    kaiSRshutsugen = two * 0.12 + three * 0.14 + four * 0.24
    jouiSRshutsugen = two * 0.03 + three * 0.04 + four * 0.06
  }

  let reqMdl = (tarMdl - curMdl) > 0 ? tarMdl - curMdl : 0

  let liveTimes = Math.ceil((tarMdl - curMdl) / avrMdl)
  if (liveTimes < 0) liveTimes = 0

  zero = Math.round(zero * 100)
  one = Math.round(one * 100)
  two = Math.round(two * 100)
  three = Math.round(three * 100)
  four = Math.round(four * 100)
  avrMdl = Math.round(avrMdl)
  kaiSRshutsugen = changeDecimal(kaiSRshutsugen * liveTimes, 2, 'round')
  jouiSRshutsugen = changeDecimal(jouiSRshutsugen * liveTimes, 2, 'round')

  let levelUp = this.getLevelUpTimes(liveTimes, comDi[3], curExp)

  this.privateStatus['2'].output.levelUp = levelUp
  this.privateStatus['2'].output.extraRewardOdds = `${zero}/${one}/${two}/${three}/${four}`
  this.privateStatus['2'].output.cardRewardOdds = `${jouiSRshutsugen}/${kaiSRshutsugen}`
  this.privateStatus['2'].output.averageMedal = avrMdl
  this.privateStatus['2'].output.requireMedal = reqMdl
  this.privateStatus['2'].output.commonLiveTimes = liveTimes > 0 ? liveTimes : 0
  this.privateStatus['2'].output.bonusStamina = loginStamina
  this.ptCount(liveTimes, Number(comDi[0]), levelUp, '2', loginStamina)
}
