import client from './client.js'

export default async function (event, methodName, arg) {
  try {
    let res = await client[methodName](arg)
    event.sender.send('api', methodName, res)
  } catch (err) {
    console.log(err)
    event.sender.send('api', methodName, false)
  }
}
