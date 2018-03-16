export default function (event, queryString, manifests) {
  let manifestArr = []
  for (let i = 0; i < manifests.length; i++) {
    if (manifests[i].name.indexOf(queryString) !== -1) {
      manifestArr.push(manifests[i])
    }
  }
  event.sender.send('queryManifest', manifestArr)
}
