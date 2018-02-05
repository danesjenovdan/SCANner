import Vue from 'vue';
import Router from 'vue-router';
import Listing from '@/components/pages/Listing';
import Analysis from '@/components/pages/Analysis';

Vue.use(Router);

export default new Router({
  mode: 'history',

  routes: [
    {
      path: '/',
      name: 'Listing',
      component: Listing,
    },
    {
      path: '/analiza/:analysisId',
      name: 'Analysis',
      component: Analysis,
    },
  ],
});
