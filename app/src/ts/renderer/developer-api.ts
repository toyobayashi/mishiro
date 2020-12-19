const mishiroCore = window.node.mishiroCore

declare global {
  interface Window {
    mishiro: {
      encode: typeof mishiroCore.Client.cryptoGrapher.encode
      decode: typeof mishiroCore.Client.cryptoGrapher.decode
      _decryptBody: typeof mishiroCore.Client.decryptBody
      decryptBody: (body: string, udid: string) => any
      getProfile: (viewer: string | number) => Promise<import('mishiro-core').ServerResponse>
    }
  }
}

window.mishiro = {
  encode: mishiroCore.Client.cryptoGrapher.encode,
  decode: mishiroCore.Client.cryptoGrapher.decode,
  _decryptBody: mishiroCore.Client.decryptBody,
  decryptBody (body, udid) {
    if (!(/^[0-9a-f-]{36}$/.test(udid))) {
      udid = mishiroCore.Client.cryptoGrapher.decode(udid)
    }
    return mishiroCore.Client.decryptBody(body, Buffer.from(udid.replace(/-/g, ''), 'hex'))
  },
  getProfile (viewer) {
    return window.preload.client.post('/profile/get_profile', { friend_id: viewer.toString() })
  }
}

export {}
