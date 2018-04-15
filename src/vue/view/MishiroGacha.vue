<template>
<div class="main-block-style flex-center">
  <div class="flex-center">
    <div class="clearfix">
      <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-10" @click="opendir">{{$t("home.opendir")}}</button>
      <button class="cgss-btn cgss-btn-default pull-right margin-left-10" @click="clear">{{$t("gacha.clear")}}</button>
      <button class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="showHistory">{{$t("gacha.history")}}</button>
      <button class="cgss-btn cgss-btn-ok pull-right margin-left-10" @click="showInformation">{{$t("gacha.information")}}</button>
    </div>
  </div>
  <div class="gray-area" id="gachaResult">
    <img v-for="card in gachaResult" :src="`./img/icon/card_${card.id}_m.png`" @click="showCard(card)">
  </div>
  <div class="flex-center">
    <div class="clearfix">
      <div class="gacha-btn gacha-btn-jukkai pull-right margin-left-100" id="jukkai" @click="jukkaiHiku()">
        <div class="gacha-btn-text">{{$t("gacha.jukkai")}}</div>
        <div class="gacha-btn-jewel">
          <img :src="'./img/img.asar/jewel.png'">2500
          <span class="white">{{$t("gacha.ko")}}</span>
        </div>
      </div>
      <div class="gacha-btn gacha-btn-ikkai pull-right" id="ikkai" @click="ikkaiHiku()">
        <div class="gacha-btn-text">{{$t("gacha.ikkai")}}</div>
        <div class="gacha-btn-jewel">
          <img :src="'./img/img.asar/jewel.png'">250
          <span class="white">{{$t("gacha.ko")}}</span>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts" src="../../ts/renderer/mishiro-gacha.ts">
</script>

<style>
.white{
  color: white;
}
.margin-left-100{
  margin-left: 100px;
}
#gachaResult {
  margin: 20px auto;
  padding: 0 25px;
  width: 830px;
  height: 312px;
  color: #000;
}
#gachaResult img {
  display: inline-block;
  width: 124px;
  margin: 15px 15px 0 15px;
  cursor: pointer;
}
.gacha-btn {
  width: 194px;
  height: 70px;
  background-image: url("./img/img.asar/button_gacha.png");
  cursor: pointer;
  user-select: none;
}
.gacha-btn:active .gacha-btn-text{top:5px}
.gacha-btn:active .gacha-btn-jewel{top:5px}
.gacha-btn-ikkai {
  background-position: -194px -70px;
}
.gacha-btn-ikkai:active {
  background-position: -194px 0;
}
.gacha-btn-jukkai {
  background-position: 0 -70px;
}
.gacha-btn-jukkai:active {
  background-position: 0 0;
}
.gacha-btn-text {
  position: relative;
  font-family: CGSS-B;
  font-size: 21px;
  color: #323232;
  height: 35px;
  line-height: 36px;
  text-align: center;
}
.gacha-btn-jewel {
  position: relative;
  width: 130px;
  height: 28px;
  line-height: 27px;
  margin: 0 auto;
  color: #e0e000;
  font-family: CGSS-B;
  text-align: right;
}
.gacha-btn-jewel img {
  float: left;
}
.gacha-btn-jukkai .gacha-btn-text{
  color: #fff;
}
</style>
