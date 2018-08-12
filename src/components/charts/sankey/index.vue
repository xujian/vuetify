<template>
  <div class="sankey-page page">
    <h1>服务器调用关系图</h1>
    <p>&nbsp;</p>
    <hsb-svg :width="width" :height="height">
      <g ref="root"></g>
    </hsb-svg>
  </div>
</template>

<script>
import * as d3 from 'd3';
import engine from '@/lib/sankey';
import HsbSvg from '@/components/svg'
import {json} from 'd3-fetch';
import axios from 'axios'

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
    levels: {
      type: Number,
      default: 4
    },
  },
  data() {
    return {}
  },
  mounted() {
    var units = 'calls', 
      formatNumber = d3.format(',.0f'),    // zero decimal places
      formatValue = d => formatNumber(d) + ' ' + units,
      healthyColor = d3.scaleLinear().domain([0, 90, 95, 100])
        .range(['#f00', '#999900', '#99ff00', '#23d160']);
    var root = d3.select(this.$refs.root)
    var sankey = engine()
      .nodeWidth(20)
      .nodePadding(10)
      .size([this.width, this.height]);
    
    json('/static/servers.json').then(function(response) {
      let formatedData = {
        nodes: [],
        links: []
      }
      let list = response._data._retData.list
      list.forEach((n) => {
        formatedData.nodes.push({
          name: n.node_name,
          level: n.node_level
        })
        n.next_nodes.forEach((t, i) => {
          formatedData.links.push({
            source: n.node_name,
            target: t.node_name,
            value: Math.max(100000, t.call_count), // 虚拟value TODO: 需计算call count base 避免线条过细
            calls: t.call_count,
            time: t.average_time,
            healthy: t.success_rate
          })
        })
      })
      // let formatedData = response
      var nodeMap = {};
      formatedData.nodes.forEach(function(x) { nodeMap[x.name] = x; });
      formatedData.links.forEach(l => {
          l['source'] = nodeMap[l.source];
          l['target'] = nodeMap[l.target];
      });
      console.info('111', formatedData)
      sankey
        .nodes(formatedData.nodes)
        .links(formatedData.links)
        .layout(32);
      console.info('222')
      // add in the links
      var link = root.append('g').selectAll('.link')
        .data(formatedData.links)
        .enter().append('path')
        .attr('class', 'link')
        .attr('d', sankey.link())
        .style('stroke-width', d => Math.max(1, d.dy)) // 线条宽度
        .style('stroke', d => healthyColor(d.healthy)) // 线条颜色 == 调用成功率
        .sort((a, b) => b.dy - a.dy);
    
    // add the link titles
      link.append('title').text(d => 
        d.source.name + ' → ' +  d.target.name + '\n' + formatValue(d.value) + '\n' +
        'healthy: ' + d.healthy
      );
    
    // add in the nodes
      var node = root.append('g').selectAll('.node')
        .data(formatedData.nodes)
        .enter().append('g')
        .attr('class', 'node')
        .attr('transform', function(d) { 
          return 'translate(' + d.x + ',' + d.y + ')'; 
        })
      console.info('node-----------------', node)
      // add the rectangles for the nodes
      node.append('rect')
        .attr('class', 'out')
        .attr('height', d => d.dy)
        .attr('width', sankey.nodeWidth())
        node.append('title').text(d => `${d.name}\nIN: ${formatValue(d.in)} OUT: ${formatValue(d.out)}`);
    
    // add in the title for the nodes
      node.append('text')
        .attr('x', -6)
        .attr('y', d => d.dy / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'end')
        .attr('transform', null)
        .text(d => `${d.name.substr(-20)} (${d.level})`)
        .filter(d => d.level === 0)
        .attr('x', 6 + sankey.nodeWidth())
        .attr('text-anchor', 'start');
    
    // the function for moving the nodes
      function dragmove(d) {
        d3.select(this).attr('transform', 
            'translate(' + (
                d.x = Math.max(0, Math.min(this.width - d.dx, d3.event.x))
              ) + ',' + (
                      d.y = Math.max(0, Math.min(this.height - d.dy, d3.event.y))
                ) + ')');
        sankey.relayout();
        link.attr('d', sankey.link());
      }
    })
  },// mounted
  methods: {
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
  pointer-events: none;
  font-size 18px;
}
.link {
  fill: none;
  stroke: #000
  stroke-opacity: .5;
}
.link:hover {
  stroke-opacity: 1;
}
</style>