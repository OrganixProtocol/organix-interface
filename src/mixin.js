import Axios from "axios";
import ScatterJS from "@scatterjs/core";
import ScatterEOS from "@scatterjs/eosjs2";
import { JsonRpc, Api } from "eosjs";
import dayjs from 'dayjs';
import _ from 'lodash'
import { all, resolve } from "core-js/fn/promise";
import { parseFloat } from "core-js/fn/number";
import Tab from "@/components/Tab.vue";

const PROD_ENV = 'prod';

const env = PROD_ENV;

let requiredFields = '';
let network = '';
let rpc = '';
let scatter = "";
let api = "";

const FLOAT_UNIT = 100000000;
const LEDGER_UNIT = 1000000000000;
const TOKEN_UNIT_NUM = 8

const DEFAULT_REFER = env === PROD_ENV ? 'tpdappincome' : 'itokenpocket';

const MAIN_CONTRACT = env === PROD_ENV ? "core.ogx" : 'organixtokep';
const OLD_CONTRACT = env === PROD_ENV ? "organixtoken" : "ogxtokentok1";
const SWITCH_CONTRACT = env === PROD_ENV ? 'switch.ogx' : "ogxswitch111";
const CHAINID = env === PROD_ENV ? 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' : '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191'

const MAIN_SYMBOL = "OGX";

const LP_CONTRACT = 'pools.ogx';

const DFS_CONTRACT = 'defisswapcnt';


const LP_PAIR = {
    637: {
        token0: 'OUSD-core.ogx',
        token1: 'USDT-tethertether',
        token0Url: 'https://tp-statics.tokenpocket.pro/token/ogx/v2/OUSD.png',
        token1Url: 'https://tp-statics.tokenpocket.pro/token/ogx/v2/USDT-tethertether.png'
    },
    12: {
        token0: 'OUSD-core.ogx',
        token1: 'USDT-tethertether',
        token0Url: 'https://tp-statics.tokenpocket.pro/token/ogx/v2/OUSD.png',
        token1Url: 'https://tp-statics.tokenpocket.pro/token/ogx/v2/USDT-tethertether.png'
    }
}


const FIXED = function (num, n) {
    var a = num * Math.pow(10, n);
    return parseFloat(parseInt(a) / Math.pow(10, n)).toFixed(n);
}

