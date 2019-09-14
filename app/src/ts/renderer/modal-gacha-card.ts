import TabSmall from '../../vue/component/TabSmall.vue'
import MishiroIdol from './mishiro-idol'
import modalMixin from './modal-mixin'
import Component, { mixins } from 'vue-class-component'
@Component({
  components: {
    TabSmall
  }
})
export default class extends mixins(modalMixin, MishiroIdol) {
  card: any = {}
  cardPlus: any = {}

  toggle (practice: string): void {
    switch (practice) {
      case 'idol.before':
        this.information = this.card
        break
      case 'idol.after':
        this.information = this.cardPlus
        break
      default:
        break
    }
  }

  mounted (): void {
    this.$nextTick(() => {
      this.event.$on('showCard', (card: any) => {
        const cardPlus = this.cardData.filter((c: any) => Number(c.id) === Number(card.evolution_id))[0]
        this.currentPractice = 'idol.before'
        this.information = card
        this.card = card
        this.cardPlus = cardPlus
        this.show = true
        this.visible = true
      })
    })
  }
}
