<template>
  <v-select
    :items="options"
    :value="value"
    @change="timeSelectChange"
    label="时间段"
    ></v-select>
</template>
<script>
export default {
  props: {
    value: {
      type: Number,
      default: 4
    }
  },
  data() {
    return {
      options: [
        {
            value: 1,
            text: '最近5分钟'
        }, {
            value: 2,
            text: '最近一个小时'
        }, {
            value: 3,
            text: '最近一天'
        }, {
            value: 4,
            text: '最近一周'
        }, {
            value: 5,
            text: '最近一个月'
        }, {
            value: 6,
            text: '最近一个季度'
        }, {
            value: 6,
            text: '最近一年'
        }
      ]
    }
  },
  methods: {
    timeSelectChange(value) {
      this.$emit('input', value)
    }
  }
}
</script>
