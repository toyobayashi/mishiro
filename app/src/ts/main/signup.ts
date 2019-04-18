// NOT USED

import { Client } from 'mishiro-core'
import { randomBytes } from 'crypto'

declare module 'mishiro-core' {
  export interface Client {
    signup (cb?: (step: number) => void): Promise<string>
  }
}

Client.prototype.signup = async function (cb) {
  const uid = randomBytes(16)
  uid[6] = ((uid[6] & 0x0f) | 0x40)
  uid[8] = ((uid[8] & 0x3f) | 0x80)
  const hex = uid.toString('hex')
  this.udid = hex.substring(0, 8) + '-' + hex.substring(8, 12) + '-' + hex.substring(12, 16) + '-' + hex.substring(16, 20) + '-' + hex.substring(20)
  this.viewer = '0'
  this.user = '0'

  const signupRes = await this.post('/tool/signup', {
    app_version: '9.9.9',
    client_type: '2',
    device_name: 'samsung SM-G955N',
    os_version: 'Android OS 4.4.2 / API-19 (NRD90M/381180702)',
    resource_version: 'Android OS 4.4.2 / API-19 (NRD90M/381180702)'
  })

  if (signupRes.data_headers.result_code !== 1) {
    console.log(signupRes)
    throw new Error(signupRes.data_headers.result_code.toString())
  }
  if (cb) cb(10)

  this.viewer = signupRes.data_headers.viewer_id.toString()
  this.user = signupRes.data_headers.user_id.toString()

  const account = `${this.user}:${this.viewer}:${this.udid}`
  console.log(account)

  let step = await this.post('/tutorial/update_step', {
    step: 10,
    type: 0,
    skip: 0,
    room_info: {
      floor: null,
      wall: null,
      theme: null
    },
    storage_info: {
      diff_in: null,
      diff_out: null
    },
    name: ''
  })

  if (step.data_headers.result_code !== 1) {
    console.log('Step: 10')
    throw new Error(step.data_headers.result_code.toString())
  }
  if (cb) cb(20)

  step = await this.post('/tutorial/update_step', {
    step: 20,
    type: 1,
    skip: 0,
    room_info: {
      floor: null,
      wall: null,
      theme: null
    },
    storage_info: {
      diff_in: null,
      diff_out: null
    },
    name: ''
  })

  if (step.data_headers.result_code !== 1) {
    console.log('Step: 20')
    throw new Error(step.data_headers.result_code.toString())
  }
  if (cb) cb(30)

  step = await this.post('/tutorial/update_step', {
    step: 30,
    type: 0,
    skip: 0,
    room_info: {
      floor: null,
      wall: null,
      theme: null
    },
    storage_info: {
      diff_in: null,
      diff_out: null
    },
    name: ''
  })

  if (step.data_headers.result_code !== 1) {
    console.log('Step: 30')
    throw new Error(step.data_headers.result_code.toString())
  }
  if (cb) cb(40)

  step = await this.post('/tutorial/update_step', {
    step: 40,
    type: 0,
    skip: 0,
    room_info: {
      floor: null,
      wall: null,
      theme: null
    },
    storage_info: {
      diff_in: null,
      diff_out: null
    },
    name: ''
  })

  if (step.data_headers.result_code !== 1) {
    console.log('Step: 40')
    throw new Error(step.data_headers.result_code.toString())
  }
  if (cb) cb(50)

  step = await this.post('/tutorial/update_step', {
    step: 50,
    type: 0,
    skip: 0,
    room_info: {
      floor: null,
      wall: null,
      theme: null
    },
    storage_info: {
      diff_in: null,
      diff_out: null
    },
    name: ''
  })

  if (step.data_headers.result_code !== 1) {
    console.log('Step: 50')
    throw new Error(step.data_headers.result_code.toString())
  }
  if (cb) cb(55)

  step = await this.post('/tutorial/update_step', {
    step: 55,
    type: 0,
    skip: 0,
    room_info: {
      floor: null,
      wall: null,
      theme: null
    },
    storage_info: {
      diff_in: null,
      diff_out: null
    },
    name: ''
  })

  if (step.data_headers.result_code !== 1) {
    console.log('Step: 55')
    throw new Error(step.data_headers.result_code.toString())
  }
  if (cb) cb(60)

  step = await this.post('/tutorial/update_step', {
    step: 60,
    type: 0,
    skip: 0,
    room_info: {
      floor: null,
      wall: null,
      theme: null
    },
    storage_info: {
      diff_in: null,
      diff_out: null
    },
    name: ''
  })

  if (step.data_headers.result_code !== 1) {
    console.log('Step: 60')
    throw new Error(step.data_headers.result_code.toString())
  }
  if (cb) cb(70)

  step = await this.post('/tutorial/update_step', {
    step: 70,
    type: 0,
    skip: 0,
    room_info: {
      floor: null,
      wall: null,
      theme: null
    },
    storage_info: {
      diff_in: null,
      diff_out: null
    },
    name: ''
  })

  if (step.data_headers.result_code !== 1) {
    console.log('Step: 70')
    throw new Error(step.data_headers.result_code.toString())
  }
  if (cb) cb(73)

  step = await this.post('/tutorial/update_step', {
    step: 73,
    type: 0,
    skip: 0,
    room_info: {
      floor: null,
      wall: null,
      theme: null
    },
    storage_info: {
      diff_in: null,
      diff_out: null
    },
    name: ''
  })

  if (step.data_headers.result_code !== 1) {
    console.log('Step: 73')
    throw new Error(step.data_headers.result_code.toString())
  }
  if (cb) cb(77)

  step = await this.post('/tutorial/update_step', {
    step: 77,
    type: 0,
    skip: 0,
    room_info: {
      floor: null,
      wall: null,
      theme: null
    },
    storage_info: {
      diff_in: null,
      diff_out: null
    },
    name: ''
  })

  if (step.data_headers.result_code !== 1) {
    console.log('Step: 77')
    throw new Error(step.data_headers.result_code.toString())
  }
  if (cb) cb(80)

  step = await this.post('/tutorial/update_step', {
    step: 80,
    type: 0,
    skip: 0,
    room_info: {
      floor: [
        {
          serial_id: 1,
          index: 110,
          reversal: 0,
          sort_num: 2
        },
        {
          serial_id: 2,
          index: 62,
          reversal: 0,
          sort_num: 3
        },
        {
          serial_id: 3,
          index: 196,
          reversal: 0,
          sort_num: 4
        },
        {
          serial_id: 4,
          index: 199,
          reversal: 0,
          sort_num: 5
        },
        {
          serial_id: 5,
          index: 170,
          reversal: 0,
          sort_num: 7
        },
        {
          serial_id: 9,
          index: 1,
          reversal: 1,
          sort_num: 6
        }
      ],
      wall: [],
      theme: [
        {
          serial_id: 6,
          index: 0,
          reversal: 0,
          sort_num: 0
        },
        {
          serial_id: 7,
          index: 1,
          reversal: 0,
          sort_num: 0
        },
        {
          serial_id: 8,
          index: 2,
          reversal: 0,
          sort_num: 0
        }
      ]
    },
    storage_info: {
      diff_in: null,
      diff_out: null
    },
    name: ''
  })

  if (step.data_headers.result_code !== 1) {
    console.log('Step: 80')
    throw new Error(step.data_headers.result_code.toString())
  }
  if (cb) cb(90)

  step = await this.post('/tutorial/update_step', {
    step: 90,
    type: 0,
    skip: 0,
    room_info: {
      floor: null,
      wall: null,
      theme: null
    },
    storage_info: {
      diff_in: null,
      diff_out: null
    },
    name: `${Math.floor(Date.now() / 1000)}`
  })

  if (step.data_headers.result_code !== 1) {
    console.log('Step: 90')
    throw new Error(step.data_headers.result_code.toString())
  }
  if (cb) cb(100)

  return account
}

export * from 'mishiro-core'
