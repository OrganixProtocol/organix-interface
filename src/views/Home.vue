<template>
  <div :class="'home ' + this.$i18n.locale">
    <!-- 铸造弹窗 -->
    <modal
      height="auto"
      classes="common-modal"
      color="#49d663"
      :adaptive="true"
      :clickToClose="true"
      width="98%"
      :maxWidth="420"
      name="mint-panel"
    >
      <div class="modal-bg">
        <div class="modal-top">
          <img src="../assets/modal/mint.png" class="modal-logo" alt />
          <h5 class="modal-title">{{ $t("i18n.mint") }}</h5>
        </div>
        <div class="modal-desc">
          <p>{{ $t("i18n.mintDesc") }}</p>
          <p>
            {{
              $t("i18n.mintDesc1", {
                minStakeTime: $store.state.minStakingTimeStr
              })
            }}
          </p>
        </div>
        <div class="divider"></div>
        <div class="modal-input">
          {{ $t("i18n.maxToMint") }}:
          <span @click="maxIssueInput()">{{
            (this.ogxTotalBalance * this.price["OGX"]) /
              this.$store.state.targetRatio -
              this.myDebt >
            0
              ? (this.ogxTotalBalance * this.price["OGX"]) /
                  this.$store.state.targetRatio -
                this.myDebt
              : 0 | fixedDeciaml2Str
          }}</span>
          OUSD
          <div style="position: relative">
            <input
              type="number"
              class="input"
              v-model="mintAmount"
              :placeholder="$t('i18n.mintPlaceholder')"
            />
            <button @click="maxIssueInput()" class="max-button">
              {{ $t("i18n.max") }}
            </button>
          </div>

          <span class="tips">
            {{ $t("i18n.currRatio") }}:
            <span
              :class="[
                'tips',
                'em',
                mintRatio < $store.state.targetRatio ? 'danger' : ''
              ]"
            >
              {{ mintRatio | percent }}</span
            >
            <!-- OGX总:
            <span class="tips em">{{ ogxTotalBalance }} OGX</span> -->
          </span>
          <span class="float-right">
            {{ $t("i18n.minRatio") }}
            <span class="tips em">
              {{ $store.state.targetRatio | percent }}</span
            >
          </span>
          <br />
          <!-- <span class="tips">
            价值:
            <span class="tips em">
              ${{ ogxTotalBalance * price["OGX"] }} ( 1 OGX = ${{
                price["OGX"]
              }})</span
            >
          </span>
          <br />
          <span class="tips">
            已有债务
            <span class="tips em">${{ myDebt }}</span>
          </span> -->
        </div>
        <div class="modal-action">
          <button
            v-if="
              mintAmount &&
              +mintAmount > 0 &&
              !isMinting &&
              mintRatio >= $store.state.targetRatio
            "
            class="confirm-btn"
            @click="doMint()"
          >
            {{ $t("i18n.confirm") }}
          </button>
          <button
            v-else-if="
              (!isMinting && mintRatio < $store.state.targetRatio) ||
              !mintAmount ||
              +mintAmount === 0
            "
            class="confirm-btn loading-bg"
          >
            {{ $t("i18n.confirm") }}
          </button>
          <button v-else class="confirm-btn loading-bg">
            <i class="iconfont iconrefresh loading"></i>
            {{ $t("i18n.confirm") }}
          </button>

          <div @click="cancel()" class="text-link">
            {{ $t("i18n.cancel") }}
          </div>
        </div>
      </div>
    </modal>

    <!-- 销毁弹窗 -->
    <modal
      height="auto"
      classes="common-modal"
      color="#49d663"
      :adaptive="true"
      :clickToClose="true"
      width="96%"
      :maxWidth="420"
      name="burn-panel"
    >
      <div class="modal-bg">
        <div class="modal-top">
          <img src="../assets/modal/burn.png" class="modal-logo" alt />
          <h5 class="modal-title">{{ $t("i18n.burn") }}</h5>
        </div>
        <div class="modal-desc">
          {{ $t("i18n.burnDesc") }}
        </div>
        <div class="divider"></div>
        <div class="modal-input">
          <span>{{ $t("i18n.debt") }}: {{ myDebt | fixedDeciaml2Str }}</span>
          <span class="float-right">
            {{ $t("i18n.ousdBal") }}:
            <span> {{ balanceObj["OUSD"] || 0 | fixedDeciaml2Str }} </span>
          </span>
          <div style="position: relative">
            <input
              type="number"
              class="input"
              v-model="burnAmount"
              :placeholder="$t('i18n.burnPlaceholder')"
            />
            <button @click="maxBurnInput()" class="max-button">
              {{ $t("i18n.max") }}
            </button>
          </div>
          <span class="float-right">
            {{ $t("i18n.minRatio") }}
            <span class="tips em">
              {{ $store.state.targetRatio | percent }}</span
            >
          </span>

          <span class="tips">
            {{ $t("i18n.currRatio") }}:
            <span
              :class="[
                'tips',
                'em',
                burnRatio < $store.state.targetRatio ? 'danger' : ''
              ]"
            >
              {{ burnRatio | percent }}</span
            >
            <br />
            <!-- <button
              class="small-btn confirm-btn"
              v-if="
                currentRatio < $store.state.targetRatio &&
                (ogxTotalBalance * price['OGX']) /
                  (parseFloat(myDebt) - parseFloat(balanceObj['OUSD'])) >
                  $store.state.targetRatio &&
                !isBurning
              "
              @click="burnToTarget()"
            >
              销毁至最低抵押率
            </button>
            <button
              v-else-if="
                currentRatio < $store.state.targetRatio &&
                (ogxTotalBalance * price['OGX']) /
                  (parseFloat(myDebt) - parseFloat(balanceObj['OUSD'])) >
                  $store.state.targetRatio &&
                isBurning
              "
              class="small-btn confirm-btn loading-bg"
            >
              销毁至最低抵押率
            </button> -->
          </span>
        </div>
        <div class="modal-action">
          <button v-if="leftSecondsToBurn > 0" class="confirm-btn loading-bg">
            {{ $t("i18n.burnAvaileAt", { canBurnTime: canBurnTime }) }}
          </button>
          <button
            v-else-if="
              !isBurning && +burnAmount > 0 && +burnAmount <= balanceObj['OUSD']
            "
            class="confirm-btn"
            @click="doBurn()"
          >
            {{ $t("i18n.confirm") }}
          </button>

          <button v-else-if="!isBurning" class="confirm-btn loading-bg">
            {{ $t("i18n.confirm") }}
          </button>
          <!-- <button
            v-else-if="!isBurning && burnRatio < $store.state.targetRatio"
            class="confirm-btn loading-bg"
          >
            {{ $t("i18n.confirm") }}
          </button> -->
          <button v-else class="confirm-btn loading-bg">
            <i class="iconfont iconrefresh loading"></i>
            {{ $t("i18n.confirm") }}
          </button>
          <div @click="cancel()" class="text-link">
            {{ $t("i18n.cancel") }}
          </div>
        </div>
      </div>
    </modal>

    <!-- LP modal -->

    <modal
      height="auto"
      classes="common-modal"
      color="#49d663"
      :adaptive="true"
      :clickToClose="true"
      width="96%"
      :maxWidth="420"
      name="lp-panel"
    >
      <div class="modal-bg">
        <div class="modal-top">
          <img src="../assets/modal/lp.png" class="modal-logo" alt />
          <h5 class="modal-title">{{ $t("i18n.lpReward") }}</h5>
        </div>
        <div class="modal-desc">
          {{ $t("i18n.lpRewardDesc") }}.
          <a
            class="green-link"
            :href="
              $i18n.locale === 'en'
                ? 'https://organix.gitbook.io/en/stake-ogx/how-to-get-the-market-making-reward'
                : 'https://organix.gitbook.io/cn/staking/ru-he-huo-de-zuo-shi-jiang-li'
            "
          >
            {{ $t("i18n.details") }} <i class="iconfont iconopen-link"></i>
          </a>
        </div>
        <div class="divider"></div>
        <div class="lp-list-wrap">
          <div v-for="lp in lpRewardList" class="lp-wrap wrap info">
            <div :class="lp.type || 'dfs'">
              <div class="lp-detail">
                <h4>
                  {{ lpPairMap[lp.id].token0.split("-")[0] }}-{{
                    lpPairMap[lp.id].token1.split("-")[0]
                  }}
                  <span class="lp-token-img">
                    <img :src="lpPairMap[lp.id].token0Url" alt="" />
                    <img :src="lpPairMap[lp.id].token1Url" alt="" />
                  </span>
                  <span class="float-right success-color">
                    APY: {{ lpRewardApy[lp.id] | percent }}</span
                  >
                </h4>

                <div class="divider"></div>
                <div v-if="nowTime > lp.start * 1000" class="lp-detail">
                  <div class="clearfix">
                    <div class="col-2 box">
                      <span
                        >Token:
                        {{
                          (myLpTokenObj[lp.id] && myLpTokenObj[lp.id].token) ||
                          0
                        }}
                      </span>
                      <br />

                      <button
                        @click="manageLP(lp.type, lp.id)"
                        class="primary-btn small-btn"
                      >
                        {{ $t("i18n.manage") }}
                        <i class="iconfont iconopen-link"></i>
                      </button>
                    </div>
                    <div class="col-2 box">
                      <span>
                        {{ $t("i18n.canClaimed") }}:
                        {{
                          myLpTokenObj[lp.id] &&
                          parseFloat(myLpTokenObj[lp.id].canClaim).toFixed(4)
                        }}
                        OGX</span
                      >
                      <br />
                      <button
                        v-if="
                          myLpTokenObj[lp.id] &&
                          parseFloat(myLpTokenObj[lp.id].canClaim) > 0
                        "
                        class="primary-btn small-btn"
                        @click="claimLp(lp.id)"
                      >
                        {{ $t("i18n.claim") }}
                      </button>
                      <button v-else class="primary-btn disabled small-btn">
                        {{ $t("i18n.claim") }}
                      </button>
                    </div>
                  </div>

                  <div class="divider"></div>
                  <div class="clearfix">
                    <div class="col-1">
                      <span>
                        {{ $t("i18n.currentEpochClaimed") }}:
                        {{
                          myLpTokenObj[lp.id] &&
                          parseFloat(
                            parseFloat(myLpTokenObj[lp.id].claimed) +
                              parseFloat(myLpTokenObj[lp.id].reward)
                          ).toFixed(4) + " OGX"
                        }}
                      </span>
                      <br />
                      <button
                        v-if="
                          myLpTokenObj[lp.id] &&
                          myLpTokenObj[lp.id].canClaimToEscrow
                        "
                        @click="claimLp(lp.id)"
                        class="primary-btn small-btn"
                      >
                        {{ $t("i18n.claimToEscrow") }}
                      </button>
                      <button class="primary-btn small-btn disabled" v-else>
                        {{
                          $t("i18n.claimToEscrowTip", {
                            claimTime:
                              myLpTokenObj[lp.id] &&
                              myLpTokenObj[lp.id].nextClaimTime
                          })
                        }}
                      </button>
                    </div>
                    <p
                      v-if="!(myLpTokenObj[lp.id] && myLpTokenObj[lp.id].token)"
                      class="tips"
                    >
                      {{ $t("i18n.dfsTips") }}
                    </p>
                  </div>
                </div>
                <div class="coming-div" v-else>
                  <h3>{{ $t("i18n.startAt") }}: {{ lp.start | formatTime }}</h3>
                </div>
              </div>
            </div>
          </div>

          <div class="lp-wrap wrap info disabled">
            <div class="defibox">
              <div class="lp-detail">
                <h4>
                  ???-???
                  <span class="lp-token-img">
                    <img
                      src="https://tp-statics.tokenpocket.pro/token/ogx/v2/OGX.png"
                      alt=""
                    />
                    <img
                      src="https://tp-statics.tokenpocket.pro/token/ogx/v2/OGX.png"
                      alt=""
                    />
                  </span>
                  <span class="float-right success-color"> APY: ???%</span>
                </h4>

                <div class="divider"></div>
                <div class="lp-detail">
                  <div class="col-2 box">
                    <span>Token: xxxx</span>
                    <br />

                    <button class="primary-btn small-btn">
                      {{ $t("i18n.manage") }}
                    </button>
                  </div>
                  <div class="col-2 box">
                    <span>{{ $t("i18n.reward") }}: ??? OGX</span>
                    <br />
                    <button class="primary-btn small-btn">
                      {{ $t("i18n.claim") }}
                    </button>
                  </div>
                </div>

                <p></p>
              </div>
            </div>
          </div>
        </div>

        <div @click="cancel()" class="text-link">
          {{ $t("i18n.cancel") }}
        </div>
      </div>
    </modal>

    <!-- LP modal end -->
    <!-- 交易弹窗 -->
    <!-- <modal
      height="auto"
      classes="common-modal swap-modal"
      color="#49d663"
      :adaptive="true"
      :clickToClose="true"
      width="96%"
      :maxWidth="420"
      name="swap-panel"
    >
      <div class="modal-bg">
        <div class="modal-top">
          <img src="../assets/modal/swap.png" class="modal-logo" alt />
          <h5 class="modal-title">{{ $t("i18n.exchange") }}</h5>
        </div>
        <div class="modal-desc">
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
          <div @click="cancel()" class="text-link">
            {{ $t("i18n.cancel") }}
          </div>
        </div>
      </div>
    </modal> -->

    <!-- 领取弹窗 -->
    <modal
      height="auto"
      classes="common-modal"
      color="#49d663"
      :adaptive="true"
      :clickToClose="true"
      width="96%"
      :maxWidth="420"
      name="claim-panel"
    >
      <div class="modal-bg">
        <div class="modal-top">
          <img src="../assets/modal/claim.png" class="modal-logo" alt />
          <h5 class="modal-title">{{ $t("i18n.claimReward") }}</h5>
        </div>
        <div class="modal-desc">
          {{ $t("i18n.claimRewardDesc") }}
        </div>
        <div class="divider"></div>
        <div class="modal-input">
          <span @click="showMsg($t('i18n.nextRoundRewardTip'))"
            >{{ $t("i18n.nextRoundReward") }} <i class="iconfont iconinfo"></i
          ></span>
          :
          <span class="float-right"
            >{{ $t("i18n.estApr") }}:
            <span class="tips em"> {{ estApr }} </span></span
          >
          <div class="clearfix"></div>
          <div class="row tips">
            <div class="col-2 box next">
              <h5>{{ $t("i18n.ogxReward") }}</h5>
              <p class="claim-amount">
                {{ estClaimableReward | fixedDeciaml2Str }}
                <br />OGX
              </p>
            </div>
            <div class="col-2 box next">
              <h5>{{ $t("i18n.feeReward") }}</h5>
              <p class="claim-amount">
                {{ estClaimableFee | fixedDeciaml2Str }}
                <br />OUSD
              </p>
            </div>
          </div>
          <span
            class="m-4 vertical-middle"
            @click="showMsg($t('i18n.claimRules'))"
            >{{ $t("i18n.currentClaimable") }}: <i class="iconfont iconinfo"></i
          ></span>
          <div class="clearfix"></div>

          <div v-if="!!isClaimedCurrentRound" class="box claimed">
            <i class="iconfont iconyes vertical-middle"></i>
            <span class="vertical-middle"> {{ $t("i18n.hasClaimed") }}</span>
          </div>
          <div v-else class="row tips">
            <div class="col-2 box">
              <h5>{{ $t("i18n.ogxReward") }}</h5>
              <p class="claim-amount">
                {{ claimableReward | fixedDeciaml2Str }}
                <br />OGX
              </p>
            </div>
            <div class="col-2 box">
              <h5>{{ $t("i18n.feeReward") }}</h5>
              <p class="claim-amount">
                {{ claimableFee | fixedDeciaml2Str }}
                <br />OUSD
              </p>
            </div>
          </div>
          <div class="row tips">
            {{ $t("i18n.deadline") }} :
            <span class="tips em">{{ claimEndTime }}</span> <br />
            <span @click="showMsg($t('i18n.deadlineTips'))">
              {{ $t("i18n.deadlineDesc") }} <i class="iconfont iconinfo"></i>
            </span>
          </div>
        </div>
        <div class="modal-action">
          <div v-if="!!isClaimedCurrentRound"></div>
          <button
            class="confirm-btn"
            v-else-if="
              (claimableFee || claimableReward) &&
              currentRatio >= $store.state.targetRatio &&
              !isClaiming
            "
            @click="doClaim()"
          >
            {{ $t("i18n.confirm") }}
          </button>

          <button
            class="confirm-btn loading-bg"
            v-else-if="
              (claimableFee || claimableReward) &&
              currentRatio >= $store.state.targetRatio &&
              isClaiming
            "
          >
            <i class="iconfont iconrefresh loading"></i>
            {{ $t("i18n.confirm") }}
          </button>
          <button
            class="confirm-btn loading-bg"
            v-else-if="claimableFee || claimableReward"
          >
            {{ $t("i18n.lowRatio") }}
          </button>
          <button v-else class="confirm-btn loading-bg">
            {{ $t("i18n.noReward") }}
          </button>
          <div @click="cancel()" class="text-link">
            {{ $t("i18n.cancel") }}
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

    <!-- 清算 弹窗 -->

    <!-- <modal
      height="auto"
      classes="common-modal"
      color="#49d663"
      :adaptive="true"
      :clickToClose="true"
      width="96%"
      :maxWidth="420"
      name="liquidation-panel"
    >
      <div class="modal-bg">
        <div class="modal-top">
          <img src="../assets/modal/burn.png" class="modal-logo" alt />
          <h5 class="modal-title">{{ $t("i18n.liquidation") }}</h5>
        </div>
        <div class="modal-desc">
          清算抵押率:
          <span class="tips em">{{
            $store.state.liquidationRatio | percent
          }}</span>
          <span class="float-right"
            >清算延迟:
            <span class="tips em"
              >{{ $store.state.liquidationDelay }} {{ $t("i18n.hour") }}
            </span>
          </span>
        </div>

        <div class="modal-input">
          <table v-if="liquidationList.length" class="liquidation-table">
            <tr>
              <th style="text-align: left">{{ $t("i18n.account") }}</th>
              <th style="text-align: right">{{ $t("i18n.liqDeadline") }}</th>
            </tr>
            <tr v-for="liq in liquidationList" v-bind:key="liq.account">
              <td style="text-align: left">
                {{ liq.account }}
              </td>
              <td style="text-align: right">
                {{ liq.deadline | formatTime }}
              </td>
            </tr>
          </table>
          <table v-else class="liquidation-table">
            <tr>
              <th style="text-align: left">{{ $t("i18n.account") }}</th>
              <th style="text-align: right">{{ $t("i18n.liqDeadline") }}</th>
            </tr>
            <tr>
              <td colspan="2" align="center" class="no-data">
                {{ $t("i18n.noData") }}
              </td>
            </tr>
          </table>
        </div>

        <div class="modal-action">
          <div @click="cancel()" class="text-link">
            {{ $t("i18n.cancel") }}
          </div>
        </div>
      </div>
    </modal> -->

    <!-- 弹窗结束 -->

    <!-- <div class="wrap header">
      <img src="../assets/logo2.png" class="main-logo vertical-middle" alt />
      <a
        href="https://tp-lab.tokenpocket.pro/kylin/index.html"
        target="_blank"
        class="vertical-middle"
        >{{ $t("i18n.testnet") }}</a
      >

      <div class="account">
        <div class="disc"></div>
        <span v-if="currentAccount" @click="logout">{{ currentAccount }}</span>
        <span v-else @click="login">{{ $t("i18n.login") }}</span>
      </div>
    </div> -->

    <!-- Header 结束 -->

    <div class="wrap info">
      <h4>
        <span v-if="$store.state.currentAccount">
          {{ $store.state.currentAccount || "-" }}
          <i @click="logout" class="iconfont iconexit"></i>
        </span>
        <span v-else @click="login"> {{ $t("i18n.login") }} </span>
        <!-- {{ $t("i18n.myWallet") }} -->
        <span
          @click="refresh()"
          class="float-right refresh-btn vertical-middle"
        >
          <span class="vertical-middle">{{ $t("i18n.refresh") }}</span>
          <i
            :class="[
              refreshing ? 'loading' : '',
              'vertical-middle',
              'icon',
              'refresh'
            ]"
          ></i>
        </span>
      </h4>
      <div class="info-part">
        <div
          :class="[
            currentRatio === '-'
              ? '-'
              : currentRatio >= $store.state.targetRatio
              ? ''
              : currentRatio > $store.state.liquidationRatio
              ? 'warning'
              : 'danger',
            'simple-percent ratio'
          ]"
        >
          {{ currentRatio | percent }}
        </div>
        <div>{{ $t("i18n.currentRatio") }}</div>

        <div class="price">1 OGX = ${{ price["OGX"] }}</div>
      </div>
      <div class="info-part">
        <div class="simple-percent">
          {{ $store.state.targetRatio | percent }}
        </div>
        <div @click="showMsg($t('i18n.whatisTargetRatio'))">
          {{ $t("i18n.targetRatio") }} <i class="iconfont iconinfo"></i>
        </div>

        <div class="price">1 EOS = ${{ price["OEOS"] }}</div>
      </div>
    </div>

    <div class="wrap info" v-if="haveOldToken">
      <p>
        <i class="iconfont iconinfo danger"></i>
        {{ $t("i18n.oldTokenDesc", { newContract: "core.ogx" }) }}
      </p>
      <button
        v-if="!isSwitchingOld"
        @click="exchangeOldToken()"
        class="confirm-btn"
      >
        {{ $t("i18n.exchangeOldBtn", { bal: oldTokenBal }) }}
      </button>
      <button v-else class="confirm-btn loading-bg">
        <i class="iconfont iconrefresh loading"></i>
        {{ $t("i18n.exchangeOldBtn", { bal: oldTokenBal }) }}
      </button>
    </div>

    <div class="wrap actions">
      <div class="clearfix">
        <div class="action-wrap info" @click="mint()">
          <div class="action">
            <img src="../assets/mint.png" alt />
          </div>
          <div class="action-text">{{ $t("i18n.mint") }}</div>
          <div class="action-desc">
            {{ $t("i18n.mint1") }} <br />{{ $t("i18n.mint2") }}
          </div>
        </div>
        <div class="action-wrap info" @click="burn()">
          <div class="action">
            <img src="../assets/burn.png" alt />
          </div>
          <div class="action-text">{{ $t("i18n.burn") }}</div>
          <div class="action-desc">
            {{ $t("i18n.burn1") }} <br />

            {{ $t("i18n.burn2") }}
          </div>
        </div>
      </div>
      <div class="clearfix">
        <div class="action-wrap info" @click="swap()">
          <div class="action">
            <img src="../assets/swap.png" alt />
          </div>
          <div class="action-text">{{ $t("i18n.exchange") }}</div>
          <div class="action-desc">
            {{ $t("i18n.exchange1") }} <br />{{ $t("i18n.exchange2") }}
          </div>
        </div>
        <div class="action-wrap info" @click="checkLP()">
          <div class="action">
            <img src="../assets/lp.png" alt />
          </div>
          <div class="action-text">{{ $t("i18n.lpReward") }}</div>
          <div class="action-desc">
            {{ $t("i18n.lpReward1") }} <br />{{ $t("i18n.lpReward2") }}
          </div>
        </div>
      </div>

      <div class="clearfix">
        <div class="action-wrap info" @click="claim()">
          <div class="action">
            <img src="../assets/claim.png" alt />
          </div>
          <div class="action-text">{{ $t("i18n.reward") }}</div>
          <div class="action-desc">
            {{ $t("i18n.reward1") }} <br />
            {{ $t("i18n.reward2") }}
          </div>
        </div>
      </div>

      <!-- <div class="action-wrap" @click="store()">
        <div class="action">
          <img src="../assets/store.png" alt />
        </div>
        <div class="action-text">{{ $t("i18n.store") }}</div>
      </div> -->
    </div>

    <div class="clearfix"></div>

    <!-- <div class="wrap">
      <h3>
        {{ $t("i18n.liquidationRatio") }}
        <i
          v-popover:tooltip.top="$t('i18n.liquidationDesc')"
          v-popover:width="200"
          class="iconfont iconinfo"
        ></i>

        <span class="float-right tips em">
          {{ $store.state.liquidationRatio | percent }}
        </span>
      </h3>
      <div class="wrap">
        <span class="text-link" @click="checkLiquidation()"
          >查看待清算列表</span
        >
      </div>
    </div> -->

    <!-- <div class="wrap footer">
      <button @click="goEx()" class="primary-btn">ORGANIX EXCHANGE</button>
    </div> -->

    <Tab></Tab>

    <!-- <div class="wrap global-info">
      <h3>我的信息</h3>
      <div>Entry: {{ myDebtInfo.debt_entry_index }}</div>
      <div>initialDebtOwner: {{ myDebtInfo.initial_debt_ownership }}</div>
      <div>initialDebt: {{ myDebtInfo && myDebtInfo.debt }}</div>
      <div>债务占比: {{ myDebtPercent }}</div>
    </div>

    <div class="wrap">
      <h3>总债务</h3>
      <div>lastDebt: {{ lastLedgerInfo && lastLedgerInfo.debt }}</div>
      <div>OUSD: {{ totalDebtInUsd }}</div>
    </div> -->
  </div>
