<template>
  <div>
    <div class="page_bg" @click="show=false" v-show="show"></div>
    <div class="page_box explain_box" v-show="show">
      <ul>
        <li v-for="(list,i) in helpJson" :key="i">
          <h3 class="help_h3" v-if="list.isTitle" v-html="list.msg"></h3>
          <span class="help_span" v-if="!list.isTitle" v-html="list.msg"></span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { getHelpAxios } from "../utiles/apis/common.js";
export default {
  data() {
    return {
      helpJson: "",
      show: false,
    };
  },
  props: {
    info: {
      type: Object,
      default: {},
    },
    
  },
  mounted() {
    this.getHelp();
  },
  methods: {
    getHelp() {
      this.helpJson = getHelpAxios(this.info.url)
        .then((res) => {
          this.helpJson = res.data;
        })
        .catch((err) => {
          alert(err);
        });
    },
  },
};
</script>