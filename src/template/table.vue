<template>
<table v-if="data" class="cgss-table">
    <thead>
        <tr>
            <th><input type="checkbox" v-model="selectAll" /></th>
            <th v-if="data[0]" v-for="(item, key) in data[0]">{{key}}</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="row in data">
            <td><input type="checkbox" :id="row.hash" :value="row" v-model="selected" @change="updateValue" 
            :disabled="isDisabled(row)"
            /></td>
            <td v-for="item in row">{{item}}</td>
        </tr>
    </tbody>
</table>
</template>

<script>
export default {
    props: ["data", "isDisabled"],
    data(){
        return {
            selected: [],
            selectAll: false
        };
    },
    methods: {
        updateValue(){
            this.$emit("change", this.selected);
        }
    },
    watch: {
        selectAll(val){
            if(val){
                this.selected = [];
                for(let i = 0; i < this.data.length; i++){
                    if(!this.isDisabled(this.data[i])){
                        this.selected.push(this.data[i]);
                    }
                }
            }
            else{
                this.selected = [];
            }
            this.$emit("change", this.selected);
        }
    },
    mounted(){
        this.$nextTick(() => {
            this.event.$on("completeTask", (row) => {
                for(let i = 0; i < this.selected.length; i++){
                    if(this.selected[i].name === row.name){
                        document.getElementById(this.selected[i].hash).setAttribute("disabled", true);
                        this.selected.splice(i, 1);
                        break;
                    }
                }
            });
        });
    }
    
};
</script>

<style>
.cgss-table{
    width: 100%;
    border-spacing:0;
    border-radius: 8px;
    border: 1px #a0a0a0 solid;
    overflow: hidden;
    font-family: "CGSS-B";
}
.cgss-table th,.cgss-table td{
    border-left: 1px solid #a0a0a0;
    border-top: 1px solid #a0a0a0;
    padding: 0 10px;
    height: 40px;
    box-sizing: border-box;
    color: #333;
    /*text-align: left;*/
}
.cgss-table th{
    background-color: #202020;
    border-top:none;
    color: #f0f0f0;
}
.cgss-table td:first-child,.cgss-table th:first-child{
    border-left: none;
}
.cgss-table tr:nth-child(even){
    background: #e0e0e0;
}
.cgss-table tr:nth-child(odd){
    background: #c0c0c0;
}
</style>
