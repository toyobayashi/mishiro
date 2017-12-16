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
    <!-- <audio id="bgm" preload="auto" v-bind:src="src" type="audio/mpeg"></audio> -->
</div>
</template>

<script src="../js/player.js"></script>

<style src="../css/player.css"></style>