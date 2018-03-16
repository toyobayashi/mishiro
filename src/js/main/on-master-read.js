import sqlite3 from './node-module-sqlite3.js'

import getEventData from './get-event-data.js'
import getGachaData from './get-gacha-data.js'
import getLimitedCard from './get-limited-card.js'
import resolveCharaData from './resolve-chara-data.js'
import resolveCardData from './resolve-card-data.js'
import resolveAudioManifest from './resolve-audio-manifest.js'
import resolveGachaAvailable from './resolve-gacha-available.js'
import resolveUserLevel from './resolve-user-level.js'

export default async function (event, masterFile, manifestData, config) {
  const timeOffset = (9 - (-(new Date().getTimezoneOffset() / 60))) * 60 * 60 * 1000
  const now = new Date().getTime()

  let master = await sqlite3.openAsync(masterFile)
  const gachaAll = await master._all('SELECT * FROM gacha_data')
  const eventAll = await master._all('SELECT * FROM event_data')

  const { eventData, eventHappening } = getEventData(eventAll, config, now, timeOffset)
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
    eventHappening,
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
}
