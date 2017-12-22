import task from "../template/task.vue";
import Downloader from "./downloader.js";
import fs from "fs";
import { exec } from "child_process";
import { ipcRenderer, shell } from "electron";
import getPath from "./getPath.js";
const dler = new Downloader();

export default {
    components: {
        task
    },
    data(){
        return {
            queryString: "",
            total: 0,
            current: 0,
            text: "",
            activeAudio: {},
            duration: 100,
            currentTime: 0,
            allLive: true,
            liveQueryList: []
        };
    },
    computed: {
        liveManifest(){
            if(this.$store.state.master){
                return this.$store.state.master.liveManifest;
            }
            else{
                return [];
            }
        },
        bgmManifest(){
            if(this.$store.state.master){
                return this.$store.state.master.bgmManifest;
            }
            else{
                return [];
            }
        }
    },
    methods: {
        oninput(){
            this.bgm.currentTime = this.$refs.playProg.value;
        },
        async selectAudio(audio){
            if(this.activeAudio.hash !== audio.hash){
                this.playSe(this.enterSe);
                dler.stop();
                this.total = 0;
                this.current = 0;
                this.text = "";

                if(audio.name.split("/")[0] === "b"){
                    if(!fs.existsSync(getPath(`./public/asset/sound/bgm/${audio.fileName}`))){
                        if(navigator.onLine){
                            this.activeAudio = audio;
                            let result = await dler.download(
                                this.getBgmUrl(audio.hash),
                                getPath(`./public/asset/sound/bgm/${audio.name.split("/")[1]}`),
                                (prog) => {
                                    this.text = prog.name;
                                    this.current = prog.loading;
                                    this.total = prog.loading;
                                }
                            );
                            if(result){
                                this.total = 99.99;
                                this.current = 99.99;
                                this.text += this.$t("live.decoding");
                                ipcRenderer.send("acb", getPath(`./public/asset/sound/bgm/${audio.name.split("/")[1]}`), `./asset/sound/bgm/${audio.fileName}`);
                            }
                        }
                        else{
                            this.event.$emit("alert", this.$t("home.errorTitle"), this.$t("home.noNetwork"));
                        }

                    }
                    else{
                        this.activeAudio = audio;
                        this.event.$emit("liveSelect", { src: `./asset/sound/bgm/${audio.fileName}` });
                    }
                }
                else if(audio.name.split("/")[0] === "l"){
                    if(!fs.existsSync(getPath(`./public/asset/sound/live/${audio.fileName}`))){
                        if(navigator.onLine){
                            this.activeAudio = audio;
                            let result = await dler.download(
                                this.getLiveUrl(audio.hash),
                                getPath(`./public/asset/sound/live/${audio.name.split("/")[1]}`),
                                (prog) => {
                                    this.text = prog.name;
                                    this.current = prog.loading;
                                    this.total = prog.loading;
                                }
                            );
                            if(result){
                                this.total = 99.99;
                                this.current = 99.99;
                                this.text += this.$t("live.decoding");
                                ipcRenderer.send("acb", getPath(`./public/asset/sound/live/${audio.name.split("/")[1]}`), `./asset/sound/live/${audio.fileName}`);
                            }
                        }
                        else{
                            this.event.$emit("alert", this.$t("home.errorTitle"), this.$t("home.noNetwork"));
                        }
                    }
                    else{
                        this.activeAudio = audio;
                        this.event.$emit("liveSelect", { src: `./asset/sound/live/${audio.fileName}` });
                    }
                }
            }
        },
        query(){
            this.playSe(this.enterSe);
            if(this.queryString){
                this.allLive = false;
                this.liveQueryList = [];
                const re = new RegExp(this.queryString);
                for(let i = 0; i < this.liveManifest.length; i++){
                    if(re.test(this.liveManifest[i].fileName)){
                        this.liveQueryList.push(this.liveManifest[i]);
                    }
                }
            }
            else{
                this.allLive = true;
                this.liveQueryList = [];
            }
        },
        opendir(){
            this.playSe(this.enterSe);
            shell.openExternal(getPath("./public/asset/sound"));
        }
    },
    filters: {
        time(second){
            let min = Math.floor(second / 60);
            let sec = Math.floor(second % 60);
            if(min < 10){
                min = "0" + min;
            }
            if(sec < 10){
                sec = "0" + sec;
            }
            return `${min}:${sec}`;
        }
    },
    mounted(){
        this.$nextTick(() => {
            this.bgm.addEventListener("timeupdate", () => {
                this.currentTime = this.bgm.currentTime;
            }, false);
            this.bgm.addEventListener("durationchange", () => {
                this.duration = this.bgm.duration;
            }, false);
            this.event.$on("playerSelect", (fileName) => {
                if(this.bgmManifest.filter(bgm => bgm.fileName === fileName).length > 0){
                    this.activeAudio = this.bgmManifest.filter(bgm => bgm.fileName === fileName)[0];
                }
                else{
                    this.activeAudio = this.liveManifest.filter(bgm => bgm.fileName === fileName)[0];
                }
            });
            ipcRenderer.on("acb", (event, acbPath, url) => {
                this.total = 0;
                this.current = 0;
                this.text = "";
                exec(`del /q /f ${acbPath}`);
                this.event.$emit("liveSelect", { src: url });
            });
        });
    }
};