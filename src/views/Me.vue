<template>
  <div :class="'overview ' + this.$i18n.locale">
    <modal
      height="auto"
      classes="msg-modal"
      width="300px"
      color="#49d663"
      :adaptive="true"
      name="message"
      >{{ msg }}</modal
    >

    <!-- 个人信息 OGX -->

    <div class="wrap status info">
      <h3 v-if="!$store.state.currentAccount" @click="login">
        {{ $t("i18n.login") }}
      </h3>
      <h3 v-else>
        <span class="label"> {{ $t("i18n.account") }}: </span
        >{{ $store.state.currentAccount }}
        <i @click="logout" class="iconfont iconexit"></i>
      </h3>
      <h3 class="total-bal">
        <p>
          <span class="label"> {{ $t("i18n.total") }}: </span
          >{{ ogxTotalBalance | fixedDeciaml2Str }} OGX
          <br />
          <span class="label"> {{ $t("i18n.valued") }}: </span>${{
            parseFloat(ogxTotalBalance * price["OGX"]).toFixed(2)
              | fixedDeciaml2Str
          }}
        </p>
      </h3>
      <div
        :class="[
          currentRatio === '-'
            ? '-'
            : currentRatio >= $store.state.targetRatio
            ? ''
            : currentRatio > $store.state.liquidationRatio
            ? 'warning'
            : 'danger',
          'percent ratio info-ratio'
        ]"
      >
        {{ currentRatio | percent }}
      </div>

      <ul>
        <li>
          <div class="status-bar">
            <div class="bal-title">
              <span
                >{{ $t("i18n.locked") }}
                {{ (ogxTotalBalance - myTransferAble) | fixedDeciaml2Str }}
              </span>
              <span class="float-right"
                >{{ $t("i18n.transferable") }}
                {{ myTransferAble | fixedDeciaml2Str }}</span
              >
            </div>
            <div class="bar-wrap">
              <div
                class="bar"
                :style="
                  'width:' +
                  parseFloat(
                    ((ogxTotalBalance - myTransferAble) / ogxTotalBalance) * 100
                  ) +
                  '%'
                "
              ></div>
            </div>
          </div>
        </li>
        <li>
          <div class="status-bar">
            <div class="bal-title">
              <span
                >{{ $t("i18n.staked") }}
                {{ myStakedOGX | fixedDeciaml2Str }}</span
              >
              <span class="float-right">
                {{ $t("i18n.unstaked") }}
                {{
                  ogxTotalBalance - myStakedOGX > 0
                    ? ogxTotalBalance - myStakedOGX
                    : 0 | fixedDeciaml2Str
                }}</span
              >
            </div>
            <div class="bar-wrap">
              <div
                class="bar"
                :style="
                  'width:' +
                  parseFloat((myStakedOGX / ogxTotalBalance) * 100).toFixed(2) +
                  '%'
                "
              ></div>
            </div>
          </div>
        </li>
        <li>
          <div class="status-bar">
            <div class="bal-title">
              <span
                >{{ $t("i18n.walletBal") }}:
                {{ parseFloat(ogxWalletBalance) | fixedDeciaml2Str }}</span
              >
              <span class="float-right"
                >{{ $t("i18n.stored") }}:
                {{ ogxStoreBalance | fixedDeciaml2Str }}</span
              >
            </div>
            <div class="bar-wrap">
              <div
                class="bar"
                :style="
                  'width:' +
                  parseFloat(
                    parseFloat(ogxWalletBalance) /
                      parseFloat(
                        (parseFloat(ogxWalletBalance) +
                          parseFloat(ogxStoreBalance)) /
                          100
                      )
                  ).toFixed(2) +
                  '%'
                "
              ></div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- 个人信息 合成资产 -->

    <div class="wrap info">
      <h3>
        <p>
          <span class=""> {{ $t("i18n.myAssets") }}: </span>
          <span class="float-right"
            >${{ mySynthValue | fixedDeciaml2Str }}</span
          >
          <br />
          <span @click="showMsg($t('i18n.whatisdebt'))" class=""
            >{{ $t("i18n.myDebt") }} <i class="iconfont iconinfo"></i> :
          </span>
          <span class="float-right"> ${{ myDebt | fixedDeciaml2Str }}</span>

          <br />
          <span v-if="mySynthValue && myDebt">
            <span @click="showMsg($t('i18n.whatisprofit'))"
              >{{ $t("i18n.profit") }} ($)
              <i class="iconfont iconinfo"></i> :</span
            >

            <span
              :class="
                (this.mySynthValue >= this.myDebt
                  ? 'success-color'
                  : 'danger-color') + ' float-right'
              "
              >{{ mySynthValue > myDebt ? "+" : "" }}
              {{ (mySynthValue - myDebt) | fixedDeciaml2Str }}</span
            >
          </span>
        </p>
      </h3>

      <div class="divider"></div>

      <!-- <h3>资产明细</h3> -->
      <div class="tokens">
        <table class="my-table">
          <!-- <tr>
            <th></th>
            <th>{{ $t("i18n.bal") }}</th>
            <th>{{ $t("i18n.valued") }}($)</th>
          </tr> -->
          <tr v-for="synth in $store.state.synthsList">
            <td>
              <img
                :src="
                  'https://tp-statics.tokenpocket.pro/token/ogx/v2/' +
                  synth.symbol +
                  '.png'
                "
                alt=""
                class="vertical-middle bal-logo"
                onerror="javascript:this.src='https://tp-statics.tokenpocket.pro/token/ogx/OGX.png'"
              />
              <span class="vertical-middle"> {{ synth.symbol }} </span>
            </td>
            <!-- <td></td> -->
            <td>
              <span class="bal"> {{ synth.amount | fixedDeciaml }} </span><br />
              <span class="label valued"
                >$
                {{
                  synth.total
                    ? synth.total
                    : parseFloat(synth.amount * synth.price) | fixedDeciaml2Str
                }}</span
              >
            </td>
          </tr>
          <!-- <tr>
            <td>{{ $t("i18n.debt") }}</td>
            <td>{{ myDebt | fixedDeciaml2Str }}</td>
          </tr> -->
        </table>
      </div>
    </div>

    <div class="wrap info" v-if="myExEntryList.length">
      <h3>
        <span @click="showSettleDetail = !showSettleDetail">
          {{ $t("i18n.orderToBeSettled") }} ({{ myExEntryList.length }})</span
        >
        <span
          class="float-right settle-all"
          v-if="
            lastTradingTime + $store.state.settleTime < parseInt(nowTime / 1000)
          "
          @click="settleOrder()"
          >{{ $t("i18n.settleAll") }}</span
        >
        <span class="float-right" v-else>
          {{
            lastTradingTime +
            $store.state.settleTime -
            parseInt(nowTime / 1000)
          }}s
        </span>
      </h3>
      <!-- <div v-for="order in myExEntryList">
        {{ order.src.split(",")[1] }} -> {{ order.dest.split(",")[1] }}
      </div> -->
      <!-- <div v-show="showSettleDetail">
        {{ $t("i18n.settleTips") }}
      </div> -->
      <!-- <div
        v-show="showSettleDetail"
        class="settle-wrap"
        v-for="(orderList, key) in myExEntryObj"
      >
        <div>
          <img
            :src="
              'https://tp-statics.tokenpocket.pro/token/ogx/v2/' + key + '.png'
            "
            alt=""
            class="settle-symbol vertical-middle"
            onerror="javascript:this.src='https://tp-statics.tokenpocket.pro/token/ogx/OGX.png'"
          />
          <span class="vertical-middle">
            {{ key }} ({{ orderList.length }})
            <span v-if="orderList.length === 12">({{ $t("i18n.full") }})</span>
          </span>
          <span
            class="float-right link"
            v-if="
              myExEntry[key] + $store.state.settleTime <
              parseInt(nowTime / 1000)
            "
            >结算</span
          >
          <span v-else class="float-right"
            >{{
              myExEntry[key] +
              $store.state.settleTime -
              parseInt(nowTime / 1000)
            }}s
          </span>
        </div>
        <div class="order-list">
          <table>
            <tr>
              <th>{{ $t("i18n.time") }}</th>
              <th>{{ $t("i18n.unsettleAmount") }}</th>
            </tr>
            <tr class="order-item" v-for="item in orderList">
              <td>
                {{ item.timestamp | monthFormatTime }}
              </td>
              <td>
                {{ parseFloat(item.amount_received) | fixedDeciaml }}
              </td>
            </tr>
          </table>
        </div>
      </div> -->
    </div>

    <div class="wrap info">
      <h3>{{ $t("i18n.howtogetOGX") }} (Defi / Dex)</h3>

      <div class="portal-link">
        <a
          target="_blank"
          :href="
            $store.state.isMobile
              ? 'https://newdex.340wan.com/kline/core.ogx-ousd-usdt?tab=buy'
              : 'https://newdex.vip/trade/core.ogx-ousd-usdt'
          "
        >
          <img src="../assets/newdex.png" alt="" />
        </a>
      </div>
      <div class="portal-link">
        <a
          target="_blank"
          href="https://pizza.finance/lend/token/detail?symbol=8,OUSD"
        >
          <img src="../assets/pizza.png" alt="" />
        </a>
      </div>
      <div class="clearfix"></div>
      <div class="portal-link">
        <a target="_blank" href="https://apps.defis.network/?code=tpdappincome">
          <img src="../assets/dfs.png" alt="" />
        </a>
      </div>
      <div class="portal-link">
        <a
          target="_blank"
          :href="
            $store.state.isMobile
              ? 'https://defibox.340wan.com/?channel=tokenpocket'
              : 'https://defibox.io/'
          "
        >
          <img src="../assets/defibox.png" alt="" />
        </a>
      </div>
      <div class="clearfix"></div>

      <div class="portal-link">
        <a
          target="_blank"
          :href="
            $store.state.isMobile
              ? 'https://w.whaleex.com.cn/wallet/trade/OGX_EOS?lan=zh&utm_source=tokenpocket'
              : 'https://www.whaleex.com/trade/OGX_EOS'
          "
        >
          <img src="../assets/whaleex.png" alt="" />
        </a>
      </div>

      <div class="portal-link">
        <a target="_blank" href="https://dolphinswap.io/exchange">
          <img src="../assets/dolphin.png" alt="" />
        </a>
      </div>
    </div>

    <div v-if="$store.state.currentAccount" class="wrap info">
      <h3>{{ $t("i18n.referLink") }}</h3>
      <p>{{ $t("i18n.referLinkTip") }}</p>

      <div class="ref-wrap">
        <input
          type="text"
          v-model="referLink"
          class="ref-link label"
          readonly
        />
        <button class="ref-btn copy-btn">{{ $t("i18n.copy") }}</button>
      </div>
    </div>

    <Tab></Tab>
  </div>
