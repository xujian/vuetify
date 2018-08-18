<template>
  <hsb-svg :width="width" :height="height + 80">
    <defs>
      <hsb-svg-marker-arrow id="marker-arrow"></hsb-svg-marker-arrow>
    </defs>
    <g class="ruler" transform="translate(0, 1220)">
      <g class="ruler-g" v-for="x in [0,1,2,3,4]" :key="x" :transform="'translate(' + x * 400 + ', 0)'">
        <rect class="ruler-tick-rect" :class="'level-' + x" :width="x < 4 ? 400 : 0" height="60"></rect>
        <text :text-anchor="x < 4 ? 'start' : 'end'" :x = "x < 4 ? 5 : -5" y = "15">LEVEL {{x + 1}}</text>
      </g>
    </g>
    <g class="background">
      <path class="dashed" v-for="x in [0,1,2,3,4]" :key="x" stroke-dasharray="4,1" :d="'M' + (x*400) + ' 0 l0,1280'" />
    </g>
    <g ref="root" :class="{'dim':dim}" v-if="formatedData">
      <g class="links" ref="links">
        <g class="link" v-for="(link, i) in formatedData.links"
          :key="i">
          <path class="link-path"
            :class="{'hovered': link.hovered}"
            :d="link.d" 
            :stroke="link.stroke" marker-start="url(#marker-arrow)"
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
import HsbSvgMarkerArrow from '@/components/svg/marker-arrow'

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
        l.d = this.engine.link()(l)
        l.strokeWidth = Math.max(1, l.dy)
        l.stroke = healthyColor(l.healthy)
        l.title = `${l.source.name} → ${l.target.name}\n${formatValue(l.calls)}\nhealthy: ${l.healthy}`
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
    HsbSvg,
    HsbSvgMarkerArrow
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
}
.ruler-rect {
  fill: #ddd;
  stroke: #cccccc;
  stroke-width: 1px;
}
.ruler-tick-rect {
  fill: #ddd;
  stroke: #cccccc;
  stroke-width: 1px;
  &.level-1 {
    fill: #ddd;
  }
  &.level-2 {
    fill: #d8d8d8;
  }
  &.level-3 {
    fill: #ccc;
  }
  &.level-4 {
    fill: #c8c8c8;
  }
}
.background {
  .dashed {
    stroke : #999
  }
}
</style>