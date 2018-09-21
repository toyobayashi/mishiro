import { Client } from 'mishiro-core'

declare namespace window {
  export let decryptBody: typeof Client.decryptBody
}

window.decryptBody = Client.decryptBody
