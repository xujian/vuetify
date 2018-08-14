<template>
  <div class="sankey-page page">
    <h1>应用调用关系图</h1>
    <p>&nbsp;</p>
    <sankey-chart :value="sankeyData"></sankey-chart>
  </div>
</template>

<script>
import SankeyChart from '@/components/charts/sankey/index'
import {json} from 'd3-fetch';
import axios from 'axios'

export default {
  data() {
    return {
      sankeyData: {
        links: [],
        nodes: []
      }
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      this.$api.call('/calls').then(response => {
        let list = response.list, links = [], nodes = []
        list.forEach((n) => {
          nodes.push({
            name: n.node_name,
            level: n.node_level
          })
          n.next_nodes.forEach((t, i) => {
            links.push({
              source: n.node_name,
              target: t.node_name,
              value: Math.max(100000, t.call_count),
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
      })
    }
  },
  components: {
    SankeyChart
  }
}
</script>
