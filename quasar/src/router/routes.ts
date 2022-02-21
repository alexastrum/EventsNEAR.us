import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'about', component: () => import('pages/About.vue') },
      {
        path: 'search',
        component: () => import('pages/Search.vue'),
        props: (route) => ({ query: route.query.q }),
      },
      { path: 'events', component: () => import('pages/Events.vue') },
      { path: 'my-events', component: () => import('pages/MyEvents.vue') },
      {
        path: 'event/:eventId',
        component: () => import('pages/Event.vue'),
        props: true,
      },
      {
        path: 'organize/:eventId?',
        component: () => import('pages/Organize.vue'),
        props: (route) => ({
          hash: route.query.transactionHashes,
          eventId: route.params.eventId,
        }),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
