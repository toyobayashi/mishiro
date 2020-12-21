import getEventData from './get-event-data'
// import getGachaData from './get-gacha-data'
import getLimitedCard from './get-limited-card'
import resolveCharaData from './resolve-chara-data'
import resolveCardData from './resolve-card-data'
import resolveAudioManifest from './resolve-audio-manifest'
// import resolveGachaAvailable from './resolve-gacha-available'
import resolveUserLevel from './resolve-user-level'
// import { openSqlite } from './sqlite3'
import DB from './db'

// let masterData: MasterData | null = null

export default async function readMaster (masterFile: string/* , config: MishiroConfig, manifests: { name: string; hash: string; [x: string]: any }[] */): Promise<{
  eventAll: any
  eventData: any
  eventAvailable: any
  eventHappening: any
  cardData: any
  bgmManifest: any
  liveManifest: any
  voiceManifest: any
  userLevel: any
  timeOffset: any
}> {
  // if (masterData) return masterData
  // const config = configurer.getConfig()
  const { getCache } = __non_webpack_require__('./export.js')

  const manifestDB: DB = getCache('manifestDB')

  const timeOffset = (9 - (-(new Date().getTimezoneOffset() / 60))) * 60 * 60 * 1000
  const now = new Date().getTime()

  // let master: any = await openSqlite(masterFile)
  const master = new DB(masterFile)
  const gachaAll = await master.find('gacha_data')
  const eventAll = await master.find('event_data')

  const { eventData, eventHappening } = getEventData(eventAll, now, timeOffset)
  console.log(`eventID: ${eventData.id}`)
  const eventAvailable = await master.find('event_available', undefined, { event_id: eventData.id })

  let cardData = await master.find('card_data')
  let charaData = await master.find('chara_data')
  const textData = [await master.find('text_data', undefined, { category: '2' }), await master.find('text_data', undefined, { category: '4' })]
  const skillData = await master.find('skill_data')
  const leaderSkillData = await master.find('leader_skill_data')
  const musicData = await master.find('music_data', ['id', 'name', 'bpm'])

  // let { gachaNow, gachaData } = getGachaData(gachaAll, config, now, timeOffset)
  // console.log(`gachaID: ${gachaData.id}`)
  // let gachaAvailable = await master._all(`SELECT * FROM gacha_available WHERE gacha_id LIKE '${gachaData.id}'`)

  // let liveManifest = manifestData.liveManifest
  // let bgmManifest = manifestData.bgmManifest
  // let voiceManifest = manifestData.voiceManifest
  // let scoreManifest = manifestData.scoreManifest
  // manifestData = {}

  let liveManifest = await manifestDB.find('manifests', ['name', 'hash'], { name: { $like: 'l/%' } })
  let bgmManifest = await manifestDB.find('manifests', ['name', 'hash'], { name: { $like: 'b/%' } })
  const voiceManifest = await manifestDB.find('manifests', ['name', 'hash'], { name: { $like: 'v/%' } })
  const scoreManifest = await manifestDB.find('manifests', ['name', 'hash'], { name: { $like: 'musicscores_m___.bdb' } })

  // let gachaLimited = await master._all('SELECT gacha_id, reward_id FROM gacha_available WHERE limited_flag = 1 ORDER BY reward_id')
  const gachaLimited = await master.find('gacha_available', ['gacha_id', 'reward_id'], { limited_flag: 1 }, { reward_id: 1 })
  // let eventLimited = await master._all('SELECT event_id, reward_id FROM event_available ORDER BY reward_id')
  const eventLimited = await master.find('event_available', ['event_id', 'reward_id'], undefined, { reward_id: 1 })

  let userLevel = await master.find('user_level', ['level', 'stamina', 'total_exp'])
  const liveData = await master.find('live_data', ['id', 'music_data_id'])
  const jacketManifest = await manifestDB.find('manifests', ['name', 'hash'], { name: { $like: 'jacket%unity3d' } })
  // master.close((err: Error) => {
  //   if (err) throw err
  //   master = void 0
  // })

  await master.close()

  const { gachaLimitedCard, eventLimitedCard } = getLimitedCard(eventAll, gachaAll, eventLimited, gachaLimited)
  charaData = resolveCharaData(charaData, textData)
  cardData = resolveCardData(cardData, charaData, skillData, leaderSkillData, eventLimitedCard, gachaLimitedCard)

  const audioManifest = resolveAudioManifest(bgmManifest, liveManifest, musicData, charaData, liveData, scoreManifest, jacketManifest)
  bgmManifest = audioManifest.bgmManifest
  liveManifest = audioManifest.liveManifest

  // let resolvedGacha = await resolveGachaAvailable(gachaAvailable, cardData, gachaData)
  // gachaAvailable = resolvedGacha.gachaAvailable
  // gachaData.count = resolvedGacha.count

  userLevel = resolveUserLevel(userLevel)

  // let gachaIcon: { name: string; hash: string; [x: string]: any }[] = gachaAvailable.map((o: any) => {
  //   return manifests.filter(m => m.name === `card_${o.reward_id}_m.unity3d`)[0]
  // })
  return {
    eventAll,
    eventData,
    eventAvailable,
    eventHappening,
    cardData,
    bgmManifest,
    liveManifest,
    voiceManifest,
    // gachaData,
    // gachaAvailable,
    // gachaNow,
    // gachaIcon,
    userLevel,
    timeOffset
  }
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
  // gachaData: any[]
  // gachaAvailable: any[]
  // gachaNow: any
  // gachaIcon: { name: string; hash: string; [x: string]: any }[]
  userLevel: any[]
  timeOffset: number
}
