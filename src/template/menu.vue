<template>
<div class="main-block-style flex-center">
    <div class="gray-area">
        <div class="flex-center">
            <div class="clearfix">
                <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-20" @click="showLicense">{{$t("menu.license")}}</button>
                <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-20" @click="showAbout">{{$t("menu.about")}}</button>
                <button class="cgss-btn-lg cgss-btn-lg-ok pull-right" @click="showOption">{{$t("menu.option")}}</button>
            </div>
        </div>
        <div class="flex-center margin-top-20">
            <div class="clearfix">
                <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-20" @click="showVar">{{$t("menu.var")}}</button>
                <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-20" @click="relaunch">{{$t("menu.relaunch")}}</button>
                <button class="cgss-btn-lg cgss-btn-lg-ok pull-right" @click="update">{{$t("menu.update")}}</button>
            </div>
        </div>
    </div>
</div>
</template>

<script src="../js/menu.js">
</script>

<style>
.margin-left-20{
    margin-left: 20px;
}
.introduction{
    width: 672px;
    height: calc(100% - 150px);
    margin-bottom: 30px;
}
</style>
