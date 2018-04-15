export default function (cardData: any[], charaData: any[], skillData: any[], leaderSkillData: any[], eventLimitedCard: any[], gachaLimitedCard: any[]) {
  let gachaLimitedCardId = Object.keys(gachaLimitedCard).map(id => Number(id))
  let eventLimitedCardId = Object.keys(eventLimitedCard).map(id => Number(id))
  for (let i = 0; i < cardData.length; i++) {
    const card = cardData[i]
    cardData[i].charaData = charaData.filter(row => Number(row.chara_id) === Number(card.chara_id))[0]
    cardData[i].skill = skillData.filter(row => Number(row.id) === Number(card.skill_id))[0]
    cardData[i].leaderSkill = leaderSkillData.filter(row => Number(row.id) === Number(card.leader_skill_id))[0]
    if (eventLimitedCardId.indexOf(cardData[i].id) !== -1) {
      cardData[i].limited = eventLimitedCard[cardData[i].id]
    }
    if (gachaLimitedCardId.indexOf(cardData[i].id) !== -1) {
      cardData[i].limited = gachaLimitedCard[cardData[i].id]
    }
  }
  return cardData
}
