<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div :style="{ width: modalWidth }" v-if="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{live.fileName.substr(live.fileName.indexOf('-') + 1).split('.')[0]}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <form>
          <div>
            <!-- <label>{{$t("menu.lang")}}</label> -->
            <div style="display:flex;justify-content:space-between">
              <InputRadio text="Debut" value="1" v-model="difficulty" lable-id="d_1"/>
              <InputRadio text="Regular" value="2" v-model="difficulty" lable-id="d_2"/>
              <InputRadio text="Pro" value="3" v-model="difficulty" lable-id="d_3"/>
              <InputRadio text="Master" value="4" v-model="difficulty" lable-id="d_4"/>
            </div>
          </div>
        </form>
        
      </div>
      <div class="modal-footer">
        <button type="button" class="cgss-btn cgss-btn-ok" @click="start">{{$t("live.start")}}</button>
        <button type="button" class="cgss-btn cgss-btn-default margin-left-50" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts" src="../../ts/renderer/modal-live-difficulty.ts">
</script>
