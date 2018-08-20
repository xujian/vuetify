import * as d3 from 'd3';

let sankey = function() {
  var sankey = {},
    width = 1600,
    nodeWidth = 20,
    nodePadding = 20,
    minNodeHeight = 10,
    curvature = 0.5,
    size = [1, 1],
    levels = 4,
    nodes = [],
    links = [],
    maxNodeValue = 1,
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

  sankey.levels = function(_) {
    if (!arguments.length) return levels;
    levels = _;
    return sankey;
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
    let callValues = nodes.map(n => n.calls)
    maxNodeValue = Math.max(...callValues)
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
      if (d.circuit !== 1) {
        var startX = d.source.x + d.source.dx,
          startY = d.source.y + d.sy + d.dy / 2,
          endX = d.target.x,
          endY = d.target.y + d.ty + d.dy / 2,
          midX = (startX + endX) / 2,
          startControlX = midX,
          startControlY = startY,
          endControlX = midX,
          endControlY = endY;
        return `M${startX},${startY}C${startControlX},${startControlY} ${endControlX},${endControlY} ${endX},${endY}`
      } else {
        var startX = d.source.x + d.source.dx,
          startY = d.source.y + d.sy + d.dy / 2,
          endX = d.target.x,
          endY = d.target.y + d.ty + d.dy / 2,
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
    let maxLinkCalls = Math.max(...links.map(l => l.calls))
    nodes.forEach(x => { nodeMap[x.name] = x})
    // 继续查找link.next_nodes里面引用的node, 加入到nodes
    links.forEach(l => {
      l.value = Math.max(maxLinkCalls / 100, l.calls)
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
      node.value = Math.max(node.in, node.out, 1)
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  // 判定node横轴位置
  function computeNodeBreadths() {
    let nodesByLevel = {};
    let unknownLevels = nodes.filter(n => n.level === -2) // 未明确定义 level 的节点需要按调用重排
    //relevel(unknownLevels);
    ;[...Array(levels).keys()].forEach(x => {
      nodesByLevel[x] = nodes.filter(n => n.level === x)
    });
    // splitLevel(2);
    [2, 3].forEach(x => { checkInnerLevelCalls(x)})
    nodes.forEach(node => {
      node.x = node.level * (width / (levels - 1))
      node.dx = nodeWidth
    });

    // check same level calls
    // 检查同级调用
    function checkInnerLevelCalls (x) {
      nodesByLevel[x].forEach(n => {
        n.inLinks.forEach(l => {
          if (l.source.level >= x) {
            l.circuit = 1
          }
        })
        n.outLinks.forEach(l => {
          if (l.target.level <= x) {
            l.circuit = 1
          }
        })
      })
    }
    /**
     * 重排 X轴
     * @param {*} list 
     */
    function relevel (list) {
      /**	
       * 最左侧 只出不进  level = 0	
       * 最左侧 只出不进  level = 4	
       * */	
      list.forEach(n => {	
        if (n.inLinks.length === 0) { // 只出不进的节点归最左侧	
          n.level = 0	
        }	
       })
       list.forEach(n => {	
        if (n.outLinks.length === 0) { // 只出不进的节点归最左侧	
          n.level = 4
        }	
       })
       list.filter(n => n.level !== 0 && n.level !== 4).forEach(n => { // 接着处理其他节点
          if (n.inLinks.every(l => l.source.level === 0)) { // 只有第一级流量的节点	
            n.level = 1
          } else {	
            n.level = 2
          }
      })
      list.filter(n => n.level < 4).forEach(n => {	
       if (n.outLinks.every(l => l.target.level === 4)) { // 只出不进的节点归最左侧	
         n.level = 3
       }	
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
    /*for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }*/
    function initializeNodeDepth() {
      let maxLinkCalls = Math.max(...links.map(l => l.calls))
      let minValueLImit = maxLinkCalls / 25 // 限制节点最小值
      var ky = d3.min(nodesByBreadth, 
        nodes => 
          (size[1] - (nodes.length - 1) * nodePadding) /
          d3.sum(nodes, n => Math.max(n.value, minValueLImit))
      )
      let maxPathVaue = width / (levels - 1)
      if (maxLinkCalls * ky > maxPathVaue) { //  avoid huge links避免返回节点较少时出现特大link
        ky = maxPathVaue / maxLinkCalls
      }
      nodesByBreadth.forEach(nodes => {
        nodes = nodes.sort((a, b) => a.order - b.order)
        nodes.forEach((node, i) => {
          node.y = i
          node.dy = Math.max(node.value, minValueLImit) * ky
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
        nodes.sort((a, b) => a.y - b.y);
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
      node.inLinks.sort((a, b) => a.source.y - b.source.y);
      node.outLinks.sort((a, b) => a.target.y - b.target.y);
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