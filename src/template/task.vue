<template>
<div class="task flex-center">
  <p style="height:30px;">{{text}}</p>
  <progress-bar :class="'cgss-progress-' + (color ? color : 'load')" :percent="currentLoading"></progress-bar>
  <progress-bar :class="'cgss-progress-' + (color ? color : 'load')" class="margin-top-10" :percent="totalLoading" v-show="!single"></progress-bar>
  <p>{{$t("update.tip")}}</p>
</div>
</template>

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

<script>
import progressBar from './progressBar.vue'
export default {
  components: {
    progressBar
  },
  props: ['currentLoading', 'totalLoading', 'text', 'single', 'color']
}
</script>