import { Event } from 'electron'
import { MishiroConfig } from '../common/config'
import getEventData from './get-event-data'
import getGachaData from './get-gacha-data'
import getLimitedCard from './get-limited-card'
import resolveCharaData from './resolve-chara-data'
import resolveCardData from './resolve-card-data'
import resolveAudioManifest from './resolve-audio-manifest'
import resolveGachaAvailable from './resolve-gacha-available'
import resolveUserLevel from './resolve-user-level'
import { openSqlite } from './sqlite3'

export default async function (event: Event, masterFile: string, manifestData: any, config: MishiroConfig) {
  const timeOffset = (9 - (-(new Date().getTimezoneOffset() / 60))) * 60 * 60 * 1000
  const now = new Date().getTime()

  let master: any = await openSqlite(masterFile)
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
  const musicData = await master._all('SELECT id, name, bpm FROM music_data')

  let { gachaNow, gachaData } = getGachaData(gachaAll, config, now, timeOffset)
  console.log(`gachaID: ${gachaData.id}`)
  let gachaAvailable = await master._all(`SELECT * FROM gacha_available WHERE gacha_id LIKE '${gachaData.id}'`)

  let liveManifest = manifestData.liveManifest
  let bgmManifest = manifestData.bgmManifest
  let voiceManifest = manifestData.voiceManifest
  let scoreManifest = manifestData.scoreManifest
  manifestData = {}

  let gachaLimited = await master._all('SELECT gacha_id, reward_id FROM gacha_available WHERE limited_flag = 1 ORDER BY reward_id')
  let eventLimited = await master._all('SELECT event_id, reward_id FROM event_available ORDER BY reward_id')

  let userLevel = await master._all('SELECT level, stamina, total_exp FROM user_level')
  let liveData = await master._all('SELECT id, music_data_id FROM live_data')
  master.close((err: Error) => {
    if (err) throw err
    master = void 0
  })

  let { gachaLimitedCard, eventLimitedCard } = getLimitedCard(eventAll, gachaAll, eventLimited, gachaLimited)
  charaData = resolveCharaData(charaData, textData)
  cardData = resolveCardData(cardData, charaData, skillData, leaderSkillData, eventLimitedCard, gachaLimitedCard)

  let audioManifest = resolveAudioManifest(bgmManifest, liveManifest, musicData, charaData, liveData, scoreManifest)
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

export interface MasterData {
  eventAll: any[]
  eventData: any
  eventAvailable: any[]
  eventHappening: any
  cardData: any[]
  bgmManifest: any[]
  liveManifest: any[]
  voiceManifest: any[]
  gachaData: any[]
  gachaAvailable: any[]
  gachaNow: any
  userLevel: any[]
  timeOffset: number
}
