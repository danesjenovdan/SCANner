// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import vueResource from 'vue-resource';
import VueAffix from 'vue-affix';
import App from './App';
import router from './router';

Vue.config.productionTip = false;

Vue.use(vueResource);
Vue.use(VueAffix);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
