import { remote } from 'electron'
const mishiroCore: typeof import('mishiro-core') = remote.getGlobal('mishiroCore')

declare namespace window {
  export namespace mishiro {
    export const encode: typeof mishiroCore.Client.cryptoGrapher.encode
    export const decode: typeof mishiroCore.Client.cryptoGrapher.decode
    export const _decryptBody: typeof mishiroCore.Client.decryptBody
    export function decryptBody (body: string, udid: string): any
    export function getProfile (viewer: string | number): Promise<import('mishiro-core').ServerResponse>
  }
}

window.mishiro = {
  encode: mishiroCore.Client.cryptoGrapher.encode,
  decode: mishiroCore.Client.cryptoGrapher.decode,
  _decryptBody: mishiroCore.Client.decryptBody,
  decryptBody (body, udid) {
    if (!(/^[0-9a-f\-]{36}$/.test(udid))) {
      udid = mishiroCore.Client.cryptoGrapher.decode(udid)
    }
    return mishiroCore.Client.decryptBody(body, Buffer.from(udid.replace(/-/g, ''), 'hex'))
  },
  getProfile (viewer) {
    return (remote.getGlobal('client') as import('mishiro-core').Client).post('/profile/get_profile', { friend_id: viewer.toString() })
  }
}
