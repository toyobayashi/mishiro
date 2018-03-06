<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div v-show="visible" :style="{ width: modalWidth }">
      <div class="modal-header">
        <title-dot v-once></title-dot>
        <h4 class="modal-title">{{$t('menu.calculator')}}</h4>
        <small-tab class="pull-right" :tab="eventType" v-model="currentEventTab" @tabClicked="toggle" :no-translation="true" :font-size="16"></small-tab>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <!-- Progress bar -->
        <div class="event-progress">
          <div class="progress-wrap">
            <p>
              <span>{{staminaTimeLeft}}</span>
              <span>PLv. {{publicStatus.plv}}</span>
            </p>
            <progress-bar class="cgss-progress-stamina" :percent="staminaPercent"></progress-bar>
          </div>
          <div class="progress-wrap">
            <p>
              <span><!-- {{$t('event.timeLeft')}} -->{{eventTimeLeft > 0 ? timeFormate(eventTimeLeft) : timeFormate(0)}}</span>
              <span>{{eventData ? eventData.name : ''}}</span>
            </p>
            <progress-bar class="cgss-progress-event" :percent="eventTimePercent"></progress-bar>
          </div>
        </div>
        <!-- Progress bar end -->

        <!-- Player status -->
        <div class="event-progress">
          <div class="progress-wrap">
            <div class="arg-row">
              <label>{{$t('event.plv')}}</label>
              <div class="event-input">
                <input-text
                  v-model="publicStatus.plv"
                  :height="30"
                  :width="90"
                  style="text-align:right"
                  :limit="[1, 300]"
                  :disabled="isCounting"
                  @focus.native="$event.target.select()">
                </input-text> / 300
              </div>
            </div>
            <div class="arg-row">
              <label>{{$t('event.stamina')}}</label>
              <div class="event-input">
                <input-text
                  v-model="publicStatus.stamina"
                  :height="30" :width="90"
                  style="text-align:right"
                  :limit="[0, maxStamina]"
                  :disabled="isCounting"
                  @focus.native="$event.target.select()">
                </input-text> / {{maxStamina}}
              </div>
            </div>
            <div class="arg-row">
              <label>{{$t('event.exp')}}</label>
              <div class="event-input">
                <input-text
                  v-model="publicStatus.exp"
                  :height="30"
                  :width="90"
                  style="text-align:right"
                  :limit="[0, maxExp]"
                  @focus.native="$event.target.select()">
                </input-text> / {{maxExp}}
              </div>
            </div>
            <div v-for="(tab, type) in eventType" v-show="currentEventTab === tab">
              <div class="arg-row" v-for="(playerStatus, name) in privateStatus[type].input">
                <label>{{$t(`event.${name}`)}}</label>
                <input-text v-if="playerStatus.type === 'text'" v-model="playerStatus.model" :height="30" class="event-input" :limit="playerStatus.limit" @focus.native="$event.target.select()"></input-text>
                <div class="radio-group" v-if="playerStatus.type === 'radio'">
                  <radio
                    style="margin-left:10px"
                    v-for="radio in playerStatus.option"
                    :text="radio.text"
                    :lable-id="radio.id"
                    :key="radio.id"
                    v-model="playerStatus.model"
                    :value="radio.value"></radio>
                </div>
              </div>
            </div>
          </div>
          <div class="progress-wrap">
            <div v-for="(tab, type) in eventType" v-show="currentEventTab === tab" class="result-for-div">
              <div class="arg-row" v-for="(result, key) in privateStatus[type].output">
                <span>{{$t(`event.${key}`)}}</span>
                <span class="cal-result">{{result}}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Player status end -->
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
        <button type="button" class="cgss-btn cgss-btn-default margin-left-50" @click="clear()">{{$t("gacha.clear")}}</button>
        <button type="button" class="cgss-btn cgss-btn-default margin-left-50" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script src="../../js/renderer/calculator.js">
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
.result-for-div > div:nth-child(1), .progress-wrap > div:nth-child(1) {
  margin-top: 5px;
}
.arg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.event-input {
  width: 290px;
}
.radio-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 300px;
}
.cal-result {
  width: 200px;
}
</style>
