<template>
  <div id="app">
    <modal
      height="auto"
      classes="common-modal"
      color="#49d663"
      :adaptive="true"
      :clickToClose="true"
      width="98%"
      :maxWidth="420"
      name="node-panel"
    >
      <div class="modal-bg">
        <div class="modal-top">
          <h5 class="modal-title" style="margin: 24px 0 8px">
            {{ $t("i18n.changeNode") }}
          </h5>
          <div class="node-wrap">
            <div
              class="node-list"
              v-for="(node, index) in nodeList"
              v-bind:key="index"
              @click="handleCheck(node, index)"
            >
              <div class="radio" :class="{ active: radio === index }">
                <i class="icon-radio"></i> <span>{{ node }}</span>
              </div>
            </div>
            <div class="node-list" @click="handleCheck('', nodeList.length)">
              <div class="radio" :class="{ active: radio === nodeList.length }">
                <i class="icon-radio"></i><span>{{ $t("i18n.custom") }}：</span>
                <span
                  ><input
                    class="input"
                    style="width: 150px; padding: 2px 4px"
                    type="text"
                    v-model="customNode"
                    placeholder="https://..."
                /></span>
              </div>
            </div>
          </div>
          <button class="confirm-btn" @click="doChangeNode()">
            {{ $t("i18n.confirm") }}
          </button>

          <div @click="cancel()" class="text-link">
            {{ $t("i18n.cancel") }}
          </div>
        </div>
      </div>
    </modal>
    <div class="wrap header">
      <img src="./assets/logo2.png" class="main-logo vertical-middle" alt />
      <!-- <a
        href="https://tp-lab.tokenpocket.pro/kylin/index.html"
        target="_blank"
        class="vertical-middle float-right"
        style="position: relative; top: 12px"
        >{{ $t("i18n.testnet") }}</a
      > -->

      <span @click="changeNode()" class="node-switch float-right">
        {{ $t("i18n.changeNode") }}
      </span>

      <span class="lang-switch float-right">
        <a
          v-if="this.$i18n.locale === 'zh'"
          @click="setLang('en')"
          href="javascript:;"
          >En</a
        >
        <a v-else @click="setLang('zh')" href="javascript:;">中</a>
      </span>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {
      nodeList: [
        "https://eos.greymass.com",
        "https://eos.newdex.one",
        "https://eos.blockeden.cn",
        "https://eospush.tokenpocket.pro",
        "https://api.eoslaomao.com",
        "https://api.eosn.io",
        "https://api.eossweden.se",
        "https://nodes.get-scatter.com",
        "https://mainnet.meet.one"
      ],
      radio: 0,
      node: "",
      customNode: ""
    };
  },
  created() {
    if (localStorage.getItem("node")) {
      var isCustom = true;
      this.nodeList.forEach((item, i) => {
        if (item === localStorage.getItem("node")) {
          this.radio = i;
          this.node = item;
          isCustom = false;
        }
      });

      if (isCustom) {
        this.radio = this.nodeList.length;
        this.node = localStorage.getItem("node");
        this.customNode = this.node;
      }
    } else {
      localStorage.setItem("node", this.nodeList[this.radio]);
      this.node = this.nodeList[this.radio];
    }
  },
  methods: {
    changeNode() {
      this.$modal.show("node-panel");
    },
    setLang(lang) {
      this.$i18n.locale = lang;
      localStorage.setItem("locale", lang);
    },
    handleCheck(node, index) {
      this.radio = index;
      if (index !== this.nodeList.length) {
        this.node = this.nodeList[index];
      } else {
        this.node = "";
      }
    },
    cancel() {
      this.$modal.hide("node-panel");
    },
    doChangeNode() {
      if (this.radio === this.nodeList.length && !this.customNode) {
        alert(this.$t("i18n.wrongNode"));
        return;
      } else if (this.radio === this.nodeList.length && this.customNode) {
        if (this.customNode.indexOf("http") === -1) {
          alert(this.$t("i18n.wrongNode"));
          return;
        }
        localStorage.setItem("node", this.customNode);
      } else {
        localStorage.setItem("node", this.node);
      }

      location.reload();
    }
  }
};
</script>

