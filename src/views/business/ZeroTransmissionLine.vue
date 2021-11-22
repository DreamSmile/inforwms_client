<template>
  <!-- 上架：零捡位传输线任务生成 -->
  <div class="all">
    <head-name></head-name>
    <div class="box">
      <div class="row"><span class="problem two_em">箱号</span><input v-model="xh" @focus="hideVK" @keyup="xh=xh.toUpperCase()" @keyup.enter="checkXh" ref="xh" /> </div>
      <div class="row"><span class="problem two_em">出口</span><input v-model="ck" readonly class="no_inp" />
      </div>
    </div>
    <div class="btn_box" v-show="!hasHidden">
      <button class="one_btn" @click="sure">确认下发传输线</button>
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
      hasHidden: false, //是否展示表格，当软键盘弹出
      xh: "", //箱号
      ck: "", //出口，通过接口获取
      loading: false,
      userName: "",
      loadingMsg: "请稍等",
    };
  },
  mounted() {
    this.$refs.xh.focus();
    window.onresize = () => {
      this.hasHidden = document.body.clientHeight < this.bodyH ? true : false;
    };
  },
  methods: {
    // 隐藏键盘
    hideVK(e) {
      e.target.setAttribute("readonly", true);
      setTimeout(() => {
        e.target.removeAttribute("readonly");
      }, 100);
    },
    // 箱号输入框回车，检查箱号
    checkXh() {
      if (!this.xh) {
        alert("请检查箱号是否填写完整");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}sj/ljwcsxrw/checkbox?storage=STORAGE_ZMC&box=${this.xh}`;
      let that = this;
      this.axios
        .get(url)
        .then(function (res) {
          console.log(res);
          that.loading = false;
          if (res.data.errcode != 0) {
            alert("箱号" + that.xh + ":" + res.data.errmsg);
            that.xh = "";
            return;
          }
          // 接口没有可以测试的数据，暂时放空
          that.ck = res.data.data.LOC;
          that.$refs.xh.blur();
        })
        .catch(function (error) {
          that.loading = false;
          that.xh = "";
          alert(error);
        });
    },
    // 调用确认接口
    sure() {
      if (!this.xh || !this.ck) {
        alert("请检查箱号、出口是否有数据");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}sj/ljwcsxrw/comfirm?storage=STORAGE_ZMC&box=${this.xh}&csxck=${this.ck}`;
      let that = this;
      this.axios
        .get(url)
        .then(function (res) {
          that.loading = false;
          if (res.data.errcode != 0) {
            alert(res.data.errmsg);
            return;
          }
          that.loadingMsg = res.data.errmsg;
          that.loading = true;
          setTimeout(() => {
            that.reset();
          }, 1700);
        })
        .catch(function (error) {
          that.loading = false;
          alert(error);
        });
    },
    reset() {
      this.xh = "";
      this.ck = "";
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.$refs.xh.focus();
    },
  },
};
</script>