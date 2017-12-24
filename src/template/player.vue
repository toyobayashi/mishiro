<template>
<div class="bgm-select-bar clearfix">
    <button v-on:click.stop="selectBgm()">
        <span>
            <marquee scrollAmount="2" direction="left">
                {{playing.src.slice(playing.src.lastIndexOf('/') + 1)}}
            </marquee>
        </span>
    </button>
    <button v-on:click.stop="pauseButton()" id="pauseBtn">
        <span>{{ isPlaying ? $t('home.pause') : $t('home.play') }}</span>
    </button>
    <ul class="gray-bg" v-show="isShow">
        <li v-for="bgm in bgmList" 
            v-if="!bgm.hidden"
            v-bind:id="bgm.src.slice(bgm.src.lastIndexOf('/') + 1).split('.')[0]" 
            v-on:click="play(bgm)">
            <span v-text="bgm.src.slice(bgm.src.lastIndexOf('/') + 1)"
                  v-bind:class="{ theme: bgm.src === src }"></span>
        </li>
    </ul>
</div>
</template>

<script src="../js/player.js">
</script>

<style>
.bgm-select-bar{
    width: 279px;
    font-family: 'CGSS-B';
    position: absolute;
    top: 0;
    left: 200px;
}
.bgm-select-bar>button{
    font-family: 'CGSS-B';
    font-size: 15px;
    cursor: pointer;
    height: 30px;
    background-image: url("../res/img/selectBar.png");
}
.bgm-select-bar>button>span{
    display: inline-block;
    position: relative;
    bottom: 2px;
}
.bgm-select-bar>button:nth-child(1){
    float: left;
    width: 192px;
    background-position: -384px -30px;
}
.bgm-select-bar>button:nth-child(2){
    color: #fff;
    float: left;
    width: 87px;
    background-position: -576px -30px;
}
.bgm-select-bar>button:nth-child(1):active{    
    background-position: -384px 0;
    padding-top: 3px;
}
.bgm-select-bar>button:nth-child(2):active{
    background-position: -576px 0;
    padding-top: 3px;
}
.bgm-select-bar>ul{
    float: left;
    list-style: none;
    width: 192px;
    font-size: 14px;
    padding: 0;
}
.bgm-select-bar>ul>li{
    cursor: pointer;
}
.bgm-select-bar>ul>li:first-child{
    border-radius: 8px 8px 0 0;
}
.bgm-select-bar>ul>li:last-child{
    border-radius: 0 0 8px 8px;
}
.bgm-select-bar>ul>li:hover{
    background-color: #999;
}
.bgm-select-bar>ul>li>span{
    display: inline-block;
    position: relative;
    left: 5px;
}
</style>