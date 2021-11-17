<template>
  <div>
    <h1 @click="showHelpFun">{{info.name}} [{{$store.state.userName}}] <sup>?</sup></h1>
    <!-- 帮助文档 -->
    <help :info="info" ref="help"></help>
  </div>
</template>
<script>
import help from "./help.vue";
export default {
  components: { help },
  name: "headName",
  data() {
    return {
      showHelp: false,
    };
  },
  props: {
    info: {
      type: Object,
      default: {},
    },
  },
  methods: {
    showHelpFun() {
      this.$refs.help.show = true;
    },
  },
};
</script>