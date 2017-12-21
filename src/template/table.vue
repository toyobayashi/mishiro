<template>
<table v-if="data.length" class="cgss-table">
    <thead>
        <tr>
            <th class="flex-center"><input type="checkbox" id="checkAll" v-model="selectAll" /><label for="checkAll"></label></th>
            <th v-if="data[0]" v-for="(item, key) in data[0]">{{key}}</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="row in data">
            <td class="flex-center"><input type="checkbox" :id="row.hash" :value="row" v-model="selected" @change="updateValue" 
            :disabled="isDisabled(row)"
            /><label :for="row.hash"></label></td>
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
            this.event.$on("completeTask", (name) => {
                for(let i = 0; i < this.selected.length; i++){
                    if(this.selected[i].name === name ||
                    this.selected[i].name === "b/" + name ||
                    this.selected[i].name === "c/" + name ||
                    this.selected[i].name === "l/" + name ||
                    this.selected[i].name === "r/" + name ||
                    this.selected[i].name === "v/" + name){
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

input[type=checkbox]{
    display: none !important;
}
input[type=checkbox]+label{
    box-sizing: border-box;
    width: 30px;
    height: 30px;
    background: -webkit-linear-gradient(225deg, #f0f0f0, #d0d0d0, #c0c0c0);
    border: 2px solid #000000;
    border-bottom: 4px solid #000000;
    border-radius: 5px;
    display: inline-block;
    position: relative;
}
input[type=checkbox]+label:after{
    content: '\2714';
    font-size: 20px;
    position: absolute;
    top: -8px;
    left: 5px;
    color: #b0b0b0;
    -webkit-text-stroke: 1px #505050;
    font-weight: bold;
}
input[type=checkbox]:active+label{
    height: 28px;
    top: 2px;
    border-bottom: 2px solid #000000;
    background: -webkit-linear-gradient(225deg, #f0f0f0, #d0d0d0, #c0c0c0);
}
input[type=checkbox]:checked+label:after{
    color: #f080e0;
    -webkit-text-stroke: 1px #50113f;
}
input[type=checkbox]:disabled+label:after{
    content: '';
}
input[type=checkbox]:disabled:active+label{
    height: 30px;
    top: 0;
    border-bottom: 4px solid #000000;
    background: -webkit-linear-gradient(225deg, #f0f0f0, #d0d0d0, #c0c0c0);
}
</style>