<style lang="less">
@mainColor: linear-gradient(225deg, #3fee9d 0%, #30d3e3 100%);
@mainSingleColor: #1dcea5;
@dangerColor: linear-gradient(225deg, #e83a3a 0%, #da1717 100%);
@dangerSingleColor: #e83a3a;
@warningColor: linear-gradient(225deg, #ecbe3b 0%, #eaac29 100%);
@warningSingleColor: #ecbe3b;
// @backgroundColor: #2a3238;
@backgroundColor: #1c2125;

@normalColor: #acb0cc;

.colored() {
  color: @mainSingleColor;
  background-image: @mainColor;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dangerColored() {
  color: @dangerSingleColor;
  background-image: @dangerColor;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.warningColored() {
  color: @warningSingleColor;
  background-image: @warningColor;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.backgroundColored() {
  background: @mainColor;
}

html,
body {
  padding: 0;
  margin: 0;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  background-color: #161920;
  font-size: 13px;
}
ul {
  list-style: none;
  padding: 0;
}
.float-right {
  float: right;
}

.vertical-middle {
  display: inline-block;
  vertical-align: middle;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro SC", "SF Pro Text",
    "Helvetica Neue", Helvetica, "PingFang SC", "Segoe UI", Roboto,
    "Hiragino Sans GB", "arial", "microsoft yahei ui", "Microsoft YaHei", SimSun,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #acb0cc;
  max-width: 560px;
  margin: 0 auto;
  margin-bottom: 100px;

  .v--modal-overlay {
    background: rgba(0, 0, 0, 0.8);
  }

  .mint-tabbar {
    background: #11141a;
    box-shadow: 0 -2px 10px 0 #040404;
    border-top: 1px solid #22262b;
    max-width: 560px;
    left: 0;
    right: 0;
    margin: auto;
  }

  .mint-tab-item {
    padding-bottom: 16px;
  }

  .mint-tab-item-icon {
    font-size: 18px;
  }

  .mint-tabbar > .mint-tab-item.is-selected {
    background: #11141a;
    color: #1dcea5;
  }

  .mint-tab-item-icon > * {
    display: inline-block;
  }

  .vue-popover {
    background: #000;
    color: #fff;
    padding: 8px;
  }

  .label {
    color: #75788c;
  }
}

.divider {
  border-bottom: 1px solid #2c303e;
  margin: 8px 0;
}

.node-wrap {
  padding: 16px 8px;
}

.node-list {
  text-align: left;
  font-size: 16px;
  margin-bottom: 10px;

  span {
    vertical-align: middle;
    display: inline-block;
  }
}

.active {
  .icon-radio {
    background: #1dcea5;
  }
}

.icon-radio {
  width: 10px;
  height: 10px;
  display: inline-block;
  border-radius: 100%;
  background: #fff;
  border: 2px solid #fff;
  vertical-align: middle;
  margin-right: 8px;
}

.inline-block {
  display: inline-block;
  vertical-align: middle;
}

.node-switch {
  border: 1px solid #203436;
  border-radius: 100px;
  padding: 2px 8px;
  position: relative;
  top: 8px;
  margin-left: 12px;
}

.lang-switch {
  border: 1px solid #203436;
  border-radius: 100px;
  padding: 2px 8px;
  position: relative;
  top: 8px;

  a {
    text-decoration: none;
  }
}

.align-right {
  text-align: right;
}

.danger-color {
  .dangerColored();
}

.m-4 {
  margin-bottom: 4px;
}

.iconfont {
  font-size: 14px;
}

.iconfont.iconinfo {
  font-size: 14px;
  top: 1px;
  position: relative;
}

.success-color {
  color: @mainSingleColor;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
input[type="number"] {
  -moz-appearance: textfield;
}

input::-webkit-input-placeholder {
  color: #acb0cc;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #2980fe;
    }
  }
}

button.disabled {
  background: #ccc !important;
  color: #fff;
  border: #ddd;
}

.iconfont.iconopen-link {
  font-size: 12px;
}

a,
input,
button {
  outline: none;
}

a {
  color: #acb0cc;
  text-decoration: underline;
}

p {
  margin: 8px 0;
}
.clearfix {
  overflow: hidden;
  clear: both;
}

@media screen and (max-width: 360px) {
  .node-wrap {
    padding: 4px;
  }
  .node-list {
    margin-bottom: 6px;
  }
}
</style>
