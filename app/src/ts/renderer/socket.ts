import { Socket } from 'net'

export function connect () {
  let client = new Socket()
  client.on('data', msg => {
    if (msg.toString() === 'reload') {
      client.destroy()
      location.reload()
    }
  })

  client.on('error', (err) => console.log(err))
  client.connect(3461, 'localhost', () => {
    console.log('Socket connect localhost:3461')
    client.write('mishiro')
  })
}
