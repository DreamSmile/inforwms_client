<template>
  <!-- 托盘箱：托盘箱解绑 -->
  <div class="all">
    <head-name></head-name>
    <div class="box">
      <div class="row"><span class="problem">托盘号</span><input @focus="hideVK" v-model="tph" ref="tph" @keyup="tph=tph.toUpperCase()" @keyup.enter="checkTph" />
      </div>
      <div class="row"><span class="problem">解绑类型</span>
        <select v-model="type">
          <option :value="0">单箱解绑</option>
          <option :value="1">解绑托盘上所有箱</option>
        </select>
      </div>
      <div class="row" v-show="type==0"><span class="problem">箱号</span><input @focus="hideVK($event,1)" v-model="xh" ref="xh" @keyup="xh=xh.toUpperCase()" @keyup.enter="checkXh" />
      </div>
    </div>
    <div class="btn_box" v-show="!hasHidden">
      <button @click="sure">确认解绑</button>
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
      bodyH: document.body.clientHeight,
      loading: false,
      loadingMsg: "请稍等",
      hasHidden: false,
      tph: "",
      xh: "",
      type: 0,
    };
  },
  mounted() {
    this.$refs.tph.focus();
    window.onresize = () => {
      this.hasHidden = document.body.clientHeight < this.bodyH ? true : false;
    };
  },
  methods: {
    // 检查托盘号
    checkTph() {
      if (!this.tph) return;
      this.loading = true;
      let url = `${$apiUrl}tpx/tpxjb/checktp?storage=STORAGE_ZMC&tpcode=${this.tph}`;
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
          this.$refs.xh.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.tph = "";
          alert(err);
        });
    },
    // 检查箱号
    checkXh() {
      if (!this.hasCheckTph && this.tph) {
        this.xh = "";
        this.$refs.tph.focus();
        this.checkTph();
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/tpxjb/checkbox?storage=STORAGE_ZMC&tpcode=${this.tph}&box=${this.xh}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱号${this.xh}:${res.data.errmsg}`);
            this.xh = "";
            return;
          }
          this.hasCheckXh = true;
          this.$refs.xh.blur();
        })
        .catch((err) => {
          this.loading = false;
          this.xh = "";
          alert(err);
        });
    },
    // 确定解绑按钮,type=0时传入箱号，解绑箱,type=1时解绑托盘上所有箱号
    sure() {
      if (!this.hasCheckTph) {
        alert("请先检查托盘号~");
        return;
      }
      if (!this.hasCheckXh && this.type == 0) {
        alert("请先检查箱号~");
        return;
      }
      let r = confirm(
        `请确定是否解绑${this.type == 0 ? this.xh : "该托盘上所有箱"}`
      );
      if (r == false) return;
      this.loading = true;
      let url = `${$apiUrl}tpx/tpxjb/done?storage=STORAGE_ZMC&tpcode=${this.tph}&box=${this.xh}&type=${this.type}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(res.data.errmsg);
            return;
          }
          this.loadingMsg = res.data.errmsg;
          this.loading = true;
          setTimeout(() => {
            this.reset();
          }, 1500);
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    // 重置
    reset() {
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.hasHidden = false;
      this.tph = "";
      this.xh = "";
      this.type = 0;
      this.$refs.tph.focus();
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