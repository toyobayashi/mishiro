<template>
<div class="main-block-style">
    <div class="clearfix">
        <input type="text" class="db-query manifest-query" v-model="queryString" :placeholder="$t('home.input')"/>
        <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-10" @click="opendir">{{$t("home.opendir")}}</button>
        <button ref="stopBtn" class="cgss-btn cgss-btn-default pull-right margin-left-10" @click="stopDownload">{{$t("home.stop")}}</button>
        <button ref="downloadBtn" class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="downloadSelectedItem">{{$t("home.download")}}</button>
        <button class="cgss-btn cgss-btn-ok pull-right margin-left-10" @click="query">{{$t("home.search")}}</button>
    </div>
    <div class="black-bg db-query-result margin-top-10">
        <cgss-table :data="data" @change="tableChange"
        :is-disabled="isDisabled"></cgss-table>
    </div>
    <task :total-loading="total" :current-loading="current" :text="text" class="margin-top-20" :color="'event'"></task>
</div>
</template>

<script src="../js/home.js">
</script>

<style>
.db-query{
    margin: 12px 0;
    background-color: #505050;
    font-family: "CGSS-B";
    font-size: 20px;
    color: #fff;
    border: 2px solid #909090;
    border-radius: 4px;
    height: 40px;
    padding: 5px;
    outline: 0;
    box-shadow: 0 1px 1px rgba(0,0,0,.75) inset;
    transition: border-color ease-in-out .15s;
}
.manifest-query{
    width: calc(100% - 690px);
}
.db-query:focus{
    border: 2px solid #f080e0;
}
.main-block-style{
    position: absolute;
    width: calc(100% - 140px);
    height: calc(100% - 138px);
    left: 70px;
    top: 70px;
    overflow: hidden;
}
.db-query-result{
    height: calc(100% - 270px);
}
</style>