</template>

<script>
import mixins from "../mixin";
import ClipboardJS from "clipboard";

export default {
  mixins: [mixins],
  data() {
    return {};
  },
  computed: {
    referLink: function () {
      return (
        location.origin +
        location.pathname +
        "?ref=" +
        this.$store.state.currentAccount
      );
    }
  },
  mounted() {
    this.initCopy();
  },
  methods: {
    initCopy() {
      var _this = this;

      let clipboard = new ClipboardJS(".copy-btn", {
        text: function () {
          return _this.referLink;
        }
      });

      clipboard.on("success", (e) => {
        _this.showMsg(_this.$t("i18n.copied"));
      });

      clipboard.on("error", (e) => {
        _this.showMsg(_this.$t("i18n.copiedFailed"));
      });
    }
  }
};
</script>

<style scoped lang="less">
@mainColor: linear-gradient(225deg, #3fee9d 0%, #30d3e3 100%);
@mainSingleColor: #1dcea5;
@dangerColor: linear-gradient(225deg, #e83a3a 0%, #da1717 100%);
@dangerSingleColor: #e83a3a;
@warningColor: linear-gradient(225deg, #ecbe3b 0%, #eaac29 100%);
@warningSingleColor: #ecbe3b;
@backgroundColor: #1c2125;

@normalColor: #acb0cc;

.bal-logo {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}
.my-table {
  font-size: 16px;
}

.info-ratio {
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 30px;
}

.bal {
  font-size: 15px;
  // font-weight: bold;
}

.valued {
  font-size: 12px;
}

.ref-wrap {
  position: relative;
  box-sizing: border-box;
  margin: 16px 0;
}

.ref-link {
  width: 100%;
  padding: 2px 12px;
  background: transparent;
  border-radius: 40px;
  border: 1px solid #2c303e;
  line-height: 1.8;
  font-size: 15px;
  box-sizing: border-box;
}
.ref-btn {
  position: absolute;
  right: 1px;
  top: 1px;
  padding: 5px 16px;
  display: inline-block;
  border-radius: 100px;
  border: none;
  font-size: 14px;
  color: #000;
  background-color: @mainSingleColor;
  background: @mainColor;
}
.settle-wrap {
  padding: 8px;
}

.settle-all {
  padding: 0 8px;
}

.settle-symbol {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.link {
  cursor: pointer;
  padding: 2px;
}

.order-list {
  padding: 4px 0;

  table {
    width: 100%;

    th,
    td {
      text-align: left;
    }
  }
}

.order-item {
  padding: 6px 0;
}
</style>
