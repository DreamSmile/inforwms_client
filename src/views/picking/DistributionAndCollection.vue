<template>
  <!-- 拣货：多品分播集货 -->
  <div class="all">
    <head-name></head-name>
    <div class="box">
      <div class="row">
        <span class="problem">货箱</span>
        <input @focus="hideVK" v-model="hx" ref="hx" @keyup="hx=hx.toUpperCase()" @keyup.enter="checkHx" />
      </div>
      <div class="row">
        <span class="problem">任务组</span>
        <input @focus="hideVK($event,1)" v-model="rwz" ref="rwz" @keyup="rwz=rwz.toUpperCase()" @keyup.enter="checkRwz" />
      </div>
      <div class="row">
        <span class="problem">集货位:荐</span>
        <input class="no_inp" v-model="tjjhw" readonly />
      </div>
      <div class="row">
        <span class="problem">集货位</span>
        <input @focus="hideVK($event,2)" v-model="jhw" ref="jhw" @keyup="jhw=jhw.toUpperCase()" @keyup.enter="checkJhw" />
      </div>
    </div>
    <!-- 按钮 -->
    <div class="btn_box" v-show="!hasHidden">
      <!-- <button class="reset_btn" @click="cancelXh">集货释放</button> -->
      <button class="btn_green" @click="showOkHis=true">完成记录({{hisList.length}})</button>
    </div>
    <!-- 完成列表 -->
    <div class="page_bg" v-show="showOkHis" @click.stop="showOkHis=false"></div>
    <div class="page_box" v-show="showOkHis">
      <div class="detail_table rw_list">
        <div class="tab_title">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 6em)">集货位</span>
          <span style="width:3em">箱数</span>
        </div>
        <div class="no_list" v-show="hisList.length<1">暂无完成的记录~</div>
        <div class="rw_list_table table_content" v-show="hisList.length>0">
          <div class="table_row table_data" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in hisList" :key="i">
            <span style="width:3em">{{i+1}}</span>
            <span style="width:calc(100% - 6em)">{{list.PARTFOCUSLOC}}</span>
            <span style="width:3em">{{list.NUM}}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 加载页面 -->
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
      bodyH: document.body.clientHeight,
      hasHidden: false,
      showOkHis: false,
      hisList: [], //集货完成列表
      hx: "",
      rwz: "",
      tjjhw: "",
      jhw: "",
      hasCheckHx: false,
    };
  },
  mounted() {
    this.$refs.hx.focus();
    window.onresize = () => {
      if (document.body.clientHeight < this.bodyH) {
        this.hasHidden = true;
      } else {
        this.hasHidden = false;
      }
    };
    this.getHisList();
  },
  methods: {
    // 获得历史
    getHisList() {
      let url = `${$apiUrl}jh/dpfbjh/jhlist?storage=STORAGE_ZMC`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            alert(res.data.errmsg);
            return;
          }
          this.hisList = res.data.data;
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    // 检查货箱
    checkHx() {
      this.loading = true;
      let url = `${$apiUrl}jh/dpfbjh/checkbox?storage=STORAGE_ZMC&box=${this.hx}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`货箱${this.hx}:${res.data.errmsg}`);
            this.hx = "";
            return;
          }
          this.hasCheckHx = true;
          this.$refs.rwz.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.hx = "";
          alert(err);
        });
    },
    // 检查任务组，并获得推荐集货位
    checkRwz() {
      if (!this.hasCheckHx) {
        alert("请先检查货箱~");
        this.rwz = "";
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/dpfbjh/getjhw?storage=STORAGE_ZMC&rwz=${this.rwz}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`任务组${this.rwz}:${res.data.errmsg}`);
            this.rwz = "";
            return;
          }
          this.tjjhw = res.data.data ? res.data.data.PARTFOCUSLOC : "无";
          this.$refs.jhw.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.rwz = "";
          alert(err);
        });
    },
    // 检查集货位
    checkJhw() {
      if (!this.hasCheckHx) {
        alert("请先检查货箱~");
        this.jhw = "";
        retrun;
      }
      if (this.tjjhw != "无" && this.jhw != this.tjjhw) {
        alert("请按照推荐集货位输入对应数据~");
        this.jhw = "";
        retrun;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/dpfbjh/checkjhw?storage=STORAGE_ZMC&jhw=${this.jhw}`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(`集货位${this.jhw}:${res.data.errmsg}`);
            this.jhw = "";
            return;
          }
          this.sure();
        })
        .catch((err) => {
          this.loading = false;
          this.jhw = "";
          alert(err);
        });
    },
    // 确定
    sure() {
      let url = `${$apiUrl}jh/dpfbjh/comfirm?storage=STORAGE_ZMC&jhw=${this.jhw}&box=${this.hx}&rwz=${this.rwz}`;
      this.axios
        .get(url)
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
    },
    // 释放
    cancelXh() {
      if (!this.jhw) {
        alert("请填入完整的集货位，再执行取消~");
        this.$refs.jhw.focus();
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/dpfbjhsf/cancel?storage=STORAGE_ZMC&jhw=${this.jhw}`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(res.data.errmsg);
            return;
          }
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    reset() {
      this.showOkHis = false;
      this.hx = "";
      this.rwz = "";
      this.tjjhw = "";
      this.jhw = "";
      this.hasCheckHx = false;
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.$refs.hx.focus();
      this.getHisList();
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