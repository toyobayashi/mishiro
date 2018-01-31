export default function (cardData, charaData, skillData, leaderSkillData, eventLimitedCard, gachaLimitedCard) {
  let gachaLimitedCardId = Object.keys(gachaLimitedCard).map(id => Number(id))
  let eventLimitedCardId = Object.keys(eventLimitedCard).map(id => Number(id))
  for (let i = 0; i < cardData.length; i++) {
    const card = cardData[i]
    cardData[i].charaData = charaData.filter(row => row.chara_id == card.chara_id)[0]
    cardData[i].skill = skillData.filter(row => row.id == card.skill_id)[0]
    cardData[i].leaderSkill = leaderSkillData.filter(row => row.id == card.leader_skill_id)[0]
    if (eventLimitedCardId.indexOf(cardData[i].id) !== -1) {
      cardData[i].limited = eventLimitedCard[cardData[i].id]
    }
    if (gachaLimitedCardId.indexOf(cardData[i].id) !== -1) {
      cardData[i].limited = gachaLimitedCard[cardData[i].id]
    }
  }
  return cardData
}
