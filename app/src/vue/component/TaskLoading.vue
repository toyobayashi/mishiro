<template>
<div class="task flex-center">
  <p style="height:30px;">{{text}}</p>
  <ProgressBar :class="'cgss-progress-' + (color ? color : 'load')" :percent="currentLoading"/>
  <ProgressBar :class="'cgss-progress-' + (color ? color : 'load')" class="margin-top-10" :percent="totalLoading" v-show="!single"/>
  <p>{{$t("update.tip")}}</p>
</div>
</template>

<script lang="ts">
import ProgressBar from './ProgressBar.vue'
import { Vue, Component, Prop } from 'vue-property-decorator'
@Component({
  components: {
    ProgressBar
  }
})
export default class extends Vue {
  @Prop() currentLoading: number
  @Prop() totalLoading: number
  @Prop() text: number | string
  @Prop() single: boolean
  @Prop() color: string
}
</script>

<style>
.task{
  font-family: "CGSS-B";
  border-radius: 10px;
  border: 3px solid #000;
  padding: 10px 50px;
  background-color: #aaa;
  height: 150px;
}
</style>