var myMixin = {
    data() {
        return {
            msg: "",
            ogxWalletBalance: '',
            ogxStoreBalance: 0,
            // synthsList: [],
            price: {},
            balanceObj: {},
            supply: {},
            myDebtPercent: '',
            myDebt: '',
            myDebtInfo: '',
            myDebtInUsd: '',
            lastLedgerInfo: '',
            totalDebtInUsd: '',
            myVestBal: 0,
            myVestList: [],
            myRewardBal: 0,
            myRewardList: [],
            allMyVestRewarList: [],
            allMyPrivateRewardList: [],
            mintAmount: '',
            burnAmount: '',
            inputSymbol: 'OUSD',
            outputSymbol: 'OBTC',
            currentTargetInput: '', // 用户选择 输入还是输出 
            swapInputAmount: '',
            swapOutputAmount: '',
            currentFeePeriod: '',
            feePeriodDuration: '',
            claimableFee: '',
            claimableReward: '',
            estClaimableFee: '',
            estClaimableReward: '',
            claimEndTime: '',
            haveVestAble: false,
            havePrivateAble: false,
            nextStartTime: '',
            nextFees: '',
            nextRewards: '',
            priceSwitch: true,
            refreshingPrice: false,
            refreshing: false,
            liquidationList: [],
            isMinting: false,
            isBurning: false,
            isSwapping: false,
            isClaiming: false,
            isVestClaiming: false,
            isLpRewarding: false,
            priceTimer: null,
            nowTimer: null,
            selected: '',
            ogxTotalSupply: '',
            referAccount: '',
            isClaimedCurrentRound: false,
            minStakingTime: '',
            minStakingTimeStr: '',
            lastStakingTime: 0,
            nowTime: new Date().getTime(),
            myExEntry: {},
            myExEntryObj: {},
            myExEntryList: [],
            lastTradingTime: '',
            haveOldToken: false,
            oldTokenBal: '',
            isSwitchingOld: false,
            showSettleDetail: false,
            lpRewardList: [],
            lpRewardApy: {},
            myLpTokenObj: {},
            lpPairMap: LP_PAIR
        };
    },
    computed: {
        ogxTotalBalance: function () {
            return parseFloat((this.ogxWalletBalance ? parseFloat(this.ogxWalletBalance) : 0) + (this.ogxStoreBalance ? parseFloat(this.ogxStoreBalance) : 0));
        },
        estApr() {
            return parseFloat(((this.price[MAIN_SYMBOL] * (parseFloat(this.nextRewards) || 0) + parseFloat(this.nextFees)) / (this.totalDebtInUsd * this.$store.state.targetRatio)) / (this.feePeriodDuration) * 60 * 60 * 24 * 365 * 100).toFixed(2) + '%';
        },
        myStakedOGX: function () {
            if (this.myDebt && this.$store.state.targetRatio && this.price[MAIN_SYMBOL]) {
                return _.min([this.myDebt * this.$store.state.targetRatio / this.price[MAIN_SYMBOL], this.ogxTotalBalance]);
            }
            return 0
        },
        canBurnTime: function () {
            return dayjs((this.lastStakingTime + this.$store.state.minStakingTime) * 1000).format('YYYY-MM-DD HH:mm:ss');
        },
        leftSecondsToBurn: function () {
            return parseInt(this.lastStakingTime + this.$store.state.minStakingTime - (this.nowTime / 1000));
        },
        mySynthValue() {
            var value = 0;
            this.$store.state.synthsList.forEach(item => {
                value += parseFloat(parseFloat(item.price) * parseFloat(item.amount))
            })
            return value;
        },
        myTransferAble: function () {
            if ((this.myStakedOGX || this.myStakedOGX === 0) && this.ogxWalletBalance) {
                return _.max([parseFloat(this.ogxWalletBalance) - parseFloat(this.myStakedOGX), 0]);
            }
            return 0
        },
        totalSynthAssetsValue: function () {
            return this.synthsListWithoutOGX.length
                ? this.synthsListWithoutOGX.reduce(
                    (total, item) =>
                        total + item.price * parseFloat(item.supply),
                    0
                )
                : 0;
        },
        currentRatio: function () {
            if (this.myDebt === 0) {
                return '-';
            }
            if (this.myDebt && this.price["OGX"] && this.ogxTotalBalance) {
                return (this.ogxTotalBalance * this.price["OGX"]) / this.myDebt
            }
            return '-';

        },
        mintRatio: function () {
            if (this.myDebt && (parseFloat(this.myDebt) + parseFloat(this.mintAmount)) === 0) {
                return '-';
            }

            if (!this.mintAmount && this.currentRatio !== '-') {
                return this.currentRatio;
            }
            else if (this.ogxTotalBalance && this.price[MAIN_SYMBOL] && this.myDebt !== '') {
                return (this.ogxTotalBalance * this.price[MAIN_SYMBOL]) / (parseFloat(this.myDebt) + parseFloat(this.mintAmount));
            }
            else {
                return '-';
            }
        },
        burnRatio: function () {
            if ((parseFloat(this.myDebt) - parseFloat(this.burnAmount)) <= 0) {
                return '-';
            }
            if (!this.burnAmount && this.currentRatio !== '-') {
                return this.currentRatio;
            }
            else if (this.ogxTotalBalance && this.price[MAIN_SYMBOL] && this.myDebt) {
                return (this.ogxTotalBalance * this.price[MAIN_SYMBOL]) / (parseFloat(this.myDebt) - parseFloat(this.burnAmount));
            }
            else {
                return '-';
            }
        },
        mySelectList: function () {
            return _.reverse(_.sortBy(this.synthsListWithoutOGX, [function (o) { return o.symbol }]))

        },
        synthsListWithoutOGX: function () {
            if (this.$store.state.allSynthsList.length) {
                return _.filter(this.$store.state.allSynthsList, item => item.symbol !== MAIN_SYMBOL).sort((a, b) => {
                    return parseFloat(b.price) * parseFloat(b.supply) - parseFloat(a.price) * parseFloat(a.supply)
                });
            }
            else {
                return [];
            }
        },
        updateTime: function () {
            let inputSymbolObj = _.find(this.$store.state.allSynthsList, item => item.symbol === this.inputSymbol);
            let outputSymbolObj = _.find(this.$store.state.allSynthsList, item => item.symbol === this.outputSymbol);

            // ousd price dont change,set to year 2089 :)
            inputSymbolObj && (inputSymbolObj.timestamp = inputSymbolObj.symbol === 'OUSD' ? 3778876800 : inputSymbolObj.timestamp);
            outputSymbolObj && (outputSymbolObj.timestamp = outputSymbolObj.symbol === 'OUSD' ? 3778876800 : outputSymbolObj.timestamp);


            return (outputSymbolObj && inputSymbolObj) ? dayjs(_.min([inputSymbolObj.timestamp, outputSymbolObj.timestamp]) * 1000).format('HH:mm:ss') : '-'
        }
    },
    beforeDestroy() {
        if (this.priceTimer) {
            clearInterval(this.priceTimer);
        }
        if (this.nowTimer) {
            clearInterval(this.nowTimer)
        }
        if (this.rewardTimer) {
            clearInterval(this.rewardTimer)
        }
    },
    components: {
        Tab
    },
    created() {
        let nodeUrl = localStorage.getItem('node') || 'https://eos.greymass.com';
        // let nodeUrl = "http://api.kylin.alohaeos.com";
        let host = nodeUrl.split('://')[1].split(":")[0];
        let port = nodeUrl.split('://')[1].split(":")[1] || (nodeUrl.split('://')[0] === 'https' ? 443 : 80);
        let networkConfig = {
            blockchain: "eos",
            host: host,
            port: port,
            protocol: nodeUrl.split('://')[0],
            chainId: CHAINID
        }

        network = ScatterJS.Network.fromJson(networkConfig);

        rpc = new JsonRpc(network.fullhost());


        requiredFields = { accounts: [network] };

        ScatterJS.plugins(new ScatterEOS());

        window.rpc = rpc;

        this.$store.commit('setIsMobile', {
            isMobile: !!navigator.userAgent
                .toLowerCase()
                .match(
                    /(ipod|iphone|android|coolpad|tokenpocket|mmp|smartphone|midp|wap|xoom|j2me|blackberry)/i
                )
        })

        // 记录历史 交易对
        if (localStorage.getItem('inputSymbol')) {
            this.inputSymbol = localStorage.getItem('inputSymbol');
        }

        if (localStorage.getItem('outputSymbol')) {
            this.outputSymbol = localStorage.getItem('outputSymbol');
        }

        // 已经有登录信息
        if (!this.$store.state.currentAccount) {
            ScatterJS.scatter.connect("scatter", { network }).then(connected => {

                if (!connected) {
                    return false;
                }
                scatter = ScatterJS.scatter;

                this.login()
            });
        }
        else {
            this.getMyInfo();
            this.getOldToken();
        }

        // check refer 
        let query = location.search.substr(1);
        let queryObj = {};

        if (query) {
            _.forEach(query.split('&'), item => {
                let tempArr = item.split('=');
                queryObj[tempArr[0]] = tempArr[1];
            });

            if (queryObj['ref']) {
                this.referAccount = queryObj['ref'];
                localStorage.setItem('referAccount', this.referAccount);
            }
        }
        // no query ref
        if (!this.referAccount && localStorage.getItem('referAccount')) {
            this.referAccount = localStorage.getItem('referAccount');
        }

        // global config, singleton
        this.getGlobalConfig();

        this.getAllSynths();

        // price update 30s
        this.priceTimer = setInterval(() => {
            this.getAllSynths();
            this.getMyInfo();
        }, 30000)

        this.rewardTimer = setInterval(() => {
            this.checkMyLP();
        }, 10000);

        this.nowTimer = setInterval(() => {
            this.nowTime = new Date().getTime();
        }, 2000);

        // tab 
        this.$store.commit('setSelectedTab', {
            selected: this.$route.name
        })

    },
    filters: {
        percent(val) {
            if (val === Infinity || val === NaN || val === '-') {
                return '-'
            }
            return val ? FIXED(parseFloat(+val * 100), 0) + '%' : '-';
        },
        fixedDeciaml(val) {
            return (val !== '' && val !== undefined) ? FIXED(parseFloat(val), 4) : 0;
        },
        fixedDeciaml2(val) {
            return val !== '' ? FIXED(parseFloat(val), 2) : '';
        },
        fixedDeciaml2Str(val) {
            return val !== '' ? FIXED(parseFloat(val), 2) : '';
            // return val !== '' ? parseFloat(parseFloat(val).toFixed(2)).toLocaleString('en-US') : ''
        },
        fixedPrecision(val) {
            return val.toPrecision(6);
        },
        monthFormatTime(val) {
            return dayjs(val * 1000).format('MM-DD HH:mm')
        },
        formatTime(val) {
            return dayjs(val * 1000).format('YYYY-MM-DD HH:mm:ss')
        }
    },
    methods: {
        go(tab) {
            this.$router.push(tab);
        },
        claimLp(mid) {
            if (this.$store.state.currentAccount) {
                api.transact({
                    actions: [{
                        account: LP_CONTRACT,
                        name: 'claim',
                        authorization: [{
                            actor: this.$store.state.currentAccount,
                            permission: this.$store.state.currentPermission || 'active'
                        }],
                        data: {
                            mid: mid,
                            user: this.$store.state.currentAccount
                        }
                    }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 300, // 5分钟
                }).then(res => {
                    this.showMsg(this.$t('i18n.success'));
                    this.getMyInfo();
                    this.checkMyLP();
                    setTimeout(() => { this.getMyInfo(); this.checkMyLP() }, 3000)

                }).catch(err => {
                    this.isSwitchingOld = false;
                    this.handleError(JSON.stringify(err));
                })
            }
        },
        settleOrder() {
            if (this.$store.state.currentAccount) {
                try {
                    _hmt.push([
                        "_trackEvent",
                        "settleOrder",
                        this.$store.state.currentAccount,
                        this.myExEntryList.length
                    ]);
                } catch (err) { }

                var actions = [];
                _.forEach(Object.keys(this.myExEntryObj), item => {
                    actions.push({
                        account: MAIN_CONTRACT,
                        name: 'settle',
                        authorization: [{
                            actor: this.$store.state.currentAccount,
                            permission: this.$store.state.currentPermission || 'active'
                        }],
                        data: {
                            account: this.$store.state.currentAccount,
                            sym: '8,' + item
                        }
                    })
                });

                api.transact({
                    actions: actions
                }, {
                    blocksBehind: 3,
                    expireSeconds: 300, // 5分钟
                }).then(res => {
                    this.showMsg(this.$t('i18n.success'));
                    this.getMyInfo();
                    setTimeout(() => { this.getMyInfo(); }, 5000)

                }).catch(err => {
                    this.handleError(JSON.stringify(err));
                })
            }
        },
        login() {
            scatter
                .login(requiredFields)
                .then((acc) => {
                    const account = acc.accounts.find(
                        (x) => x.blockchain === "eos"
                    );

                    this.$store.commit('setAccount', {
                        account: account.name,
                        permission: account.authority || 'active'
                    })

                    api = scatter.eos(network, Api, { rpc });

                    this.getMyInfo();

                    // 查询旧币
                    this.getOldToken();

                })
                .catch((err) => {
                    // alert(JSON.stringify(err));
                });
        },
        getOldToken() {
            rpc.get_currency_balance(OLD_CONTRACT, this.$store.state.currentAccount, MAIN_SYMBOL).then(res => {
                if (res && res[0] && parseFloat(res[0]) > 0) {
                    this.haveOldToken = true;
                    this.oldTokenBal = res[0];
                }
                else {
                    this.haveOldToken = false;
                    this.oldTokenBal = 0;
                }
            })
        },
        exchangeOldToken() {
            if (this.$store.state.currentAccount) {
                this.isSwitchingOld = true;
                api.transact({
                    actions: [{
                        account: OLD_CONTRACT,
                        name: 'transfer',
                        authorization: [{
                            actor: this.$store.state.currentAccount,
                            permission: this.$store.state.currentPermission || 'active'
                        }],
                        data: {
                            from: this.$store.state.currentAccount,
                            to: SWITCH_CONTRACT,
                            quantity: this.oldTokenBal,
                            memo: ''
                        }
                    }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 300, // 5分钟
                }).then(res => {
                    this.isSwitchingOld = false
                    this.showMsg(this.$t('i18n.success'));
                    this.getMyInfo();
                    this.getOldToken();
                    setTimeout(() => { this.getMyInfo(); this.getOldToken() }, 3000)

                }).catch(err => {
                    this.isSwitchingOld = false;
                    this.handleError(JSON.stringify(err));
                })
            }
        },
        logout() {
            scatter.forgetIdentity();
            this.$store.commit('setAccount', {
                account: '',
                permission: ''
            });
            this.ogxWalletBalance = '';
            this.ogxStoreBalance = '';
        },
        // checkLiquidation() {
        //     rpc.get_table_rows({ json: true, code: MAIN_CONTRACT, scope: MAIN_CONTRACT, table: 'lentry' }).then(res => {
        //         this.liquidationList = res.rows;
        //     })
        //     this.$modal.show('liquidation-panel');
        // },
        mint() {
            this.$modal.show('mint-panel');
        },
        doMint() {
            if (this.$store.state.currentAccount && this.$store.state.targetRatio <= this.mintRatio) {
                this.isMinting = true;
                api.transact({
                    actions: [{
                        account: MAIN_CONTRACT,
                        name: 'issuesynths',
                        authorization: [{
                            actor: this.$store.state.currentAccount,
                            permission: this.$store.state.currentPermission || 'active'
                        }],
                        data: {
                            "account": this.$store.state.currentAccount,
                            "amount": FIXED(parseFloat(this.mintAmount), TOKEN_UNIT_NUM) + ' OUSD'
                        }
                    }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 300, // 5分钟
                }).then(res => {
                    this.isMinting = false;
                    this.showMsg(this.$t('i18n.mintSuccess'));
                    this.$modal.hide('mint-panel');
                    this.getMyInfo();
                    this.getAllSynths();
                    setTimeout(() => { this.getMyInfo() }, 3000)


                    this.mintAmount = ''
                }).catch(err => {
                    this.isMinting = false;
                    this.handleError(JSON.stringify(err));
                })
            }
        },
        burn() {
            this.$modal.show('burn-panel');
        },
        doBurn() {
            // 有债务，但销毁的不能大于 已有债务, 也不能大于自己余额
            if (this.$store.state.currentAccount && this.myDebt && (this.myDebt - this.burnAmount >= 0) && parseFloat(this.balanceObj['OUSD']) >= this.burnAmount) {
                this.isBurning = true;

                api.transact({
                    actions: [{
                        account: MAIN_CONTRACT,
                        name: 'burnsynths',
                        authorization: [{
                            actor: this.$store.state.currentAccount,
                            permission: this.$store.state.currentPermission
                        }],
                        data: {
                            "account": this.$store.state.currentAccount,
                            "amount": FIXED(parseFloat(this.burnAmount), TOKEN_UNIT_NUM) + ' OUSD'
                        }
                    }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 300, // 5分钟
                }).then(res => {
                    this.isBurning = false;
                    this.showMsg(this.$t('i18n.burnSuccess'));
                    this.$modal.hide('burn-panel');
                    this.getMyInfo();
                    setTimeout(() => { this.getMyInfo(); this.getAllSynths(); }, 3000)
                    this.burnAmount = '';
                }).catch(err => {
                    console.log(err);
                    this.isBurning = false;
                    this.handleError(JSON.stringify(err));
                })
            }
        },
        // 暂时没用到
        burnToTarget() {
            this.isBurning = true;
            api.transact({
                actions: [{
                    account: MAIN_CONTRACT,
                    name: 'burnsynthstg',
                    authorization: [{
                        actor: this.$store.state.currentAccount,
                        permission: this.$store.state.currentPermission
                    }],
                    data: {
                        "from": this.$store.state.currentAccount
                    }
                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 300, // 5分钟
            }).then(res => {
                this.isBurning = false;
                this.showMsg(this.$t('i18n.burnSuccess'));
                this.$modal.hide('burn-panel');
                this.getMyInfo();
                setTimeout(() => { this.getMyInfo(); this.getAllSynths(); }, 3000)
                this.burnAmount = '';
            }).catch(err => {
                console.log(err);
                this.isBurning = false;
                this.handleError(JSON.stringify(err));
            })

        },
        selectSymbol(type) {
            this.currentTargetInput = type;
            this.$modal.show('symbol-panel');
        },
        inputMax() {
            this.swapInputAmount = this.balanceObj[this.inputSymbol];
            this.inputSwap();
        },
        reverseToken() {
            var temp = this.inputSymbol;
            this.inputSymbol = this.outputSymbol;

            this.outputSymbol = temp;

            localStorage.setItem('inputSymbol', this.inputSymbol);
            localStorage.setItem('outputSymbol', this.outputSymbol);

            // 触发一下价格
            this.swapInputAmount = 0;
            this.inputSwap();
        },
        maxIssueInput() {
            let floatValue = parseFloat((this.ogxTotalBalance * this.price[MAIN_SYMBOL]) / this.$store.state.targetRatio - (+FIXED(this.myDebt, 4) + 0.0001)); // trick 精度问题

            floatValue = _.max([floatValue, 0])
            this.mintAmount = FIXED(floatValue, TOKEN_UNIT_NUM);
        },
        maxBurnInput() {
            this.burnAmount = _.max([_.min([this.myDebt, (this.balanceObj["OUSD"] || 0)]), 0]);
        },
        maxExchangeInput() {
            this.inputMax();
        },
        swap() {
            if (_hmt) {
                try {
                    _hmt.push([
                        "_trackEvent",
                        "tabClick",
                        'exchangeBtn',
                        this.$store.state.currentAccount || "guest"
                    ]);
                } catch (err) { }
            }
            this.$router.push('exchange');
        },
        inputSwap() {
            this.swapOutputAmount = parseFloat(this.swapInputAmount * this.price[this.inputSymbol] / this.price[this.outputSymbol]).toFixed(TOKEN_UNIT_NUM);
        },
        outputSwap() {
            this.swapInputAmount = parseFloat(this.swapOutputAmount * this.price[this.outputSymbol] / this.price[this.inputSymbol]).toFixed(TOKEN_UNIT_NUM);
        },

        doSwap() {
            if (this.$store.state.currentAccount) {
                this.isSwapping = true;
                api.transact({
                    actions: [{
                        account: MAIN_CONTRACT,
                        name: 'exchange',
                        authorization: [{
                            actor: this.$store.state.currentAccount,
                            permission: this.$store.state.currentPermission
                        }],
                        data: {
                            "from": this.$store.state.currentAccount,
                            "source_currency_key": TOKEN_UNIT_NUM + ',' + this.inputSymbol,
                            "source_amount": FIXED(parseFloat(this.swapInputAmount), TOKEN_UNIT_NUM) + ' ' + this.inputSymbol,
                            "dest_currency_key": TOKEN_UNIT_NUM + "," + this.outputSymbol,
                            // "destination_address": this.$store.state.currentAccount,
                            "memo": (this.referAccount && this.referAccount !== this.$store.state.currentAccount && this.referAccount !== DEFAULT_REFER) ? this.referAccount : (this.$store.state.currentAccount === DEFAULT_REFER) ? '' : DEFAULT_REFER
                        }
                    }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 300, // 5分钟
                }).then(res => {
                    this.isSwapping = false;
                    this.showMsg(this.$t('i18n.swapSuccess'));
                    // this.$modal.hide('swap-panel');
                    this.getMyInfo();
                    setTimeout(() => { this.getMyInfo(); this.getAllSynths(); }, 5000)
                    this.swapInputAmount = '';
                    this.swapOutputAmount = '';
                }).catch(err => {
                    this.isSwapping = false;
                    this.handleError(JSON.stringify(err));
                })
            }
        },
        claimVest() {
            if (this.$store.state.currentAccount) {
                this.isVestClaiming = true;
                api.transact({
                    actions: [{
                        account: MAIN_CONTRACT,
                        name: 'rewardvest',
                        authorization: [{
                            actor: this.$store.state.currentAccount,
                            permission: this.$store.state.currentPermission
                        }],
                        data: {
                            "account": this.$store.state.currentAccount
                        }
                    }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 300, // 5分钟
                }).then(res => {
                    this.isVestClaiming = false;
                    this.showMsg(this.$t('i18n.claimSuccess'));
                    // this.$modal.hide('store-panel');
                    this.getMyInfo();
                    setTimeout(() => { this.getMyInfo(); this.getAllSynths(); }, 5000)
                }).catch(err => {
                    this.isVestClaiming = false;
                    this.handleError(JSON.stringify(err));
                })
            }
        },
        claimPrivate() {
            if (this.$store.state.currentAccount) {
                this.isVestClaiming = true;
                api.transact({
                    actions: [{
                        account: MAIN_CONTRACT,
                        name: 'synthvest',
                        authorization: [{
                            actor: this.$store.state.currentAccount,
                            permission: this.$store.state.currentPermission
                        }],
                        data: {
                            "account": this.$store.state.currentAccount
                        }
                    }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 300, // 5 minutes
                }).then(res => {
                    this.isVestClaiming = false;
                    this.showMsg(this.$t('i18n.claimSuccess'));
                    // this.$modal.hide('store-panel');
                    this.getMyInfo();
                    setTimeout(() => { this.getMyInfo(); this.getAllSynths(); }, 5000)
                }).catch(err => {
                    this.isVestClaiming = false;
                    this.handleError(JSON.stringify(err));
                })
            }
        },
        claim() {
            this.$modal.show('claim-panel');
        },
        doClaim() {
            if (this.$store.state.currentAccount) {
                this.isClaiming = true;
                api.transact({
                    actions: [{
                        account: MAIN_CONTRACT,
                        name: 'claimfees',
                        authorization: [{
                            actor: this.$store.state.currentAccount,
                            permission: this.$store.state.currentPermission
                        }],
                        data: {
                            "account": this.$store.state.currentAccount
                        }
                    }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 300, // 5 minutes
                }).then(res => {
                    this.isClaiming = false;
                    this.showMsg(this.$t('i18n.claimSuccess'));
                    this.$modal.hide('claim-panel');
                    this.getMyInfo();
                    setTimeout(() => { this.getMyInfo(); this.getAllSynths(); }, 5000)
                }).catch(err => {
                    this.isClaiming = false;
                    this.handleError(JSON.stringify(err));
                })
            }
        },
        store() {
            this.$modal.show('store-panel');
        },
        cancel() {
            this.$modal.hide('mint-panel');
            this.$modal.hide('burn-panel');
            this.$modal.hide('swap-panel');
            this.$modal.hide('claim-panel');
            this.$modal.hide('store-panel');
            // this.$modal.hide('liquidation-panel');
            this.$modal.hide('lp-panel');
        },
        showMsg(msg) {
            this.msg = msg;
            this.$modal.show('message');
        },
        getGlobalConfig() {
            if (!this.$store.state.targetRatio) {
                rpc.get_table_rows({ json: true, code: MAIN_CONTRACT, scope: MAIN_CONTRACT, table: 'issuancecfg' }).then(res => {
                    this.$store.commit('setTargetRatio', { targetRatio: (FLOAT_UNIT / res.rows[0].issuance_ratio) })
                })
            }

            if (!this.$store.state.minStakingTime) {
                rpc.get_table_rows({ json: true, code: MAIN_CONTRACT, scope: MAIN_CONTRACT, table: 'issuerconfig' }).then(res => {
                    this.$store.commit('setMinStakingTime', {
                        minStakingTime: res.rows[0].minimum_stake_time,
                        minStakingTimeStr: res.rows[0].minimum_stake_time / 86400
                    });
                })
            }

            if (!this.$store.state.settleTime) {
                rpc.get_table_rows({
                    json: true,
                    code: MAIN_CONTRACT,
                    scope: MAIN_CONTRACT,
                    table: 'exconfig',
                }).then(res => {
                    this.$store.commit('setSettleTime', {
                        settleTime: res.rows[0].waiting_period_secs
                    })
                })
            }

            if (!this.$store.state.liquidationRatio) {
                rpc.get_table_rows({
                    json: true,
                    code: MAIN_CONTRACT,
                    scope: MAIN_CONTRACT,
                    table: 'liqconfig',
                }).then(res => {
                    this.$store.commit('setLiquidition', {
                        liquidationRatio: parseFloat(FLOAT_UNIT / res.rows[0].liquidation_ratio),
                        liquidationDelay: res.rows[0].liquidation_delay / 60 / 60
                    });
                })
            }

            if (!this.$store.state.feeRate) {
                rpc.get_table_rows({
                    json: true,
                    code: MAIN_CONTRACT,
                    scope: MAIN_CONTRACT,
                    table: 'feerate'
                }).then(res => {
                    this.$store.commit('setFeeRate', {
                        feeRate: res.rows[0].rate
                    });
                })
            }
        },
        mergePrice() {
            var list = _.clone(this.$store.state.synthsList);
            var list2 = this.$store.state.allSynthsList;
            var priceObj = this.price;
            var supplyObj = this.supply
            // bal list merge price
            if (list.length) {
                // var totalSynthInUsd = 0;
                var balList = []
                var balObj = {};
                list.forEach(synth => {
                    if (parseFloat(synth.amount) > 0) {

                        balObj[synth.symbol] = synth.amount;

                        if (priceObj[synth.symbol]) {
                            synth.price = priceObj[synth.symbol];
                        }

                        balList.push(synth);
                    }
                })
                this.balanceObj = balObj;

                // balList
                balList.sort((a, b) => {
                    return parseFloat(parseFloat(b.price) * parseFloat(b.amount)) - parseFloat(parseFloat(a.price) * parseFloat(a.amount))
                })


                this.$store.commit('setSynthsList', {
                    synthsList: balList
                })


                // this.synthsListWithTotal = list.concat([{
                //     symbol: this.$t('i18n.totalSynthAssetsValue'), amount: '', price: '', total: parseFloat(totalSynthInUsd)
                // }])

            }
            if (list2.length) {
                list2.forEach(synth => {
                    if (priceObj[synth.symbol]) {
                        synth.price = priceObj[synth.symbol];
                    }
                    if (supplyObj[synth.symbol]) {
                        synth.supply = supplyObj[synth.symbol];
                    }
                })
            }
            this.checkMyDebtPercent();
        },
        getAllSynths() {
            var allSynthsList = [];
            return rpc.get_table_rows({ json: true, code: MAIN_CONTRACT, scope: MAIN_CONTRACT, table: 'currrundrate', limit: 100 }).then(res => {
                let tempPriceObj = {};
                res.rows.forEach(item => {
                    var price = parseFloat(item.rate / FLOAT_UNIT);
                    var symbol = item.sym.split(',')[1];

                    allSynthsList.push({ symbol: symbol, price: price, supply: '', timestamp: item.timestamp });

                    tempPriceObj[symbol] = price;

                    // get supply
                    rpc.get_currency_stats(MAIN_CONTRACT, symbol).then(subRes => {
                        this.supply[symbol] = subRes[symbol] ? subRes[symbol].supply : 0;

                        if (symbol === MAIN_SYMBOL) {
                            this.ogxTotalSupply = this.supply[symbol]
                        }

                    }).then(aa => this.mergePrice());
                })

                this.price = tempPriceObj;
                this.$store.commit('setAllSynthsList', {
                    allSynthsList: allSynthsList
                })
                this.mergePrice();
            })
        },
        doSelectSymbol(symbol) {
            if (this.currentTargetInput === 'input') {
                var temp = this.inputSymbol;

                this.inputSymbol = symbol;

                localStorage.setItem('inputSymbol', this.inputSymbol);

                if (this.outputSymbol === symbol) {
                    this.outputSymbol = temp;
                    localStorage.setItem('outputSymbol', this.outputSymbol);
                }
            }
            else {
                var temp = this.outputSymbol;

                this.outputSymbol = symbol;
                localStorage.setItem('outputSymbol', this.outputSymbol);
                if (this.inputSymbol === symbol) {
                    this.inputSymbol = temp;
                    localStorage.setItem('inputSymbol', this.inputSymbol);
                }
            }

            this.$modal.hide('symbol-panel');

            // trigger input output price
            this.inputSwap();

        },

        exchangePrice() {
            this.priceSwitch = !this.priceSwitch;
        },
        checkMyDebtPercent() {
            if (this.$store.state.allSynthsList.length && !_.find(this.$store.state.allSynthsList, item => item.supply === '' || item.price === '')) {
                var totalDebtInUsd = 0;
                this.$store.state.allSynthsList.forEach(synth => {
                    if (synth.symbol !== MAIN_SYMBOL) {
                        totalDebtInUsd += parseFloat(parseFloat(synth.price) * parseFloat(synth.supply || 0));
                    }
                })

                this.totalDebtInUsd = totalDebtInUsd;

                if (this.myDebtInfo && this.myDebtInfo.debt) {
                    this.myDebtPercent = parseFloat(this.lastLedgerInfo.debt / this.myDebtInfo.debt * this.myDebtInfo.initial_debt_ownership / LEDGER_UNIT);
                    this.myDebt = parseFloat(this.totalDebtInUsd * this.myDebtPercent);
                }

            }
        },
        refresh() {
            this.refreshing = true;
            this.getAllSynths();
            this.getMyInfo().finally(res => {
                this.refreshing = false;
            })

        },
        refreshPrice() {
            this.refreshingPrice = true;
            this.getAllSynths().finally(res => {
                this.refreshingPrice = false;
            })
        },
        goEx() {
            this.showMsg(this.$t('i18n.underGoing'));
        },
        getClaimable() {
            var p1 = rpc.get_table_rows({
                json: true,
                code: MAIN_CONTRACT,
                scope: MAIN_CONTRACT,
                table: 'feepoolcfg',
                limit: 1
            })


            // fee period
            var p2 = rpc.get_table_rows({
                json: true,
                code: MAIN_CONTRACT,
                scope: MAIN_CONTRACT,
                table: 'feeperiod',
                limit: 100
            })


            // personal fee
            var p3 = rpc.get_table_rows({
                json: true,
                code: MAIN_CONTRACT,
                scope: this.$store.state.currentAccount,
                table: 'feeissuadata',
                limit: 100,
                reverse: true
            })

            // withdrawd period
            var p4 = rpc.get_table_rows({
                json: true,
                code: MAIN_CONTRACT,
                scope: MAIN_CONTRACT,
                table: 'cwithdraw',
                lower_bound: this.$store.state.currentAccount + ' ',
                upper_bound: this.$store.state.currentAccount + ' ',
                limit: 1
            })

            // new ledger 
            var p5 = rpc.get_table_rows({
                json: true,
                code: MAIN_CONTRACT,
                scope: MAIN_CONTRACT,
                table: 'debtledger',
                limit: 1,
                reverse: true
            })


            Promise.all([p1, p2, p3, p4, p5]).then(res => {
                var [res0, res1, res2, res3, res4] = res;
                var currentFeePeriod = res0.rows[0].current_fee_period;
                var feePeriodDuration = res0.rows[0].fee_period_duration;

                this.feePeriodDuration = feePeriodDuration;

                var closeDebt = res4.rows[0] && res4.rows[0].debt;

                var feePeriodList = res1.rows;

                var feeIssueData = res2.rows;

                var feeList = _.filter(feePeriodList, item => {
                    return item.id !== currentFeePeriod;
                })

                var estFeeList = _.filter(feePeriodList, item => {
                    return item.id === currentFeePeriod;
                })


                var claimedPeriod = res3.rows.length ? res3.rows[0].period : 0;

                var closeIndex = feePeriodList[currentFeePeriod].starting_debt_index - 1;

                this.nextStartTime = feePeriodList[currentFeePeriod].start_time * 1000;

                this.nextFees = estFeeList[0].fees_to_distribute;
                this.nextRewards = estFeeList[0].rewards_to_distribute;

                var currentFeePeriodId = feePeriodList[currentFeePeriod].fee_period_id - 1;

                this.claimEndTime = dayjs((feePeriodList[currentFeePeriod].start_time + feePeriodDuration) * 1000).format('YYYY-MM-DD HH:mm:ss');

                // current round
                // claimed 
                if (claimedPeriod >= currentFeePeriodId && claimedPeriod !== 0) {
                    this.claimableFee = 0;
                    this.isClaimedCurrentRound = true;
                    this.claimableReward = 0;
                }
                // check claimable
                else {
                    var hasFinded = false;
                    var tempItem = '';
                    feeIssueData.forEach(item => {
                        if (item.debt_entry_index !== 0 && item.debt_entry_index <= closeIndex) {
                            hasFinded = true;
                            tempItem = item;
                        }
                    })

                    if (hasFinded) {
                        this.getMyFess(tempItem.debt_entry_index, closeIndex, tempItem.debt_percentage, feeList[0].fees_to_distribute, feeList[0].rewards_to_distribute)
                    }

                }

                // next round
                var i = 0;
                var hasData = false;
                // while (i < feeIssueData.length && !hasData) {
                //     if (feeIssueData[i] && feeIssueData[i].debt_percentage === '0') {
                //         i++;
                //     }
                //     else {
                //         hasData = true;
                //     }
                // }
                if (feeIssueData[feeIssueData.length - 1] && feeIssueData[feeIssueData.length - 1].debt_percentage !== '0') {
                    hasData = true
                }

                if (hasData && feeIssueData[feeIssueData.length - 1]) {
                    this.getMyNextRound(feeIssueData[feeIssueData.length - 1].debt_entry_index, closeDebt, feeIssueData[feeIssueData.length - 1].debt_percentage, estFeeList[0].fees_to_distribute, estFeeList[0].rewards_to_distribute);
                }

                else {
                    this.estClaimableFee = 0;
                    this.estClaimableReward = 0;
                }


            })
        },
        getMyFess(initIndex, closeIndex, percent, fees, rewards) {
            var init = rpc.get_table_rows({
                json: true, code: MAIN_CONTRACT,
                scope: MAIN_CONTRACT,
                table: 'debtledger',
                index_position: 'primary',
                key_type: 'unuint64_t',
                lower_bound: +initIndex,
                limit: 1
            })

            var close = rpc.get_table_rows({
                json: true, code: MAIN_CONTRACT,
                scope: MAIN_CONTRACT,
                table: 'debtledger',
                index_position: 'primary',
                key_type: 'unuint64_t',
                lower_bound: +closeIndex,
                limit: 1
            })

            Promise.all([init, close]).then(res => {
                var [initDebt, closeDebt] = res;
                this.claimableFee = parseFloat(fees) * percent / LEDGER_UNIT * closeDebt.rows[0].debt / initDebt.rows[0].debt;
                this.claimableReward = parseFloat(rewards) * percent / LEDGER_UNIT * closeDebt.rows[0].debt / initDebt.rows[0].debt;
            })

        },
        getLiquidationConfig() {

        },
        getMyNextRound(initIndex, closeDebt, percent, fees, rewards) {
            var init = rpc.get_table_rows({
                json: true, code: MAIN_CONTRACT,
                scope: MAIN_CONTRACT,
                table: 'debtledger',
                index_position: 'primary',
                key_type: 'unuint64_t',
                lower_bound: +initIndex,
                limit: 1
            }).then(res => {
                this.estClaimableFee = parseFloat(fees) * percent / LEDGER_UNIT * closeDebt / res.rows[0].debt;
                this.estClaimableReward = parseFloat(rewards) * percent / LEDGER_UNIT * closeDebt / res.rows[0].debt;
            })

        },
        checkLP() {
            this.$modal.show('lp-panel');

            this.checkMyLP();
        },
        manageLP(type, id) {

            // dfs
            if (type === 'dfs' || !type) {
                location.href = "https://apps.defis.network/market/" + id
            }
            else {
                // box
            }

        },
        checkMyLP() {
            rpc.get_table_rows({
                json: true,
                code: LP_CONTRACT,
                scope: LP_CONTRACT,
                table: 'ponds',
                limit: 10
            }).then(res => {
                this.lpRewardList = res.rows;

                res.rows.forEach(lp => {
                    var mid = lp.id;

                    // get dfs market info
                    rpc.get_table_rows({
                        json: true,
                        code: DFS_CONTRACT,
                        scope: DFS_CONTRACT,
                        table: 'markets',
                        lower_bound: 637,
                        upper_bound: 637,
                        limit: 1
                    }).then(res => {
                        var market = res.rows[0];

                        // todo add other tokens
                        var marketTotalUsd = market.reserve0.indexOf('USDT') ? (parseFloat(market.reserve0) * 2) : market.reserve1.indexOf('USDT') ? (parseFloat(market.reserve1) * 2) : 0;

                        var totalRewadUsd = this.price[MAIN_SYMBOL] * parseFloat(lp.weight)
                        var totalStakedUsd = lp.total_token * (marketTotalUsd / market.liquidity_token)
                        var apy = (totalRewadUsd / totalStakedUsd) / 7 * 365;
                        console.log(apy);

                        this.lpRewardApy[mid] = apy
                    })

                    // get my info as a miner
                    if (this.$store.state.currentAccount) {
                        rpc.get_table_rows({
                            json: true,
                            code: LP_CONTRACT,
                            scope: mid,
                            table: 'miners',
                            lower_bound: this.$store.state.currentAccount + ' ',
                            upper_bound: this.$store.state.currentAccount + ' ',
                            limit: 1
                        }).then(res => {
                            if (res.rows.length) {
                                var miner = res.rows[0];
                                var canClaimTime = new Date((miner.last_claimed * 1000) + 604800000);
                                var canClaimToEscrow = new Date().getTime() >= canClaimTime;
                                var nextClaimTime = dayjs(canClaimTime).format('MM-DD: HH:mm:ss');

                                var closeTime = _.min([parseInt(new Date().getTime() / 1000), lp.period_finish]);

                                var amount = (closeTime - lp.last_update_time) * parseFloat(lp.reward_rate) / lp.total_token;
                                var rewardPerToken = parseFloat(lp.reward_pt_stored) + amount;

                                var left = rewardPerToken - parseFloat(miner.reward_per_token_paid);
                                var canClaim = miner.token * left > 0 ? miner.token * left : 0;


                                miner.canClaim = canClaim
                                miner.nextClaimTime = nextClaimTime;
                                miner.canClaimToEscrow = canClaimToEscrow;
                                this.myLpTokenObj[mid] = miner;

                            }
                        })
                    }


                })



            })








        },
        getMyInfo() {
            if (this.$store.state.currentAccount) {
                var synthsList = [];
                // token balance
                rpc.get_currency_balance(MAIN_CONTRACT, this.$store.state.currentAccount).then(res => {
                    var balances = res;
                    balances.forEach(bal => {
                        if (bal.split(' ')[1] === MAIN_SYMBOL) {
                            this.ogxWalletBalance = bal;
                        }
                        else {
                            synthsList.push({ symbol: bal.split(' ')[1], amount: bal.split(' ')[0], price: '' });
                        }
                    })

                    this.$store.commit('setSynthsList', {
                        synthsList: synthsList
                    })

                    this.mergePrice();
                })

                // 私募 托管池
                var escrowVest = rpc.get_table_rows({
                    json: true,
                    code: MAIN_CONTRACT,
                    scope: MAIN_CONTRACT,
                    table: 'synthescrow',
                    lower_bound: this.$store.state.currentAccount + ' ',
                    upper_bound: this.$store.state.currentAccount + ' ',
                    limit: 1
                })

                var escrowReward = rpc.get_table_rows({
                    json: true,
                    code: MAIN_CONTRACT,
                    scope: MAIN_CONTRACT,
                    table: 'rewardescrow',
                    lower_bound: this.$store.state.currentAccount + ' ',
                    upper_bound: this.$store.state.currentAccount + ' ',
                    limit: 1
                })

                Promise.all([escrowVest, escrowReward]).then(res => {
                    var escrowVest = (res[0].rows && res[0].rows.length) ? res[0].rows[0] : {};
                    var escrowReward = (res[1].rows && res[1].rows.length) ? res[1].rows[0] : {};

                    this.havePrivateAble = false;

                    if (escrowVest.total_vested_account_balance) {
                        this.myVestBal = escrowVest.total_vested_account_balance;
                        this.myVestList = _.filter(escrowVest.vesting_schedule_list, vest => {
                            return +vest.timestamp !== 0;
                        })

                        this.myVestList.forEach(vest => {
                            if (vest.timestamp * 1000 < new Date().getTime()) {
                                this.havePrivateAble = true;
                            }
                        })
                    }

                    this.haveVestAble = false;

                    if (escrowReward.total_escrowed_account_balance) {
                        this.myRewardBal = escrowReward.total_escrowed_account_balance;
                        this.myRewardList = _.filter(escrowReward.vesting_schedule_list, vest => {
                            return +vest.timestamp !== 0;
                        });

                        this.myRewardList.forEach(vest => {
                            if (vest.timestamp * 1000 < new Date().getTime()) {
                                this.haveVestAble = true;
                            }
                        })

                    }

                    // this.allMyVestRewarList = allList;

                    this.ogxStoreBalance = parseFloat(parseFloat(this.myVestBal) + parseFloat(this.myRewardBal));
                })

                this.getClaimable();



                // 查询未结算交易记录
                rpc.get_table_rows({
                    json: true,
                    code: MAIN_CONTRACT,
                    scope: this.$store.state.currentAccount,
                    table: 'exentry',
                    limit: 100
                }).then(res => {
                    this.myExEntry = {};
                    this.myExEntryObj = {};
                    this.myExEntryList = [];

                    var exEntries = {}
                    var exEntryObj = {}
                    var exEntryList = [];

                    res.rows.forEach(item => {
                        exEntryList = exEntryList.concat(item.ex_entry_list);
                        exEntryObj[item.dest.split(',')[1]] = item.ex_entry_list;
                        exEntries[item.dest.split(',')[1]] = item.ex_entry_list[item.ex_entry_list.length - 1].timestamp;
                    })

                    exEntryList = exEntryList.sort(function (a, b) {
                        return b.timestamp - a.timestamp;
                    })

                    this.lastTradingTime = exEntryList.length ? exEntryList[0].timestamp : '';

                    this.myExEntryObj = exEntryObj;
                    this.myExEntry = exEntries;
                    this.myExEntryList = exEntryList;

                }).catch(err => {
                    console.log(err);
                })

                // last entry
                var myEntry = rpc.get_table_rows({
                    json: true,
                    code: MAIN_CONTRACT,
                    scope: MAIN_CONTRACT,
                    table: 'issuancedata',
                    lower_bound: this.$store.state.currentAccount + ' ',
                    upper_bound: this.$store.state.currentAccount + ' ',
                    limit: 1
                })

                // ledger info
                var totalLedger = rpc.get_table_rows({
                    json: true,
                    code: MAIN_CONTRACT,
                    scope: MAIN_CONTRACT,
                    table: 'debtledger',
                    reverse: true,
                    limit: 1
                })

                return Promise.all([myEntry, totalLedger]).then(res => {
                    var myDebtInfo;
                    // no debt, new player
                    if (!res[0].rows.length) {
                        myDebtInfo = {};

                        this.myDebt = 0;

                    }
                    else {
                        this.lastStakingTime = res[0].rows[0].last_issue_event;
                        myDebtInfo = res[0].rows[0];
                    }
                    this.lastLedgerInfo = res[1].rows ? res[1].rows[0] : {};

                    if (myDebtInfo.debt_entry_index !== undefined) {
                        rpc.get_table_rows({ json: true, code: MAIN_CONTRACT, scope: MAIN_CONTRACT, table: 'debtledger', index_position: 'primary', key_type: 'unuint64_t', lower_bound: myDebtInfo.debt_entry_index, limit: 1 }).then(subres => {
                            if (subres.rows.length) {
                                myDebtInfo.debt = subres.rows[0].debt;
                                this.myDebtInfo = myDebtInfo;
                                this.mergePrice();
                            }
                        }).catch(err => {

                        }).finally(res => {
                            return;
                        })
                    }
                    else {
                        return
                    }
                })
            }
            else {
                return Promise.resolve();
            }
        },
        handleError(err) {
            if (typeof err === "string") {
                try {
                    let errJson = JSON.parse(err);
                    if (errJson.json !== undefined) {
                        errJson = errJson.json;
                    }
                    if (errJson.error && errJson.error.details.length) {
                        var errorMsg = errJson.error.details[0].message


                        if (errorMsg.indexOf('Minimum stake time not reached') > -1) {
                            this.showMsg(this.$t("i18n.error") + this.$t('i18n.stakeTimeNotReached'));
                        }
                        else if (errorMsg.indexOf('A synth or OGX rate is stale') > -1) {
                            this.showMsg(this.$t("i18n.error") + this.$t('i18n.isStale'));
                        }
                        else if (errorMsg.indexOf('Amount too large') > -1) {
                            this.showMsg(this.$t("i18n.error") + this.$t('i18n.tooLarge'));
                        }
                        else if (errorMsg.indexOf('No debt to forgive') > -1) {
                            this.showMsg(this.$t("i18n.error") + this.$t('i18n.noDebtToForgive'));
                        }
                        else if (errorMsg.indexOf('src/dest rate stale or not found') > -1) {
                            this.showMsg(this.$t("i18n.error") + this.$t('i18n.isStale'));
                        }
                        else if (errorMsg.indexOf('c-ratio below penalty threshold') > -1) {
                            this.showMsg(this.$t("i18n.error") + this.$t('i18n.ratioBelowPenalty'));
                        }
                        else if (errorMsg.indexOf('Cannot settle during waiting period') > -1) {
                            this.showMsg(this.$t("i18n.error") + this.$t('i18n.cantSettleDuringWaiting'));
                        }
                        else if (errorMsg.indexOf('insufficient balance after any settlement owing') > -1) {
                            this.showMsg(this.$t("i18n.error") + this.$t('i18n.insufficientBalance'));
                        }
                        else if (errorMsg.indexOf('no fees or rewards available for period, or fees already claimed') > -1) {
                            this.showMsg(this.$t("i18n.error") + this.$t('i18n.noRewardOrClaimed'));
                        }
                        else if (errorMsg.indexOf('recommend yourself') > -1) {
                            this.showMsg(this.$t("i18n.error") + this.$t('i18n.cantRecomSelf'))
                        }
                        else if (errorMsg.indexOf('max queue length reached') > -1) {
                            this.showMsg(this.$t("i18n.error") + this.$t('i18n.maxQueueReached'));
                        }
                        else {
                            this.showMsg(this.$t("i18n.error") + errorMsg)
                        }
                    }


                    else if (errJson.error) {
                        this.showMsg(this.$t("i18n.error") + errJson.error.what)
                    } else {
                        this.showMsg(this.$t("i18n.error") + errJson.message ||
                            errJson.code ||
                            errJson.msg)
                    }
                } catch (e) {
                    this.showMsg(this.$t("i18n.error") + e)
                }
            } else {

                this.showMsg(this.$t("i18n.error") + err.message || err.type || err.code)
            }
        }
    }
}

export default myMixin;