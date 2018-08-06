<template>
  <div class="chart-container">
    <sankey-chart></sankey-chart>
  </div>
</template>

<script>
import LineChart from '@/components/charts/line'
import SankeyChart from '@/components/charts/sankey'

export default {
  components: {
    LineChart,
    SankeyChart
  }
}
</script>
