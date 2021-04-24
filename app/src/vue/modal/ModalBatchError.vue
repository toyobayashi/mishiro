<template>
<div v-show="show" class="modal modal-batch-error">
  <transition name="scale" @after-leave="afterLeave">
    <div v-show="visible" :style="{ width: modalWidth }">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{$t('home.errorTitle')}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <div class="error-item">
          <div class="path">{{$t('menu.batchErrorName')}}</div>
          <div class="msg">{{$t('menu.batchErrorMsg')}}</div>
          <div class="code">{{$t('menu.batchErrorCode')}}</div>
        </div>
        <div class="error-item" v-for="err in errorList" :key="err.path">
          <div class="path" :title="err.path">{{err.path}}</div>
          <div class="msg" :title="err.message">{{err.message}}</div>
          <div class="code" :title="err.code">{{err.code}}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="cgss-btn cgss-btn-default" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts" src="../../ts/renderer/modal-batch-error.ts">
</script>

<style scoped>
.modal-batch-error .error-item {
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;
}
.modal-batch-error .error-item .path {
  flex: 4;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.modal-batch-error .error-item .msg {
  flex: 5;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.modal-batch-error .error-item .code {
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-align: right;
}
</style>
