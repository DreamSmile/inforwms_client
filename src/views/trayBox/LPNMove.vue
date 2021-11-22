<template>
  <!-- 托盘箱：LPN移动（箱移动） -->
  <div class="all">
    <h1 @click="showHelp =true">LPN移动 (箱移动) [{{userName}}] <sup>?</sup></h1>
    <div class="box">
      <div class="row"><span class="problem two_em">库位</span><input @focus="hideVK" v-model="kw" ref="kw" @keyup="kw=kw.toUpperCase()" @keyup.enter="checkKw" />
      </div>
      <div class="row"><span class="problem two_em">箱号</span><input @focus="hideVK($event,1)" v-model="xh" ref="xh" @keyup="xh=xh.toUpperCase()" @keyup.enter="checkXh" />
      </div>
    </div>
    <!-- 等待 -->
    <div class="loading_bg" v-show="loading">
      <div class="loading">
        <p>{{loadingMsg}}<span> 。。。</span></p>
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
      userName: "",
      kw: "",
      xh: "", //箱号
      hasCheckKw: false,
    };
  },
  mounted() {
    this.$refs.kw.focus();
  },
  methods: {
    // 检查库位
    checkKw() {
      if (!this.kw) {
        alert("请输入完整库位信息~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/lpnyd/checkkw?storage=STORAGE_ZMC&kw=${this.kw}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`库位：${this.kw}:${res.data.errmsg}`);
            this.kw = "";
            return;
          }
          this.hasCheckKw = true;
          this.$refs.xh.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.kw = "";
          alert(err);
        });
    },
    // 检查箱号，并执行移动
    checkXh() {
      if (!this.hasCheckKw) {
        alert("请先检查库位~");
        this.xh = "";
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/lpnyd/checkbox?storage=STORAGE_ZMC&kw=${this.kw}&box=${this.xh}`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(`箱号：${this.kw}:${res.data.errmsg}`);
            this.xh = "";
            return;
          }
          this.loadingMsg = res.data.errmsg;
          setTimeout(() => {
            this.reset();
          }, 1500);
        })
        .catch((err) => {
          this.loading = false;
          this.xh = "";
          alert(err);
        });
    },
    reset() {
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.kw = "";
      this.xh = ""; //箱号
      this.hasCheckKw = false;
      this.$refs.kw.focus();
    },
    hideVK(e, index) {
      if (index) {
        this.setCursor(index);
      }
      e.target.setAttribute("readonly", true);
      setTimeout(() => {
        e.target.removeAttribute("readonly");
      }, 100);
    },
  },
};
</script>