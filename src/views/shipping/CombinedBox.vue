<template>
  <div class="all">
    <head-name :info="info"></head-name>
    <div class="box">
      <div class="inp_box">
        <div class="row">
          <span class="three_em">汇总箱</span>
          <input @focus="hideVK" v-model="xh1" ref="xh1" @keyup="xh1=xh1.toUpperCase()" @keyup.enter="checkXh1" />
        </div>
        <div class="row">
          <span class="three_em">拿出箱</span>
          <input @focus="hideVK($event,1)" v-model="xh2" ref="xh2" @keyup="xh2=xh2.toUpperCase()" @keyup.enter="checkXh2" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loading: false,
      loadingMsg: "请稍等",
      xh1: "",
      xh2: "",
      hasCheckXh1: false,
      info: { name: "并箱", url: "shipping/CombinedBox" },
    };
  },
  async mounted() {
    this.$refs.xh1.focus();
  },
  methods: {
    // 检查箱号1
    checkXh1() {
      if (!this.xh1) {
        alert("请输入完整汇总箱~");
        return;
      }
      this.loading = true;
      let url = `${apiUrl}fy/bx/checkbox1?storage=STORAGE_ZMC&user=${this.userName}&box=${this.xh1}`;
      //  test
      this.hasCheckXh1 = true;
      this.$refs.xh2.focus();
      this.loading = false;
      return;
      // test over
      axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`汇总箱${this.xh1}:${res.data.errmsg}`);
            this.xh1 = "";
            return;
          }
          this.hasCheckXh1 = true;
          this.$refs.xh2.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.xh1 = "";
          alert(err);
        });
    },
    // 检查拿出箱
    checkXh2() {
      if (!this.hasCheckXh1) {
        alert("请先检查汇总箱");
        this.xh2 = "";
        return;
      }
      if (!this.xh2) {
        alert("请输入完整拿出箱~");
        return;
      }
      this.loading = true;
      let url = `${apiUrl}fy/bx/checkbox2?storage=STORAGE_ZMC&user=${this.userName}&box=${this.xh1}&box2=${this.xh2}`;
      // test
      this.loadingMsg = res.data.errmsg;
      setTimeout(() => {
        this.reset();
      }, 1500);
      return;
      // test over
      axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(`拿出箱${this.xh2}:${res.data.errmsg}`);
            this.xh2 = "";
            return;
          }
          this.loadingMsg = res.data.errmsg;
          setTimeout(() => {
            this.reset();
          }, 1500);
        })
        .catch((err) => {
          this.loading = false;
          this.xh2 = "";
          alert(err);
        });
    },
    reset() {
      this.xh1 = "";
      this.xh2 = "";
      this.hasCheckXh1 = false;
      this.loadingMsg = "请稍等";
      this.loading = false;
      this.$refs.xh1.focus();
    },
    hideVK(e, index) {
      if (index) {
        setCursor(index);
      }
      e.target.setAttribute("readonly", true);
      setTimeout(() => {
        e.target.removeAttribute("readonly");
      }, 100);
    },
  },
};
</script>