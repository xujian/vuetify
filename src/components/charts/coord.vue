<template>
  <g class="coord">
    <g class="ruler" :transform="'translate(0, ' + height + ')'">
      <g class="ruler-g" v-for="x in levelIndexes" :key="x" :transform="'translate(' + x * levelSize + ', 0)'">
        <rect class="ruler-tick-rect" :class="'level-' + x" :width="x < value - 1 ?  levelSize : 0" height="60"></rect>
        <text :text-anchor="x < value - 1 ? 'start' : 'end'" :x = "x < value - 1 ? 5 : -5" y = "15">LEVEL {{x + 1}}</text>
      </g>
    </g>
    <g class="background">
      <path class="dashed" v-for="x in levelIndexes" :key="x" stroke-dasharray="4,1" :d="'M' + x * levelSize + ' 0 l0,1280'" />
    </g>
  </g>
</template>
<script>
export default {
  props: {
    type: {
      type: String,
      default: 'x'
    },
    value: {
      type: Number,
      default: 4
    },
    width: {
      type: Number,
      default: 1600
    },
    height: {
      type: Number,
      default: 1200
    }
  },
  computed: {
    levelSize() {
      return this.width / (this.value -1)
    },
    levelIndexes() {
      return [...Array(this.value).keys()]
    }
  }
}
</script>
<style lang="stylus">
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

