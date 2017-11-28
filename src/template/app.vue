<template>
<div style="position: absolute;width: 100%;height: 100%;">
    <transition name="fade" @after-leave="afterEnter">
        <entry v-if="!isEntered" @enter="isEntered = !isEntered"></entry>
    </transition>
    <transition name="fade">
        <update v-if="!isReady" @ready="isReady = !isReady"></update>
    </transition>
    <background></background>
    <div id="mainBlock" v-show="show">
        <home></home>
        <hide-button @toggle="showBackground"></hide-button>
        <version></version>
        <player></player>
        <small-tab :tab="i18nTabs" :default="_i18n._vm.locale" id="i18nTab" @tabClicked="changeLanguage"></small-tab>
        <nav-bar></nav-bar>
    </div>
    <alert></alert>
</div>
</template>

<script>
import entry from "./entry.vue";
import player from "./player.vue";
import update from "./update.vue";
import background from "./background.vue";
import smallTab from "./smallTab.vue";
import hideButton from "./hideButton.vue";
import navBar from "./navBar.vue";
import version from "./version.vue";
import home from "./home.vue";
import alert from "./alert.vue";
export default {
    components: {
        entry,
        player,
        update,
        background,
        smallTab,
        hideButton,
        navBar,
        version,
        home,
        alert
    },
    data(){
        return {
            isEntered: false,
            isReady: false,
            show: true,
            i18nTabs: {
                zh: "i18n.chinese",
                ja: "i18n.japanese"
            }
        };
    },
    methods: {
        enter(){
            this.isEntered = true;
        },
        changeLanguage(language){
            switch(language){
                case "i18n.japanese": this._i18n._vm.locale = "ja"; break;
                case "i18n.chinese": this._i18n._vm.locale = "zh"; break;
            }
            // this.$el.parentNode.parentNode.getElementsByTagName("title")[0].innerHTML = this.$t("title");
        },
        showBackground(){
            const cb = () => {
                this.show = !this.show;
                document.removeEventListener("click", cb, false);
            };
            this.show = !this.show;
            setTimeout(() => {
                if(!this.show){
                    document.addEventListener("click", cb, false);
                }
            }, 0);
        },
        afterEnter(){
            console.log("[event] enter");
            this.event.$emit("enter");
        }
    },
    mounted(){
        this.$nextTick(() => {
            this.event.$on("enter", () => {
                
            });
            this.event.$on("ready", () => {
                
            });
        });
    }
};
</script>

<style src="../css/style.css"></style>