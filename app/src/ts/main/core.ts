import configurer from './config'
import * as core from 'mishiro-core'

const confver = configurer.get('latestResVer')
const confacc = configurer.get('account')

const client = new core.Client(
  confacc || '::',
  confver !== undefined ? (confver/*  - 100 */).toString() : undefined
)

if (!client.user) {
  client.user = '506351535'
  client.viewer = '141935962'
  client.udid = 'edb05dd4-9d13-4f76-b860-95f7a79de44e'
}

export * from 'mishiro-core'

export { client }
