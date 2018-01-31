import { ipcMain } from 'electron'
import { exec } from 'child_process'
import fs from 'fs'
import { read } from '../util/fsExtra.js'
import SQL from './sqlExec.js'
import getEventData from './getEventData.js'
import getGachaData from './getGachaData.js'
import getLimitedCard from './getLimitedCard.js'
import resolveCharaData from './resolveCharaData.js'
import resolveCardData from './resolveCardData.js'
import resolveAudioManifest from './resolveAudioManifest.js'
import resolveGachaAvailable from './resolveGachaAvailable.js'
import resolveUserLevel from './resolveUserLevel.js'
import { getPath } from '../common/getPath.js'
import { configurer } from '../common/config.js';

(async function () {
  let config = await configurer.getConfig()
  let fix = {}
  if (!config.latestResVer) {
    fix.latestResVer = 10035100
  }
  if (config.language !== 'zh' && config.language !== 'ja') {
    fix.language = 'zh'
  }
  if (Object.keys(fix).length) {
    await configurer.configure(fix)
  }
})()

let manifestData = {}

ipcMain.on('readManifest', async (event, manifestFile, resVer) => {
  let manifest = new SQL.Database(await read(manifestFile))
  const manifests = manifest._exec('SELECT name, hash FROM manifests')
  manifestData.liveManifest = manifest._exec('SELECT name, hash FROM manifests WHERE name LIKE "l/%"')
  manifestData.bgmManifest = manifest._exec('SELECT name, hash FROM manifests WHERE name LIKE "b/%"')
  manifest.close()
  manifest = void 0
  console.log(`bgm: ${manifestData.bgmManifest.length}`)
  console.log(`live: ${manifestData.liveManifest.length}`)
  event.sender.send('readManifest', manifests, resVer)
})

ipcMain.on('readMaster', async (event, masterFile) => {
  let config = await configurer.getConfig()
  const timeOffset = (9 - (-(new Date().getTimezoneOffset() / 60))) * 60 * 60 * 1000
  const now = new Date().getTime()

  let master = new SQL.Database(await read(masterFile))
  const gachaAll = master._exec('SELECT * FROM gacha_data')
  const eventAll = master._exec('SELECT * FROM event_data')

  const eventData = getEventData(eventAll, config, now, timeOffset)
  console.log(`eventID: ${eventData.id}`)
  const eventAvailable = master._exec(`SELECT * FROM event_available WHERE event_id = "${eventData.id}"`)

  let cardData = master._exec('SELECT * FROM card_data')
  let charaData = master._exec('SELECT * FROM chara_data')
  const textData = master._exec("SELECT * FROM text_data WHERE category='2';SELECT * FROM text_data WHERE category='4'")
  const skillData = master._exec('SELECT * FROM skill_data')
  const leaderSkillData = master._exec('SELECT * FROM leader_skill_data')
  const musicData = master._exec('SELECT id, name FROM music_data')

  let { gachaNow, gachaData } = getGachaData(gachaAll, config, now, timeOffset)
  console.log(`gachaID: ${gachaData.id}`)
  let gachaAvailable = master._exec(`SELECT * FROM gacha_available WHERE gacha_id LIKE '${gachaData.id}'`)

  let liveManifest = manifestData.liveManifest
  let bgmManifest = manifestData.bgmManifest
  manifestData = {}

  let gachaLimited = master._exec('SELECT gacha_id, reward_id FROM gacha_available WHERE limited_flag = 1 ORDER BY reward_id')
  let eventLimited = master._exec('SELECT event_id, reward_id FROM event_available ORDER BY reward_id')

  let userLevel = master._exec('SELECT level, stamina, total_exp FROM user_level')
  master.close()
  master = void 0

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
    gachaData,
    gachaAvailable,
    gachaNow,
    userLevel,
    timeOffset
  })
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

export default void 0
