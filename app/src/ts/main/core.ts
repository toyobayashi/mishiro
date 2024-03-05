import configurer from './config'
import * as core from 'mishiro-core'

const confver = configurer.get('latestResVer')
const confacc = configurer.get('account')

const client = new core.Client(
  confacc || '::',
  confver !== undefined ? (confver/*  - 100 */).toString() : undefined
)

client.setProxy(configurer.get('proxy') ?? '')

if (!client.user) {
  client.user = '940464243'
  client.viewer = '174481488'
  client.udid = 'cf608be5-6d38-421a-8eb1-11a501132c0a'
}

export * from 'mishiro-core'

export { client }
