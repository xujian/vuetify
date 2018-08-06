<template>
  <div class='canvas' ref='canvas'>
  </div>
</template>

<script>
import * as d3 from 'd3';
import {json} from 'd3-fetch';
import axios from 'axios'

console.info('json', json)

d3.sankey = function() {
  var sankey = {},
      width = 1200,
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    console.info('112')
    computeNodeLinks();
    console.info('113')
    computeNodeValues();
    console.info('114')
    computeNodeBreadths();
    console.info('115')
    computeNodeDepths(iterations);
    console.info('116')
    computeLinkDepths();
    console.info('117')
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return 'M' + x0 + ',' + y0
           + 'C' + x2 + ',' + y0
           + ' ' + x3 + ',' + y1
           + ' ' + x1 + ',' + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === 'number') source = link.source = nodes[link.source];
      if (typeof target === 'number') target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  // 似乎是判定node横轴位置
  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        index = 0,
        x = 0;
    console.info('computeNodeBreadths:nodes', remainingNodes)
    while (remainingNodes.length) {
      console.info('computeNodeBreadths', index ++)
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) { // 集中所有source link
          if ( !nextNodes.map((item) => {return item.name}).includes(link.target.name)) { // 滤重
            nextNodes.push(link.target);
          }
        });
      });
      console.info('computeNodeBreadths:nodes:after 1 loop', remainingNodes)
      remainingNodes = index > 10 ? [] : nextNodes;
      ++x;
    }
    moveSinksRight(x);
    scaleNodeBreadths((width - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};


export default {
  name: 'sankey-chart',
  data() {
    return {}
  },
  mounted() {
    var units = 'Widgets';
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 1200 - margin.left - margin.right,
        height = 740 - margin.top - margin.bottom;
    var formatNumber = d3.format(',.0f'),    // zero decimal places
        format = function(d) { return formatNumber(d) + ' ' + units; },
        color = d3.scaleLinear()
          .domain([10, 130])
          .range([0, 960]);
    // append the svg canvas to the page
    var svg = d3.select(this.$refs.canvas).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', `0 0  ${width} ${height}`)
      .append('g')
      .attr('transform',  'translate(' + margin.left + ',' + margin.top + ')');
    
    // Set the sankey diagram properties
    var sankey = d3.sankey()
      .nodeWidth(36)
      .nodePadding(10)
      .size([width, height]);
    var path = sankey.link();
    
    json('/static/servers.json').then(function(response) {
      let formatedData = {
        nodes: [],
        links: []
      }
      let list = response._data._retData.list
      list.forEach((n) => {
        formatedData.nodes.push({name: n.node_name})
        n.next_nodes.forEach((t) => {
          formatedData.links.push({
            source: n.node_name,
            target: t.node_name,
            value: t.call_count,
            time: t.average_time
          })
        })
      })
      // let formatedData = response
      var nodeMap = {};
      formatedData.nodes.forEach(function(x) { nodeMap[x.name] = x; });
      formatedData.links = formatedData.links.map(function(x) {
        return {
          source: nodeMap[x.source],
          target: nodeMap[x.target],
          value: x.value
        };
      });
      console.info('111')
      sankey
        .nodes(formatedData.nodes)
        .links(formatedData.links)
        .layout(32);
      console.info('222')
      // add in the links
      var link = svg.append('g').selectAll('.link')
        .data(formatedData.links)
        .enter().append('path')
        .attr('class', 'link')
        .attr('d', path)
        .style('stroke-width', function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });
    
    // add the link titles
      link.append('title')
        .text(function(d) {
        return d.source.name + ' → ' +  d.target.name + '\n' + format(d.value); });
    
    // add in the nodes
      var node = svg.append('g').selectAll('.node')
        .data(formatedData.nodes)
        .enter().append('g')
        .attr('class', 'node')
        .attr('transform', function(d) { 
          return 'translate(' + d.x + ',' + d.y + ')'; 
        })
      console.info('node-----------------', node)
      // add the rectangles for the nodes
      node.append('rect')
        .attr('height', function(d) { return d.dy; })
        .attr('width', sankey.nodeWidth())
        .style('fill', function(d) { 
          return d.color = color(d.name.replace(/ .*/, ''));
        })
        .style('stroke', function(d) { 
          return d3.rgb(d.color).darker(2); 
        })
        .append('title')
        .text(function(d) { 
          return d.name + '\n' + format(d.value);
        });
    
    // add in the title for the nodes
      node.append('text')
        .attr('x', -6)
        .attr('y', function(d) { return d.dy / 2; })
        .attr('dy', '.35em')
        .attr('text-anchor', 'end')
        .attr('transform', null)
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < width / 2; })
        .attr('x', 6 + sankey.nodeWidth())
        .attr('text-anchor', 'start');
    
    // the function for moving the nodes
      function dragmove(d) {
        d3.select(this).attr('transform', 
            'translate(' + (
                d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
              ) + ',' + (
                      d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
                ) + ')');
        sankey.relayout();
        link.attr('d', path);
      }
    })
  },// mounted
  methods: {
  },
};
</script>

<style lang='stylus'>
.canvas {
  height 500px
  svg {
    width 100%
  }
}
.node rect {
  cursor: move;
  fill-opacity: .9;
  shape-rendering: crispEdges;
}
.node text {
  pointer-events: none;
  text-shadow: 0 1px 0 #fff;
}
.link {
  fill: none;
  stroke: #000;
  stroke-opacity: .2;
}
.link:hover {
  stroke-opacity: .5;
}
</style>