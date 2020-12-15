<template>
  <div :class="'overview ' + this.$i18n.locale">
    <!-- 币种选择弹窗 -->

    <modal
      height="auto"
      classes="symbol-modal"
      color="#49d663"
      :adaptive="true"
      :clickToClose="true"
      width="96%"
      :maxWidth="420"
      name="symbol-panel"
    >
      <div class="modal-bg">
        <h3>{{ $t("i18n.selectToken") }}</h3>
        <div class="token-wrap">
          <div
            class="token-item"
            style="overflow: hidden"
            v-for="synth in mySelectList"
            @click="doSelectSymbol(synth.symbol)"
            v-bind:key="synth.symbol"
          >
            <div class="vertical-middle" style="width: 50%; float: left">
              <img
                :src="
                  'https://tp-statics.tokenpocket.pro/token/ogx/v2/' +
                  synth.symbol +
                  '.png'
                "
                alt=""
                class="vertical-middle"
                onerror="javascript:this.src='https://tp-statics.tokenpocket.pro/token/ogx/OGX.png'"
              />
              <span class="vertical-middle token-name">{{ synth.symbol }}</span>
            </div>
            <span
              v-if="balanceObj[synth.symbol]"
              class="vertical-middle"
              style="width: 50%; float: left"
              >{{ $t("i18n.bal") }}:
              {{ balanceObj[synth.symbol] | fixedDeciaml2Str }}
            </span>
          </div>
        </div>
      </div>
    </modal>
    <!-- 标准弹窗 -->

    <modal
      height="auto"
      classes="msg-modal"
      width="300px"
      color="#49d663"
      :adaptive="true"
      name="message"
      >{{ msg }}</modal
    >

    <div class="wrap info">
      <h3>{{ $t("i18n.exchange") }}</h3>
      <div class="exchange-desc">
        <p>
          <span
            style="margin-right: 8px"
            @click="showMsg($t('i18n.whatisOassets'))"
          >
            <i class="iconfont iconinfo"></i> {{ $t("i18n.oAssets") }}
          </span>
          <span @click="showMsg($t('i18n.whatisIassets'))">
            <i class="iconfont iconinfo"></i> {{ $t("i18n.iAssets") }}
          </span>
        </p>
        <p>
          <span
            @click="showMsg($t('i18n.tradingGap'))"
            style="margin-right: 8px"
          >
            <i class="iconfont iconinfo"></i> {{ $t("i18n.aboutTradingGap") }}
          </span>

          <span @click="showMsg($t('i18n.noSlip'))">
            <i class="iconfont iconinfo"></i> {{ $t("i18n.aboutNoSlip") }}
          </span>
        </p>
      </div>

      <div class="divider"></div>
      <div class="modal-input">
        <div class="clearfix">
          <span class="vertical-middle">{{ $t("i18n.paidToken") }} </span>
          <div class="float-right tips" @click="inputMax()">
            {{ $t("i18n.bal") }}: {{ balanceObj[inputSymbol] || 0 }}
          </div>
        </div>
        <div class="swap-input-wrap">
          <span
            class="input-symbol vertical-middle"
            @click="selectSymbol('input')"
            ><img
              class="input-symbol-logo vertical-middle"
              :src="
                'https://tp-statics.tokenpocket.pro/token/ogx/v2/' +
                inputSymbol +
                '.png'
              "
              alt=""
            />
            <span class="vertical-middle">{{ inputSymbol }}</span>
          </span>
          <div style="position: relative">
            <input
              type="number"
              class="input swap-input vertical-middle"
              :placeholder="$t('i18n.inputTokenPlaceholder')"
              v-model="swapInputAmount"
              @input="inputSwap()"
            />
            <button @click="maxExchangeInput()" class="max-button">
              {{ $t("i18n.max") }}
            </button>
          </div>
        </div>

        <div class="down-arrow">
          <i class="iconfont iconexchange1" @click="reverseToken()"></i>
        </div>
        <div class="clearfix">
          <span class="vertical-middle">{{ $t("i18n.getToken") }}</span>
        </div>
        <div class="swap-input-wrap">
          <span
            class="input-symbol vertical-middle"
            @click="selectSymbol('output')"
          >
            <img
              class="input-symbol-logo vertical-middle"
              :src="
                'https://tp-statics.tokenpocket.pro/token/ogx/v2/' +
                outputSymbol +
                '.png'
              "
              alt=""
            />

            <span class="vertical-middle">{{ outputSymbol }}</span></span
          >
          <input
            type="number"
            class="input swap-input vertical-middle"
            :placeholder="$t('i18n.outputTokenPlaceholder')"
            v-model="swapOutputAmount"
            @input="outputSwap()"
          />
        </div>

        <div class="tips m-4">
          {{ $t("i18n.currentSwapPrice") }}:
          <span class="float-right">
            <i class="icon-exchange" @click="exchangePrice()"></i> 1
            {{ priceSwitch ? outputSymbol : inputSymbol }} =
            <span class="em tips">
              {{
                parseFloat(
                  price[priceSwitch ? outputSymbol : inputSymbol] /
                    price[priceSwitch ? inputSymbol : outputSymbol]
                ) | fixedPrecision
              }}</span
            >
            {{ priceSwitch ? inputSymbol : outputSymbol }}</span
          >
        </div>
        <div class="tips m-4">
          {{ $t("i18n.fee") }}:
          <span class="em tips">{{
            parseFloat($store.state.feeRate / 1000000).toFixed(1) + "%"
          }}</span>
          <!-- <span class="float-right">
              <i
                @click="refreshPrice()"
                :class="[
                  refreshingPrice ? 'loading' : '',
                  'vertical-middle',
                  'icon',
                  'refresh'
                ]"
              ></i>
              <span class="vertical-middle">{{ $t("i18n.updateTime") }}: </span>
              <span
                @click="showMsg($t('i18n.updateTimeTip'))"
                class="em tips vertical-middle"
                style="margin: 0 4px"
              >
                {{ updateTime }}
              </span>
              <i
                @click="showMsg($t('i18n.updateTimeTip'))"
                class="iconfont iconinfo vertical-middle"
              ></i
            >
            </span> -->
        </div>
      </div>
      <div class="modal-action">
        <button
          v-if="
            !isSwapping &&
            swapInputAmount &&
            +swapInputAmount > 0 &&
            +swapInputAmount <= balanceObj[inputSymbol] &&
            myExEntry &&
            $store.state.settleTime &&
            myExEntry[inputSymbol] + $store.state.settleTime >
              parseInt(nowTime / 1000)
          "
          class="confirm-btn loading-bg"
        >
          {{
            $t("i18n.settleNeeds", {
              symbol: inputSymbol,
              time: parseInt(
                myExEntry[inputSymbol] +
                  $store.state.settleTime -
                  parseInt(nowTime / 1000)
              )
            })
          }}
        </button>

        <button
          v-else-if="
            !isSwapping &&
            swapInputAmount &&
            +swapInputAmount > 0 &&
            +swapInputAmount <= balanceObj[inputSymbol]
          "
          class="confirm-btn"
          @click="doSwap()"
        >
          {{ $t("i18n.confirm") }}
        </button>
        <button
          v-else-if="
            !isSwapping &&
            +swapInputAmount &&
            (+swapInputAmount > balanceObj[inputSymbol] ||
              !balanceObj[inputSymbol])
          "
          class="confirm-btn loading-bg"
        >
          {{ $t("i18n.notEnough") }}
        </button>
        <button v-else-if="!isSwapping" class="confirm-btn loading-bg">
          {{ $t("i18n.confirm") }}
        </button>

        <button v-else class="confirm-btn loading-bg">
          <i class="iconfont iconrefresh loading"></i>
          {{ $t("i18n.confirm") }}
        </button>
      </div>
    </div>
    {{ myExEntryObj.length }}
    <div class="wrap info" v-if="myExEntryList.length">
      <h3>
        {{ $t("i18n.orderToBeSettled") }} ({{ myExEntryList.length }})
        <span
          class="float-right"
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

      <!-- <div class="settle-wrap" v-for="(orderList, key) in myExEntryObj"> -->
      <!-- <div>
          <img
            :src="
              'https://tp-statics.tokenpocket.pro/token/ogx/v2/' + key + '.png'
            "
            alt=""
            class="settle-symbol vertical-middle"
            onerror="javascript:this.src='https://tp-statics.tokenpocket.pro/token/ogx/OGX.png'"
          />
          <span class="vertical-middle">
            {{ orderList.length }}
            个未结算交易 <span v-if="orderList.length === 12">(满)</span>
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
        </div> -->

      <!-- <div v-for="item in orderList">
          订单时间：{{ item.timestamp | monthFormatTime }} 数量:
          {{ parseFloat(item.amount_received) | fixedDeciaml }}
        </div> -->
      <!-- </div> -->
    </div>

    <Tab></Tab>
  </div>
</template>

<script>
import mixins from "../mixin";

export default {
  mixins: [mixins]
};
</script>

<style scoped lang="less">
.exchange-desc {
  padding: 4px;
}
.down-arrow {
  text-align: center;

  img {
    padding: 4px 20px;
    height: 10px;
  }
}
.settle-wrap {
  padding: 8px;
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
</style>
