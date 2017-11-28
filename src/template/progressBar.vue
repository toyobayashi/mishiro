<template>
<div class="cgss-progress">
	<div>
		<div id="staminaBar" v-bind:style="{ width: percent + '%' }"></div>
		<span>{{ percent.toFixed(2) }}%</span>
	</div>
</div>
</template>

<script>
export default {
    props: ["percent"],
    data(){
        return {

        };
    }
};
</script>

<style src="../css/progressBar.css"></style>