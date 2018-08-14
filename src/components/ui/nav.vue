<template>
  <v-navigation-drawer width="250" class="blue-grey darken-4" 
      dark persistent :mini-variant="miniVariant" 
      :value="navState"
      @input="setNav"
      fixed app>
      <v-toolbar flat class="transparent" dense>
        <v-list class="pa-0" :class="{'list-border-bottom' : miniVariant}">
          <v-list-tile>
            <v-list-tile-action v-if="!miniVariant">
              <v-icon large color="orange">invert_colors</v-icon>
            </v-list-tile-action>
            <v-list-tile-content v-if="!miniVariant">
              <v-list-tile-title>
                <h2>Vuebase</h2>
              </v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon @click.stop="miniVariant = !miniVariant">
                <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-divider></v-divider>

      <v-tooltip right :disabled="!miniVariant">
        <v-toolbar flat class="transparent" dense slot="activator">
          <v-list class="pa-0" :class="{'list-border-bottom' : miniVariant}">
            <v-list-tile to="/" exact>
              <v-list-tile-action>
                <v-icon>home</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Project Overview</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-toolbar>
        <span>Project Overview</span>
      </v-tooltip>
      <v-divider></v-divider>

      <v-list subheader :class="{'list-border-bottom' : miniVariant}">
        <v-subheader>ANALYTICS</v-subheader>
        <template v-for="item in analyticsItems">
          <v-tooltip right :disabled="!miniVariant">
            <v-list-tile :key="item.icon" :to="item.link" exact slot="activator">
              <v-list-tile-action>
                <v-icon v-html="item.icon"></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title v-text="item.title"></v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <span v-text="item.title"></span>
          </v-tooltip>
        </template>
      </v-list>
      <v-divider></v-divider>

      <v-list subheader>
        <v-subheader>DEVELOP</v-subheader>
        <template v-for="item in developItems">
          <v-tooltip right :disabled="!miniVariant">
            <v-list-tile :key="item.icon" :to="item.link" exact slot="activator">
              <v-list-tile-action>
                <v-icon v-html="item.icon"></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title v-text="item.title"></v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <span v-text="item.title"></span>
          </v-tooltip>
        </template>
      </v-list>
      <!--<v-divider></v-divider>-->
    </v-navigation-drawer>
</template>
<script>
import {mapGetters, mapMutations} from 'vuex'

export default {
  name: 'HsbNav',
  props: {
    active: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['navState'])
  },
  data () {
    return {
      actived: this.active,
      miniVariant: false,
      analyticsItems: [{
          icon: 'dashboard',
          title: '应用关系图',
          link: '/dashboard/calls'
        }
      ],
      developItems: [/*{
          icon: 'supervisor_account',
          title: 'Authentification',
          link: ''
        },
        {
          icon: 'storage',
          title: 'Database',
          link: ''
        },
        {
          icon: 'perm_media',
          title: 'Storage',
          link: ''
        },
        {
          icon: 'public',
          title: 'Hosting',
          link: ''
        },
        {
          icon: 'functions',
          title: 'Functions',
          link: ''
        }*/
      ] 
    }
  },
  methods: {
    ...mapMutations(['setNav'])
  }
}
</script>
