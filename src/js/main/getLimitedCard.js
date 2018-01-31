export default function (eventAll, gachaAll, eventLimited, gachaLimited) {
  let gachaLimitedCard = {}
  gachaLimited.forEach((card) => {
    if (!gachaLimitedCard[card['reward_id']]) {
      gachaLimitedCard[card['reward_id']] = []
    }
    let gacha = gachaAll.filter(gacha => gacha.id == card['gacha_id'])[0]
    gachaLimitedCard[card['reward_id']].push({ name: gacha.name, id: gacha.id, startDate: gacha.start_date.split(' ')[0], endDate: gacha.end_date.split(' ')[0] })
  })

  let eventLimitedCard = {}
  eventLimited.forEach((card) => {
    if (!eventLimitedCard[card['reward_id']]) {
      eventLimitedCard[card['reward_id']] = []
    }
    let event = eventAll.filter(event => event.id == card['event_id'])[0]
    eventLimitedCard[card['reward_id']].push({ name: event.name, id: event.id, startDate: event.event_start.split(' ')[0], endDate: event.event_end.split(' ')[0] })
  })

  return { gachaLimitedCard, eventLimitedCard }
}
