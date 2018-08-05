<template>
  <v-app>
    <hsb-nav :active="nav"></hsb-nav>
    <hsb-toolbar></hsb-toolbar>
    <v-content>
      <router-view />
    </v-content>
    <hsb-aside></hsb-aside>
  </v-app>
</template>

<script>
  import HsbNav from "@/components/ui/nav"
  import HsbToolbar from "@/components/ui/toolbar"
  import HsbAside from "@/components/ui/aside"

  export default {
    name: 'DefaultLayout',
    data() {
      return {
        nav: false
      }
    },
    methods: {
    },
    components: {
      HsbNav,
      HsbToolbar,
      HsbAside
    }
  }

</script>

<style scoped lang="stylus">
  .bottom-menu {
    position: absolute;
    width: 100%;
    bottom: 0;
  }

  .list-border-bottom {
    border-bottom: 1px solid rgba(255, 255, 255, .12);
  }

</style>
