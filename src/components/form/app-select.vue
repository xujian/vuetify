<template>
    <v-select
      multiple
      :items="options"
      item-text="name"
      item-value="name"
      :value="value"
      @change="selectChange"
      label="按应用筛选"
    ></v-select>
</template>
<script>
export default {
  props: {
    value: {
      type: Array,
      default: []
    },
    options: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
    }
  },
  methods: {
    selectChange(value) {
      this.$emit('input', value)
    }
  }
}
</script>