</template>

<script>
import Home from "./home";
export default Home;
</script>

<style lang="less">
@import "./home.less";

.lp-list-wrap {
  max-height: 400px;
  overflow: auto;
}

.col-1 {
  padding: 2px 8px;
}

.coming-div {
  text-align: center;
  padding: 12px;
}

.lp-wrap {
  position: relative;
  margin: 12px 4px;
  padding: 8px;

  &.disabled {
    opacity: 0.1;
  }

  .tips {
    padding: 2px 8px;
  }

  .lp-detail {
    h4 {
      margin-left: 30px;
    }

    .box {
      text-align: center;

      span {
        margin: 4px 0;
        display: inline-block;
        vertical-align: middle;
        line-height: 24px;
      }

      button.small-btn {
        display: inline-block;
      }
    }

    p {
      margin: 0;
    }
  }

  > div {
    min-height: 72px;
  }

  .lp-token-img {
    vertical-align: middle;
    display: inline-block;
    margin-left: 8px;
    // position: absolute;
    // bottom: 12px;
    // left: 24px;

    img {
      width: 18px;
      height: 18px;
      float: left;
      border-radius: 100px;
      margin-left: -4px;
    }
  }

  .dfs {
    background: url("../assets/dfs-icon.png") no-repeat;
    background-size: auto 24px;
  }

  .defibox {
    background: url("../assets/box-icon.png") no-repeat;
    background-size: auto 24px;
  }
}
</style>