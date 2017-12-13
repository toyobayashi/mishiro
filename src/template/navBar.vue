<template>
<div class="main-bar" id="mainBar">
    <ul>
        <li v-for="block in blocks" :class="{ active: currentBlock === block}" @click="navToggle(block)"></li>
    </ul>
</div>
</template>

<script>
export default {
    props: ["currentBlock"],
    data(){
        return {
            blocks: ["home", "idol", "live", "gacha", "menu"]
        };
    },
    methods: {
        navToggle(block){
            if(block !== this.currentActive){
                if(block === "live" || block === "gacha" || block === "menu"){
                    this.event.$emit("alert", this.$t("home.errorTitle"), this.$t("home.hope"));
                }
                else{
                    this.currentActive = block;
                    this.$emit("changeBlock", block);
                }
                this.playSe(this.enterSe);
            }
        }
    }
};
</script>

<style>
.main-bar{
    display: block;
    position: fixed;
    width: 672px;
    left: 50%;
    margin-left: -336px;
    bottom: 0;
    background-image: url("../res/img/navbar.png");
    z-index: 200;
}
.main-bar ul{
    list-style: none;
    height: 68px;
}
.main-bar ul li{
    cursor: pointer;
    float: left;
    display: block;
    width: 128px;
    height: 68px;
    text-decoration: none;
    background-image: url("../res/img/navbar.png");
}
.main-bar ul li:nth-child(1){
    background-position: 0 0;
}
.main-bar ul li:nth-child(1).active{
    background-position: 0 -68px;
}
.main-bar ul li:nth-child(2){
    background-position: -128px 0;
}
.main-bar ul li:nth-child(2).active{
    background-position: -128px -68px;
}
.main-bar ul li:nth-child(3){
    width: 160px;
    background-position: -256px 0;
}
.main-bar ul li:nth-child(3).active{
    background-position: -256px -68px;
}
.main-bar ul li:nth-child(4){
    background-position: -416px 0;
}
.main-bar ul li:nth-child(4).active{
    background-position: -416px -68px;
}
.main-bar ul li:nth-child(5){
    background-position: -544px 0;
}
.main-bar ul li:nth-child(5).active{
    background-position: -544px -68px;
}
</style>
