<template>
  <v-toolbar app flat dense color="primary" dark>
    <v-toolbar-side-icon @click.stop="toggleNav()" 
    class="hidden-lg-and-up" 
    :class="searching ? 'hidden-xs-only' : ''" />
    <v-menu :nudge-width="100" :class="searching ? 'hidden-xs-only' : ''">
      <v-toolbar-title slot="activator" class="pl-2">
        <span>{{ menuItems[0] }}</span>
        <v-icon>arrow_drop_down</v-icon>
      </v-toolbar-title>
      <v-list>
        <v-list-tile v-for="item in menuItems" :key="item">
          <v-list-tile-title v-text="item"></v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
    <v-spacer></v-spacer>

    <v-btn icon @click.native.stop="searchBegin">
      <v-icon>search</v-icon>
    </v-btn>
    <div :class="{'searching--closed': !searching}" class="searching">
      <v-text-field id="search" v-model="search" append-icon="close" :append-icon-cb="searchEnd" label="Search" hide-details single-line
        color="white" @blur="onBlur" />
    </div>

    <v-tooltip bottom>
      <v-btn icon @click.stop="toggleAside()" slot="activator">
        <v-badge color="red" overlap>
          <span slot="badge">2</span>
          <v-icon>notifications</v-icon>
        </v-badge>
      </v-btn>
      <span>2 unread notifications</span>
    </v-tooltip>

    <v-menu bottom left v-if="false">
      <v-btn icon slot="activator">
        <v-avatar class="white" size="32">
          <v-icon color="primary">person</v-icon>
        </v-avatar>
      </v-btn>
      <v-list class="pa-0">
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <v-avatar class="primary" size="48px">
              <v-icon dark>person</v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>John Doe</v-list-tile-title>
            <v-list-tile-sub-title>Administrator</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider></v-divider>

        <v-list-tile key="profile">
          <v-list-tile-action>
            <v-icon>person</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>My Profile</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider></v-divider>

        <v-list-tile key="lock_open">
          <v-list-tile-action>
            <v-icon>lock_open</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Logout</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-toolbar>
</template>
<script>
import {mapMutations} from 'vuex'

export default {
  name: 'HsbToolbar',
  data () {
    return {
      drawer: true,
      rightDrawer: false,
      search: '',
      searching: false,
      tabs: null,
      menuItems: [
        'DA'
      ],
      tabsItems: [{
          id: 1,
          title: 'Indicators',
          link: 'indicators'
        },
        {
          id: 2,
          title: 'Backup',
          link: 'backup'
        },
        {
          id: 3,
          title: 'Logs',
          link: 'logs'
        }
      ],
    }
  },
  computed: {
  },
  methods: {
    ...mapMutations(['toggleNav', 'toggleAside']),
    onBlur() {
      this.searching = false
      this.search = ''
    },
    searchBegin() {
      this.searching = true
      setTimeout(() => document.querySelector('#search').focus(), 50)
    },
    searchEnd() {
      this.searching = false
      this.search = ''
      document.querySelector('#search').blur()
    }
  }
}
</script>
<style lang="stylus" scoped>
  @import '~vuetify/src/stylus/settings/_variables.styl' 
  .searching {
    overflow: hidden;
    width: 208px;
    padding-left: 8px;
    transition: $primary-transition;
  }

  .searching--closed {
    padding-left: 0;
    width: 0;
  }

  .searching>* {
    right: 8px;
  }

  .searching--closed>* {
    display: none;
  }

  .hidden-searching {
    @media $display-breakpoints.sm-and-down {
      display: none !important;
    }
  }
</style>
