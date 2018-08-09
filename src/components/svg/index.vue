<template>
  <div class='canvas-wrapper'>
    <svg ref='canvas' 
        :width="width" 
        :height="height" 
        :viewBox="viewBox">
        <slot></slot>
    </svg>
  </div>
</template>

<script>
export default {
  props: {
      width: {
          type: Number,
          default: 1600
      },
      height: {
          type: Number,
          default: 1200
      },
  },
  computed: {
      viewBox () {
        return `0 0  ${this.width + 80} ${this.height}`
      }
  },
  components: {
  },
  mounted () {
  }
}
</script>

<style lang="stylus">
.canvas-wrapper
  svg
    width 100%
</style>
