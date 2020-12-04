<template>
  <div :class="'rank ' + this.$i18n.locale">
    <mt-tabbar v-model="selected" :fixed="true">
      <mt-tab-item @click.native="go('home')" id="home">
        <i slot="icon" class="iconfont iconhome"></i>
        {{ $t("i18n.home") }}
      </mt-tab-item>
      <mt-tab-item @click.native="go('overview')" id="overview">
        <i slot="icon" class="iconfont iconpie-chart"></i>
        {{ $t("i18n.dashboard") }}
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
import mixins from "../mixin";

export default {
  mixins: [mixins],
  data() {
    return {};
  },
  created() {
    this.selected = "rank";
  }
};
</script>

<style scoped lang="less">
</style>
