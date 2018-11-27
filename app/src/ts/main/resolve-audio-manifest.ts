interface Manifest {
  name: string
  hash: string
}

interface BGM extends Manifest {
  fileName: string
}

interface Live extends Manifest {
  fileName: string
  score?: string
  scoreHash?: string
  bpm?: number
}

interface Music {
  id: number
  name: string
  bpm: number
}

export default function (bgmManifest: BGM[], liveManifest: Live[], musicData: Music[], charaData: any[], liveData: any[], scoreManifest: Manifest[]) {
  for (let i = 0; i < bgmManifest.length; i++) {
    let bgm = bgmManifest[i]
    let fileName = bgm.name.split('/')[1].split('.')[0] + '.mp3'
    bgmManifest[i].fileName = fileName
  }

  for (let i = 0; i < liveManifest.length; i++) {
    let song = liveManifest[i]
    let name: string = song.name.split('/')[1].split('.')[0]
    let arr: string[] = name.split('_')
    let fileName: string = ''
    if (Number(arr[1]) < 1000) {
      fileName = name + '.mp3'
    } else {
      if (arr.length > 2) {
        if (arr[2] === 'another') {
          fileName = arr[1] + '_' + arr[2] + '-' + musicData.filter(row => Number(row.id) === Number(arr[1]))[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '.mp3'
        } else {
          fileName = arr[1] + '_' + arr[2] + '-' + musicData.filter(row => Number(row.id) === Number(arr[1]))[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '（' + charaData.filter(row => Number(row.chara_id) === Number(arr[2]))[0].name + '）.mp3'
        }
      } else {
        fileName = arr[1] + '-' + musicData.filter(row => Number(row.id) === Number(arr[1]))[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '.mp3'
      }
      let id = liveData.filter(row => Number(row.music_data_id) === Number(arr[1]))[0].id
      let scoreId = id.toString().length >= 3 ? id : (id.toString().length === 2 ? '0' + id : '00' + id)
      let scoreExists = scoreManifest.filter(row => row.name === `musicscores_m${scoreId}.bdb`)
      if (scoreExists.length) {
        liveManifest[i].score = scoreExists[0].name
        liveManifest[i].scoreHash = scoreExists[0].hash
        liveManifest[i].bpm = musicData.filter(row => Number(row.id) === Number(arr[1]))[0].bpm
      }
    }
    liveManifest[i].fileName = fileName
  }
  return { bgmManifest, liveManifest }
}
