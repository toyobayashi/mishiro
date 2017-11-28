<template>
<div class="main-block-style">
    <div class="clearfix">
        <input type="text" class="db-query" v-model="queryString"/>
        <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-10" @click="opendir">{{$t("home.opendir")}}</button>
        <button ref="downloadBtn" class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="downloadSelectedItem">{{$t("home.download")}}</button>
        <button class="cgss-btn cgss-btn-ok pull-right margin-left-10" id="query" @click="query">{{$t("home.search")}}</button>
    </div>
    <div class="black-bg db-query-result margin-top-20">
        <cgss-table :data="data" @change="tableChange"
        :is-disabled="isDisabled"></cgss-table>
    </div>
    <task :total-loading="total" :current-loading="current" :text="text"></task>
</div>
</template>

<script>
import cgssTable from "./table.vue";
import task from "./task.vue";
export default {
    components: {
        cgssTable,
        task
    },
    data(){
        return {
            queryString: "",
            text: "",
            data: null,
            selectedItem: [],
            current: 0,
            total: 0,
            isDisabled(row){
                return fs.existsSync(getPath(`./download/${(row.name.indexOf("/") === -1) ? row.name : row.name.split("/")[1]}`));
            }
        };
    },
    computed: {
        manifest(){
            return this.$store.state.manifest;
        }
    },
    methods: {
        opendir(){
            this.playSe(this.enterSe);
            system("if not exist download md download");
            exec("explorer " + getPath("./download"));
        },
        query(){
            if(this.queryString === ""){
                this.event.$emit("alert", this.$t("home.errorTitle"), this.$t("home.noEmptyString"));
            }
            else{
                this.data = this.manifest._exec(`SELECT name, hash FROM manifests WHERE name LIKE "%${this.queryString}%"`);
            }
            this.playSe(this.enterSe);
        },
        tableChange(val){
            this.selectedItem = val;
        },
        async downloadSelectedItem(){
            this.playSe(this.enterSe);
            system("if not exist download md download");
            const task = this.selectedItem.slice(0);
            if(task.length > 0){
                this.$refs.downloadBtn.setAttribute("disabled", "disabled");
                let completed = 0;
                for(let i = 0; i < task.length; i++){
                    if(task[i].name.split(".")[1] === "acb"){
                        await this.dl(
                            `http://storage.game.starlight-stage.jp/dl/resources/High/Sound/Common/${task[i].name.split("/")[0]}/${task[i].hash}`,
                            getPath(`./download/${task[i].name.split("/")[1]}`),
                            (prog) => {
                                this.text = `${task[i].name.split("/")[1]}　${Math.ceil(prog.current / 1024)}/${Math.ceil(prog.max / 1024)} KB`;
                                this.current = prog.loading;
                                this.total = 100 * completed / task.length + prog.loading / 100 * (100 / task.length);
                            }
                        );
                    }
                    else if(task[i].name.split(".")[1] === "unity3d"){
                        const file = await this.dl(
                            `http://storage.game.starlight-stage.jp/dl/resources/High/AssetBundles/Android/${task[i].hash}`,
                            getPath(`./download/${task[i].name.split(".")[0]}`),
                            (prog) => {
                                this.text = `${task[i].name}　${Math.ceil(prog.current / 1024)}/${Math.ceil(prog.max / 1024)} KB`;
                                this.current = prog.loading;
                                this.total = 100 * completed / task.length + prog.loading / 100 * (100 / task.length);
                            }
                        );
                        fs.readFile(file, "utf-8", (err, data) => {
                            if(data !== "File not found.\""){
                                this.lz4dec(file, "unity3d");
                                system(`del /q /f .\\download\\${task[i].name.split(".")[0]}`);
                            }
                        });
                    }
                    else if(task[i].name.split(".")[1] === "bdb"){
                        const file = await this.dl(
                            `http://storage.game.starlight-stage.jp/dl/resources/Generic/${task[i].hash}`,
                            getPath(`./download/${task[i].name.split(".")[0]}`),
                            (prog) => {
                                this.text = `${task[i].name}　${Math.ceil(prog.current / 1024)}/${Math.ceil(prog.max / 1024)} KB`;
                                this.current = prog.loading;
                                this.total = 100 * completed / task.length + prog.loading / 100 * (100 / task.length);
                            }
                        );
                        fs.readFile(file, "utf-8", (err, data) => {
                            if(data !== "File not found.\""){
                                this.lz4dec(file, "bdb");
                                system(`del /q /f .\\download\\${task[i].name.split(".")[0]}`);
                            }
                        });
                    }
                    else if(task[i].name.split(".")[1] === "mdb"){
                        const file = await this.dl(
                            `http://storage.game.starlight-stage.jp/dl/resources/Generic/${task[i].hash}`,
                            getPath(`./download/${task[i].name.split(".")[0]}`),
                            (prog) => {
                                this.text = `${task[i].name}　${Math.ceil(prog.current / 1024)}/${Math.ceil(prog.max / 1024)} KB`;
                                this.current = prog.loading;
                                this.total = 100 * completed / task.length + prog.loading / 100 * (100 / task.length);
                            }
                        );
                        fs.readFile(file, "utf-8", (err, data) => {
                            if(data !== "File not found.\""){
                                this.lz4dec(file, "mdb");
                                system(`del /q /f .\\download\\${task[i].name.split(".")[0]}`);
                            }
                        });
                    }
                    completed++;
                    this.current = 0;
                    this.text = "";
                    this.event.$emit("completeTask", task[i]);
                }
                this.total = 0;
                this.$refs.downloadBtn.removeAttribute("disabled");
            }
            else{
                this.event.$emit("alert", this.$t("home.errorTitle"), this.$t("home.noEmptyDownload"));
            }
        }
    }
};
</script>

<style>
.pull-right{
    float: right;
}
.margin-left-10{
    margin-left: 10px;
}
.margin-top-10{
    margin-top: 10px;
}
.margin-top-20{
    margin-top: 20px;
}
.db-query{
    margin: 12px 0;
    background-color: #505050;
    font-family: "CGSS-B";
    font-size: 20px;
    color: #fff;
    border: 1px solid #909090;
    border-radius: 4px;
    height: 40px;
    width: calc(100% - 530px);
    padding: 5px;
    outline: 0;
    box-shadow: 0 1px 1px rgba(0,0,0,.75) inset;
    transition: border-color ease-in-out .15s;
}
.db-query:focus{
    border: 2px solid #f080e0;
}
.main-block-style{
    position: absolute;
    width: calc(100% - 140px);
    height: calc(100% - 138px);
    left: 70px;
    top: 70px;
    /* padding: 75px 70px 68px 70px; 
    max-height: calc(100% - 68px);*/
    overflow: hidden;
}
.db-query-result{
    height: calc(100% - 270px);
}
</style>
