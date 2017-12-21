<template>
<div v-show="show" class="modal">
    <transition name="scale" @after-leave="afterLeave">
        <div style="width: 600px;" v-show="visible">
            <div class="modal-header">
                <span class="title-dot"></span><span class="title-dot"></span><span class="title-dot"></span>
                <h4 class="modal-title">
                    {{$t("menu.option")}}
                </h4>
            </div>
            <div class="modal-body">
                <form>
                    <div>
                        <label>{{$t("menu.lang")}}</label>
                        <div class="pull-right option-input clearfix">
                            <input type="radio" value="zh" id="razh" v-model="lang" name="lang" class="pull-left" /><label for="razh" class="pull-left lable-top"></label><span class="pull-left">{{$t("i18n.chinese")}}</span>
                            <input type="radio" value="ja" id="raja" v-model="lang" name="lang" class="pull-left" /><label for="raja" class="pull-left lable-top margin-left-50"></label><span class="pull-left">{{$t("i18n.japanese")}}</span>
                        </div>
                    </div>
                    <div class="margin-top-10">
                        <label>{{$t("menu.resVer")}}</label>
                        <input class="db-query pull-right option-input" :placeholder="`10012760 ≤ ${$t('menu.resVer')} ≤ ${latestResVer}`" v-model="resVer" />
                    </div>
                    <div class="margin-top-10">
                        <label>{{$t("menu.gacha")}}</label>
                        <input class="db-query pull-right option-input" :placeholder="`30001 ≤ ${$t('menu.gacha')} ≤ ${gachaNow.id}`" v-model="gachaId" />
                    </div>
                    <div class="margin-top-10">
                        <label>{{$t("menu.event")}}</label>
                        <input class="db-query pull-right option-input" :placeholder="$t('menu.eventPlacehoder') + 'bgm_event_ID'" v-model="eventId" />
                    </div>
                    <div class="margin-top-10">
                        <label>{{$t("menu.background")}}</label>
                        <input class="db-query pull-right option-input" :placeholder="$t('menu.backPlacehoder')" v-model="backgroundId" />
                    </div>
                </form>
            </div>
            <div class="modal-footer flex-center">
                <div class="clearfix">
                    <button type="button" class="cgss-btn cgss-btn-default pull-right margin-left-50" @click="close">{{$t("home.close")}}</button>
                    <button type="button" class="cgss-btn cgss-btn-ok pull-right" @click="save">{{$t("menu.save")}}</button>
                </div>
            </div>
        </div>
    </transition>
</div>
</template>

<script>
export default {
    data(){
        return {
            show: false,
            visible: false,
            latestResVer: this.configurer.getConfig().latestResVer,
            lang: "",
            resVer: "",
            gachaId: "",
            eventId: "",
            backgroundId: ""
        };
    },
    computed: {
        cardData(){
            return this.$store.state.master ? this.$store.state.master.cardData : {};
        },
        eventData(){
            return this.$store.state.master ? this.$store.state.master.eventAll : {};
        },
        gachaNow(){
            return this.$store.state.master ? this.$store.state.master.gachaNow : {};
        }
    },
    methods: {
        close(){
            this.playSe(this.cancelSe);
            this.visible = false;
        },
        afterLeave(){
            this.show = false;
        },
        save(){
            this.playSe(this.enterSe);
            let resVer, gachaId, eventId, backgroundId;
            if(this.resVer){
                if(Number(this.resVer) < 10012760 || Number(this.resVer) % 10 !== 0 || Number(this.resVer) > this.latestResVer){
                    this.event.$emit("alert", this.$t("home.errorTitle"), "resVer error");
                    return;
                }
                else{
                    resVer = Number(this.resVer);
                }
            }
            else{
                resVer = this.resVer;
            }

            if(this.gachaId){
                if(Number(this.gachaId) < 30000 || Number(this.gachaId) > this.gachaNow.id || Math.floor(Number(this.gachaId)) !== Number(this.gachaId)){
                    this.event.$emit("alert", this.$t("home.errorTitle"), "gachaId error");
                    return;
                }
                else{
                    gachaId = Number(this.gachaId);
                }
            }
            else{
                gachaId = this.gachaId;
            }

            if(this.eventId){
                if(!this.eventData.filter(e => e.id == this.eventId).length){
                    this.event.$emit("alert", this.$t("home.errorTitle"), "eventId error");
                    return;
                }
                else{
                    eventId = Number(this.eventId);
                }
            }
            else{
                eventId = this.eventId;
            }

            if(this.backgroundId){
                if(!this.cardData.filter(c => c.id == this.backgroundId).length){
                    this.event.$emit("alert", this.$t("home.errorTitle"), "backgroundId error");
                    return;
                }
                else{
                    backgroundId = Number(this.backgroundId);
                }
            }
            else{
                backgroundId = this.backgroundId;
            }

            this.event.$emit("smallTab", this.lang);
            this._i18n._vm.locale = this.lang;
            this.configurer.configure({ language: this.lang, resVer, gacha: gachaId, event: eventId, background: backgroundId });
            this.visible = false;
        }
    },
    mounted(){
        this.$nextTick(() => {
            this.event.$on("option", () => {
                let config = this.configurer.getConfig();
                this.lang = config.language ? config.language : "";
                this.resVer = config.resVer ? config.resVer : "";
                this.gachaId = config.gacha ? config.gacha : "";
                this.eventId = config.event ? config.event : "";
                this.backgroundId = config.background ? config.background : "";
                this.show = true;
                this.visible = true;
            });
        });
    }
};
</script>

<style>
.lable-top{
    top: 5px;
}
.option-input{
    margin: 0;
    width: 70%;
}
.margin-left-50{
    margin-left: 50px;
}
input[type=radio]{
    display: none !important;
}
input[type=radio]+label{
    box-sizing: border-box;
    width: 30px;
    height: 30px;
    background: #f0f0f0;
    border: 2px solid #000000;
    border-radius: 50%;
    display: inline-block;
    padding: 4px;
    position: relative;
}
input[type=radio]+label:after{
    content: ' ';
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: -webkit-linear-gradient(270deg, #a0a0a0, #c8c8c8, #f0f0f0);
}
input[type=radio]:active+label:after{
    background: -webkit-linear-gradient(270deg, #909090, #c8c8c8, #f0f0f0);
}
input[type=radio]:checked+label:after{
    background: -webkit-radial-gradient(25% 25%, closest-corner, #f0f0f0, #c01080);
}
</style>
