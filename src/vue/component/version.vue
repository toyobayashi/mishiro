<template>
<div class="version white-bg">{{$t("home.resVer")}}: {{resVer}}</div>
</template>
<script>
export default {
  props: {
    'resVer': {
      type: [Number, String],
      required: true
    }
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
