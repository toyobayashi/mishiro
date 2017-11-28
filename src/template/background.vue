<template>
<div id="bgGroup">
    <div v-if="backgroundId">
        <img :class="{
            yoko: bg,
            tate: !bg
        }" :src="'./img/card/card_bg_' + backgroundId + '.png'" />
    </div>
    <div v-else>
        <img src="../res/img/bg_anim_icon.png" id="symbol"/>
        <img src="../res/img/bg_anim_circle.png" id="colorCircle1"/>
        <img src="../res/img/bg_anim_circle.png" id="colorCircle2"/>
        <img src="../res/img/bg_anim_circle.png" id="colorCircle3"/>
        <img src="../res/img/bg_anim_circle_01.png" id="grayCircle1"/>
        <img src="../res/img/bg_anim_circle_02.png" id="grayCircle2"/>
        <img src="../res/img/bg_anim_circle_02.png" id="grayCircle3"/> 
    </div>
</div>
</template>

<style>
@keyframes rotatePlus {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
@keyframes rotateMinus {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
}
#bgGroup{
    position: absolute;
    z-index: -1000;
}
#symbol{
    position:fixed;
    z-index:-11;
    left:50%;
    top:50%;
    margin-top:-145px;
    margin-left:-170px
}
#colorCircle1{
    animation: rotateMinus 20s linear infinite;
    z-index: -10;
    position: fixed;
    left: -203px;
    top: -243px;
}
#colorCircle2{
    animation: rotateMinus 10s linear infinite;
    z-index: -10;
    position: fixed;
    left: 130px;
    bottom: -243px;
}
#colorCircle3{
    animation: rotatePlus 20s linear infinite;
    z-index: -10;
    position: fixed;
    right: -50px;
    top: -370px;
}
#grayCircle1{
    animation: rotatePlus 30s linear infinite;
    z-index: -10;
    position: fixed;
    left: -313px;
    top: -353px;
}
#grayCircle2{
    animation: rotateMinus 40s linear infinite;
    z-index: -10;
    position: fixed;
    right: -385px;
    bottom: -385px;
}
#grayCircle3{
    animation: rotateMinus 40s linear infinite;
    z-index: -10;
    position: fixed;
    right: -192px;
    top: -512px;
}
</style>

<script>
export default {
    data(){
        return {
            bg: null,
            backgroundId: false
        };
    },
    mounted(){
        this.$nextTick(() => {
            this.bg = (window.innerWidth / window.innerHeight >= 1280 / 824);
            window.onresize = (() => {
                this.bg = (window.innerWidth / window.innerHeight >= 1280 / 824);
            });
            this.event.$on("eventBgReady", (cardId) => {
                this.backgroundId = cardId;
            });
        });
    }
};
</script>
