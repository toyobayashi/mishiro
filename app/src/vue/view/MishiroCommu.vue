<template>
<div class="main-block-style">
  <div class="clearfix">
    <InputText class="manifest-query" v-model="queryString" :placeholder="$t('commu.id')" />
    <button class="cgss-btn cgss-btn-ok pull-right margin-left-10" @click="query">{{$t("home.search")}}</button>
  </div>
  <canvas id="can" width='811' height='124'></canvas>
</div>
</template>

<script lang="ts" src="../../ts/renderer/mishiro-commu.ts">
</script>
