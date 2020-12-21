export default function (charaData: any[], textData: any[]): any[] {
  for (let i = 0; i < charaData.length; i++) {
    const chara = charaData[i]
    const hometown = textData[0].filter((row: any) => Number(row.index) === Number(chara.home_town))[0]
    const seiza = textData[1].filter((row: any) => (1000 + Number(row.index)) === Number(chara.constellation))[0]
    if (hometown) {
      charaData[i].hometown = hometown.text
    }
    if (seiza) {
      charaData[i].seiza = seiza.text
    }
  }
  return charaData
}
