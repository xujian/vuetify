<template>
    <marker :id="id" viewBox="0 0 10 10" refX="0" refY="5"
          markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse"
          orient="auto">
        <path d="M10,5 L0,2.5" />
        <path d="M10,5 L0,5" />
        <path d="M10,5 L0,2.5" />
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
