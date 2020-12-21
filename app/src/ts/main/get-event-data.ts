import configurer from './config'

export default function getEventData (eventAll: any[], now: number, timeOffset: number): {
  eventData: any
  eventHappening: boolean
} {
  eventAll.sort((a, b) => new Date(b.event_start).getTime() - new Date(a.event_start).getTime())

  const event = configurer.get('event')
  if (event != null) {
    for (let i = 0; i < eventAll.length; i++) {
      if (event === Number(eventAll[i].id)) return { eventData: eventAll[i], eventHappening: true }
    }
  }

  let eventData = null
  let eventHappening = false

  for (let i = 0; i < eventAll.length; i++) {
    const e = eventAll[i]
    const start = new Date(e.event_start).getTime() - timeOffset
    const end = new Date(e.result_end).getTime() - timeOffset
    if (now >= start && now <= end) {
      eventHappening = true
      eventData = e
      break
    }
  }
  if (!eventHappening) eventData = now > new Date(eventAll[0].result_end).getTime() ? eventAll[0] : eventAll[1]
  // const eventNow = master._exec("SELECT * FROM event_data WHERE event_start = (SELECT MAX(event_start) FROM (SELECT * FROM event_data WHERE event_start < DATETIME(CURRENT_TIMESTAMP, 'localtime')))")[0]

  return { eventData, eventHappening }
}
