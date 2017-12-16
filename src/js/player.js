const bgmList = {
    anni: {
        src: "./asset/sound/bgm/bgm_event_3017.mp3",
        start: 31.35,
        end: 86.95
    },
    day: {
        src: "./asset/sound/bgm/bgm_studio_day.mp3",
        start: 13.704,
        end: 95.165
    },
    night: {
        src: "./asset/sound/bgm/bgm_studio_night.mp3",
        start: 12.94,
        end: 98.79
    },
    sunset: {
        src: "./asset/sound/bgm/bgm_studio_sunset.mp3",
        start: 13.075,
        end: 100.575
    },
    idol: {
        src: "./asset/sound/bgm/bgm_idol_menu.mp3",
        start: 0.990,
        end: 80.900
    },
    gacha: {
        src: "./asset/sound/bgm/bgm_gacha_menu.mp3",
        start: 1.800,
        end: 56.599
    }
};

export default {
    data(){
        return {
            bgmTimer: 0,
            startTime: 0,
            endTime: 0,
            isPlaying: false,
            bgmList,
            isShow: false,
            playing: bgmList.anni
            // bgm: new Audio(this.initSrc())
        };
    },
    computed: {

    },
    methods: {
        initSrc(){
            let t = new Date();
            if(t.getHours() >= 5 && t.getHours() <= 16){
                return bgmList.day.src;
            }
            else if(t.getHours() < 5 || t.getHours() >= 20){
                return bgmList.night.src;
            }
            else{
                return bgmList.sunset.src;
            }
        },
        pauseButton(){
            this.playSe(this.cancelSe);
            if(this.isPlaying){
                this.pause();
            }
            else{
                this.play();
            }
        },
        selectBgm(){
            this.playSe(this.enterSe);
            this.isShow = !this.isShow;
        },
        set(bgm){
            this.bgm.src = bgm.src;
            this.startTime = bgm.start;
            this.endTime = bgm.end;
            this.playing = bgm;
        },
        playStudioBgm(){
            let t = new Date();
            if(t.getHours() >= 5 && t.getHours() <= 16){
                this.play(bgmList.day);
            }
            else if(t.getHours() < 5 || t.getHours() >= 20){
                this.play(bgmList.night);
            }
            else{
                this.play(bgmList.sunset);
            }
        },
        play(bgm){
            if(bgm){
                this.set(bgm);
                this.event.$emit("playerSelect", bgm.src.split("/")[bgm.src.split("/").length - 1]);
            }
            setTimeout(() => {
                clearInterval(this.bgmTimer);
                this.bgm.volume = 1;
                this.bgm.play();
                this.isPlaying = true;
                if(this.startTime && this.endTime){
                    this.bgm.onended = null;
                    this.bgmTimer = setInterval(() => {
                        if(this.bgm.currentTime >= this.endTime){
                            this.bgm.currentTime = this.startTime;
                            this.bgm.play();
                        }
                    }, 1);
                }
                else{
                    this.bgm.onended = function(){
                        this.currentTime = 0;
                        this.play();
                    };
                }
            }, 0);
        },
        pause(){
            this.bgm.pause();
            this.isPlaying = false;
            clearInterval(this.bgmTimer);
        }
    },
    mounted(){
        this.$nextTick(() => {
            //this.setStudioBgm();
            this.set(bgmList.anni);
            this.play();
            this.playSe(new Audio("./asset/sound/se/chara_title.mp3"));
            window.bgm = this.bgm;
            document.addEventListener("click", (e) => {
                if(this.isShow && e.target !== document.getElementById("pauseBtn")){
                    this.isShow = false;
                }
            }, false);

            this.event.$on("ready", () => {
                this.playStudioBgm();
                // this.pause();
            });
            this.event.$on("changeBgm", (block) => {
                let flag = false;
                for(let b in bgmList){
                    if(bgmList[b].src === this.playing.src){
                        flag = true;
                        break;
                    }
                }
                if(flag){
                    switch(block){
                        case "home":
                            if(this.playing.src !== bgmList.day.src && this.playing.src !== bgmList.sunset.src && this.playing.src !== bgmList.night.src){
                                this.playStudioBgm();
                            }
                            break;
                        case "idol":
                            if(this.playing.src !== bgmList.idol.src){
                                this.play(bgmList.idol);
                            }
                            break;
                        default:
                            break;
                    }
                } 
            });
            this.event.$on("liveSelect", (bgm) => {
                let flag = false;
                for(let b in bgmList){
                    if(bgmList[b].src === bgm.src){
                        flag = true;
                        this.play(bgmList[b]);
                        break;
                    }
                }
                if(!flag){
                    this.play(bgm);
                }
            });
        });
    }
};
