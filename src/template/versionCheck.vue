<template>
<div v-show="show" class="modal">
    <transition name="scale" @after-leave="afterLeave">
        <div class="version-dialog" v-show="visible">
            <div class="modal-header">
                <span class="title-dot"></span><span class="title-dot"></span><span class="title-dot"></span>
                <h4 class="modal-title">
                    {{$t("menu.update")}}
                </h4>
            </div>
            <div class="modal-body">
                <table class="table-bordered" border="1">
                    <tr>
                        <td width="25%">{{$t("menu.version")}}</td>
                        <td width="75%">{{versionData.version}}</td>
                    </tr>
                    <tr>
                        <td>{{$t("menu.commit")}}</td>
                        <td>{{versionData.commit}}</td>
                    </tr>
                    <tr>
                        <td>{{$t("menu.description")}}</td>
                        <td class="markdown-body" v-html="versionData.description"></td>
                    </tr>
                </table>
            </div>
            <div class="modal-footer flex-center">
                <div class="clearfix">
                    <button type="button" class="cgss-btn cgss-btn-default pull-right margin-left-50" @click="close">{{$t("home.close")}}</button>
                    <button type="button" class="cgss-btn-lg cgss-btn-lg-ok pull-right" @click="showRepo">{{$t("menu.release")}}</button>
                </div>
            </div>
        </div>
    </transition>
</div>
</template>

<script>
import { shell } from "electron";
export default {
    data(){
        return {
            show: false,
            visible: false,
            versionData: {}
        };
    },
    methods: {
        close(){
            this.playSe(this.cancelSe);
            this.visible = false;
        },
        afterLeave(){
            this.show = false;
        },
        showRepo(){
            if(this.versionData.exeUrl){
                shell.openExternal(this.versionData.exeUrl);
            }
            else if(this.versionData.zipUrl){
                shell.openExternal(this.versionData.zipUrl);
            }
            else{
                shell.openExternal("https://github.com/toyobayashi/mishiro/releases");
            }
            this.playSe(this.enterSe);
        }
    },
    mounted(){
        this.$nextTick(() => {
            this.event.$on("versionCheck", (versionData) => {
                this.show = true;
                this.visible = true;
                this.versionData = versionData;
            });
        });
    }
};
</script>

<style>
.version-dialog {
    width: 800px;
}
.markdown-body {
    word-wrap: break-word;
}
</style>
