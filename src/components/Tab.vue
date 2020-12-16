<template>
  <div>
    <mt-tabbar v-model="$store.state.selected" :fixed="true">
      <mt-tab-item @click.native="go('home')" id="home">
        <i slot="icon" class="iconfont iconhome"></i>
        {{ $t("i18n.home") }}
      </mt-tab-item>
      <mt-tab-item @click.native="go('overview')" id="overview">
        <i slot="icon" class="iconfont iconpie-chart"></i>
        {{ $t("i18n.dashboard") }}
      </mt-tab-item>
      <mt-tab-item @click.native="go('exchange')" id="exchange">
        <i slot="icon" class="iconfont iconexchange"></i>
        {{ $t("i18n.exchange") }}
      </mt-tab-item>
      <mt-tab-item @click.native="go('store')" id="store">
        <i slot="icon" class="iconfont iconstore"></i>
        {{ $t("i18n.store") }}
      </mt-tab-item>
      <mt-tab-item @click.native="go('me')" id="me">
        <i slot="icon" class="iconfont iconme"></i>
        {{ $t("i18n.me") }}
      </mt-tab-item>
    </mt-tabbar>
  </div>
</template>
<script>
export default {
  name: "tab",
  methods: {
    go(tab) {
      this.$store.commit("setSelectedTab", { selected: tab });
      this.$router.push(tab);

      if (_hmt) {
        try {
          _hmt.push([
            "_trackEvent",
            "tabClick",
            tab,
            this.$store.state.currentAccount || "guest"
          ]);
        } catch (err) {}
      }
    }
  }
};
</script>
<style scoped lang="less">
.iconfont {
  font-size: 18px;
}
</style>
