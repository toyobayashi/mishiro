<template>
<div class="task">
    <p style="height:30px;">{{text}}</p>
    <progress-bar class="cgss-progress-load" :percent="totalLoading"></progress-bar>
    <progress-bar class="cgss-progress-load margin-top-10" :percent="currentLoading"></progress-bar>
    <p>{{$t("update.tip")}}</p>
</div>
</template>

<style>
.loding{
    
}
.task{
    font-family: "CGSS-B";
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    border: 3px solid #000;
    padding: 10px 50px;
    margin: 20px 0 0 0;
    background-color: #aaa;
    height: 150px;
}

</style>

<script>
import progressBar from "./progressBar.vue";
export default {
    components: {
        progressBar
    },
    props: ["currentLoading", "totalLoading", "text"],
    data(){
        return {

        };
    }
};
</script>