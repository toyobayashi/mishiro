<template>
<div class="task flex-center">
    <p style="height:30px;">{{text}}</p>
    <progress-bar class="cgss-progress-load" :percent="currentLoading"></progress-bar>
    <progress-bar class="cgss-progress-load margin-top-10" :percent="totalLoading" v-show="!single"></progress-bar>
    <p>{{$t("update.tip")}}</p>
</div>
</template>

<style>
.task{
    font-family: "CGSS-B";
    border-radius: 10px;
    border: 3px solid #000;
    padding: 10px 50px;
    background-color: #aaa;
    height: 150px;
}
.flex-center{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

</style>

<script>
import progressBar from "./progressBar.vue";
export default {
    components: {
        progressBar
    },
    props: ["currentLoading", "totalLoading", "text", "single"],
    data(){
        return {

        };
    }
};
</script>