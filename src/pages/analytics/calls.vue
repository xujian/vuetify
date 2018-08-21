<template>
  <div class="sankey-page page">
    <h1>应用调用关系图</h1>
      <v-layout row wrap>
        <v-flex xs12 sm3>
          <hsb-period-select v-model="timeSelected" />
        </v-flex>
        <v-flex xs12 sm3>
          <hsb-app-select :options="appSelectOptions" v-model="appsSelected" />
        </v-flex>
        <v-flex xs12 sm3>
          <v-checkbox
            v-model="includesNonStandard"
            label="包含非规范节点"
            @change="query()" />
      </v-flex>
    </v-layout>
    <sankey-chart :value="sankeyData" :levels="5"></sankey-chart>
  </div>
</template>

<script>
import SankeyChart from '@/components/charts/sankey/index'
import HsbPeriodSelect from '@/components/form/period-select'
import HsbAppSelect from '@/components/form/app-select'

/**
 * 调用接口获取数据并格式化
 * 将数据输出到sankey-chart
 */
export default {
  data() {
    return {
      sankeyData: {
        links: [],
        nodes: []
      },
      appSelectOptions: [],
      appsSelected: [],
      timeSelected: 4,
      includesNonStandard: false,
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
      let params = {
        time: this.timeSelected,
        apps: this.appsSelected,
        channel: 1
      }
      this.$api.call('/calls', {data: params}).then(response => {
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
        if (!this.includesNonStandard) this.excludeNonStandard()
        if(this.appSelectOptions.length === 0) {
          this.appSelectOptions = nodes.filter(n => n.level === 0)
        }
      })
    },
    excludeNonStandard() {
      let nodeLevels = {}
      this.sankeyData.nodes.forEach(n => {
        nodeLevels[n.name] = n.level
      })
      this.sankeyData.nodes = this.sankeyData.nodes.filter(n => nodeLevels[n.name] != -2)
      this.sankeyData.links = this.sankeyData.links.filter(l => nodeLevels[l.source] !== -2 && nodeLevels[l.target] !== -2)
    }
  },
  components: {
    SankeyChart,
    HsbPeriodSelect,
    HsbAppSelect
  }
}
</script>
