import progressBar from "../template/progressBar.vue";
import smallTab from "../template/smallTab.vue";
import Downloader from "./downloader.js";
import getPath from "./getPath.js";
import fs from "fs";
import { shell } from "electron";
const dler = new Downloader();

export default {
    components: {
        progressBar,
        smallTab
    },
    data(){
        return {
            // tabDefault: "after",
            queryString: "",
            searchResult: [],
            activeCard: {},
            activeCardPlus: {},
            information: {},
            imgProgress: 0,
            practice: {
                before: "idol.before",
                after: "idol.after"
            }
        };
    },
    computed: {
        cardData(){
            return this.$store.state.master.cardData;
        },
        rarity(){
            switch(this.information.rarity){
                case 1:
                    return "N";
                case 2:
                    return "N+";
                case 3:
                    return "R";
                case 4:
                    return "R+";
                case 5:
                    return "SR";
                case 6:
                    return "SR+";
                case 7:
                    return "SSR";
                case 8:
                    return "SSR+";
                default:
                    return "";
            }
        },
        hp(){
            if(this.information.hp_min && this.information.hp_max && this.information.bonus_hp){
                return this.information.hp_min + "～" + this.information.hp_max + " (+" + this.information.bonus_hp + ")";
            }
            else{
                return "";
            }
        },
        vocal(){
            if(this.information.vocal_min && this.information.vocal_max && this.information.bonus_vocal){
                return this.information.vocal_min + "～" + this.information.vocal_max + " (+" + this.information.bonus_vocal + ")";
            }
            else{
                return "";
            }
        },
        dance(){
            if(this.information.dance_min && this.information.dance_max && this.information.bonus_dance){
                return this.information.dance_min + "～" + this.information.dance_max + " (+" + this.information.bonus_dance + ")";
            }
            else{
                return "";
            }
        },
        visual(){
            if(this.information.visual_min && this.information.visual_max && this.information.bonus_visual){
                return this.information.visual_min + "～" + this.information.visual_max + " (+" + this.information.bonus_visual + ")";
            }
            else{
                return "";
            }
        },
        solo(){
            if(this.information.solo_live !== undefined){
                if(this.information.solo_live == 0){
                    return this.$t("idol.nashi");
                }
                else{
                    return "お願い！シンデレラ";
                }
            }
            else{
                return "";
            }
        }
    },
    methods: {
        query(){
            this.searchResult = [];
            this.playSe(this.enterSe);
            if(this.queryString){
                for(let i = 0; i < this.cardData.length; i++){
                    const card = this.cardData[i];
                    if(card.name.indexOf("＋") !== card.name.length - 1){
                        const re = new RegExp(this.queryString);
                        if(re.test(card.name)){
                            this.searchResult.push(this.cardData[i]);
                            continue;
                        }
                        if(re.test(card.charaData.name_kana)){
                            this.searchResult.push(this.cardData[i]);
                            continue;
                        }
                        if(re.test(card.chara_id)){
                            this.searchResult.push(this.cardData[i]);
                            continue;
                        }
                        if(re.test(card.id)){
                            this.searchResult.push(this.cardData[i]);
                            continue;
                        }
                    }
                }
            }
            else{
                this.event.$emit("alert", this.$t("home.errorTitle"), this.$t("home.noEmptyString"));
            }
        },
        selectedIdol(card){
            if(this.activeCard.id != card.id){
                dler.stop();
                this.playSe(this.enterSe);
                this.activeCard = card;
                this.information = card;
                for(let i = 0; i < this.cardData.length; i++){
                    if(this.cardData[i].id == card.id + 1){
                        this.activeCardPlus = this.cardData[i];
                        break;
                    }
                }

                this.event.$emit("smallTab", "before");
                if(navigator.onLine){
                    this.changeBackground(card);
                }
            }
        },
        async changeBackground(card){

            this.imgProgress = 0;

            if(Number(card.rarity) > 4){
                let result = await this.downloadCard(card.id);
                this.imgProgress = 0;
                if(result){
                    this.event.$emit("idolSelect", card.id);
                }
            }
            else{
                this.event.$emit("noBg");
            }
        },
        async downloadCard(id, progressing){
            return await dler.download(
                `https://hoshimoriuta.kirara.ca/spread/${id}.png`,
                getPath(`./public/img/card/bg_${id}.png`),
                (progressing ? progressing : (prog => { this.imgProgress = prog.loading; }))
            );
        },
        toggle(practice){
            dler.stop();
            switch(practice){
                case "idol.before":
                    this.information = this.activeCard;
                    if(navigator.onLine){
                        this.changeBackground(this.activeCard);
                    }
                    break;
                case "idol.after":
                    this.information = this.activeCardPlus;
                    if(navigator.onLine){
                        this.changeBackground(this.activeCardPlus);
                    }
                    break;
                default:
                    break;
            }
        },
        opendir(){
            this.playSe(this.enterSe);
            if(!fs.existsSync(getPath("./public/img/card"))){
                fs.mkdirSync(getPath("./public/img/card"));
            }
            shell.openExternal(getPath("./public/img/card"));
        }
    },
    filters: {
        hand(v){
            switch(v){
                case 3001:
                    return "右";
                case 3002:
                    return "左";
                case 3003:
                    return "両";
                default:
                    return "";
            }
        },
        blood(v){
            switch(v){
                case 2001:
                    return "A";
                case 2002:
                    return "B";
                case 2003:
                    return "AB";
                case 2004:
                    return "O";
                default:
                    return "";
            }
        },
        threesize(v){
            if(v[0] === undefined || v[1] === undefined || v[2] === undefined){
                return "";
            }
            else if(v[0] >= 1000 && v[1] >= 1000 && v[2] >= 1000){
                return "？/？/？";
            }
            else{
                return v[0] + "/" + v[1] + "/" + v[2];
            }
        }
    },
    mounted(){
        this.$nextTick(() => {
            this.event.$on("eventBgReady", (id) => {
                if(id % 2 === 0){
                    this.event.$emit("smallTab", "after");
                    for(let i = 0; i < this.cardData.length; i++){
                        if(this.cardData[i].id == id - 1){
                            this.activeCard = this.cardData[i];
                            continue;
                        }
                        if(this.cardData[i].id == id){
                            this.activeCardPlus = this.cardData[i];
                            this.information = this.cardData[i];
                            break;
                        }
                    }
                }
                else{
                    this.event.$emit("smallTab", "before");
                    for(let i = 0; i < this.cardData.length; i++){
                        if(this.cardData[i].id == id){
                            this.activeCard = this.cardData[i];
                            this.information = this.cardData[i];
                            continue;
                        }
                        if(this.cardData[i].id == id + 1){
                            this.activeCardPlus = this.cardData[i];
                            break;
                        }
                    }
                }
            });
            this.event.$on("enterKey", (block) => {
                if(block === "idol"){
                    this.query();
                }
            });
        });
    }
};