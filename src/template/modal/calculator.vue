<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div v-show="visible" :style="{ width: modalWidth }">
      <div class="modal-header">
        <title-dot v-once></title-dot>
        <h4 class="modal-title">{{$t('menu.calculator')}}</h4>
        <small-tab class="pull-right" :tab="eventType" :default="'atapon'" @tabClicked="toggle" :no-translation="true" :font-size="16"></small-tab>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <div class="event-progress">
          <div class="progress-wrap">
            <p>
              <span>Time. 05:00</span>
              <span>Exp. 6666</span>
              <span>PLv. 66</span>
            </p>
            <progress-bar class="cgss-progress-stamina" :percent="33"></progress-bar>
          </div>
          <div class="progress-wrap">
            <p>Time Left: 00:00:00</p>
            <progress-bar class="cgss-progress-event" :percent="66"></progress-bar>
          </div>
        </div>
        <div class="event-progress">
          <div class="progress-wrap">
            <div class="arg-row" v-for="playerStatus in atapon">
              <label>{{playerStatus.text}}</label>
              <input v-if="playerStatus.type === 'text'" type="text" v-model="playerStatus.model" class="db-query event-input">
              <div class="radio-group" v-if="playerStatus.type === 'radio'">
                <radio
                  v-for="radio in playerStatus.option"
                  :text="radio.text"
                  :lable-id="radio.id"
                  :key="radio.id"
                  v-model="playerStatus.model"
                  :value="radio.value"></radio>
              </div>
            </div>
          </div>
          <div class="progress-wrap">
            <div>Working in progress...</div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="cgss-btn cgss-btn-ok" @click="calculate()">{{$t("event.calculate")}}</button>
        <button
          type="button"
          v-show="isCounting"
          class="cgss-btn-lg cgss-btn-lg-default margin-left-50"
          @click="stopCount">{{$t("event.stopCount")}}</button>
        <button
          type="button"
          v-show="!isCounting"
          class="cgss-btn-lg cgss-btn-lg-ok margin-left-50"
          @click="startCount">{{$t("event.startCount")}}</button>
        <button type="button" class="cgss-btn cgss-btn-default margin-left-50" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script>
import modalMixin from '../../js/modalMixin.js'
import progressBar from '../component/progressBar.vue'
import smallTab from '../component/smallTab.vue'
import radio from '../component/radio.vue'
export default {
  mixins: [modalMixin],
  components: {
    progressBar,
    smallTab,
    radio
  },
  data () {
    return {
      modalWidth: '900px',
      isCounting: false,
      eventType: {
        atapon: 'ATAPON',
        medley: 'MEDLEY',
        caravan: 'CARAVAN',
        tour: 'TOUR'
      },
      atapon: {
        plv: {
          type: 'text',
          text: 'PLV',
          model: 0
        },
        stamina: {
          type: 'text',
          text: 'STAMINA',
          model: 0
        },
        exp: {
          type: 'text',
          text: 'EXP',
          model: 0
        },
        // ...
        commonTimes: {
          type: 'radio',
          text: 'COMMONTIMES',
          model: '1',
          option: [{
            id: 'ct1',
            text: '1 times',
            value: '1'
          }, {
            id: 'ct2',
            text: '2 times',
            value: '2'
          }]
        }
      }
    }
  },
  methods: {
    toggle (eventType) {
      console.log(eventType)
    },
    stopCount () {
      this.playSe(this.enterSe)
      this.isCounting = false
    },
    startCount () {
      this.playSe(this.enterSe)
      this.isCounting = true
    },
    calculate () {
      this.playSe(this.enterSe)
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.event.$on('openCal', () => {
        this.show = true
        this.visible = true
      })
    })
  }
}
</script>

<style scoped>
.event-progress {
  display: flex;
  justify-content: space-between;
}
.progress-wrap {
  width: calc(50% - 20px);
}
.progress-wrap > p {
  line-height: 20px;
  font-size: 15px;
  display: flex;
  justify-content: space-between;
  flex-direction: row-reverse;
}
.arg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.event-input {
  margin: 0;
  height: 30px;
}
.radio-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
