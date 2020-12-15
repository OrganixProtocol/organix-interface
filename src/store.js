import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        language: '',
        currentAccount: '',
        currentPermission: '',
        // singleton
        targetRatio: '',
        minStakingTime: '',
        minStakingTimeStr: '',
        liquidationRatio: '',
        settleTime: '',
        allSynthsList: [],
        synthsList: [],
        isMobile: true,
        feeRate: '',
        selected: 'home'
    },
    getter: {

    },
    mutations: {
        updateLang(state, data) {
            state.language = data ? data : 'en'
        },
        setSelectedTab(state, data) {
            state.selected = data.selected;
        },
        setAccount(state, data) {
            state.currentAccount = data.account;
            state.currentPermission = data.permission;
        },
        setLiquidition(state, data) {
            state.liquidationRatio = data.liquidationRatio;
            state.liquidationDelay = data.liquidationDelay;
        },
        setTargetRatio(state, data) {
            state.targetRatio = data.targetRatio;
        },
        setMinStakingTime(state, data) {
            state.minStakingTime = data.minStakingTime;
            state.minStakingTimeStr = data.minStakingTimeStr;
        },
        setSettleTime(state, data) {
            state.settleTime = data.settleTime;
        },
        setAllSynthsList(state, data) {
            state.allSynthsList = data.allSynthsList
        },
        setSynthsList(state, data) {
            state.synthsList = data.synthsList
        },
        setIsMobile(state, data) {
            state.isMobile = data.isMobile
        },
        setFeeRate(state, data) {
            state.feeRate = data.feeRate
        }
    },
    actions: {
    },
    modules: {
    }
})
