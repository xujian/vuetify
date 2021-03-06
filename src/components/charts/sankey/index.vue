<template>
  <hsb-svg :width="width" :height="height + 80">
    <defs>
      <hsb-svg-marker-arrow id="marker-arrow"></hsb-svg-marker-arrow>
    </defs>
    <hsb-svg-coord type="x" :value="levels" :width="width" />
    <g ref="root" :class="{'dim':dim}" v-if="formatedData">
      <g class="links" ref="links">
        <g class="link" v-for="(link, i) in formatedData.links" :key="i">
          <hsb-bezier 
            :from="{x: link.source.x, y: link.source.y + link.sy + link.dy / 2}"
            :to="{x: link.target.x, y: link.target.y + link.ty + link.dy / 2}"
            class="link-path"
            :class="{'hovered': link.hovered}"
            :stroke="link.stroke"
            :stroke-width="link.strokeWidth"
            :title="link.title" />
        </g>
      </g>
      <g class="nodes" ref="nodes">
        <g v-for="node in formatedData.nodes"
          class="node"
          :class="{'hovered': node.hovered}" 
          :key="node.id" 
          :transform="node.translate"
          @mouseover="onNodeMouseOver(node)"
          @mouseout="onNodeMouseOut(node)">
          <rect class="node-rect" :width="nodeWidth" :height="node.dy"></rect>
          <line class="in" x1="5" :y2="(node.dy * node.in) / Math.max(node.in, node.out, 1)" x2="5" y1="0"></line>
          <line class="out" x1="15" :y2="(node.dy * node.out) / Math.max(node.in, node.out, 1)" x2="15" y1="0"></line>
          <text class="node-text"
            :y="node.dy / 2"
            :x="node.level === 0 ? 30 : -10"
            dy="0.5em"
            :text-anchor="node.level == 0 ? 'start' : 'end'">{{node.name.substr(-25)}}</text>
            <title>{{node.title}}</title>
        </g>
      </g>
    </g>
  </hsb-svg>
</template>

<script>
import * as d3 from 'd3';
import engine from './engine';
import HsbSvg from '@/components/svg'
import HsbBezier from '@/components/svg/bezier'
import HsbSvgMarkerArrow from '@/components/svg/marker-arrow'
import HsbSvgCoord from '@/components/charts/coord'

/** 
 * 输入固定格式参数 绘制SANKEY 桑基图
 */
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
    /**
    *  总层数 
    **/
    levels: {
      type: Number,
      default: 5
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
        .levels(this.levels)
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
      let healthyColor = d3.scaleLinear()
        .domain([0, 90, 95, 100])
        .range(['#f00', '#999900', '#99ff00', '#23d160'])
      let units = 'calls', 
        formatNumber = d3.format(',.0f'),    // zero decimal places
        formatValue = d => formatNumber(d) + ' ' + units;
      this.engine
        .nodes(initialData.nodes)
        .links(initialData.links)
        .layout(32);
      initialData.links.forEach(l => {
        l.strokeWidth = Math.max(1, l.dy)
        l.stroke = healthyColor(l.healthy)
        l.title = `${l.source.name} → ${l.target.name}\n${formatValue(l.calls)}\nhealthy: ${l.healthy}`
      })
      initialData.nodes.forEach(node => {
        node.translate = `translate(${node.x}, ${node.y})`
        let ins = node.inLinks ? node.inLinks.map(l => l.source.name + ' → ' + l.calls).join('\n') : ''
        let outs = node.outLinks ? node.outLinks.map(l => l.calls + ' → ' + l.target.name).join('\n') : ''
        node.title = `${node.name}\n\nIN: ${formatValue(node.in)}\n${ins}\n\nOUT: ${formatValue(node.out)}\n${outs}`
      })
      return initialData
    },
    onNodeMouseOver(node) {
      this.dim = true
      node.hovered = true
      node.inLinks.forEach(l => {
        l.hovered = true
        l.source.hovered = true
      })
      node.outLinks.forEach(l => {
        l.hovered = true
        l.target.hovered = true
      })
    },
    onNodeMouseOut(node) {
      this.dim = false
      node.hovered = false
      node.inLinks.forEach(l => {
        l.hovered = false
        l.source.hovered = false
      })
      node.outLinks.forEach(l => {
        l.hovered = false
        l.target.hovered = false
      })
    }
  },
  components: {
    HsbSvg,
    HsbSvgMarkerArrow,
    HsbBezier,
    HsbSvgCoord
  }
};
</script>

<style lang='stylus'>
.node rect {
  fill: #ddd;
  fill-opacity: .75;
  stroke: #009688;
  shape-rendering: crispEdges;
  &:hover {
    fill-opacity: 1;
  }
}
.node text {
  font-size: 18px;
}
.node line.in {
  stroke: #00796B;
  stroke-width: 10px;
}
.node line.out {
  stroke: #00695C;
  stroke-width: 10px;
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
  .node:not(.hovered) {
    opacity: .1
  }
}
</style>