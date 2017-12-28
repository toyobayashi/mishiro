<template>
<div v-show="show" class="modal">
    <transition name="scale" @after-leave="afterLeave">
        <div class="dialog" v-show="visible">
            <div class="modal-header">
                <span class="title-dot"></span><span class="title-dot"></span><span class="title-dot"></span>
                <h4 class="modal-title">
                    {{$t("menu.about")}}
                </h4>
            </div>
            <div class="modal-body">
                <table class="table-bordered" border="1">
                    <tr>
                        <td width="25%">{{$t("menu.appname")}}</td>
                        <td width="75%">{{remote.app.getName()}}</td>
                    </tr>
                    <tr>
                        <td>{{$t("menu.appver")}}</td>
                        <td>{{remote.app.getVersion()}}</td>
                    </tr>
                    <tr>
                        <td>Electron</td>
                        <td>v1.7.10</td>
                    </tr>
                    <tr>
                        <td>Node</td>
                        <td>v7.9.0</td>
                    </tr>
                    <tr>
                        <td>{{$t("menu.description")}}</td>
                        <td>{{$t("menu.descCon")}}</td>
                    </tr>
                </table>
            </div>
            <div class="modal-footer flex-center">
                <div class="clearfix">
                    <button type="button" class="cgss-btn cgss-btn-default pull-right margin-left-50" @click="close">{{$t("home.close")}}</button>
                    <button type="button" class="cgss-btn cgss-btn-ok pull-right" @click="showRepo">Github</button>
                </div>
            </div>
        </div>
    </transition>
</div>
</template>

<script>
import { remote, shell } from "electron";
export default {
    data(){
        return {
            show: false,
            visible: false,
            remote
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
            shell.openExternal("https://github.com/toyobayashi/mishiro");
            this.playSe(this.enterSe);
        }
    },
    mounted(){
        this.$nextTick(() => {
            this.event.$on("showAbout", () => {
                this.show = true;
                this.visible = true;
            });
            this.event.$on("escKey", () => {
                this.close();
            });
        });
    }
};
</script>

