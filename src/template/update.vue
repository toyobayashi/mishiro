<template>
<div class="black">
    <div class="lb">
        <p>{{text}}</p>
        <progress-bar class="cgss-progress-load" :percent="loading"></progress-bar>
        <p>{{$t("update.tip")}}</p>
    </div>
    <img src="../res/img/spinner.gif" class="spinner" />
</div>
</template>

<style scoped>
.black{
    position: absolute; 
    z-index: 900;
    font-family: "CGSS-B";
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-end;
    width: 100%;
    height: 100%;
    background-color: #000;
}
.lb{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    padding: 20px;
    margin: 40px;
    width: 45%;
    height: 20%;
    background-color: #aaa;
}
.spinner{
    width: 48px;
    height: 48px;
    position: absolute;
    bottom: 40px;
    right: 40px;
}
</style>

<script src="../js/update.js">
</script>