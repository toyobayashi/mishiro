export default {
    state: {
        resVer: "unknown",
        manifest: null,
        master: null,
        eventInfo: null
    },
    mutations: {
        updateResVer(state, resVer){
            state.resVer = resVer;
        },
        updateManifest(state, manifest){
            state.manifest = manifest;
        },
        updateMaster(state, master){
            state.master = master;
        },
        updateEventInfo(state, eventInfo){
            state.eventInfo = eventInfo;
        }
    }
};