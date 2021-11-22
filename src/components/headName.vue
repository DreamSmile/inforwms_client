<template>
  <div>
    <h1 @click="showHelpFun">{{$route.meta.title}} [{{userName}}] <sup>?</sup></h1>
    <!-- 帮助文档 -->
    <help ref="help"></help>
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
      userName: JSON.parse(localStorage.getItem("IM_USER_INFO")).cname,
    };
  },
  methods: {
    showHelpFun() {
      this.$refs.help.show = true;
    },
  },
};
</script>