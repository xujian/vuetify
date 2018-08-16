<template>
  <div>
    <v-toolbar
        dense
        tabs
        color="primary"
        dark
    >
      <v-tabs
          v-model="tabs"
          color="transparent"
          slider-color="white"
          slot="extension"
      >
        <v-tab
            v-for="tabsItem in tabsItems"
            :key="tabsItem.id"
            :to="tabsItem.link"
        >
          <span class="pl-2 pr-2">{{ tabsItem.title }}</span>
        </v-tab>
      </v-tabs>
    </v-toolbar>

    <v-container class="page-content">
      <v-layout row>
        <v-flex xs12>
          <v-slide-y-transition mode="out-in">
            <router-view />
          </v-slide-y-transition>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
  return {
    tabs: null,
    tabsItems: [
    { id: 1, title: "调用拓扑", link: "calls" },
    { id: 2, title: "关键路径", link: "conversions" }
    ]
  };
  }
};
</script>

<style>
.container.page-content {
  max-width: 1280px 
}
</style>
