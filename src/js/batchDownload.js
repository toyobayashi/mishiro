import dl from "./download.js";
import path2name from "./path2name.js";

class downloader{
    constructor(taskArr = []){
        this.taskArr = taskArr; // [ [url, path, data] ]
        this.req = null;
        this.abort = false;
        this.index = -1;
    }

    async batchDl(taskArr, start, progressing, complete, stop){
        this.taskArr = taskArr;
        this.index = 0;
        for(this.index = 0; this.index < this.taskArr.length; this.index++){
            this.abort = false;
            let url = this.taskArr[this.index][0];
            let filepath = this.taskArr[this.index][1];
            let data = this.taskArr[this.index][2];
            if(!fs.existsSync(filepath)){
                if(start){
                    start(path2name(filepath), filepath, data);
                }
                try {
                    await dl(url, filepath, progressing, (req) => { this.req = req; });
                }
                catch (e){
                    console.log(e);
                }
            }
            if(!this.abort){
                complete(path2name(filepath), filepath, data);
            }
            else{
                if(stop){
                    stop(path2name(filepath), filepath, data);
                }
            }
        }
        this.taskArr = [];
    }

    stop(failed){
        if(this.taskArr.length){
            this.taskArr = [];
            this.abort = true;
            setTimeout(() => {
                this.req.abort();
            }, 0);
        }
        else{
            if(failed){
                failed();
            }
        }
    }
}

export default downloader;
