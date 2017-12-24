<template>
<div v-show="show" class="modal">
    <transition name="scale" @after-leave="afterLeave">
        <div class="dialog" v-show="visible">
            <div class="modal-header">
                <span class="title-dot"></span><span class="title-dot"></span><span class="title-dot"></span>
                <h4 class="modal-title">
                    {{$t("gacha.information")}}
                </h4>
            </div>
            <div class="modal-body" id="gachaInfoBody">
                <table class="table-bordered" border="1">
                    <tr>
                        <td colspan="1">{{$t("gacha.id")}}</td>
                        <td colspan="3">{{gachaData.id}}</td>
                    </tr>
                    <tr>
                        <td colspan="1">{{$t("gacha.name")}}</td>
                        <td colspan="3">{{gachaData.name}}</td>
                    </tr>
                    <tr>
                        <td colspan="1">{{$t("gacha.discription")}}</td>
                        <td colspan="3">{{gachaData.dicription}}</td>
                    </tr>
                    <tr>
                        <td colspan="1">{{$t("gacha.endDate")}}</td>
                        <td colspan="3">{{gachaData.end_date}} (JST)</td>
                    </tr>
                    <tr>
                        <td width="18%">{{$t("gacha.r")}}</td>
                        <td width="32%">{{gachaData.count ? gachaData.count.R : 0}} ({{(gachaData.count ? gachaData.count.fes : false) ? "82.00%" : "85.00%"}})</td>
                        <td width="18%">{{$t("gacha.get")}}</td>
                        <td width="32%">{{info.r}}</td>
                    </tr>
                    <tr>
                        <td>{{$t("gacha.sr")}}</td>
                        <td>{{gachaData.count ? gachaData.count.SR : 0}}  (12.00%)</td>
                        <td>{{$t("gacha.get")}}</td>
                        <td>{{info.sr}}</td>
                    </tr>
                    <tr>
                        <td>{{$t("gacha.ssr")}}</td>
                        <td>{{gachaData.count ? gachaData.count.SSR : 0}} ({{(gachaData.count ? gachaData.count.fes : false) ? "6.00%" : "3.00%"}})</td>
                        <td>{{$t("gacha.get")}}</td>
                        <td>{{info.ssr}}</td>
                    </tr>
                    <tr>
                        <td colspan="1">{{$t("gacha.cost")}}</td>
                        <td colspan="3">{{info.costStarJewel}}</td>
                    </tr>
                </table>
            </div>
            <div class="modal-footer">
                <button type="button" class="cgss-btn cgss-btn-default" @click="close">{{$t("home.close")}}</button>
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
            info: {}
        };
    },
    computed: {
        gachaData(){
            return this.$store.state.master ? this.$store.state.master.gachaData : {};
        }
    },
    methods: {
        close(){
            this.playSe(this.cancelSe);
            this.visible = false;
        },
        afterLeave(){
            this.show = false;
        }
    },
    mounted(){
        this.$nextTick(() => {
            this.event.$on("showInformation", (info) => {
                this.info = info;
                this.show = true;
                this.visible = true;
            });
        });
    }
};
</script>
