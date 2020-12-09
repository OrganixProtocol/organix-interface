const zh = {
  i18n: {
    login: '登录',
    account: '账号',
    mint: '铸造',
    mintPlaceholder: '铸造的OUSD数量',
    mintDesc: '抵押OGX铸造OUSD，同时产生的债务，债务量影响你可领取奖励。铸造OUSD会减少抵押率',
    mintDesc1: '抵押铸造后需要等待 {minStakeTime}天 后才可以进行销毁',
    max: '最大',
    currRatio: '抵押率',
    minRatio: '最低抵押率',
    confirm: '确认',
    cancel: '取消',
    burn: '销毁',
    burnPlaceholder: '销毁的OUSD数量',
    burnDesc: '销毁OUSD来解锁OGX，同时减少债务，增加抵押率',
    ousdBal: 'OUSD余额',
    debt: '债务',
    myDebt: '我的债务',
    exchange: '交易',
    exchangeDesc: '无滑点的交易各种合成资产',
    paidToken: '支付币种',
    bal: '余额',
    inputTokenPlaceholder: '请输入支付的数量',
    getToken: '获得币种',
    outputTokenPlaceholder: '请输入获得的数量',
    currentSwapPrice: '当前兑换价格',
    fee: '手续费',
    claimReward: '领取奖励',
    claimRewardDesc: '如果你抵押OGX铸造了OUSD并且抵押率不小于系统最低抵押率，就有资格每周获得两种奖励：OGX新增代币奖励和交易所产生的手续费奖励',
    nextRoundReward: '下一轮预估奖励',
    nextRoundRewardTip: '在本轮进行抵押铸造产生的奖励将在下一轮领取，下一轮领取时间为本轮结束后',
    estApr: '预估年化',
    ogxReward: '新增代币奖励',
    feeReward: '手续费奖励',
    currentRoundFee: '本周期内产生手续费',
    currentRoundVol: '本周期内成交量',
    currentRoundStartTime: '本周期开始时间',
    currentClaimable: '当前可领奖励',
    deadline: '本轮领取截止时间',
    deadlineDesc: '请在规定时间内完成领取',
    deadlineTips: '在规定时间内未领取的个人奖励，这部分奖励会被回收，放到下一个周期的公共奖励池',
    lowRatio: '抵押率不足',
    noReward: '无可领取的奖励',
    storePool: '抵押奖励托管池',
    storeDesc: '管理每个周期领取的新增OGX奖励，在解锁时间过后，你可以在这里进行归属',
    unlockTime: '解锁时间',
    amount: '数量',
    selectToken: '选择币种',
    testnet: '测试网账号创建',
    myWallet: '我的钱包详情',
    refresh: '刷新',
    currentRatio: '当前抵押率',
    targetRatio: '目标抵押率',
    claim: '领取',
    store: '托管',
    valued: '价值',
    locked: '已锁定',
    transferable: '可转账',
    staked: '已抵押',
    unstaked: '未抵押',
    walletBal: '钱包余额',
    stored: '托管中',
    myAssets: '我的合成资产',
    sysOverview: '系统内合成资产分布',
    token: '代币',
    supply: '发行量',
    price: '单价',
    totalValue: '总价值',
    total: '总',
    myTotal: '我的OGX',
    success: '成功',
    mintSuccess: '铸造成功',
    burnSuccess: '销毁成功',
    swapSuccess: '兑换成功',
    claimSuccess: '领取成功',
    totalSynthAssetsValue: '合成资产总价值',
    underGoing: '高级版本交易功能正在开发中',
    error: '错误信息:',
    stakeTimeNotReached: '未达到最小抵押时长',
    isStale: '代币价格失效了，请稍后再试',
    tooLarge: '数量太大了',
    noDebtToForgive: '没有需要偿还的债务',
    ratioBelowPenalty: '抵押率不足',
    noRewardOrClaimed: '没有可领取的奖励或已经领取过本轮奖励',
    liquidationRatio: '清算抵押率',
    liquidationDelay: '清算延迟',
    updateTime: '价格更新时间',
    cantSettleDuringWaiting: '无法结算最近的交易，请稍后再试',
    insufficientBalance: '结算后余额不足，请减少交易量',
    liquidation: '清算',
    liquidationDesc: '当抵押率低于{liqRatio}时账号会被标记为待清算，同时会有一段时间的缓冲期，超过缓冲期如果抵押率仍未恢复，则可被其他人进行清算，清算者可通过OUSD清算获得更多价值的OGX',
    maxToMint: '可铸造数量',
    hour: '小时',
    liqDeadline: '缓冲结束时间',
    noData: '暂无数据',
    updateTimeTip: '当更新时间与当前时间间隔较长时，结算后会产生一定误差',
    reverseAssetsRule: '像IBTC，IETH，IEOS这种以I开头的，是对应资产的反向资产，价格的涨跌与普通资产相反',
    home: '主页',
    me: '我的',
    dashboard: '概览',
    copy: '复制',
    copied: '已复制',
    copiedFailed: '复制失败',
    confirmVest: '确认领取',
    reward: '奖励',
    sysStat: '系统参数与统计',
    cantRecomSelf: "不可以邀请自己",
    referLink: '邀请链接',
    referLinkTip: '将会获得被邀请人交易手续费的10%，不允许邀请自己',
    totalSupply: '总量',
    utilization: '利用率',
    hasClaimed: '本轮奖励已领取',
    day: '天',
    minute: '分钟',
    minStakingTime: '最小抵押时长',
    oAssets: '什么是OBTC等O资产',
    iAssets: '什么是IBTC等I资产',
    burnAvaileAt: '可以在{canBurnTime}后销毁',
    privatePool: '代币销售托管池',
    privateDesc: '管理代币销售的释放，在解锁时间过后，你可以在这里进行归属',
    whatisOassets: '像OBTC，OETH这种O开头的资产，价格与BTC，ETH保持一致的，当ETH上涨10美元，OETH也会上涨10美元',
    whatisIassets: '像IBTC，IETH这种I开头的资产，价格与BTC，ETH的价格趋势相反，即当BTC上涨10美元，IBTC下跌10美元，同理当ETH下跌100美元时，IETH会上涨100美元',
    whatisTargetRatio: '系统中设定的最小抵押率，当你的抵押率低于该值，则无法进行奖励的领取。你可以通过铸造和销毁OUSD来调整抵押率。',
    mint1: '抵押OGX铸造OUSD',
    mint2: '产生债务',
    burn1: '销毁OUSD解锁OGX',
    burn2: '提高抵押率',
    exchange1: '使用OUSD',
    exchange2: '交易合成资产',
    reward1: '根据抵押率和债务量',
    reward2: '申领奖励',
    wrongAmount: '请输入正确的数量',
    notEnough: '余额不足',
    aboutTradingGap: '关于交易结算机制',
    profit: '盈亏',
    claimRules: '领取后，OGX新增代币奖励将会被存储在托管池中，等待解锁时间过后方可进行归属。交易手续费奖励将直接转入你的钱包账号',
    tradingGap: '同一个币种买入和卖出之间需要间隔1-2分钟，系统进行交易价格的结算，结算价格会根据成交时间选择对应的预言机价格进行结算，多退少补，结算触发时间为下一次交易该币种。',
    aboutNoSlip: '关于无滑点交易',
    noSlip: '所有代币的成交价格都以预言机提供的价格成交',
    maxQueueReached: '目标币种未结算的队列已满，请先尝试反向卖出或买入少量代币，完成历史订单的结算，再进行本次交易',
    settleNeeds: '{symbol}还需要{time}秒完成结算',
    whatisprofit: '该值仅代表你账号当前的债务与合成资产的差值，并未考虑奖励领取相关',
    exchangeOldBtn: '将 {bal} 旧币兑换成新币',
    oldTokenDesc: '主网OGX代币合约已经换成{newContract}，请点击下方按钮进行新旧代币转换。',
    howtogetOGX: '如何获得OGX、OUSD等合成资产',
    changeNode: '节点切换',
    custom: '自定义',
    wrongNode: '请填写正确的节点地址',
    whatisdebt: '铸造OUSD后，你的初始债务等于铸造的OUSD数量，债务将随着所有合成资产持有人的收益和损失而波动。当系统中合成资产因为价格增长导致总价值增加时，系统中的总债务和个人的债务量都会增加。要解锁你抵押的OGX，您需要还清您的债务。'
  }
};

export default zh;