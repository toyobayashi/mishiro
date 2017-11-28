<template>
<div class="version white-bg">Version: {{resVer}}</div>
</template>
<script>
export default {
    data(){
        return {
            // resVer: this.resVer
        };
    },
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
