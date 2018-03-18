
export default function createScore (csv, bpm) {
  // let csvTable = csv.split("\r\n");
  let csvTable = csv.split('\n')
  csvTable.forEach(function (v, i) {
    csvTable[i] = v.split(',')
  })
  csvTable.forEach(function (v, i) {
    v[1] = Math.round(v[1] / (60 / bpm) * 1000) / 1000
  })
  let i = 1
  for (i = 1; i < csvTable.length; i++) {
    csvTable[i][2] = Number(csvTable[i][2])
    if (csvTable[i][2] !== 1 && csvTable[i][2] !== 2) {
      csvTable.splice(i, 1)
      i--
      // console.log("remove: " + rmv);
    }
  }

  let score = []
  for (i = 1; i < csvTable.length; i++) {
    let note = [csvTable[i][1]/* , csvTable[i][2] */, Number(csvTable[i][4])]
    if (csvTable[i][2] === 2) {
      let j = i + 1
      // console.log(csvTable[j][4])
      for (j = i + 1; j < csvTable.length; j++) {
        if (csvTable[j][4] == csvTable[i][4]) {
          let length = csvTable[j][1] - csvTable[i][1]
          note.push(length)
          csvTable.splice(j, 1)
          score.push(note)
          // console.log("remove long: " + rmv);
          break
        }
      }
    } else {
      score.push(note)
    }
  }

  return score

  /* let js = ''
  for (i = 0; i < score.length - 1; i++) {
    js += '\t['
    for (let j = 0; j < score[i].length - 1; j++) {
      js += score[i][j] + ',\t'
    }
    js += score[i][j] + '],\n'
    // js += "\t[" + score[i] + "],\n";
  }
  js += '\t['
  let j = 0
  for (; j < score[i].length - 1; j++) {
    js += score[i][j] + ',\t'
  }
  js += score[i][j] + ']'
  fs.writeFileSync('./static/asset/score/' + name + '.js', 'let ' + name + ' = [\n' + js + '];')
  console.log(name + '成功生成谱面。') */
}
