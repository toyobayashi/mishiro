<template>
<div class="version white-bg">{{$t("home.resVer")}}: {{resVer}}</div>
</template>
<script>
export default {
    computed: {
        resVer(){
            return this.$store.state.resVer;
        }
    }
};
</script>
<style>
.version{
    position: absolute;
    top: 10px;
    right: 100px;
}
</style>
