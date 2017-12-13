<template>
<div class="main-block-style">
    <div class="gray-area idol-result pull-left margin-right-20">
        <ul>
            <li :class="{active:activeCard.name === i.name}" v-for="i in searchResult" v-text="i.name" @click="selectedIdol(i)"></li>
        </ul>
    </div>
    <div>
        <input type="text" class="db-query idol-query" v-model="queryString" :placeholder="$t('idol.input')" />
        <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-10" @click="opendir">{{$t("home.opendir")}}</button>
        <button class="cgss-btn cgss-btn-ok pull-right margin-left-10" @click="query">{{$t("home.search")}}</button>
    </div>
    <div class="black-bg idol-info margin-top-10">
        <div class="clearfix">
            <progress-bar class="cgss-progress-load pull-left" :percent="imgProgress"></progress-bar>
            <small-tab class="pull-right" :tab="practice" :default="'after'" @tabClicked="toggle"></small-tab>
        </div>
        <table class="table-bordered" border="1"
        :class="{
            cute: information.charaData ? information.charaData.type === 1 : false,
            cool: information.charaData ? information.charaData.type === 2 : false,
            passion: information.charaData ? information.charaData.type === 3 : false
        }">
            <tr>
                <td width="15%">{{$t("idol.id")}}</td>
                <td width="35%">{{information.id}}</td>
                <td width="15%">{{$t("idol.okurigana")}}</td>
                <td width="35%">{{information.charaData ? information.charaData.name_kana : ""}}</td>
            </tr>
            <tr>
                <td>{{$t("idol.card_name")}}</td>
                <td>{{information.name}}</td>
                <td>{{$t("idol.name")}}</td>
                <td>{{information.charaData ? information.charaData.name : ""}}</td>
            </tr>
            <tr>
                <td>{{$t("idol.chara_id")}}</td>
                <td>{{information.chara_id}}</td>
                <td>{{$t("idol.age")}}</td>
                <td>{{information.charaData ? information.charaData.age : ""}}</td>
            </tr>
            <tr>
                <td>{{$t("idol.rarity")}}</td>
                <td>{{rarity}}</td>
                <td>{{$t("idol.height")}}</td>
                <td>{{information.charaData ? information.charaData.height : ""}}</td>
            </tr>
            <tr>
                <td class="hp">{{$t("idol.hp")}}</td>
                <td class="hp">{{hp}}</td>
                <td>{{$t("idol.weight")}}</td>
                <td>{{information.charaData ? information.charaData.weight : ""}}</td>
            </tr>
            <tr>
                <td class="vocal">{{$t("idol.vocal")}}</td>
                <td class="vocal">{{vocal}}</td>
                <td>{{$t("idol.birth")}}</td>
                <td>{{information.charaData ? (information.charaData.birth_month + "月" + information.charaData.birth_day + "日") : ""}}</td>
            </tr>
            <tr>
                <td class="dance">{{$t("idol.dance")}}</td>
                <td class="dance">{{dance}}</td>
                <td>{{$t("idol.blood")}}</td>
                <td>{{information.charaData ? information.charaData.blood_type : "" | blood}}</td>
            </tr>
            <tr>
                <td class="visual">{{$t("idol.visual")}}</td>
                <td class="visual">{{visual}}</td>
                <td>{{$t("idol.handedness")}}</td>
                <td>{{information.charaData ? information.charaData.hand : "" | hand}}</td>
            </tr>
            <tr>
                <td>{{$t("idol.solo_live")}}</td>
                <td>{{solo}}</td>
                <td>{{$t("idol.threesize")}}</td>
                <td>{{information.charaData ? [information.charaData.body_size_1, information.charaData.body_size_2, information.charaData.body_size_3] : [] | threesize}}</td>
            </tr>
            <tr>
                <td>{{$t("idol.skill_name")}}</td>
                <td>{{information.skill ? information.skill.skill_name : ""}}</td>
                <td>{{$t("idol.hometown")}}</td>
                <td>{{information.charaData ? information.charaData.hometown : ""}}</td>
            </tr>
            <tr>
                <!-- <td>{{$t("idol.skill_explain")}}</td> -->
                <td colspan="2">{{information.skill ? information.skill.explain : ""}}</td>
                <td>{{$t("idol.constellation")}}</td>
                <td>{{information.charaData ? information.charaData.seiza : ""}}</td>
            </tr>
            <tr>
                <td>{{$t("idol.leader_skill_name")}}</td>
                <td>{{information.leaderSkill ? information.leaderSkill.name : ""}}</td>
                <td>{{$t("idol.voice")}}</td>
                <td>{{information.charaData ? information.charaData.voice : ""}}</td>
            </tr>
            <tr>
                <!-- <td>{{$t("idol.leader_skill_explain")}}</td> -->
                <td colspan="2">{{information.leaderSkill ? information.leaderSkill.explain : ""}}</td>
                <td>{{$t("idol.favorite")}}</td>
                <td>{{information.charaData ? information.charaData.favorite : ""}}</td>
            </tr>
        </table>
    </div>
</div>
</template>

<script src="../js/idol.js"></script>

<style>
.cute>tr>td:nth-last-child(1), .cute>tr>td:nth-last-child(2){
    color: #f090a0;
}
.cool>tr>td:nth-last-child(1), .cool>tr>td:nth-last-child(2){
    color: #a0f0f0;
}
.passion>tr>td:nth-last-child(1), .passion>tr>td:nth-last-child(2){
    color: #f0c080;
}
.hp {
    color: #90e0c0;
}
.vocal {
    color: #f090a0;
}
.dance {
    color: #a0f0f0;
}
.visual {
    color: #f0c080;
}
.table-bordered{
    border: 1px solid #ddd;
    border-spacing: 0;
    border-collapse: collapse;
    width: 100%;
    max-width: 100%;
}
.table-bordered>tr>td:nth-child(1), .table-bordered>tr>td:nth-last-child(2){
    text-align: center;
}
.table-bordered>tr>td:nth-last-child(3), .table-bordered>tr>td:nth-last-child(1){
    padding-left: 5px;
}
.idol-info{
    height: calc(100% - 93px);
}
.idol-info>div>.cgss-progress-load{
    width: calc(100% - 200px);
}
.idol-info>div>.pull-right{
    position: relative;
    top: -5px;
}
.idol-query{
    width: calc(100% - 690px);
}
.idol-result{
    width: 300px;
    height: calc(100% - 20px);
}
.idol-result>ul>li{
    cursor: pointer;
    display: flex;
    height: 30px;
    border: 1px solid #000;
    background: linear-gradient(180deg,#f0f0f0,silver);
    font-family: "CGSS-B";
    font-size: 15px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.idol-result>ul>li.active{
    background: linear-gradient(180deg,#902070,#e070d0);
    color: #fff;
}
</style>
