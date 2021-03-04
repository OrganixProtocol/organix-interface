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
    <div class="wrap info">
      <h3>{{ $t("i18n.storePool") }}</h3>
      <div class="modal-desc">
        {{ $t("i18n.storeDesc") }}
      </div>

      <div class="store-table-wrap">
        <table v-if="myRewardList.length" class="store-table">
          <tr>
            <th style="text-align: left">{{ $t("i18n.unlockTime") }}</th>
            <th style="text-align: right">{{ $t("i18n.amount") }} (OGX)</th>
          </tr>
          <tr v-for="vest in currentRewardList">
            <td style="text-align: left">
              {{ vest.timestamp | formatTime }}
            </td>
            <td style="text-align: right">
              {{ vest.quantity | fixedDeciaml2Str }}
            </td>
          </tr>
        </table>
        <table v-else class="store-table">
          <tr>
            <th style="text-align: left">{{ $t("i18n.unlockTime") }}</th>
            <th style="text-align: right">{{ $t("i18n.amount") }} (OGX)</th>
          </tr>
          <tr>
            <td colspan="2" align="center" class="no-data">
              {{ $t("i18n.noData") }}
            </td>
          </tr>
        </table>
        <div v-if="myRewardList.length" class="store-page-container">
          <div class="last-page" v-show="currentRewardPage + 2 <= rewardPages"
               @click="changeStorePage('reward', rewardPages)">{{ rewardPages }}</div>
          <div class="more-page" v-show="currentRewardPage + 2 < rewardPages">...</div>
          <div class="next-page" v-show="currentRewardPage + 1 <= rewardPages"
               @click="changeStorePage('reward', currentRewardPage + 1)">{{ currentRewardPage + 1 }}</div>
          <div class="current-page">{{ currentRewardPage }}</div>
          <div class="pre-page" v-show="currentRewardPage - 1 >= 1"
               @click="changeStorePage('reward', currentRewardPage - 1)">{{ currentRewardPage - 1 }}</div>
          <div class="more-page" v-show="currentRewardPage - 2 > 1">...</div>
          <div class="first-page" v-show="currentRewardPage - 2 >= 1"
               @click="changeStorePage('reward', 1)">1</div>
        </div>
      </div>

      <div class="modal-action">
        <button
          v-if="haveVestAble && !isVestClaiming"
          @click="claimVest()"
          class="confirm-btn"
        >
          {{ $t("i18n.confirmVest") }}
        </button>

        <button v-else-if="haveVestAble" class="confirm-btn loading-bg">
          <i class="iconfont iconrefresh loading"></i>
          {{ $t("i18n.confirmVest") }}
        </button>

        <button v-else class="confirm-btn loading-bg">
          {{ $t("i18n.noReward") }}
        </button>
      </div>
    </div>

    <div v-if="myVestList.length" class="wrap info">
      <h3>{{ $t("i18n.privatePool") }}</h3>
      <div class="modal-desc">
        {{ $t("i18n.privateDesc") }}
      </div>

      <div class="store-table-wrap">
        <table class="store-table">
          <tr>
            <th style="text-align: left">{{ $t("i18n.unlockTime") }}</th>
            <th style="text-align: right">{{ $t("i18n.amount") }} (OGX)</th>
          </tr>
          <tr v-for="vest in currentVestList">
            <td style="text-align: left">
              {{ vest.timestamp | formatTime }}
            </td>
            <td style="text-align: right">
              {{ vest.quantity | fixedDeciaml2Str }}
            </td>
          </tr>
        </table>
        <div v-if="myVestList.length" class="store-page-container">
          <div class="last-page" v-show="currentVestPage + 2 <= vestPages"
               @click="changeStorePage('myVest', vestPages)">{{ vestPages }}</div>
          <div class="more-page" v-show="currentVestPage + 2 < vestPages">...</div>
          <div class="next-page" v-show="currentVestPage + 1 <= vestPages"
               @click="changeStorePage('myVest', currentVestPage + 1)">{{ currentVestPage + 1 }}</div>
          <div class="current-page">{{ currentVestPage }}</div>
          <div class="pre-page" v-show="currentVestPage - 1 >= 1"
               @click="changeStorePage('myVest', currentVestPage - 1)">{{ currentVestPage - 1 }}</div>
          <div class="more-page" v-show="currentVestPage - 2 > 1">...</div>
          <div class="first-page" v-show="currentVestPage - 2 >= 1"
               @click="changeStorePage('myVest', 1)">1</div>
        </div>
      </div>

      <div class="modal-action">
        <button
          v-if="havePrivateAble && !isVestClaiming"
          @click="claimPrivate()"
          class="confirm-btn"
        >
          {{ $t("i18n.confirmVest") }}
        </button>

        <button v-else-if="havePrivateAble" class="confirm-btn loading-bg">
          <i class="iconfont iconrefresh loading"></i>
          {{ $t("i18n.confirmVest") }}
        </button>

        <button v-else class="confirm-btn loading-bg">
          {{ $t("i18n.noReward") }}
        </button>
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
.store-table-wrap {
  margin: 12px 0 24px;
}
</style>
