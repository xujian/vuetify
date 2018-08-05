<template>
  <v-navigation-drawer temporary :right="right" 
    :value="asideState"
    @input="setAside"
    fixed app>
    <v-toolbar flat prominent dark class="primary">
      <v-toolbar-title>Notifications</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click.stop="rightDrawer = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-list subheader dense>
      <v-subheader>All notifications</v-subheader>
      <v-list-tile>
        <v-list-tile-action>
          <v-icon>person_add</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>
          12 new users registered
        </v-list-tile-title>
      </v-list-tile>
      <v-divider></v-divider>
      <v-list-tile>
        <v-list-tile-action>
          <v-icon>data_usage</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>
          DB overloaded 80%
        </v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>
<script>
import {mapGetters, mapMutations} from 'vuex'

export default {
  name: 'HsbAside',
  computed: {
    ...mapGetters(['asideState'])
  },
  data () {
    return {
      right: true,
      rightDrawer: false
    }
  },
  methods:{
    ...mapMutations(['setAside'])
  }
}
</script>
