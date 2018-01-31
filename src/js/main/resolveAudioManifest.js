export default function (bgmManifest, liveManifest, musicData, charaData) {
  for (let i = 0; i < bgmManifest.length; i++) {
    let bgm = bgmManifest[i]
    let fileName = bgm.name.split('/')[1].split('.')[0] + '.mp3'
    bgmManifest[i].fileName = fileName
  }

  for (let i = 0; i < liveManifest.length; i++) {
    let song = liveManifest[i]
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
  }
  return { bgmManifest, liveManifest }
}
