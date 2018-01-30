import { ipcMain } from 'electron'
import { exec } from 'child_process'
import fs from 'fs'
import SQL from './sqlExec.js'
import { getPath } from '../common/getPath.js'
import { configurer } from '../common/config.js'

const timeOffset = (9 - (-(new Date().getTimezoneOffset() / 60))) * 60 * 60 * 1000
const now = new Date().getTime()

let config = configurer.getConfig()
let fix = {}
if (!config.latestResVer) {
  fix.latestResVer = 10035000
}
if (config.language !== 'zh' && config.language !== 'ja') {
  fix.language = 'zh'
}
if (Object.keys(fix).length) {
  configurer.configure(fix)
}

let manifest = null

function getRarity (id, cardData) {
  for (var i = 0; i < cardData.length; i++) {
    if (id == cardData[i].id) {
      return cardData[i].rarity
    }
  }
}

ipcMain.on('readManifest', (event, manifestFile, resVer) => {
  manifest = new SQL.Database(manifestFile)
  const manifests = manifest._exec('SELECT name, hash FROM manifests')
  event.sender.send('readManifest', manifests, resVer)
})

ipcMain.on('readMaster', (event, masterFile) => {
  const master = new SQL.Database(masterFile)
  const gachaAll = master._exec('SELECT * FROM gacha_data')
  const eventAll = master._exec('SELECT * FROM event_data')
  /**
   * event finding, return event data object
   */
  let eventNow = null
  eventAll.sort((a, b) => new Date(b.event_start).getTime() - new Date(a.event_start).getTime())
  for (let i = 0; i < eventAll.length; i++) {
    const e = eventAll[i]
    const start = new Date(e.event_start).getTime() - timeOffset
    const end = new Date(e.result_end).getTime() - timeOffset
    if (now >= start && now <= end) {
      eventNow = e
      break
    }
  }
  if (!eventNow) eventNow = now > new Date(eventAll[0].result_end).getTime() ? eventAll[0] : eventAll[1]
  // const eventNow = master._exec("SELECT * FROM event_data WHERE event_start = (SELECT MAX(event_start) FROM (SELECT * FROM event_data WHERE event_start < DATETIME(CURRENT_TIMESTAMP, 'localtime')))")[0]

  const eventData = config.event ? master._exec(`SELECT * FROM event_data WHERE id="${config.event}"`)[0] : eventNow
  const eventAvailable = master._exec(`SELECT * FROM event_available WHERE event_id = "${eventData.id}"`)

  let cardData = master._exec('SELECT * FROM card_data')
  let charaData = master._exec('SELECT * FROM chara_data')
  const textData = master._exec("SELECT * FROM text_data WHERE category='2';SELECT * FROM text_data WHERE category='4'")
  const skillData = master._exec('SELECT * FROM skill_data')
  const leaderSkillData = master._exec('SELECT * FROM leader_skill_data')
  const musicData = master._exec('SELECT id, name FROM music_data')

  /**
   * gacha finding, return gacha Array
   */
  let gachaNowArray = []
  gachaAll.forEach((gacha, i) => {
    if (gacha.id > 30000 && gacha.id < 40000) {
      const start = new Date(gacha.start_date).getTime() - timeOffset
      const end = new Date(gacha.end_date).getTime() - timeOffset
      if (now >= start && now <= end) gachaNowArray.push(gacha)
    }
  })
  gachaNowArray.sort((a, b) => a.id - b.id)
  // let gachaNowArray = master._exec("SELECT * FROM gacha_data WHERE start_date = (SELECT MAX(start_date) FROM gacha_data WHERE id LIKE '3%') AND id LIKE '3%'")
  let gachaNow = gachaNowArray[gachaNowArray.length - 1]
  let gachaData = config.gacha ? master._exec(`SELECT * FROM gacha_data WHERE id="${config.gacha}"`)[0] : gachaNow
  let gachaAvailable = master._exec(`SELECT * FROM gacha_available WHERE gacha_id LIKE '${gachaData.id}'`)

  let liveManifest = manifest._exec('SELECT name, hash FROM manifests WHERE name LIKE "l/%"')
  let bgmManifest = manifest._exec('SELECT name, hash FROM manifests WHERE name LIKE "b/%"')

  let gachaLimited = master._exec('SELECT gacha_id, reward_id FROM gacha_available WHERE limited_flag = 1 ORDER BY reward_id')
  let eventLimited = master._exec('SELECT event_id, reward_id FROM event_available ORDER BY reward_id')

  const userLevel = master._exec('SELECT level, stamina, total_exp FROM user_level')
  manifest.close()
  master.close()

  let gachaLimitedCard = {}
  gachaLimited.forEach((card) => {
    if (!gachaLimitedCard[card['reward_id']]) {
      gachaLimitedCard[card['reward_id']] = []
    }
    let gacha = gachaAll.filter(gacha => gacha.id == card['gacha_id'])[0]
    gachaLimitedCard[card['reward_id']].push({ name: gacha.name, id: gacha.id, startDate: gacha.start_date.split(' ')[0], endDate: gacha.end_date.split(' ')[0] })
  })

  let eventLimitedCard = {}
  eventLimited.forEach((card) => {
    if (!eventLimitedCard[card['reward_id']]) {
      eventLimitedCard[card['reward_id']] = []
    }
    let event = eventAll.filter(event => event.id == card['event_id'])[0]
    eventLimitedCard[card['reward_id']].push({ name: event.name, id: event.id, startDate: event.event_start.split(' ')[0], endDate: event.event_end.split(' ')[0] })
  })

  charaData.forEach((chara, i) => {
    let hometown = textData[0].filter(row => row.index == chara.home_town)[0]
    let seiza = textData[1].filter(row => (1000 + Number(row.index)) == chara.constellation)[0]
    if (hometown) {
      charaData[i].hometown = hometown.text
    }
    if (seiza) {
      charaData[i].seiza = seiza.text
    }
  })

  let gachaLimitedCardId = Object.keys(gachaLimitedCard).map(id => Number(id))
  let eventLimitedCardId = Object.keys(eventLimitedCard).map(id => Number(id))
  cardData.forEach((card, i) => {
    cardData[i].charaData = charaData.filter(row => row.chara_id == card.chara_id)[0]
    cardData[i].skill = skillData.filter(row => row.id == card.skill_id)[0]
    cardData[i].leaderSkill = leaderSkillData.filter(row => row.id == card.leader_skill_id)[0]
    if (eventLimitedCardId.indexOf(cardData[i].id) !== -1) {
      cardData[i].limited = eventLimitedCard[cardData[i].id]
    }
    if (gachaLimitedCardId.indexOf(cardData[i].id) !== -1) {
      cardData[i].limited = gachaLimitedCard[cardData[i].id]
    }
  })
  bgmManifest.forEach((bgm, i) => {
    let fileName = bgm.name.split('/')[1].split('.')[0] + '.mp3'
    bgmManifest[i].fileName = fileName
  })
  liveManifest.forEach((song, i) => {
    let name = song.name.split('/')[1].split('.')[0]
    let arr = name.split('_')
    let fileName = ''
    if (Number(arr[1]) < 1000) {
      fileName = name + '.mp3'
    } else {
      if (arr.length > 2) {
        if (arr[2] === 'another') {
          fileName = arr[1] + '_' + arr[2] + '-' + musicData.filter(row => row.id == arr[1])[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '.mp3'
        } else {
          fileName = arr[1] + '_' + arr[2] + '-' + musicData.filter(row => row.id == arr[1])[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '（' + charaData.filter(row => row.chara_id == arr[2])[0].name + '）.mp3'
        }
      } else {
        fileName = arr[1] + '-' + musicData.filter(row => row.id == arr[1])[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '.mp3'
      }
    }
    liveManifest[i].fileName = fileName
  })

  let R = 0
  let SR = 0
  let SSR = 0
  let fes = false
  let SSR_UP = 0
  let SR_UP = 0
  let REC = 0
  gachaAvailable.forEach(function (v, i) {
    gachaAvailable[i].rarity = getRarity(v.reward_id, cardData)
    if (gachaAvailable[i].rarity == 3) {
      R++
    } else if (gachaAvailable[i].rarity == 5) {
      SR++
      if (gachaAvailable[i].up_value == 1) {
        SR_UP++
      }
    } else if (gachaAvailable[i].rarity == 7) {
      SSR++
      if (gachaAvailable[i].up_value == 1) {
        SSR_UP++
      }
      if (gachaAvailable[i].recommend_order > 0) {
        REC++
      }
    }
  })

  if (new RegExp('シンデレラフェス').test(gachaData.dicription)) {
    fes = true
  }
  if (gachaAvailable[0]['relative_odds'] === 0) {
    let R_ODDS = 850000
    let SR_ODDS = 120000
    let SSR_ODDS = 30000
    let R_ODDS_SR = 0
    let SR_ODDS_SR = 970000
    let SSR_ODDS_SR = 30000
    let SR_UP_ODDS = 0
    let SSR_UP_ODDS = 0
    let SR_UP_ODDS_SR = 0

    if (SSR_UP > 0 && SR_UP > 0) {
      if (SSR_UP === 1) {
        SSR_UP_ODDS = 7500
      } else if (SSR_UP === 2) {
        SSR_UP_ODDS = 8000
      }
      SR_UP_ODDS = 24000
      SR_UP_ODDS_SR = 200000
    }

    if (fes) {
      R_ODDS = 820000; SR_ODDS = 120000; SSR_ODDS = 60000
      R_ODDS_SR = 0; SR_ODDS_SR = 940000; SSR_ODDS_SR = 60000
      switch (REC) {
        case 1:
          SSR_UP_ODDS = 15000
          break
        case 2:
          SSR_UP_ODDS = 17500
          break
        default:
          SSR_UP_ODDS = 15000
          break
      }
    }

    gachaAvailable.forEach(function (v, i) {
      if (v.rarity == 3) {
        gachaAvailable[i]['relative_odds'] = Math.round(R_ODDS / R)
        gachaAvailable[i]['relative_sr_odds'] = Math.round(R_ODDS_SR / R)
      } else if (v.rarity == 5) {
        if (v.up_value == 1) {
          gachaAvailable[i]['relative_odds'] = Math.round(SR_UP_ODDS / SR_UP)
          gachaAvailable[i]['relative_sr_odds'] = Math.round(SR_UP_ODDS_SR / SR_UP)
        } else {
          gachaAvailable[i]['relative_odds'] = Math.round((SR_ODDS - SR_UP_ODDS) / (SR - SR_UP))
          gachaAvailable[i]['relative_sr_odds'] = Math.round((SR_ODDS_SR - SR_UP_ODDS_SR) / (SR - SR_UP))
        }
      } else if (v.rarity == 7) {
        if (fes) {
          if (v.up_value == 1) {
            if (v.recommend_order > 0) {
              gachaAvailable[i]['relative_odds'] = (SSR_UP_ODDS - 7500) / REC
              gachaAvailable[i]['relative_sr_odds'] = (SSR_UP_ODDS - 7500) / REC
            } else {
              gachaAvailable[i]['relative_odds'] = Math.round(7500 / (SSR_UP - REC))
              gachaAvailable[i]['relative_sr_odds'] = Math.round(7500 / (SSR_UP - REC))
            }
          } else {
            gachaAvailable[i]['relative_odds'] = Math.round((SSR_ODDS - SSR_UP_ODDS) / (SSR - SSR_UP))
            gachaAvailable[i]['relative_sr_odds'] = Math.round((SSR_ODDS_SR - SSR_UP_ODDS) / (SSR - SSR_UP))
          }
        } else {
          if (v.up_value == 1) {
            gachaAvailable[i]['relative_odds'] = Math.round(SSR_UP_ODDS / SSR_UP)
            gachaAvailable[i]['relative_sr_odds'] = Math.round(SSR_UP_ODDS / SSR_UP)
          } else {
            gachaAvailable[i]['relative_odds'] = Math.round((SSR_ODDS - SSR_UP_ODDS) / (SSR - SSR_UP))
            gachaAvailable[i]['relative_sr_odds'] = Math.round((SSR_ODDS_SR - SSR_UP_ODDS) / (SSR - SSR_UP))
          }
        }
      }
    })
  }
  gachaData.count = { R, SR, SSR, fes }

  userLevel.sort((a, b) => a.level - b.level)
  userLevel.forEach((level, i) => {
    if (i !== userLevel.length - 1) level.exp = userLevel[i + 1].total_exp - level.total_exp
    else level.exp = Infinity
  })

  event.sender.send('readMaster', { eventAll, eventNow, cardData, eventData, eventAvailable, bgmManifest, liveManifest, gachaData, gachaAvailable, gachaNow, userLevel, timeOffset })
})

ipcMain.on('acb', (event, acbPath, url = '') => {
  const name = acbPath.split('\\')[acbPath.split('\\').length - 1].split('.')[0]
  exec(`${getPath()}\\bin\\CGSSAudio.exe ${acbPath}`, (err) => {
    if (!err) {
      if (url) {
        let urlArr = url.split('/')
        if (urlArr[urlArr.length - 2] === 'live') {
          let fileName = urlArr[urlArr.length - 1]
          urlArr[urlArr.length - 1] = fileName
          fs.renameSync(getPath(`./public/asset/sound/live/${name}.mp3`), getPath(`./public/asset/sound/live/${fileName}`))
          event.sender.send('acb', acbPath, url)
        } else {
          event.sender.send('acb', acbPath, url)
        }
      } else {
        fs.unlinkSync(acbPath)
      }
    }
  })
})

export default config
