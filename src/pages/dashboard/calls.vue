<template>
  <div class="sankey-page page">
    <h1>应用调用关系图</h1>
      <v-layout row wrap>
      <v-flex xs12 sm6>
        <v-select
            :items="timeOptions"
            :value="4"
            @change="timeSelectChange"
            label="时间段"
          ></v-select>
      </v-flex>
      <v-flex xs12 sm6>
          <v-select
            multiple
            :items="appOptions"
            item-text="name"
            item-value="name"
            :value="appsSelected"
            @change="appSelectChange"
            label="按应用筛选"
          >
        </v-select>
      </v-flex>
    </v-layout>
    <sankey-chart :value="sankeyData"></sankey-chart>
  </div>
</template>

<script>
import SankeyChart from '@/components/charts/sankey/index'
import axios from 'axios'

export default {
  data() {
    return {
      sankeyData: {
        links: [],
        nodes: []
      },
      appOptions: [],
      appsSelected: [],
      timeSelected: 4,
      timeOptions: [
        {
            value: 1,
            text: '最近5分钟'
        }, {
            value: 2,
            text: '最近一个小时'
        }, {
            value: 3,
            text: '最近一天'
        }, {
            value: 4,
            text: '最近一周'
        }, {
            value: 5,
            text: '最近一个月'
        }, {
            value: 6,
            text: '最近一个季度'
        }, {
            value: 6,
            text: '最近一年'
        }
      ]
    }
  },
  mounted() {
    this.query();
  },
  methods: {
    timeSelectChange(value) {
      this.timeSelected = value
      this.query()
    },
    appSelectChange(value) {
      this.appsSelected = value
      this.query()
    },
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
        if(this.appOptions.length === 0) {
          this.appOptions = nodes.filter(n => n.level === 1)
        }
      })
    }
  },
  components: {
    SankeyChart
  }
}
</script>
