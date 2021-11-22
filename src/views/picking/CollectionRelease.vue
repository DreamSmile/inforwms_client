<template>
  <!-- 拣货：多品分播集货释放 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box">
      <div class="row row_small">
        <span class="problem three_em">集货位</span>
        <input @focus="hideVK" v-model="jhw" ref="jhw" @keyup="jhw=jhw.toUpperCase()" @keyup.enter="checkJhw" />
      </div>
      <div class="row row_small">
        <span class="problem three_em">箱数</span>
        <input v-model="xs" class="no_inp" readonly />
      </div>
      <div class="detail_page">
        <div class="tab_title page_tab_title">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 6em)">集货位</span>
          <span style="width:3em">箱数</span>
        </div>
        <div class="no_list page_no_list" v-show="hisList.length<1 && !hasHidden">无可释放数据~</div>
        <div class="page_table_content" v-show="hisList.length>0 && !hasHidden">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in hisList" :key="i" @click="choiceJhw(i)">
            <span style="width:3em">{{i+1}}</span>
            <span style="width:calc(100% - 6em)">{{list.PARTFOCUSLOC}}</span>
            <span style="width:3em">{{list.NUM}}</span>
          </div>
        </div>
      </div>
      <!-- 按钮 -->
      <div class="btn_box" v-show="!hasHidden">
        <button @click="cancel">确定释放</button>
        <!-- <button class="btn_green" @click="showOkHis=true">完成记录</button> -->
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
      jhw: "",
      xs: "",
      hisList: [],
      hasCheckJhw: false,
    };
  },
  mounted() {
    this.$refs.jhw.focus();
    window.onresize = () => {
      this.hasHidden = document.body.clientHeight < this.bodyH ? true : false;
    };
    this.getHisList();
  },
  methods: {
    // 拣货位
    choiceJhw(index) {
      if (this.jhw) {
        let r = confirm("是否更换集货位？");
        if (!r) return;
      }
      this.jhw = this.hisList[index].PARTFOCUSLOC;
      this.checkJhw();
    },
    // 检查集货位
    checkJhw() {
      if (!this.jhw) {
        alert("请输入完整集货位~");
        return;
      }
      let url = `${$apiUrl}jh/dpfbjhsf/checkjhw?storage=STORAGE_ZMC&jhw=${this.jhw}`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            alert(`集货位${this.jhw}:${res.data.errmsg}`);
            this.jhw = "";
            return;
          }
          this.xs = res.data.data.NUM;
          this.hasCheckJhw = true;
        })
        .catch((err) => {
          this.loading = false;
          this.jhw = "";
          alert(err);
        });
    },
    // 获得历史
    getHisList() {
      let url = `${$apiUrl}jh/dpfbjhsf/jhwlist?storage=STORAGE_ZMC`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode == 404) return;
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

    // 释放
    cancel() {
      if (!this.jhw) {
        alert("请先填入完整的集货位~");
        this.$refs.jhw.focus();
        return;
      }
      if (!confirm("请确认是否释放")) return;
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
    reset() {
      this.hisList = [];
      this.getHisList();
      this.jhw = "";
      this.xs = "";
      this.hasCheckJhw = false;
      this.loadingMsg = "请稍等";
      this.loading = false;
      this.$refs.jhw.focus();
    },
    hideVK(e) {
      e.target.setAttribute("readonly", true);
      setTimeout(() => {
        e.target.removeAttribute("readonly");
      }, 100);
    },
  },
};
</script>