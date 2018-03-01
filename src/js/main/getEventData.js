export default function getEventData (eventAll, config, now, timeOffset) {
  eventAll.sort((a, b) => new Date(b.event_start).getTime() - new Date(a.event_start).getTime())

  if (config && config.event) {
    for (let i = 0; i < eventAll.length; i++) {
      if (config.event == eventAll[i].id) return { eventData: eventAll[i], eventHappening: true }
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
