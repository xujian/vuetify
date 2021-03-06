import Vue from 'vue'

/***
 * 向右画线
 */
let __drawHorizonal = (from, to) => {
    var startX = from.x,
    startY = from.y,
    endX = to.x,
    endY = to.y,
    midX = (startX + endX) / 2,
    startControlX = midX,
    startControlY = startY,
    endControlX = midX,
    endControlY = endY;
    return `M${startX},${startY}C${startControlX},${startControlY} ${endControlX},${endControlY} ${endX},${endY}`
},

/**
 * 垂直画线
 */
__drawVertical = (from, to) => {
  var startX = from.x,
    startY = from.y,
    endX = to.x,
    endY = to.y,
    offsetY = Math.abs(to.y - from.y),
    startControlX = startX +  offsetY / 2, // 始终左进右出
    startControlY = startY,
    endControlX = startX - offsetY / 2,
    endControlY = endY
  return `M${startX},${startY}C${startControlX},${startControlY} ${endControlX},${endControlY} ${endX},${endY}`
}

let component = Vue.component('svg-bezier', {
  props: {
    from: {
      type: Object,
      default: {
        x: 0,
        y: 0
      }
    },
    to: {
      type: Object,
      default: {
        x: 100,
        y: 100
      }
    },
    stroke: {
      type: String
    },
    strokeWidth: {
      type: Number
    },
    title: {
      type: String,
      default: ''
    }
  },
  computed: {
    d() {
      if (this.to.x > this.from.x) {
        return __drawHorizonal(this.from, this.to)
      } else {
        return __drawVertical(this.from, this.to)
      }
    }
  },
  template: `<path :d="d" :stroke="stroke" :stroke-width="strokeWidth" ><title>{{title}}</title></path>`
})

export default component