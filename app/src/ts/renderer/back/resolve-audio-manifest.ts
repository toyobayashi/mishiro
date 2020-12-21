import * as path from 'path'

interface Manifest {
  name: string
  hash: string
}

interface BGM extends Manifest {
  fileName: string
  awbHash?: string
}

interface Live extends Manifest {
  fileName: string
  score?: string
  scoreHash?: string
  jacket?: string
  jacketHash?: string
  bpm?: number
  awbHash?: string
}

interface Music {
  id: number
  name: string
  bpm: number
}

export default function (bgmManifest: BGM[], liveManifest: Live[], musicData: Music[], charaData: any[], liveData: any[], scoreManifest: Manifest[], jacketManifest: Manifest[]): {
  bgmManifest: BGM[]
  liveManifest: Live[]
} {
  const streamingList: string[] = []
  const streamingHash: string[] = []

  for (let i = 0; i < bgmManifest.length; i++) {
    const bgm = bgmManifest[i]
    if (path.extname(bgm.name) === '.awb') {
      const tmp = bgm.name.split('.')
      tmp[tmp.length - 1] = 'acb'
      streamingList.push(tmp.join('.'))
      streamingHash.push(bgm.hash)
      continue
    }
    const fileName = bgm.name.split('/')[1].split('.')[0] + '.mp3'
    bgmManifest[i].fileName = fileName
  }

  for (let i = 0; i < bgmManifest.length; i++) {
    const pos = streamingList.indexOf(bgmManifest[i].name)
    if (pos !== -1) {
      bgmManifest[i].awbHash = streamingHash[pos]
    }
  }

  streamingList.length = 0
  streamingHash.length = 0
  for (let i = 0; i < liveManifest.length; i++) {
    const song = liveManifest[i]
    // const name: string = song.name.split('/')[1].split('.')[0]
    if (path.extname(song.name) === '.awb') {
      const tmp = song.name.split('.')
      tmp[tmp.length - 1] = 'acb'
      streamingList.push(tmp.join('.'))
      streamingHash.push(song.hash)
      liveManifest.splice(i, 1)
      i--
      continue
    }
    const name: string = path.parse(song.name).name
    const arr: string[] = name.split('_')
    let fileName: string = ''
    if (arr[0] === 'song' && Number(arr[1]) < 1000) {
      fileName = name + '.mp3'
    } else if (arr[0] === 'inst') {
      fileName = 'inst_' + arr[2] + '-' + musicData.filter(row => Number(row.id) === Number(arr[2]))[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '.mp3'
    } else if (arr[0] === 'vo' && arr[1] === 'solo') {
      const charaName = charaData.filter(row => Number(row.chara_id) === Number(arr[3]))[0]
      fileName = 'vo_solo_' + arr[2] + musicData.filter(row => Number(row.id) === Number(arr[2]))[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '（' + (charaName ? charaName.name as string : arr[3]) + '）.mp3'
    } else {
      if (arr.length > 2) {
        if (isNaN(Number(arr[2]))) {
          fileName = arr[1] + '_' + arr[2] + '-' + musicData.filter(row => Number(row.id) === Number(arr[1]))[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '.mp3'
        } else {
          fileName = arr[1] + '_' + arr[2] + '-' + musicData.filter(row => Number(row.id) === Number(arr[1]))[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '（' + (charaData.filter(row => Number(row.chara_id) === Number(arr[2]))[0].name as string) + '）.mp3'
        }
      } else {
        fileName = arr[1] + '-' + musicData.filter(row => Number(row.id) === Number(arr[1]))[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '.mp3'
      }
      const liveDataArr = liveData.filter(row => Number(row.music_data_id) === Number(arr[1]))
      let id: any = null
      if (liveDataArr.length === 1) {
        id = liveDataArr[0].id
      } else {
        for (let j = 0; j < liveDataArr.length; j++) {
          if (Number(liveDataArr[j].event_type) !== 0 && Number(liveDataArr[j].difficulty_5) !== 0) {
            id = liveDataArr[j].id
          }
        }
        if (id === null) {
          id = liveDataArr[0].id
        }
      }

      const scoreId = id.toString().length >= 3 ? id : (id.toString().length === 2 ? `0${id}` : `00${id}`)
      const scoreExists = scoreManifest.filter(row => row.name === `musicscores_m${scoreId}.bdb`)
      if (scoreExists.length) {
        liveManifest[i].score = scoreExists[0].name
        liveManifest[i].scoreHash = scoreExists[0].hash
        liveManifest[i].bpm = musicData.filter(row => Number(row.id) === Number(arr[1]))[0].bpm
      }

      const jacketExists = jacketManifest.filter(row => row.name === `jacket_${arr[1]}.unity3d`)
      if (jacketExists.length) {
        liveManifest[i].jacket = jacketExists[0].name
        liveManifest[i].jacketHash = jacketExists[0].hash
      }
    }
    liveManifest[i].fileName = fileName
  }

  for (let i = 0; i < liveManifest.length; i++) {
    const pos = streamingList.indexOf(liveManifest[i].name)
    if (pos !== -1) {
      liveManifest[i].awbHash = streamingHash[pos]
    }
  }
  return { bgmManifest, liveManifest }
}
