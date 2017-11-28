import dl from "./download.js";

const downloadMaster = (resVer, hash, progressing) => {
    return dl(
        `http://storage.game.starlight-stage.jp/dl/resources/Generic/${hash}`,
        getPath(`./data/master_${resVer}`),
        (prog) => {
            progressing(prog);
        }
    );
};

export default downloadMaster;
