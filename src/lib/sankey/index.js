import * as d3 from 'd3';

let sankey = function() {
    var sankey = {},
        width = 1600,
        nodeWidth = 20,
        nodePadding = 20,
        minNodeHeight = 10,
        curvature = 0.75,
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
      nodes.forEach((n, i) => {n.id = i})
      return sankey;
    };
  
    sankey.links = function(_) {
      if (!arguments.length) return links;
      links = _;
      nodes.forEach((l, i) => {l.id = i})
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
  
    /**
     * 绘制 link path
     */
    sankey.link = function() {
      function link(d) {
        if (!d.circuit) {
          var startX = d.source.x + d.source.dx,
              startY = d.source.y + d.sy + d.dy / 2,
              endX = d.target.x,
              endY = d.target.y + d.ty + d.dy / 2,
              xi = d3.interpolateNumber(startX, endX),
              startControlX = xi(curvature),
              startControlY = startY,
              endControlX = xi(1 - curvature),
              endControlY = endY;
          return `M${startX},${startY}C${startControlX},${startControlY} ${endControlX},${endControlY} ${endX},${endY}`
        } else {
          // 平级调用 画一个半圆
          var startX = d.source.x + d.source.dx,
              startY = d.source.y + d.sy + d.dy / 2,
              endX = d.target.x,
              endY = d.target.y + d.ty + d.dy / 2,
              xi = d3.interpolateNumber(startX, endX),
              startControlX = startX + Math.abs(d.target.y - d.source.y + d.sy + d.dy / 2) // 始终左进右出
              startControlY = startY,
              endControlX = startX - Math.abs(d.target.y - d.source.y + d.sy + d.dy / 2)
              endControlY = endY + (d.target.x - d.source.x)
          return `M${startX},${startY}C${startControlX},${startControlY} ${endControlX},${endControlY} ${endX},${endY}`
        }
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
        node.in  = d3.sum(node.sourceLinks, value) // 入流量
        node.out = d3.sum(node.targetLinks, value) // 出流量
        node.value = Math.max(node.in, node.out)
      });
    }
  
    // Iteratively assign the breadth (x-position) for each node.
    // Nodes are assigned the maximum breadth of incoming neighbors plus one;
    // nodes with no incoming links are assigned breadth zero, while
    // nodes with no outgoing links are assigned the maximum breadth.
    // 似乎是判定node横轴位置
    function computeNodeBreadths() {
      nodes.forEach((item) => {
        item.dx = nodeWidth
      })
      console.info('pre-level2', nodes)
      /**
       * 寻找并定义
       * 最左侧 只出不进  level = 0
       * 最左侧 只出不进  level = 4
       * */
      nodes.forEach(n => {
        if (n.sourceLinks.length === 0) { // 只出不进的节点归最左侧
          n.level = 0
        }
       })
       nodes.filter(n => n.level !== 0).forEach(n => { // 接着处理其他节点
         if (n.targetLinks.length === 0) { // 只进不出的节点 终点
          if (n.sourceLinks.every(l => {l.source.level === 0})) { // 只有第一级流量的节点
            n.level = 1
            n.settled = true
          } else {
            n.level = 4
          }
        } else { // 剩下的中间节点 (有进有出) 先归到 level 1
          n.level = 1
        }
      })
      let levels = {}
      splitLevel(1)
      splitLevel(2)
      // [2].forEach(x => { checkInnerLevelCalls(x)})

      // 拆分第二层
      // 查找level=2平级之间互相调用
      function splitLevel (x) {
        levels[x] = nodes.filter(n => n.level === x)
        console.info('splitLevel-------level=', x, levels[x])
        // 计算每一 node 所属 link value 总和的中位数
        let sourceValues = levels[x].map(n => {
            console.info('>>>>>>>>>>>>>>>>>>>>>', n.name, n.sourceLinks.length)
            return n.sourceLinks.length === 0 ? 0 : n.sourceLinks.map(l => l.value).reduce((a, b) => a + b)
          }
        )
        sourceValues = sourceValues.sort((a, b) => a < b)
        let middleValue = sourceValues[Math.floor(sourceValues.length / 2)]
        levels[x].forEach(n => { // 降级 level 2 -> 3
          if (n.sourceLinks.some(s => s.source.level === x 
              && s.value > middleValue
              && n.settled !== true
            )) {
            n.level = x + 1
          }
        })
        levels[x + 1] = nodes.filter(n => n.level === x + 1)
      }

      // check same level calls
      // 检查同级调用
      function checkInnerLevelCalls (x) {
        levels[x].forEach(n => {
          n.sourceLinks.forEach(l => {
            if (l.target.level === x) {
              l.circuit = 1
            }
          })
          n.targetLinks.forEach(l => {
            if (l.source.level === x) {
              l.circuit = 1
            }
          })
        })
      }
      /*var remainingNodes = nodes,
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
        remainingNodes = index > 3 ? [] : nextNodes;
        ++x;
      }*/
      // moveSinksRight(x);
      scaleNodeBreadths(1600 / 4);
      console.info('computeNodeBreadths', nodes)
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
        node.x = node.level * kx;
      });
    }
  
    function computeNodeDepths(iterations) {
      var nodesByBreadth = d3.nest()
        .key(d => d.x)
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(d => d.values);
        console.info('computeNodeDepths-////////////////////', nodesByBreadth)
      initializeNodeDepth();
      resolveCollisions();
      console.info('computedNodeDepths--------------------', iterations)
      for (var alpha = 1; iterations > 0; --iterations) {
        relaxRightToLeft(alpha *= .99);
        resolveCollisions();
        relaxLeftToRight(alpha);
        resolveCollisions();
      }
      function initializeNodeDepth() {
        var ky = d3.min(nodesByBreadth, 
          nodes => (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value)
        )
        console.info('initializeNodeDepth====***************ky', ky)
        nodesByBreadth.forEach(function(nodes) {
          nodes.forEach(function(node, i) {
            node.y = i;
            node.dy = Math.max(node.value * ky, minNodeHeight);
          });
        });
        links.forEach(link => {
          link.dy = link.value * ky
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
    } // computeNodeDepths
  
    function computeLinkDepths() {
      nodes.forEach(function(node) {
        node.sourceLinks.sort(ascendingTargetDepth);
        node.targetLinks.sort(ascendingSourceDepth);
      });
      nodes.forEach(function(node) { // 计算links Y 位置
        var sy = 0, ty = 0;
        node.sourceLinks.forEach(link => {
          link.sy = sy;
          sy += link.dy;
        });
        node.targetLinks.forEach(link => {
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

export default sankey;