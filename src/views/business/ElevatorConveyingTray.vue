<template>
  <!-- 上架：提升机输送托盘任务生成-->
  <div class="all">
    <head-name></head-name>
    <div class="box">
      <div class="row"><span class="problem three_em">库位</span><input v-model="kw" @focus="hideVK" @keyup="kw=kw.toUpperCase()" ref="kw" @keyup.enter="checkKw" />
      </div>
      <div class="row"><span class="problem three_em">托盘号</span><input v-model="tph" @keyup="tph=tph.toUpperCase()" @focus="hideVK($event,1)" ref="tph" @keyup.enter="checkTph" />
      </div>
      <div class="row"><span class="problem three_em">出口</span><input v-model="ck" readonly class="no_inp" />
      </div>

    </div>
    <div class="btn_box" v-show="!hasHidden">
      <button class="one_btn" @click="sure">确认下发任务</button>
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
      kw: "", //库位
      tph: "", //托盘号
      ck: "", //出口，通过接口获取
      loading: false,
      isCkCheck: false, //是否执行过检查库位
      userName: "",
      loadingMsg: "请稍等",
    };
  },
  async mounted() {
    this.$refs.kw.focus();
    window.onresize = () => {
      this.hasHidden = document.body.clientHeight < this.bodyH ? true : false;
    };
  },
  methods: {
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
    // 库位输入回车，检查库位
    checkKw() {
      if (!this.kw) {
        alert("请检查库位是否填写完整");
        return;
      }
      this.tph = "";
      this.ck = ""; //改了库位托盘号出口等就需要清空·
      this.loading = true;
      let url = `${$apiUrl}sj/tsjrw/checkkw?storage=STORAGE_ZMC&kw=${this.kw}`;
      let that = this;
      this.axios
        .get(url)
        .then(function (res) {
          console.log(res);
          that.loading = false;
          if (res.data.errcode != 0) {
            alert("库位：" + that.kw + " :" + res.data.errmsg);
            that.kw = "";
            return;
          }
          that.isCkCheck = true;
          that.$refs.tph.focus();
        })
        .catch(function (error) {
          that.loading = false;
          that.kw = "";
          alert(error);
        });
    },
    // 托盘号输入回车，检查托盘号
    checkTph() {
      if (!this.tph || !this.kw) {
        alert("请检查托盘号是否填写完整");
        return;
      }
      if (!this.isCkCheck) {
        alert("请先检查库位，方式：在库位框，输入库位并回车");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}sj/tsjrw/checktp?storage=STORAGE_ZMC&kw=${this.kw}&tpcode=${this.tph}`;
      let that = this;
      this.axios
        .get(url)
        .then(function (res) {
          that.loading = false;
          console.log(res);
          if (res.data.errcode != 0) {
            alert("托盘号：" + that.tph + " : " + res.data.errmsg);
            that.tph = "";
            that.ck = "";
            return;
          }
          that.ck = res.data.data.LOC;
          that.$refs.tph.blur();
        })
        .catch(function (error) {
          that.loading = false;
          that.tph = "";
          that.ck = "";
          alert(error);
        });
    },
    // 调用确认接口
    sure() {
      if (!this.kw || !this.tph || !this.ck) {
        alert("请检查库位、托盘号、出口是否有数据");
        return;
      }
      if (!this.isCkCheck) {
        alert("请先检查库位，方式：在库位框，输入库位并回车");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}/sj/tsjrw/comfirm?storage=STORAGE_ZMC&kw=${this.kw}&tpcode=${this.tph}&tsj=${this.ck}`;
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
          }, 1700);
        })
        .catch((error) => {
          this.loading = false;
          alert(error);
        });
    },
    reset() {
      this.kw = "";
      this.tph = "";
      this.ck = "";
      this.isCkCheck = false;
      this.$refs.kw.focus();
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.$refs.kw.focus();
    },
  },
};
</script>