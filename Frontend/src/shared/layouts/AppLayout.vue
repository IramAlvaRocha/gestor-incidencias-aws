<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Ticket,
} from '@lucide/vue';
import { useLogout } from '@/modules/auth/composables/useLogout';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const route = useRoute();
const authStore = useAuthStore();
const { mutate: doLogout, isPending } = useLogout();

const initials = computed(() => {
  const name = authStore.user?.name?.trim() ?? '?';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
});

const navItems = [
  { title: 'Proyectos', name: 'projects', icon: FolderKanban },
  { title: 'Tickets', name: 'tickets', icon: Ticket },
] as const;
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader class="gap-3 px-3 py-4">
        <RouterLink
          :to="{ name: 'projects' }"
          class="flex items-center gap-2.5 rounded-lg px-1 outline-none ring-sidebar-ring focus-visible:ring-2"
        >
          <div
            class="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm"
          >
            <LayoutDashboard class="size-4" />
          </div>
          <div class="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span class="truncate text-sm font-semibold tracking-tight">Arena</span>
            <span class="text-muted-foreground truncate text-[11px]">Incidencias</span>
          </div>
        </RouterLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Espacio de trabajo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in navItems" :key="item.name">
                <SidebarMenuButton
                  as-child
                  :is-active="route.name === item.name || (item.name === 'projects' && route.name === 'project-tickets')"
                  :tooltip="item.title"
                >
                  <RouterLink :to="{ name: item.name }">
                    <component :is="item.icon" />
                    <span>{{ item.title }}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter class="gap-2 p-3">
        <Separator class="bg-sidebar-border" />
        <div class="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Avatar class="size-8 border border-sidebar-border">
            <AvatarFallback class="bg-sidebar-accent text-xs font-semibold">
              {{ initials }}
            </AvatarFallback>
          </Avatar>
          <div class="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p class="truncate text-sm font-medium leading-tight">
              {{ authStore.user?.name }}
            </p>
            <p class="text-muted-foreground truncate text-[11px]">
              {{ authStore.user?.role }}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            class="text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:hidden"
            :disabled="isPending"
            :title="isPending ? 'Saliendo...' : 'Cerrar sesión'"
            @click="doLogout()"
          >
            <LogOut />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header
        class="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/80 bg-background/80 px-4 backdrop-blur-md"
      >
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-1 h-4" />
        <div class="min-w-0">
          <p class="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            Arena
          </p>
          <h1 class="truncate text-sm font-semibold">
            {{ route.meta.title ?? 'Espacio de trabajo' }}
          </h1>
        </div>
      </header>

      <main class="flex flex-1 flex-col p-4 md:p-6">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
