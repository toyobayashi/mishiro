import Downloader from "./downloader.js";
import getPath from "./getPath.js";
const dler = new Downloader();

const downloadMaster = (resVer, hash, progressing) => {
    return dler.download(
        `http://storage.game.starlight-stage.jp/dl/resources/Generic/${hash}`,
        getPath(`./data/master_${resVer}`),
        progressing
    );
};

export default downloadMaster;
