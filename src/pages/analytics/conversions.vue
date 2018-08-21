<template>
  <div class="sankey-page page">
    <h1>关键路径转化率</h1>
      <v-layout row wrap>
        <v-flex xs12 sm3>
          <hsb-period-select v-model="timeSelected" />
        </v-flex>
        <v-flex xs12 sm3>
          <hsb-app-select :options="appSelectOptions" v-model="appsSelected" />
        </v-flex>
    </v-layout>
    <sankey-chart :value="sankeyData" :levels="7"></sankey-chart>
  </div>
</template>

<script>
import SankeyChart from '@/components/charts/sankey/index'
import HsbPeriodSelect from '@/components/form/period-select'
import HsbAppSelect from '@/components/form/app-select'

export default {
  data() {
    return {
      sankeyData: {
        links: [],
        nodes: []
      },
      appSelectOptions: [],
      appsSelected: [],
      timeSelected: 4
    }
  },
  mounted() {
    this.query();
  },
  watch: {
    timeSelected () {
      this.query()
    },
    appSelected () {
      this.query()
    }
  },
  methods: {
    query() {
      this.$api.call('/calls', {data: {
        time: this.timeSelected,
        apps: this.appsSelected,
        channel: 2
      }}).then(response => {
        let list = response.list, links = [], nodes = []
        list.forEach((n) => {
          nodes.push({
            id: n.id,
            name: n.node_name,
            level: n.node_level - 1,
            order: n.node_pos
          })
          n.next_nodes.forEach((t, i) => {
            links.push({
              source: n.node_name,
              target: t.node_name,
              calls: t.call_count,
              time: t.average_time,
              healthy: t.success_rate
            })
          })
        })
        this.sankeyData = {
          nodes: nodes,
          links: links
        }
        if(this.appSelectOptions.length === 0) {
          this.appSelectOptions = nodes.filter(n => n.level === 0)
        }
      })
    }
  },
  components: {
    SankeyChart,
    HsbPeriodSelect,
    HsbAppSelect
  }
}
</script>
