const bgmList = {
    event: {
        src: "./asset/sound/bgm/bgm_event.mp3",
        start: 0,
        end: 0
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
    anni: {
        hidden: true,
        src: "./asset/sound/bgm/bgm_title_anniversary2.mp3",
        start: 31.35,
        end: 86.95
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
                //this.set(bgmList.day);
                this.play(bgmList.day);
            }
            else if(t.getHours() < 5 || t.getHours() >= 20){
                //this.set(bgmList.night);
                this.play(bgmList.night);
            }
            else{
                //this.set(bgmList.sunset);
                this.play(bgmList.sunset);
            }
        },
        play(bgm){
            if(bgm){
                this.set(bgm);
            }
            setTimeout(() => {
                clearInterval(this.bgmTimer);
                this.bgm.volume = 1;
                this.bgm.play();
                this.isPlaying = true;
                if(this.endTime === 0){
                    this.bgm.onended = function(){
                        this.currentTime = 0;
                        this.play();
                    };
                }
                else{
                    this.bgm.onended = null;
                    this.bgmTimer = setInterval(() => {
                        if(this.bgm.currentTime >= this.endTime){
                            this.bgm.currentTime = this.startTime;
                            this.bgm.play();
                        }
                    }, 1);
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
        });
    }
};
