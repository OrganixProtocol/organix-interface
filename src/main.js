import Vue from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n/index'
import store from './store'
import VModal from 'vue-js-modal'
import VPopover from 'vue-js-popover'
import { Tabbar, TabItem } from 'mint-ui';
import 'mint-ui/lib/style.css'

Vue.component(Tabbar.name, Tabbar);
Vue.component(TabItem.name, TabItem);


Vue.use(VPopover, { tooltip: true })

Vue.use(VModal)

Vue.config.productionTip = false

new Vue({
  i18n,
  store,
  router,
  render: h => h(App)
}).$mount('#app')
