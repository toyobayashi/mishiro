import path2name from "./path2name.js";

function dl(u, p, progressing, getReq){
    let filename = path2name(p);
    return new Promise((resolve, reject) => {
        if(fs.existsSync(p)){
            resolve(p);
        }
        else{
            let size = 0;
            if(fs.existsSync(p + ".tmp")){
                const f = fs.readFileSync(p + ".tmp");
                size = f.length;
            }

            let options = null;

            if(size > 0){
                options = {
                    url: u,
                    headers: {
                        "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)",
                        "X-Unity-Version": "5.1.2f1",
                        "Accept-Encoding": "gzip",
                        "Range": "bytes=" + size + "-",
                        "Connection": "Keep-Alive"
                    }
                };
            }
            else{
                options = {
                    url: u,
                    headers: {
                        "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)",
                        "X-Unity-Version": "5.1.2f1",
                        "Accept-Encoding": "gzip",
                        "Connection": "Keep-Alive"
                    }
                };
            }

            let current = 0, contentLength = 0;

            let req = request(options);
            let rename = true;
            if(getReq){
                getReq(req);
            }
            req.on("response", (response) => {
                contentLength = Number(response.headers["content-length"]);
                if(contentLength == size && !response.headers["content-range"]){
                    req.abort();
                    progressing({
                        current: size,
                        max: size,
                        loading: 100
                    });
                    resolve(p);
                }
                else{
                    let ws = fs.createWriteStream(p + ".tmp", { flags: "a+" });
                    req.
                        on("data", (data) => {
                            current += data.length;
                            progressing({
                                name: filename,
                                current: size + current,
                                max: size + contentLength,
                                loading: 100 * (size + current) / (size + contentLength)
                            });
                        })
                        .on("end", () => {
                            if(rename){
                                system(`ren ${path.join(p)}.tmp ${filename}`);
                            }
                            resolve(p);
                        })
                        .on("abort", () => {
                            rename = false;
                            resolve(false);
                        })
                        .on("error", (e) => {
                            reject(e);
                        });
                    req.pipe(ws);
                }
            });
        }
    });

}
export default dl;
//dl("http://storage.game.starlight-stage.jp/dl/10028600/manifests/Android_AHigh_SHigh", "./data/manifest_test");

