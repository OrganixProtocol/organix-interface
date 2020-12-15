<template>
  <div :class="'overview ' + this.$i18n.locale">
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
      <h3>{{ $t("i18n.sysStat") }}</h3>
      <table class="sys-info-table">
        <tr>
          <td>OGX {{ $t("i18n.totalSupply") }}</td>
          <td class="align-right">{{ ogxTotalSupply | fixedDeciaml2Str }}</td>
        </tr>
        <tr>
          <td>OGX {{ $t("i18n.totalValue") }}</td>
          <td class="align-right">
            ${{
              (parseFloat(ogxTotalSupply) * price["OGX"]) | fixedDeciaml2Str
            }}
          </td>
        </tr>
        <tr>
          <td>{{ $t("i18n.totalSynthAssetsValue") }}</td>
          <td class="align-right">
            ${{ totalSynthAssetsValue | fixedDeciaml2Str }}
          </td>
        </tr>

        <tr>
          <td>{{ $t("i18n.currentRoundStartTime") }}</td>
          <td class="align-right">
            {{ parseInt(nextStartTime / 1000) | monthFormatTime }}
          </td>
        </tr>

        <tr>
          <td>{{ $t("i18n.currentRoundFee") }}</td>
          <td class="align-right">${{ nextFees | fixedDeciaml2Str }}</td>
        </tr>

        <tr>
          <td>{{ $t("i18n.currentRoundVol") }}</td>
          <td class="align-right">
            ${{
              parseFloat(
                (parseFloat(nextFees) /
                  parseFloat($store.state.feeRate / 100000)) *
                  0.9 *
                  1000
              ) | fixedDeciaml2Str
            }}
          </td>
        </tr>

        <!-- <tr>
          <td>OGX {{ $t("i18n.utilization") }}</td>
          <td class="align-right">
            {{
              (parseFloat(totalSynthAssetsValue) /
                ((price["OGX"] * parseFloat(ogxTotalSupply)) / $store.state.targetRatio))
                | percent
            }}
          </td>
        </tr> -->

        <tr>
          <td
            @click="
              showMsg(
                $t('i18n.liquidationDesc', {
                  liqRatio: parseInt($store.state.liquidationRatio * 100) + '%'
                })
              )
            "
          >
            {{ $t("i18n.liquidationRatio") }}
            <i class="iconfont iconinfo"></i>
          </td>
          <td class="align-right">
            {{ $store.state.liquidationRatio | percent }}
          </td>
        </tr>
        <tr>
          <td>{{ $t("i18n.liquidationDelay") }}</td>
          <td class="align-right">
            {{ $store.state.liquidationDelay }} {{ $t("i18n.hour") }}
          </td>
        </tr>
        <tr>
          <td>{{ $t("i18n.minStakingTime") }}</td>
          <td class="align-right">
            {{ $store.state.minStakingTimeStr }} {{ $t("i18n.day") }}
          </td>
        </tr>
      </table>
    </div>

    <div class="wrap info">
      <h3>{{ $t("i18n.sysOverview") }}</h3>
      <div class="tokens global-info">
        <table class="overview-table">
          <!-- <tr>
            <th>{{ $t("i18n.token") }}</th>
            <th>{{ $t("i18n.supply") }}</th>
            <th>{{ $t("i18n.price") }}($)</th>
            <th>{{ $t("i18n.totalValue") }}($)</th>
          </tr> -->
          <!-- <tr v-for="synth in allSynthsList"> -->
          <tr v-for="synth in synthsListWithoutOGX">
            <td style="width: 24px">
              <img
                :src="
                  'https://tp-statics.tokenpocket.pro/token/ogx/v2/' +
                  synth.symbol +
                  '.png'
                "
                alt=""
                class="vertical-middle overview-logo"
                onerror="javascript:this.src='https://tp-statics.tokenpocket.pro/token/ogx/OGX.png'"
              />
            </td>
            <td class="token-symbol-td">
              <span class="token-name">{{ synth.symbol }}</span> <br />
              <span class="valued label">
                ${{ synth.price | fixedDeciaml }}</span
              >
            </td>
            <td>
              <span class="bal">
                {{
                  synth.supply && synth.supply.split(" ")[0] | fixedDeciaml2Str
                }}</span
              >
              <br />

              <span class="valued label">
                ${{
                  synth.price && synth.supply
                    ? parseFloat(
                        parseFloat(synth.price) * parseFloat(synth.supply)
                      ).toFixed(2)
                    : "" | fixedDeciaml2Str
                }}
                ({{
                  synth.price && synth.supply
                    ? parseFloat(
                        parseFloat(synth.price) * parseFloat(synth.supply)
                      ) / totalSynthAssetsValue
                    : "-" | percent
                }})</span
              >
            </td>
          </tr>
        </table>
      </div>
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
.overview-logo {
  width: 24px;
  height: 24px;
}

.sys-info-table {
  width: 100%;

  td {
    padding: 8px;
  }
}
.bal {
  font-size: 15px;
}
.valued {
  font-size: 12px;
}
.token-symbol-td {
  text-align: left;
}
.token-name {
  font-size: 15px;
}
.overview-table {
  td {
    padding: 6px 8px;
  }
}
</style>
