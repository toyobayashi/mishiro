import { Client, ServerResponse } from 'mishiro-core'
import { remote } from 'electron'

declare namespace window {
  export namespace mishiro {
    export const encode: typeof Client.cryptoGrapher.encode
    export const decode: typeof Client.cryptoGrapher.decode
    export const _decryptBody: typeof Client.decryptBody
    export function decryptBody (body: string, udid: string): any
    export function getProfile (viewer: string | number): Promise<ServerResponse>
  }
}

window.mishiro = {
  encode: Client.cryptoGrapher.encode,
  decode: Client.cryptoGrapher.decode,
  _decryptBody: Client.decryptBody,
  decryptBody (body, udid) {
    if (!(/^[0-9a-f\-]{36}$/.test(udid))) {
      udid = Client.cryptoGrapher.decode(udid)
    }
    return Client.decryptBody(body, Buffer.from(udid.replace(/-/g, ''), 'hex'))
  },
  getProfile (viewer) {
    return (remote.getGlobal('client') as Client).post('/profile/get_profile', { friend_id: viewer.toString() })
  }
}
