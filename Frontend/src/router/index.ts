import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import AppLayout from "@/shared/layouts/AppLayout.vue";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/modules/auth/views/LoginView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "projects",
        component: () =>
          import("@/modules/projects/views/ProjectsListView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "projects",
        redirect: { name: "projects" },
      },
      {
        path: '/tickets',
        name: 'tickets',
        component: () => import("@/modules/tickets/views/TicketsListView.vue")
      },
      {
        path: "tickets/:id",
        name: "ticket-detail",
        component: () => import("@/modules/tickets/views/TicketDetailView.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "login" };
  }

  if (to.name === "login" && authStore.isAuthenticated) {
    return { name: "projects" };
  }

  return true;
});

export default router;
