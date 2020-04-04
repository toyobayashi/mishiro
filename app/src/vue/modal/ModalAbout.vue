<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div :style="{ width: '800px' }" v-show="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{$t("menu.about")}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <table class="table-bordered" border="1">
          <tr><td width="20%">{{$t('menu.appname')}}</td><td width="80%" colspan="3">{{app.name}}</td></tr>
          <tr><td width="20%">{{$t('menu.appver')}}</td><td width="80%" colspan="3">{{app.getVersion()}}</td></tr>
          <tr><td width="20%">{{$t('menu.commitHash')}}</td><td width="80%" colspan="3">{{commit}}</td></tr>
          <tr><td width="20%">{{$t('menu.commitDate')}}</td><td width="80%" colspan="3">{{commitDate}}</td></tr>
          <tr>
            <td width="20%">Electron</td><td width="20%">{{versions.electron}}</td>
            <td width="20%">Chrome</td><td width="40%">{{versions.chrome}}</td>
          </tr>
          <tr>
            <td width="20%">Node.js</td><td width="20%">{{versions.node}}</td>
            <td width="20%">V8</td><td width="40%">{{versions.v8}}</td>
          </tr>
          <tr><td width="20%">OS</td><td width="80%" colspan="3">{{osinfo}}</td></tr>
          <tr><td width="20%">{{$t('menu.description')}}</td><td width="80%" colspan="3">{{$t('menu.descCon')}}</td></tr>
        </table>
      </div>
      <div class="modal-footer">
        <button type="button" class="cgss-btn cgss-btn-ok" @click="showRepo">Github</button>
        <button type="button" class="cgss-btn cgss-btn-default margin-left-50" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts" src="../../ts/renderer/modal-about.ts">
</script>
