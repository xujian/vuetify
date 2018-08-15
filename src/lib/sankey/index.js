import * as d3 from 'd3';

let sankey = function() {
    var sankey = {},
        width = 1600,
        nodeWidth = 20,
        nodePadding = 20,
        minNodeHeight = 10,
        curvature = 0.5,
        size = [1, 1],
        nodes = [],
        links = [],
        unknowSource = {
          name: '[Unknow]',
          x: 0, dx: 0, y: size[1] / 2, dy: 0,
          level: 0, in: 0, out: 0,
          inLinks: [], outLinks: []
        },
        unknowTarget = {
          name: '[Unknow]',
          x: 1600, dx: 0, y: size[1] / 2, dy: 0,
          level: 4, in: 0, out: 0,
          inLinks: [], outLinks: []
        };
  
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
      computeNodeLinks();
      computeNodeValues();
      computeNodeBreadths();
      computeNodeDepths(iterations);
      computeLinkDepths();
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
              endControlY = endY + (Math.min(d.target.x - d.source.x, 150))
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
  
    // Populate the inLinks and outLinks for each node.
    // Also, if the source and target are not objects, assume they are indices.
    function computeNodeLinks() {
      let nodeMap = {}
      nodes.forEach(x => { nodeMap[x.name] = x});
      // 继续查找link.next_nodes里面引用的node, 加入到nodes
      links.forEach(l => {
        if (!nodeMap.hasOwnProperty(l.target)) {
          console.log('log-----missing nodes in target', l.target)
          nodes.push(nodeMap[l.target] = {
            id: nodeMap.length,
            name: l.target,
            level: 4
          })
        }
      })
      nodes.forEach(node => {
        node.inLinks = [];
        node.outLinks = [];
      });
      links.forEach(l => {
        l.source = nodeMap[l.source] || l.source
        l.target = nodeMap[l.target] || l.target
      });
      links.forEach(link => {
        link.target.inLinks && link.target.inLinks.push(link);
        link.target.inLinks && link.source.outLinks.push(link);
      });
    }
  
    // Compute the value (size) of each node by summing the associated links.
    function computeNodeValues() {
      nodes.forEach(function(node) {
        node.in  = d3.sum(node.inLinks, l => l.value) // 入流量
        node.out = d3.sum(node.outLinks, l => l.value) // 出流量
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
      /**
       * 寻找并定义
       * 最左侧 只出不进  level = 0
       * 最左侧 只出不进  level = 4
       * */
      nodes.forEach(n => {
        if (n.inLinks.length === 0) { // 只出不进的节点归最左侧
          n.level = 0
        }
       })
       nodes.filter(n => n.level !== 0).forEach(n => { // 接着处理其他节点
         if (n.outLinks.length === 0) { // 只进不出的节点 终点
          if (n.inLinks.every(l => l.source.level === 0)) { // 只有第一级流量的节点
            n.level = 1
          } else {
            n.level = 4
          }
        } else { // 剩下的中间节点 (有进有出) 先归到 level 1
          n.level = 2
        }
      })
      let levels = {}
      // splitLevel(1);
      splitLevel(2);
      [2, 3].forEach(x => { checkInnerLevelCalls(x)})
      nodes.forEach(node => {
        node.x = node.level * (width / 4)
        node.dx = nodeWidth
      });

      // 拆分第二层
      // 查找level=2平级之间互相调用
      function splitLevel (x) {
        levels[x] = nodes.filter(n => n.level === x)
        // 计算每一 node 所属 link value 总和的中位数
        let sourceValues = levels[x].map(n => {
            return n.inLinks.length === 0 ? 0 : n.inLinks.map(l => l.value).reduce((a, b) => a + b)
          }
        )
        sourceValues = sourceValues.sort((a, b) => a < b)
        let middleValue = sourceValues[Math.floor(sourceValues.length / 2)]
        levels[x].forEach(n => { // 降级 level 2 -> 3
          if (n.inLinks.some(
            s => s.source.level === x
            // && s.value > middleValue
             // && n.settled !== true
          ) && !n.outLinks.some(t => t.target.level <= x)
            ) {
            n.level = x + 1
          }
        })
        levels[x + 1] = nodes.filter(n => n.level === x + 1)
      }

      // check same level calls
      // 检查同级调用
      function checkInnerLevelCalls (x) {
        levels[x].forEach(n => {
          n.inLinks.forEach(l => {
            if (l.source.level === x) {
              l.circuit = 1
            }
          })
          n.outLinks.forEach(l => {
            if (l.target.level === x) {
              l.circuit = 1
            }
          })
        })
      }
    }


    function computeNodeDepths(iterations) {
      var nodesByBreadth = d3.nest()
        .key(d => d.level)
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(d => d.values);
      initializeNodeDepth();
      resolveCollisions();
      for (var alpha = 1; iterations > 0; --iterations) {
        relaxRightToLeft(alpha *= .99);
        resolveCollisions();
        relaxLeftToRight(alpha);
        resolveCollisions();
      }
      function initializeNodeDepth() {
        // 计算每一列所占高度
        var ky = d3.min(nodesByBreadth, 
          nodes => (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, n => n.value)
        )
        nodesByBreadth.forEach(nodes => {
          nodes.forEach((node, i) => {
            node.y = i;
            node.dy = Math.max(node.value * ky, minNodeHeight);
          });
        });
        links.forEach(link => {
          link.dy = link.value * ky
        });
      }
      function relaxLeftToRight(alpha) {
        nodesByBreadth.forEach(nodes => {
          nodes.forEach(node => {
            if (node.outLinks.length) {
              var y = d3.sum(node.outLinks, link => center(link.source) * link.value) 
                / d3.sum(node.outLinks, n => n.value);
              node.y += (y - center(node)) * alpha;
              if (node.name === 'HsbHeZuoWeb') {
              }
            }
          });
        });
      }
      function relaxRightToLeft(alpha) {
        nodesByBreadth.slice().reverse().forEach(nodes => {
          nodes.forEach(node => {
            if (node.inLinks.length) {
              var y = d3.sum(node.inLinks, link => center(link.target) * link.value)
                / d3.sum(node.inLinks, link => link.value);
              node.y += (y - center(node)) * alpha;
              if (node.name === 'HsbHeZuoWeb') {
              }
            }
          });
        });
      }
      function resolveCollisions() {
        nodesByBreadth.forEach(nodes => {
          var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;
          // Push any overlapping nodes down.
          nodes.sort((a, b) => a.y > b.y);
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
    } // computeNodeDepths

    function computeLinkDepths() {
      nodes.forEach(node => {
        node.inLinks.sort((a, b) => a.source.y > b.source.y);
        node.outLinks.sort((a, b) => a.target.y > b.target.y);
      });
      nodes.forEach(node => { // 计算links Y 位置
        var sy = 0, ty = 0;
        node.inLinks.forEach(link => {
          link.ty = ty;
          ty += link.dy;
        });
        node.outLinks.forEach(link => {
          link.sy = sy;
          sy += link.dy;
        });
      });
      links.forEach(link => {
        link.ty = link.ty || 0
        link.sy = link.sy || 0
      })
    }
  
    function center(node) {
      return node.y + node.dy / 2;
    }
  
    return sankey;
  };

export default sankey;