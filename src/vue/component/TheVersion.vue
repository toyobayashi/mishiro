<template>
<div class="version white-bg">{{$t("home.resVer")}}: {{resVer}}</div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
@Component
export default class extends Vue {
  @Prop({ required: true }) resVer: number | string
}
</script>
<style scoped>
.version{
  position: absolute;
  top: 10px;
  right: 100px;
}
</style>
