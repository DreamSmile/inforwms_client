<template>
  <div class="all">
    <head-name></head-name>
    <div class="box">
      <div class="row"><span class="problem">托盘号</span><input v-model="tph" @keyup.enter="checkTP" @focus="hideVK" ref="tph" @keyup="tph=tph.toUpperCase()" />
      </div>
      <div class="row"><span class="problem">自库位</span><input class="no_inp" v-model="zkw" readonly /> </div>
      <div class="row"><span class="problem">箱数</span><input class="no_inp" v-model="xs" readonly /> </div>
      <div class="row"><span class="problem">推荐库位</span><input class="no_inp" v-model="tjkw" readonly /> </div>
      <div class="row"><span class="problem">至库位</span><input v-model="tokw" ref="tokw" @focus="hideVK($event,4)" @keyup.enter="checkSite" @keyup="tokw=tokw.toUpperCase()" /> </div>
      <div class="row"><span class="problem">验证码</span><input v-model="yzm" @focus="hideVK($event,6)" @keyup="yzm=yzm.toUpperCase()" ref="yzm" @keyup.enter="up" />
      </div>
    </div>
    <div class="btn_box" v-show="!hasHidden">
      <button @click="up" class="one_btn">托盘上架</button>
    </div>
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
      hasHidden: false,
      loading: false,
      userName: "",
      loadingMsg: "请稍等",
      tph: "", //托盘号
      zkw: "", //自库位
      xs: "", //箱数
      tjkw: "", //推荐库位
      tokw: "", //至库位
      yzm: "", //验证码
      hasCheckTokw: false, //是否检查至库位
    };
  },
  async mounted() {
    this.$refs.tph.focus();
    window.onresize = () => {
      this.hasHidden = document.body.clientHeight < this.bodyH ? true : false;
    };
  },
  methods: {
    checkTP() {
      if (!this.tph) {
        alert("请填写完整托盘号！");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}sj/tpsj/checktp?storage=STORAGE_ZMC&tpcode=${this.tph}`;
      let that = this;
      this.axios
        .get(url)
        .then(function (res) {
          that.loading = false;
          if (res.data.errcode != 0) {
            alert(`托盘号${that.tph}:${res.data.errmsg}`);
            that.xs = ""; //箱号
            that.tjkw = ""; //推荐库位
            that.tph = ""; //当前库位
            that.zkw = ""; //当前库位
            return;
          }
          that.xs = res.data.data.boxnumber; //箱号
          that.tjkw = res.data.data.recommendKw; //推荐库位
          that.zkw = res.data.data.dqkw; //当前库位
          that.$refs.tokw.focus();
        })
        .catch(function (error) {
          that.loading = false;
          that.tph = ""; //当前库位
          alert(error);
        });
    },
    // 检查至库位
    checkSite() {
      if (!this.tjkw || !this.xs || !this.zkw || !this.tokw) {
        alert("信息不完整，不允许检查库位！");
        return;
      }
      this.url = true;
      let url = `${$apiUrl}/sj/tpsj/checkkw?storage=STORAGE_ZMC&kw=${this.tokw}&tjkw=${this.tjkw}`;
      let that = this;
      this.axios
        .get(url)
        .then(function (res) {
          that.loading = false;
          if (res.data.errcode != 0) {
            alert(`库位：${that.tokw}: ${res.data.errmsg}`);
            that.tokw = "";
            return;
          }
          that.$refs.yzm.focus();
          that.hasCheckTokw = true;
        })
        .catch(function (error) {
          that.loading = false;
          that.tokw = "";
          alert(error);
        });
    },
    // 托盘上架
    up() {
      if (!this.yzm || !this.tph || !this.tokw) {
        alert("信息不完整，不允许上架！");
        return;
      }
      if (!this.hasCheckTokw) {
        alert("请先检查至库位~");
        return;
      }
      this.url = true;
      let url = `${$apiUrl}/sj/tpsj/done?storage=STORAGE_ZMC&captcha=${this.yzm}&tpcode=${this.tph}&kw=${this.tokw}`;
      let that = this;
      this.axios
        .get(url)
        .then(function (res) {
          that.loading = false;
          if (res.data.errcode != 0) {
            alert(`${that.yzm}: ${res.data.errmsg}`);
            that.yzm = "";
            return;
          }
          that.loadingMsg = res.data.errmsg;
          that.loading = true;
          setTimeout(() => {
            that.loading = false;
            that.loadingMsg = "请稍等";
          }, 1200);
          that.reset();
        })
        .catch(function (error) {
          that.loading = false;
          that.yzm = "";
          alert(error);
        });
    },
    reset() {
      this.tph = "";
      this.zkw = "";
      this.xs = "";
      this.tjkw = "";
      this.tokw = "";
      this.yzm = "";
      this.hasCheckZkw = false;
      this.$refs.tph.focus();
    },
    // 隐藏键盘
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