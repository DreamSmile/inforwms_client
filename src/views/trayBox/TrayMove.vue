<template>
  <!-- 托盘箱：托盘移动 -->
  <div class="all">
    <head-name></head-name>
    <div class="box">
      <div class="row"><span class="problem three_em">托盘号</span><input @focus="hideVK" v-model="tph" ref="tph" @keyup="tph=tph.toUpperCase()" @keyup.enter="checkTph" />
      </div>
      <div class="row"><span class="problem three_em">箱数</span><input v-model="xs" readonly class="no_inp" />
      </div>
      <div class="row"><span class="problem three_em">至库位</span><input @focus="hideVK($event,2)" v-model="tokw" @keyup="tokw=tokw.toUpperCase()" @keyup.enter="checkTokw" ref="tokw" />
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
      tph: "",
      xs: "",
      tokw: "",
      hasCheckTph: false,
    };
  },
  mounted() {
    this.$refs.tph.focus();
  },
  methods: {
    // 检查托盘号
    checkTph() {
      if (!this.tph) {
        alert("请输入完整托盘号~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/tpyd/checktp?storage=STORAGE_ZMC&tpcode=${this.tph}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`托盘号：${this.tph}:${res.data.errmsg}`);
            this.tph = "";
            return;
          }
          this.hasCheckTph = true;
          this.xs = res.data.data.NUM;
          this.$refs.tokw.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.tph = "";
          alert(err);
        });
    },
    // 检查至库位回车
    checkTokw() {
      if (!this.hasCheckTph) {
        alert("请先检查托盘号~");
        this.tokw = "";
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/tpyd/checkkw?storage=STORAGE_ZMC&tpcode=${this.tph}&kw=${this.tokw}`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(`至库位：${this.tokw}:${res.data.errmsg}`);
            this.tokw = "";
            return;
          }
          this.loadingMsg = res.data.errmsg;
          setTimeout(() => {
            this.reset();
          }, 1500);
        })
        .catch((err) => {
          this.loading = false;
          this.tokw = "";
          alert(err);
        });
    },
    reset() {
      this.$refs.tph.focus();
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.tph = "";
      this.xs = "";
      this.tokw = "";
      this.hasCheckTph = false;
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