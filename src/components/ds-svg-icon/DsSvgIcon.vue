<template>
  <text :class="['iconfont', icon]" :style="{ fontSize, color }"></text>
</template>

<script>
export default {
  name: 'Icon',
  props: {
    icon: {
      type: String,
      required: true,
    },
    fontSize: {
      type: String,
      default: '14px',
    },
    color: {
      type: String,
      default: '#94A1B5',
    },
  },
}
</script>

<style scoped>
/* 可以加一点默认的对齐 */
.iconfont {
  vertical-align: middle;
}
</style>
