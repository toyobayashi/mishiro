import progressBar from "../template/progressBar.vue";
import check from "./check.js";
import downloadManifest from "./downloadManifest.js";
import downloadMaster from "./downloadMaster.js";
import downloader from "./batchDownload.js";
const dler = new downloader();

export default {
    components: {
        progressBar
    },
    data(){
        return {
            loading: 0,
            isReady: false,
            text: this.$t("update.check")
        };
    },
    methods: {
        getEventId(eventData){
            const time = new Date();
            let happening = false;

            let noEventTime = Infinity, noEventIndex = -1;

            for(let i = eventData.length - 1; i >= 0; i--){
                let st = new Date(eventData[i]["event_start"]);
                let rt = new Date(eventData[i]["result_end"]);
                rt = rt.getTime() - 60 * 60 * 1000;
                st = st.getTime() - 60 * 60 * 1000;

                const dt = Math.abs(time.getTime() - rt);
                if(dt <= noEventTime){
                    noEventTime = dt;
                    noEventIndex = i;
                }

                rt = new Date(rt);
                st = new Date(st);
                if(time.getTime() < rt.getTime() && time.getTime() >= st.getTime()){
                    happening = true;
                    this.$store.commit("updateEventInfo", eventData[i]);
                    return eventData[i].id;
                }
            }
            if(!happening){
                this.$store.commit("updateEventInfo", eventData[noEventIndex]);
                return eventData[noEventIndex].id;
            }
        },
        getEventCardId(eventAvailable){
            eventAvailable.sort(function (a, b){
                return a.recommend_order - b.recommend_order;
            });
            return [eventAvailable[0].reward_id, eventAvailable[eventAvailable.length - 1].reward_id];
        },
        emitReady(){
            this.$emit("ready");
            console.log("[event] ready");
            this.event.$emit("ready");
        },
        getResVer: async function(debugVersion){
            let resVer = await check((prog) => { // 检查资源版本，回调更新进度条
                this.text = this.$t("update.check") + prog.current + " / " + prog.max;
                this.loading = prog.loading;
            }, debugVersion);
            return resVer;
        },
        getManifest: async function(resVer){
            this.loading = 0;
            this.text = this.$t("update.manifest");

            let manifestFile = "";
            if(fs.existsSync(getPath(`./data/manifest_${resVer}.db`))){
                this.loading = 100;
                manifestFile = getPath(`./data/manifest_${resVer}.db`);
            }
            else{
                const manifestLz4File = await downloadManifest(resVer, (prog) => {
                    this.text = this.$t("update.manifest") + Math.ceil(prog.current / 1024) + "/" + Math.ceil(prog.max / 1024) + " KB";
                    this.loading = prog.loading;
                });
                manifestFile = this.lz4dec(manifestLz4File, "db");
                system(`del /q /f .\\data\\manifest_${resVer}`);
            }
            return manifestFile;
        },
        getMaster: async function(resVer, masterHash){
            this.loading = 0;
            this.text = this.$t("update.master");

            let masterFile = "";
            if(fs.existsSync(getPath(`./data/master_${resVer}.db`))){
                this.loading = 100;
                masterFile = getPath(`./data/master_${resVer}.db`);
            }
            else{
                const masterLz4File = await downloadMaster(resVer, masterHash, (prog) => {
                    this.text = this.$t("update.master") + Math.ceil(prog.current / 1024) + "/" + Math.ceil(prog.max / 1024) + " KB";
                    this.loading = prog.loading;
                });
                masterFile = this.lz4dec(masterLz4File, "db");
                system(`del /q /f .\\data\\master_${resVer}`);
            }
            return masterFile;
        }
    },
    mounted(){
        this.$nextTick(() => {
            this.event.$on("enter", async () => { // 已从入口进入
                if(navigator.onLine
                /* false */
                ){ // 判断网络是否连接
                    const resVer = await this.getResVer(/* "10033000" */);
                    this.$store.commit("updateResVer", resVer);

                    const manifestFile = await this.getManifest(resVer);

                    ipcRenderer.on("readManifest", async (event, manifests) => {
                        this.$store.commit("updateManifest", manifests);
                        const masterHash = manifests.filter(row => row.name === "master.mdb")[0].hash;
                        const masterFile = await this.getMaster(resVer, masterHash);
                        ipcRenderer.send("readMaster", fs.readFileSync(masterFile));
                    });
                    ipcRenderer.on("readMaster", (event, masterData) => {
                        console.log(masterData);
                        this.$store.commit("updateMaster", masterData);
                        const eventId = this.getEventId(masterData.eventData);
                        const eventAvailable = masterData.eventAvailable.filter(row => row.event_id == eventId);
                        const cardId = this.getEventCardId(eventAvailable);
                        system("if not exist \"public\\img\\card\" md \"public\\img\\card\"");
                        const cardIdEvolution = [(Number(cardId[0]) + 1), (Number(cardId[1]) + 1)];
                        const dltask = this.createCardBackgroundTask(cardIdEvolution);
                        dler.batchDl(dltask, (name) => {
                            this.text = name;
                            this.loading = 0;
                        }, (prog) => {
                            this.text = prog.name + "　" + Math.ceil(prog.current / 1024) + "/" + Math.ceil(prog.max / 1024) + " KB";
                            this.loading = prog.loading;
                        }, (name) => {
                            if(name === `bg_${(Number(cardId[0]) + 1)}.png`){
                                this.event.$emit("eventBgReady", Number(cardId[0]) + 1);
                            }
                        }).then(() => {
                            setTimeout(() => {
                                this.emitReady();
                            }, 1000);
                        });
                    });
                    ipcRenderer.send("readManifest", fs.readFileSync(manifestFile));
                }
                else{ // 如果网络未连接则直接触发ready事件
                    this.emitReady();
                }
            });
        });
    }
};