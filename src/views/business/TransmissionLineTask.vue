<template>
  <!-- 上架：传输线任务生成 -->
  <div class="all">
    <head-name></head-name>
    <div class="box">
      <div class="row"><span class="problem three_em">任务类</span>
        <select v-model="rwl" @change="changeSel">
          <option :value="0">箱</option>
          <option :value="1">托盘</option>
        </select>
      </div>
      <div class="row"><span class="problem three_em">容器号</span><input ref="rqh" @focus="hideVK" v-model="rqh" :placeholder="rwl==0?'箱号':'托盘号'" @keyup.enter="getCk" @keyup="rqh=rqh.toUpperCase()" /> </div>
      <div class="row"><span class="problem three_em">出口</span><input v-model="ck" @focus="hideVK($event,1)" ref="ck" @keyup="ck=ck.toUpperCase()" @keyup.enter="sure" />
      </div>
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
      rwl: 0, //任务类
      rqh: "", //容器号
      ck: "", //出口
      loading: false,
      hasCheck: false, //是否检查过容器号
      userName: "", //接口获得用户名称
      loadingMsg: "请稍等",
    };
  },
  async mounted() {
    this.$refs.rqh.focus();
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
    // 修改下拉选项,每次更换将会清除容器号、出口内容
    changeSel(el) {
      this.rqh = "";
      this.ck = "";
      this.hasCheck = false;
      this.$refs.rqh.focus();
    },
    // 回车容器号
    getCk() {
      if (!this.rqh) {
        alert("请检查容器号是否填写完整");
        return;
      }
      this.loading = true;
      let url = "";
      if (this.rwl == 0) {
        //箱
        url = `${$apiUrl}sj/csxrw/checkinfo?storage=STORAGE_ZMC&type=${this.rwl}&box=${this.rqh}`;
      } else if (this.rwl == 1) {
        //托盘
        url = `${$apiUrl}sj/csxrw/checkinfo?storage=STORAGE_ZMC&type=${this.rwl}&tpcode=${this.rqh}`;
      } else {
        alert("任务类参数传递有误，请联系it人员");
        return;
      }
      let that = this;
      this.axios
        .get(url)
        .then(function (res) {
          console.log(res);
          that.loading = false;
          if (res.data.errcode != 0) {
            alert("容器号" + that.rqh + " : " + res.data.errmsg);
            that.rqh = "";
            return;
          }
          that.hasCheck = true;
          that.$refs.ck.focus();
        })
        .catch(function (error) {
          that.loading = false;
          that.rqh = "";
          alert(error);
        });
    },
    // 确认
    sure() {
      if (!this.rqh || !this.ck) {
        alert("请检查容器号、出口是否有数据");
        return;
      }
      if (!this.hasCheck) {
        alert("容器号无效，请输入有效容器号并检查");
        return;
      }
      this.loading = true;
      let url = "";
      if (this.rwl == 0) {
        //箱
        url = `${$apiUrl}sj/csxrw/comfirm?storage=STORAGE_ZMC&type=${this.rwl}&box=${this.rqh}&csxck=${this.ck}`;
      } else if (this.rwl == 1) {
        //托盘
        url = `${$apiUrl}sj/csxrw/comfirm?storage=STORAGE_ZMC&type=${this.rwl}&tpcode=${this.rqh}&csxck=${this.ck}`;
      } else {
        alert("任务类参数传递有误，请联系it人员");
        return;
      }
      let that = this;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert("出口" + this.ck + ": " + res.data.errmsg);
            this.ck = "";
            return;
          }
          this.loadingMsg = res.data.errmsg;
          this.loading = true;
          setTimeout(() => {
            this.reset();
          }, 1500);
        })
        .catch(function (error) {
          that.loading = false;
          this.ck = "";
          alert(error);
        });
    },
    reset() {
      this.rqh = "";
      this.ck = "";
      this.loadingMsg = "请稍等";
      this.loading = false;
      this.hasCheck = false;
      this.$refs.rqh.focus();
    },
  },
};
</script>