<template>
  <component :is="component">
    <slot />
  </component>
</template>

<script>
import DefaultLayout from "./layouts/Default";

export default {
  name: "App",
  components: {
    DefaultLayout
  },
  computed: {
    component() {
      return DefaultLayout;
    }
  }
};
</script>
