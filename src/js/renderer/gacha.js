import { shell } from 'electron'
import getPath from '../common/get-path.ts'
export default {
  data () {
    return {
      gachaResult: [],
      historyList: [],
      r: 0,
      sr: 0,
      ssr: 0,
      costStarJewel: 0
    }
  },
  props: {
    'master': {
      type: Object,
      require: true
    }
  },
  computed: {
    gachaAvailable () {
      return this.master.gachaAvailable
    },
    cardData () {
      return this.master.cardData
    },
    sortByCommon () {
      return this.sortJsonArray(this.gachaAvailable, 'relative_odds', false)
    },
    sortBySr () {
      return this.sortJsonArray(this.gachaAvailable, 'relative_sr_odds', false)
    },
    oddsArray () {
      return this.countAttr(this.sortByCommon, 'relative_odds')
    },
    srOddsArray () {
      return this.countAttr(this.sortBySr, 'relative_sr_odds')
    },
    maxOdds () {
      let l = this.oddsArray.length
      return this.oddsArray[l - 1].maxOddsValue
    },
    srMaxOdds () {
      let l = this.srOddsArray.length
      return this.srOddsArray[l - 1].maxOddsValue
    }
  },
  methods: {
    sortJsonArray (jsonArray, key, isSmallToBig) {
      let tempArray = []
      for (let i = 0; i <= jsonArray.length - 1; i++) {
        tempArray[i] = jsonArray[i]
      }

      if (isSmallToBig === true) {
        tempArray.sort(function (a, b) {
          return a[key] - b[key]
        })
      } else {
        tempArray.sort(function (a, b) {
          return b[key] - a[key]
        })
      }
      return tempArray
    },
    countAttr (jsonArray, key) {
      let valueArray = []
      valueArray[0] = {}
      valueArray[0][key] = jsonArray[0][key]
      for (let i = 1; i <= jsonArray.length - 1; i++) {
        if (jsonArray[i][key] != jsonArray[i - 1][key]) {
          let obj = {}
          obj[key] = jsonArray[i][key]
          valueArray.push(obj)
        }
      }

      let maxIndex = -1
      let count = 0
      let maxOddsValue = 0
      for (let x = 0; x <= valueArray.length - 1; x++) {
        for (let i = 0; i <= jsonArray.length - 1; i++) {
          if (jsonArray[i][key] == valueArray[x][key]) {
            maxIndex++
            count++
            maxOddsValue = maxOddsValue + Number(valueArray[x][key])
          }
        }
        valueArray[x]['count'] = count
        valueArray[x]['maxIndex'] = maxIndex
        valueArray[x]['maxOddsValue'] = maxOddsValue
        count = 0
      }

      return valueArray
    },
    getId (r) {
      if (r <= this.oddsArray[0].maxOddsValue) {
        let index = Math.ceil((r - 0) / this.oddsArray[0].relative_odds) - 1
        return this.sortByCommon[index].reward_id
      }
      for (let i = 1; i <= this.oddsArray.length - 1; i++) {
        if (r <= this.oddsArray[i].maxOddsValue) {
          let index = Math.ceil((r - this.oddsArray[i - 1].maxOddsValue) / this.oddsArray[i].relative_odds) + this.oddsArray[i - 1].maxIndex
          return this.sortByCommon[index].reward_id
        }
      }
    },
    getSrId (r) {
      if (r <= this.srOddsArray[0].maxOddsValue) {
        let index = Math.ceil((r - 0) / this.srOddsArray[0].relative_sr_odds) - 1
        return this.sortBySr[index].reward_id
      }
      for (let i = 1; i <= this.srOddsArray.length - 1; i++) {
        if (r <= this.srOddsArray[i].maxOddsValue) {
          let index = Math.ceil((r - this.srOddsArray[i - 1].maxOddsValue) / this.srOddsArray[i].relative_sr_odds) + this.srOddsArray[i - 1].maxIndex
          return this.sortBySr[index].reward_id
        }
      }
    },
    getCard (id) {
      const card = this.cardData.filter(card => card.id == id)[0]
      switch (card.rarity) {
        case 3:
          this.r++
          break
        case 5:
          this.sr++
          this.historyList.push(card)
          break
        case 7:
          this.ssr++
          this.historyList.push(card)
          break
      }
      this.gachaResult.push(card)
    },
    random () {
      return parseInt(Math.random() * this.maxOdds) + 1
    },
    randomSr () {
      return parseInt(Math.random() * this.srMaxOdds) + 1
    },
    ikkaiHiku () {
      // console.log(this.oddsArray)
      this.playSe(this.enterSe)
      this.gachaResult = []
      this.costStarJewel += 250
      setTimeout(() => {
        this.getCard(this.getId(this.random()))
      }, 50)
    },
    jukkaiHiku () {
      this.playSe(this.enterSe)
      this.gachaResult = []
      this.costStarJewel += 2500
      setTimeout(() => {
        for (var i = 0; i < 9; i++) {
          this.getCard(this.getId(this.random()))
        }
        this.getCard(this.getSrId(this.randomSr()))
      }, 50)
    },
    clear () {
      this.playSe(this.cancelSe)
      this.r = 0
      this.sr = 0
      this.ssr = 0
      this.costStarJewel = 0
      this.historyList = []
      this.gachaResult = []
    },
    showHistory () {
      this.playSe(this.enterSe)
      this.event.$emit('showHistory', this.historyList)
    },
    showInformation () {
      this.playSe(this.enterSe)
      this.event.$emit('showInformation', {
        r: this.r,
        sr: this.sr,
        ssr: this.ssr,
        total: this.r + this.sr + this.ssr,
        costStarJewel: this.costStarJewel
      })
    },
    showCard (card) {
      this.playSe(this.enterSe)
      this.event.$emit('showCard', card)
    },
    opendir () {
      this.playSe(this.enterSe)
      shell.openExternal(getPath('./public/img/icon'))
    }
  }
}
