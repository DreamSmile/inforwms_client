<template>
  <!-- 托盘箱：库位托盘绑定 -->
  <div class="all">
    <head-name></head-name>
    <div class="box">
      <div class="row"><span class="problem three_em">库位</span><input @focus="hideVK" v-model="kw" ref="kw" @keyup="kw=kw.toUpperCase()" @keyup.enter="checkKw" />
      </div>
      <div class="row"><span class="problem three_em">货主</span><input v-model="hz" readonly class="no_inp" />
      </div>
      <div class="row"><span class="problem three_em">箱数</span><input v-model="xs" class="no_inp" readonly />
      </div>
      <div class="row"><span class="problem three_em">托盘号</span><input @focus="hideVK($event,3)" v-model="tph" ref="tph" @keyup="tph=tph.toUpperCase()" @keyup.enter="checkTph" />
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
      hz: "",
      xs: "",
      tph: "",
      zt: "",
      hasCheckKw: false,
    };
  },
  mounted() {
    this.$refs.kw.focus();
  },
  methods: {
    // 库位回车
    checkKw() {
      if (!this.kw) return;
      this.loading = true;
      let url = `${$apiUrl}tpx/kwtpbd/checkkw?storage=STORAGE_ZMC&kw=${this.kw}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`库位:${this.kw}:${res.data.errmsg}`);
            this.kw = "";
            return;
          }
          this.hz = res.data.data.STORERKEY;
          this.xs = res.data.data.XS;
          this.hasCheckKw = true;
          this.$refs.tph.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.kw = "";
          alert(err);
        });
    },
    // 检查托盘号
    checkTph() {
      if (!this.hasCheckKw) {
        alert("请先检查库位~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/kwtpbd/checktp?storage=STORAGE_ZMC&tpcode=${this.tph}`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(`托盘号:${this.tph}:${res.data.errmsg}`);
            this.tph = "";
            return;
          }
          let sureUrl = `${$apiUrl}tpx/kwtpbd/done?storage=STORAGE_ZMC&tpcode=${this.tph}&kw=${this.kw}`;
          this.axios
            .get(sureUrl)
            .then((res) => {
              if (res.data.errcode != 0) {
                this.loading = false;
                alert(res.data.errmsg);
                return;
              }
              this.loadingMsg = res.data.errmsg;
              setTimeout(() => {
                this.reset();
              }, 1500);
            })
            .catch((err) => {
              this.loading = false;
              alert(err);
            });
        })
        .catch((err) => {
          this.loading = false;
          this.tph = "";
          alert(err);
        });
    },
    reset() {
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.kw = "";
      this.hz = "";
      this.xs = "";
      this.tph = "";
      this.zt = "";
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