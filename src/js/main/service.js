import { ipcMain } from 'electron'
// import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
/* import { read } from '../util/fsExtra.js'
import SQL from './sqlExec.js' */
import sqlite3 from './node-module-sqlite3.js'
import getEventData from './getEventData.js'
import getGachaData from './getGachaData.js'
import getLimitedCard from './getLimitedCard.js'
import resolveCharaData from './resolveCharaData.js'
import resolveCardData from './resolveCardData.js'
import resolveAudioManifest from './resolveAudioManifest.js'
import resolveGachaAvailable from './resolveGachaAvailable.js'
import resolveUserLevel from './resolveUserLevel.js'
import { acb2mp3 } from './audio.js'
import { getPath } from '../common/getPath.js'
import { configurer } from '../common/config.js';

(async function () {
  let config = await configurer.getConfig()
  let fix = {}
  if (!config.latestResVer) {
    fix.latestResVer = 10035250
  }
  if (config.language !== 'zh' && config.language !== 'ja') {
    fix.language = 'zh'
  }
  if (Object.keys(fix).length) {
    await configurer.configure(fix)
  }
})()

sqlite3.Database.prototype._all = function (sql) {
  return new Promise((resolve, reject) => {
    this.all(sql, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

let manifestData = {}
let manifests = []

ipcMain.on('queryManifest', (event, queryString) => {
  let manifestArr = []
  for (let i = 0; i < manifests.length; i++) {
    if (manifests[i].name.indexOf(queryString) !== -1) {
      manifestArr.push(manifests[i])
    }
  }
  event.sender.send('queryManifest', manifestArr)
})

ipcMain.on('readManifest', (event, manifestFile, resVer) => {
  // let manifest = new SQL.Database(await read(manifestFile))
  let manifest = new sqlite3.Database(manifestFile, sqlite3.OPEN_READONLY, async err => {
    if (err) throw err
    manifests = await manifest._all('SELECT name, hash FROM manifests')
    manifestData.liveManifest = await manifest._all('SELECT name, hash FROM manifests WHERE name LIKE "l/%"')
    manifestData.bgmManifest = await manifest._all('SELECT name, hash FROM manifests WHERE name LIKE "b/%"')
    manifestData.voiceManifest = await manifest._all('SELECT name, hash FROM manifests WHERE name LIKE "v/%"')

    manifest.close(err => {
      if (err) throw err
      manifest = void 0
    })

    let masterHash = ''
    for (let i = 0; i < manifests.length; i++) {
      if (manifests[i].name === 'master.mdb') {
        masterHash = manifests[i].hash
      }
    }
    console.log(`manifest: ${manifests.length}`)
    console.log(`bgm: ${manifestData.bgmManifest.length}`)
    console.log(`live: ${manifestData.liveManifest.length}`)
    event.sender.send('readManifest', masterHash, resVer)
  })
})

ipcMain.on('readMaster', async (event, masterFile) => {
  let config = await configurer.getConfig()
  const timeOffset = (9 - (-(new Date().getTimezoneOffset() / 60))) * 60 * 60 * 1000
  const now = new Date().getTime()

  let master = new sqlite3.Database(masterFile, sqlite3.OPEN_READONLY, async err => {
    if (err) throw err
    const gachaAll = await master._all('SELECT * FROM gacha_data')
    const eventAll = await master._all('SELECT * FROM event_data')

    const eventData = getEventData(eventAll, config, now, timeOffset)
    console.log(`eventID: ${eventData.id}`)
    const eventAvailable = await master._all(`SELECT * FROM event_available WHERE event_id = "${eventData.id}"`)

    let cardData = await master._all('SELECT * FROM card_data')
    let charaData = await master._all('SELECT * FROM chara_data')
    const textData = [await master._all("SELECT * FROM text_data WHERE category='2'"), await master._all("SELECT * FROM text_data WHERE category='4'")]
    const skillData = await master._all('SELECT * FROM skill_data')
    const leaderSkillData = await master._all('SELECT * FROM leader_skill_data')
    const musicData = await master._all('SELECT id, name FROM music_data')

    let { gachaNow, gachaData } = getGachaData(gachaAll, config, now, timeOffset)
    console.log(`gachaID: ${gachaData.id}`)
    let gachaAvailable = await master._all(`SELECT * FROM gacha_available WHERE gacha_id LIKE '${gachaData.id}'`)

    let liveManifest = manifestData.liveManifest
    let bgmManifest = manifestData.bgmManifest
    let voiceManifest = manifestData.voiceManifest
    manifestData = {}

    let gachaLimited = await master._all('SELECT gacha_id, reward_id FROM gacha_available WHERE limited_flag = 1 ORDER BY reward_id')
    let eventLimited = await master._all('SELECT event_id, reward_id FROM event_available ORDER BY reward_id')

    let userLevel = await master._all('SELECT level, stamina, total_exp FROM user_level')
    master.close(err => {
      if (err) throw err
      master = void 0
    })

    let { gachaLimitedCard, eventLimitedCard } = getLimitedCard(eventAll, gachaAll, eventLimited, gachaLimited)
    charaData = resolveCharaData(charaData, textData)
    cardData = resolveCardData(cardData, charaData, skillData, leaderSkillData, eventLimitedCard, gachaLimitedCard)

    let audioManifest = resolveAudioManifest(bgmManifest, liveManifest, musicData, charaData)
    bgmManifest = audioManifest.bgmManifest
    liveManifest = audioManifest.liveManifest

    let resolvedGacha = resolveGachaAvailable(gachaAvailable, cardData, gachaData)
    gachaAvailable = resolvedGacha.gachaAvailable
    gachaData.count = resolvedGacha.count

    userLevel = resolveUserLevel(userLevel)

    event.sender.send('readMaster', {
      eventAll,
      eventData,
      eventAvailable,
      cardData,
      bgmManifest,
      liveManifest,
      voiceManifest,
      gachaData,
      gachaAvailable,
      gachaNow,
      userLevel,
      timeOffset
    })
  })
})

ipcMain.on('acb', async (event, acbPath, url = '') => {
  let isArr = Array.isArray(acbPath)
  try {
    if (isArr) {
      for (let i = 0; i < acbPath.length; i++) {
        await acb2mp3(acbPath[i])
      }
    } else {
      await acb2mp3(acbPath)
    }
  } catch (err) {
    throw err
  }
  if (url) {
    const name = path.parse(acbPath).name
    let urlArr = url.split('/')
    if (urlArr[urlArr.length - 2] === 'live') {
      let fileName = urlArr[urlArr.length - 1]
      fs.renameSync(getPath(`./public/asset/sound/live/${name}.mp3`), getPath(`./public/asset/sound/live/${fileName}`))
      event.sender.send('acb', url)
    } else {
      event.sender.send('acb', url)
    }
  } else {
    let pathArr = isArr ? acbPath[0].split('\\') : acbPath.split('\\')
    if (pathArr[pathArr.length - 3] === 'voice') {
      event.sender.send('voice')
    }
  }
  if (isArr) {
    for (let i = 0; i < acbPath.length; i++) {
      fs.unlinkSync(acbPath[i])
    }
  } else {
    fs.unlinkSync(acbPath)
  }
  /* exec(`${getPath()}\\bin\\CGSSAudio.exe ${acbPath}`, (err) => {
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
  }) */
})

export default void 0
