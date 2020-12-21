export default function (eventAll: any[], gachaAll: any[], eventLimited: any[], gachaLimited: any[]): {
  gachaLimitedCard: any
  eventLimitedCard: any
} {
  const gachaLimitedCard: any = {}
  gachaLimited.forEach((card) => {
    if (!gachaLimitedCard[card.reward_id]) {
      gachaLimitedCard[card.reward_id] = []
    }
    const gacha = gachaAll.filter(gacha => Number(gacha.id) === Number(card.gacha_id))[0]
    gachaLimitedCard[card.reward_id].push({ name: gacha.name, id: gacha.id, startDate: gacha.start_date.split(' ')[0], endDate: gacha.end_date.split(' ')[0] })
  })

  const eventLimitedCard: any = {}
  eventLimited.forEach((card) => {
    if (!eventLimitedCard[card.reward_id]) {
      eventLimitedCard[card.reward_id] = []
    }
    const event = eventAll.filter(event => Number(event.id) === Number(card.event_id))[0]
    eventLimitedCard[card.reward_id].push({ name: event.name, id: event.id, startDate: event.event_start.split(' ')[0], endDate: event.event_end.split(' ')[0] })
  })

  return { gachaLimitedCard, eventLimitedCard }
}
