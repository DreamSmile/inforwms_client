<template>
  <!-- 发货：拣货发运 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box">
      <div class="row row_small">
        <span class="problem three_em">发运号</span>
        <input @focus="hideVK" class="input_small" v-model="fyh" ref="fyh" @keyup="fyh=fyh.toUpperCase()" @keyup.enter="checkFyh" />
      </div>
      <div class="row row_small">
        <span class="problem three_em">托盘号</span>
        <input @focus="hideVK($event,1)" class="input_small" v-model="tph" ref="tph" @keyup="tph=tph.toUpperCase()" @keyup.enter="checkTph" />
      </div>
      <div class="row row_small">
        <span class="problem three_em">箱号</span>
        <input @focus="hideVK($event,2)" class="two_inp" v-model="xh" ref="xh" @keyup="xh=xh.toUpperCase()" />
        <span class="problem three_em">承运商</span>
        <input v-model="info.COMPANY" class="no_inp two_inp" readonly />
      </div>
      <div class="detail_page">
        <div class="base_info">
          <div class="info_item">
            <p>需扫量</p>
            <p>{{info.NUM || '0'}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>已扫量</p>
            <p>{{xhList.length}}</p>
          </div>
        </div>
        <div class="tab_title page_tab_title">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 3em)">箱号</span>
        </div>
        <div class="page_table_content" v-show="!hasHidden">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in xhList" :key="i">
            <span style="width:3em">{{xh.length - i}}</span>
            <span style="width:calc(100% - 3em)">{{list}}</span>
          </div>
        </div>
      </div>
      <div class="btn_box" v-show="!hasHidden">
        <button class="btn_green" @click="showFyhList=true">发运号列表({{fyhList.length}})</button>
        <button @click="checkXh">确认箱号</button>
      </div>
    </div>
    <!-- 查看发运号列表信息 -->
    <div class="page_bg" v-show="showFyhList" @click.stop="showFyhList=false"></div>
    <div class="page_box" v-show="showFyhList">
      <div class="detail_table rw_list">
        <div class="tab_title">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 3em)">发运号</span>
        </div>
        <div class="rw_list_table table_content">
          <div class="table_row table_data" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in fyhList" :key="i" @click="choiceFyh(i)">
            <span style="width:2em">{{i+1}}</span>
            <span style="width:calc(100% - 3em)">{{list.SHIPPINGKEY}}</span>
          </div>
        </div>
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
      bodyH: document.body.clientHeight,
      hasHidden: false,
      showFyhList: false,
      fyhList: [], //发运号列表
      fyh: "",
      tph: "",
      xh: "",
      info: {},
      xhList: [],
      hasCheckFyh: false,
      hasCheckTph: false,
    };
  },
  mounted() {
    this.$refs.fyh.focus();
    this.getFyhList();
    window.onresize = () => {
      this.hasHidden = document.body.clientHeight < this.bodyH ? true : false;
    };
  },
  methods: {
    //  循环确定扫描箱号
    checkXh() {
      if (this.info.NUM == "无") {
        alert("该发运单不需要扫描箱号~");
        this.xh = "";
        return;
      }
      if (!this.hasCheckFyh || !this.hasCheckTph) {
        alert("请先检查发运号与托盘号~");
        this.xh = "";
        return;
      }
      if (!this.xh) {
        alert("请输入完整箱号~");
        this.$refs.xh.focus();
        return;
      }
      if (this.xhList.indexOf(this.xh) != -1) {
        alert(`${this.xh}重复扫描`);
        this.$refs.xh.focus();
        this.xh = "";
        return;
      }
      this.loading = true;
      let url = `${this.$apiUrl}fy/jhfy/checkbox?storage=STORAGE_ZMC&box=${this.xh}&fyh=${this.fyh}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱号${this.xh}:${res.data.errmsg}`);
            this.xh = "";
            this.$refs.xh.focus();
            return;
          }
          this.sureXh();
        })
        .catch((err) => {
          this.loading = false;
          this.xh = "";
          alert(err);
        });
    },
    // 确定箱号
    sureXh() {
      this.loading = true;
      let url = `${this.$apiUrl}fy/jhfy/comfirm?storage=STORAGE_ZMC&box=${this.xh}&fyh=${this.fyh}&tpcode=${this.tph}&cys=${this.info.COMPANY}`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(res.data.errmsg);
            this.xh = "";
            return;
          }
          this.xhList.unshift(this.xh);
          this.xh = "";
          if (this.xhList.length >= this.info.NUM) {
            console.log("任务完成");
            this.loadingMsg = "任务全部完成~";
            setTimeout(() => {
              this.reset();
            }, 1500);
            return;
          }
          this.loading = false;
          this.$refs.xh.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.xh = "";
          alert(err);
        });
    },
    reset() {
      this.fyhList = [];
      this.fyh = "";
      this.tph = "";
      this.xh = "";
      this.info = {};
      this.xhList = [];
      this.hasCheckFyh = false;
      this.hasCheckTph = false;
      this.getFyhList();
      this.$refs.fyh.focus();
      this.loading = false;
      this.loadingMsg = "请稍等";
    },
    // 选中发运列表中的某一条数据
    choiceFyh(index) {
      if (this.fyh) {
        let r = confirm("是否更换发运号，将会重置信息~");
        if (!r) return;
      }
      this.showFyhList = false;
      this.hasCheckFyh = false;
      this.fyh = this.fyhList[index].SHIPPINGKEY;
      this.checkFyh();
    },
    // 检查发运号
    checkFyh() {
      if (!this.fyh) {
        alert("请输入发运号");
        return;
      }
      this.loading = true;
      let url = `${this.$apiUrl}fy/jhfy/checkfyh?storage=STORAGE_ZMC&fyh=${this.fyh}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`发运号${this.fyh}:${res.data.errmsg}`);
            this.fyh = "";
            return;
          }
          this.info = res.data.data;
          this.info.COMPANY = this.info.COMPANY ? this.info.COMPANY : "无";
          this.info.NUM = this.info.NUM ? this.info.NUM : "无";
          this.hasCheckFyh = true;
          this.$refs.tph.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.fyh = "";
          alert(err);
        });
    },
    //    获得发运号列表
    getFyhList() {
      this.loading = true;
      let url = `${this.$apiUrl}/fy/jhfy/fyhlist?storage=STORAGE_ZMC`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(res.data.errmsg);
            return;
          }
          this.fyhList = res.data.data;
          if (this.fyhList.length < 1) {
            alert("发运号列表数量为0~");
          }
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    // 检查托盘号
    checkTph() {
      this.loading = true;
      let url = `${this.$apiUrl}fy/jhfy/checktp?storage=STORAGE_ZMC&tpcode=${this.tph}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`托盘号${this.tph}:${res.data.errmsg}`);
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