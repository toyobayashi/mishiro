import { MishiroConfig } from '../main/config'
export default function (gachaAll: any[], config: MishiroConfig, now: number, timeOffset: number): {
  gachaNow: any
  gachaData: any
} {
  gachaAll.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

  const gachaNowArray = []

  for (let i = 0; i < gachaAll.length; i++) {
    const gacha = gachaAll[i]
    if (gacha.id > 30000 && gacha.id < 40000) {
      const start = new Date(gacha.start_date).getTime() - timeOffset
      const end = new Date(gacha.end_date).getTime() - timeOffset
      if (now >= start && now <= end) gachaNowArray.push(gacha)
    }
  }
  if (!gachaNowArray.length) {
    for (let i = 0; i < gachaAll.length; i++) {
      if (gachaAll[i].id > 30000 && gachaAll[i].id < 40000) {
        gachaNowArray.push(gachaAll[i])
        break
      }
    }
  } else gachaNowArray.sort((a, b) => a.id - b.id)

  // let gachaNowArray = master._exec("SELECT * FROM gacha_data WHERE start_date = (SELECT MAX(start_date) FROM gacha_data WHERE id LIKE '3%') AND id LIKE '3%'")
  const gachaNow = gachaNowArray[gachaNowArray.length - 1]
  let gachaData = null

  if (config && config.gacha) {
    for (let i = 0; i < gachaAll.length; i++) {
      if (config.gacha === Number(gachaAll[i].id)) {
        gachaData = gachaAll[i]
        break
      }
    }
  } else gachaData = gachaNow

  return {
    gachaNow,
    gachaData
  }
}
