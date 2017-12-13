<template>
<div v-show="show" class="modal">
    <transition name="scale" @after-leave="afterLeave">
        <div style="width: 600px;" v-show="visible">
            <div class="modal-header">
                <!-- <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button> -->
                <span class="title-dot"></span><span class="title-dot"></span><span class="title-dot"></span>
                <h4 class="modal-title" id="calError1">
                    {{title}}
                </h4>
            </div>
            <div class="modal-body">
                {{body}}
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
            title: "",
            body: ""
        };
    },
    methods: {
        close(){
            this.playSe(this.cancelSe);
            this.visible = false;
        },
        afterLeave(){
            this.show = false;
            this.title = "";
            this.body = "";
        }
    },
    mounted(){
        this.$nextTick(() => {
            this.event.$on("alert", (title, body) => {
                this.title = title;
                this.body = body;
                this.show = true;
                this.visible = true;
            });
        });
    }
};
</script>

<style>
.modal{
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    z-index: 800;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.modal>div{
    border: 2px solid rgba(0,0,0,1);
    border-radius: 10px;
    font-family: "CGSS-B";
    font-size: 20px;
}
.modal-header {
    padding: 18px;
    border-bottom: 1px solid #000;
    height: 64px;
    background: linear-gradient(180deg,#f0f0f0,#d0d0d0);
    border-radius: 10px 10px 0 0;
}
.modal-title {
    margin: 0;
    line-height: 27px;
    font-size: 20px;
    height: 27px;
    display: inline-block;
    position: relative;
    bottom: 5px;
}
.modal-body {
    position: relative;
    padding: 15px;
    background-color: rgba(0,0,0,.87);
    color: #fff;
}
.modal-footer {
    padding: 15px;
    text-align: center;
    border-top: 1px solid #000;
    background: linear-gradient(180deg,#f0f0f0,#d0d0d0);
    height: 103px;
    border-radius: 0 0 10px 10px;
}
.title-dot {
    display: inline-block;
    width: 6px;
    height: 27px;
    border-left: 3px dotted #333;
}
</style>
