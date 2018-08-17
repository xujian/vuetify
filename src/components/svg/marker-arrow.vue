<template>
  <marker :id="id" class="marker-arrow"
      viewBox="0 0 20 20" refX="0" refY="10"
      markerWidth="20" markerHeight="20" markerUnits="userSpaceOnUse"
      orient="auto">
      <path d="M0,5 V15 L15,10 Z" />
    </marker>
</template>
<script>
export default {
  name: 'svg-marker-arrow',
  props: {
    id: {
      type: String,
      default: 'marker-arrow'
    }
  }
}
</script>
<style lang="stylus">
.marker-arrow {
  path {
    stroke: none;
    fill: #009688;
    fill-opacity: 0.5;
    stroke-width: 2px;
  }
}
</style>
