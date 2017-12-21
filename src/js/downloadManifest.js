import Downloader from "./downloader.js";
import getPath from "./getPath.js";
const dler = new Downloader();

const downloadManifest = (resVer, progressing) => {
    return dler.download(
        `http://storage.game.starlight-stage.jp/dl/${resVer}/manifests/Android_AHigh_SHigh`,
        getPath(`./data/manifest_${resVer}`),
        progressing
    );
};

export default downloadManifest;
