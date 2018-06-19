<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div style="width:900px" v-show="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{information.name ? information.name : ""}}</h4>
        <TabSmall class="pull-right" :tab="practice" v-model="currentPractice" @tabClicked="toggle"/>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <table class="table-bordered" border="1" :class="{
          cute: information.charaData ? information.charaData.type === 1 : false,
          cool: information.charaData ? information.charaData.type === 2 : false,
          passion: information.charaData ? information.charaData.type === 3 : false
        }">
          <tr v-for="line in table">
            <td :width="line[0].width || '15%'" :class="line[0].class" :colspan="line[0].colspan || 1">{{line[0].text}}</td>
            <td :width="line[1].width || '35%'" :class="line[1].class" :colspan="line[1].colspan || 1">{{line[1].text}}</td>
            <td :width="line[2].width || '15%'">{{line[2].text}}</td>
            <td :width="line[3].width || '35%'" v-if="line[3]">{{line[3].text}}</td>
          </tr>
          <tr v-if="card.limited">
            <td>{{$t("idol.limited")}}</td>
            <td colspan="3">
              <p v-for="limit in card.limited">{{"(" + (limit.id > 9999 ? $t("idol.gacha") + limit.id : $t("idol.event") + limit.id) + ") " + limit.name + ": " + limit.startDate + " ～ " + limit.endDate}}</p>
            </td>
          </tr>
        </table>
      </div>
      <div class="modal-footer">
        <button type="button" class="cgss-btn cgss-btn-default" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts" src="../../ts/renderer/modal-gacha-card.ts">
</script>
