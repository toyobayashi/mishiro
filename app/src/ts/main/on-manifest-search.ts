import { Event } from 'electron'
export default function (event: Event, queryString: string, manifests: any[]) {
  let manifestArr = []
  for (let i = 0; i < manifests.length; i++) {
    if (manifests[i].name.indexOf(queryString) !== -1) {
      manifestArr.push(manifests[i])
    }
  }
  event.returnValue = manifestArr
}
