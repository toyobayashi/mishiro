<template>
<div class="version white-bg">{{$t("home.resVer")}}: {{resVer}}</div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
@Component
export default class extends Vue {
  get resVer (): string {
    return this.$store.state.resVer === -1 ? 'Unknown' : this.$store.state.resVer.toString()
  }
}
</script>
<style scoped>
.version{
  position: absolute;
  top: 10px;
  right: 100px;
}
</style>
