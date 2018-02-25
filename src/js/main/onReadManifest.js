import sqlite3 from './node-module-sqlite3.js'

function openReadonlyDatabase (db) {
  return new Promise((resolve, reject) => {
    let d = new sqlite3.Database(db, sqlite3.OPEN_READONLY, err => {
      if (err) reject(err)
      else resolve(d)
    })
  })
}

export default async function (event, manifestFile, resVer) {
  let manifest = await openReadonlyDatabase(manifestFile)
  let manifests = []
  let manifestData = {}

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
  return { manifests, manifestData }
}
