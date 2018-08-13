<template>
  <hsb-svg :width="width" :height="height">
    <g ref="root" :class="{'dim':dim}" v-if="formatedData">
      <g class="links" ref="links">
        <g class="link" v-for="(link, i) in formatedData.links"
          :key="i">
          <path class="link-path"
            :class="{'hovered': link.hovered}"
            :d="link.d" 
            :stroke="link.stroke"
            :stroke-width="link.strokeWidth">
              <title>{{link.title}}</title>
            </path>
        </g>
      </g>
      <g class="nodes" ref="nodes">
        <g class="node" v-for="node in formatedData.nodes" 
          :key="node.id" 
          :transform="node.translate"
          @mouseover="onNodeMouseOver(node)"
          @mouseout="onNodeMouseOut(node)">
          <rect class="node-rect" :width="nodeWidth" :height="node.dy">
            <title>{{node.title}}</title>
          </rect>
          <text class="node-text"
            :y="node.dy / 2"
            :x="node.level === 0 ? 30 : -10"
            dy="0.5em"
            :text-anchor="node.level == 0 ? 'start' : 'end'">{{node.name.substr(-20)}}</text>
        </g>
      </g>
    </g>
  </hsb-svg>
</template>

<script>
import * as d3 from 'd3';
import engine from '@/lib/sankey';
import HsbSvg from '@/components/svg'

export default {
  name: 'sankey-chart',
  props: {
    width: {
      type: Number,
      default: 1600
    },
    height: {
      type: Number,
      default: 1200
    },
    nodeWidth: {
      type: Number,
      default: 20
    },
    levels: {
      type: Number,
      default: 4
    },
    value: {
      type: Object,
      default: {
        links: [],
        nodes: []
      }
    }
  },
  computed: {
    formatedData() {
      return this.formatData(this.value)
    },
    engine() {
      return engine()
        .nodeWidth(20)
        .nodePadding(10)
        .size([this.width, this.height]);
    }
  },
  data() {
    return {
      dim: false
    }
  },
  mounted() {
  },
  methods: {
    initEgine() {
    },
    formatData(value) {
      let initialData = value
      let nodeMap = {}
      initialData.nodes.forEach(x => { nodeMap[x.name] = x});
      let healthyColor = d3.scaleLinear()
        .domain([0, 90, 95, 100])
        .range(['#f00', '#999900', '#99ff00', '#23d160'])
      let units = 'calls', 
        formatNumber = d3.format(',.0f'),    // zero decimal places
        formatValue = d => formatNumber(d) + ' ' + units;
      initialData.links.forEach(l => {
          l['source'] = nodeMap[l.source];
          l['target'] = nodeMap[l.target];
      });
      this.engine
        .nodes(initialData.nodes)
        .links(initialData.links)
        .layout(32);
      initialData.links.forEach(l => {
        l.d = this.engine.link()(l)
        l.strokeWidth = Math.max(1, l.dy)
        l.stroke = healthyColor(l.healthy)
        l.title = `${l.source.name} → ${l.target.name}\n${formatValue(l.value)}\nhealthy: ${l.healthy}`
      })
      initialData.nodes.forEach(node => {
        node.translate = `translate(${node.x}, ${node.y})`
        node.title = `${node.name}\nIN: ${formatValue(node.in)} OUT: ${formatValue(node.out)}`
      })
      return initialData
    },
    onNodeMouseOver(node) {
      this.dim = true
      node.inLinks.forEach(n => {n.hovered = true})
      node.outLinks.forEach(n => {n.hovered = true})
    },
    onNodeMouseOut(node) {
      this.dim = false
      node.inLinks.forEach(n => {n.hovered = false})
      node.outLinks.forEach(n => {n.hovered = false})
    }
  },
  components: {
    HsbSvg
  }
};
</script>

<style lang='stylus'>
.node rect {
  cursor: move;
  fill: #006338;
  fill-opacity: .75;
  stroke: #000;
  shape-rendering: crispEdges;
  &:hover {
    fill-opacity: 1;
  }
}
.node text {
  font-size: 18px;
}
.link-path {
  fill: none;
  stroke-opacity: .5;
}
.link-path:hover {
  stroke-opacity: 1;
}
.dim {
  .link-path:not(.hovered) {
    stroke-opacity: .1;
  }
}
</style>