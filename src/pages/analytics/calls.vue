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
      this.$api.call('/calls', {data: {
        time: this.timeSelected,
        apps: this.appsSelected,
        channel: 1
      }}).then(response => {
        this.sankeyData = {
          nodes: response.nodes,
          links: response.links
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
