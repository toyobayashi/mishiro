import { openSqlite } from './sqlite3'

export default async function (manifestFile: string) {
  let manifest: any = await openSqlite(manifestFile)
  let manifests: any[] = []
  let manifestData: any = {}

  manifests = await manifest._all('SELECT name, hash FROM manifests')
  manifestData.liveManifest = await manifest._all('SELECT name, hash FROM manifests WHERE name LIKE "l/%"')
  manifestData.bgmManifest = await manifest._all('SELECT name, hash FROM manifests WHERE name LIKE "b/%"')
  manifestData.voiceManifest = await manifest._all('SELECT name, hash FROM manifests WHERE name LIKE "v/%"')
  manifestData.scoreManifest = await manifest._all('SELECT name, hash FROM manifests WHERE name LIKE "musicscores_m___.bdb"')

  manifest.close((err: Error) => {
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
  return { manifests, manifestData, masterHash }
}
