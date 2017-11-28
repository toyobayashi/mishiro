function dl(u, p, progressing){
    let filename = "";
    if(p.indexOf("/") !== -1){
        const patharr = p.split("/");
        filename = patharr[patharr.length - 1];
    }
    else if(p.indexOf("\\") !== -1){
        const patharr = p.split("\\");
        filename = patharr[patharr.length - 1];
    }
    else{
        filename = p;
    }
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
                                current: size + current,
                                max: size + contentLength,
                                loading: 100 * (size + current) / (size + contentLength)
                            });
                        })
                        .on("end", () => {
                            system(`ren ${path.join(p)}.tmp ${filename}`);
                            resolve(p);
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

