<template>
  <!-- 托盘箱：托盘箱绑定 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box">
      <div class="row row_small">
        <span class="problem three_em">库位</span>
        <input @focus="hideVK" v-model="kw" ref="kw" @keyup="kw=kw.toUpperCase()" @keyup.enter="checkKw" class="two_inp" />
        <span class="problem">托盘类型</span>
        <select v-model="tplx" class="tp_select two_inp">
          <option :value="10">普通</option>
          <option :value="20">鞋类</option>
          <option :value="30">立库</option>
          <option :value="40">其他</option>
          <option :value="50">退货托盘</option>
        </select>
      </div>
      <div class="row row_small">
        <span class="problem three_em">托盘号</span>
        <input @focus="hideVK($event,1)" v-model="tph" ref="tph" @keyup="tph=tph.toUpperCase()" @keyup.enter="checkTph" class="two_inp" />
        <span class="problem">箱号</span>
        <input @focus="hideVK($event,3)" v-model="xh" ref="xh" @keyup="xh=xh.toUpperCase()" @keyup.enter="checkXh" class="two_inp" />
      </div>
      <div class="detail_page">
        <div class="base_info">
          <div class="info_item">
            <p>需扫量</p>
            <p>{{sl}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>已扫量</p>
            <p>{{xhList.length}}</p>
          </div>
        </div>
        <!-- 扫描的箱号列表 -->
        <div class="detail_table_box">
          <div class="tab_title page_tab_title">
            <span style="width:3em">序号</span>
            <span style="width:calc(100% - 7em)">箱号</span>
            <span style="width:4em">操作</span>
          </div>
          <div class="no_list page_no_list" v-show="xhList.length<1 && !hasHidden">扫描箱号才有数据哦~</div>
          <div class="page_table_content" v-show="xhList.length>0 &&!hasHidden">
            <div class="table_row sku_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in xhList" :key="i">
              <span style="width:3em">{{xhList.length - i}}</span>
              <span style="width:calc(100% - 7em)">{{list}}</span>
              <span style="width:4em"><span class="remove_btn" @click="removeSku(i)">移除</span></span>
            </div>
          </div>
        </div>
      </div>
      <div class="btn_box" v-show="!hasHidden">
        <button @click="sure">确认绑定</button>
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
      bodyH: document.body.clientHeight,
      hasHidden: false,
      loading: false,
      loadingMsg: "请稍等",
      kw: "",
      tplx: 10,
      tph: "",
      sl: 0, //数量
      xh: "", //箱号
      hasCheckKw: false,
      hasCheckTph: false,
      hasCheckXh: false,
      xhList: [],
    };
  },
  mounted() {
    if (localStorage.getItem("tpxbd")) {
      try {
        let data = JSON.parse(localStorage.getItem("tpxbd"));
        if (
          data.userName == this.userName &&
          data.time + 21600000 < new Date().getTime()
        ) {
          if (confirm("是否使用缓存数据？")) {
            this.xhList = data.xhList;
            this.workIndex = data.workIndex;
            this.kw = data.kw;
            this.tplx = data.tplx;
            this.tph = data.tph;
            this.sl = data.sl; //数量
            this.$nextTick(() => {
              this.$refs.xh.focus();
            });
          } else {
            localStorage.removeItem("tpxbd");
          }
        } else {
          localStorage.removeItem("tpxbd");
        }
      } catch (error) {
        alert("缓存解析出错");
      }
    }
    this.$refs.kw.focus();
    // 返回按钮,当已经输入箱号，退出询问是否要缓存
    window.onBackClicked = () => {
      if (this.xhList.length < 1) {
        _JIAndroidObj.closeWKView();
      } else {
        if (confirm("退出是否保存当前任务进度？")) {
          let data = {
            userName: this.userName,
            xhList: this.xhList,
            workIndex: this.workIndex,
            kw: this.kw,
            tplx: this.tplx,
            tph: this.tph,
            sl: this.sl, //数量
            time: new Date().Time(),
          };
          localStorage.setItem("tpxbd", JSON.stringify(data));
          _JIAndroidObj.closeWKView();
        } else {
          localStorage.removeItem("tpxbd");
          _JIAndroidObj.closeWKView();
        }
      }
    };
  },
  methods: {
    // 移除
    removeSku(index) {
      this.loading = true;
      let url = `${$apiUrl}tpx/tpxjb/done?storage=STORAGE_ZMC&tpcode=${this.tph}&box=${this.xhList[index]}&type=0`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`移除${this.xhList[index]}失败:${res.data.errmsg}`);
            return;
          }
          this.xhList.splice(index, 1);
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    // 库位回车
    checkKw() {
      if (!this.kw) return;
      this.loading = true;
      let url = `${$apiUrl}tpx/tpxbd/checkkw?storage=STORAGE_ZMC&kw=${this.kw}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`库位：${this.kw}:${res.data.errmsg}`);
            this.kw = "";
            return;
          }
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
      if (!this.tph) {
        alert("请输入完整的tph");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/tpxbd/checktp?storage=STORAGE_ZMC&kw=${this.kw}&tpcode=${this.tph}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`托盘号${this.tph}:${res.data.errmsg}`);
            this.tph = "";
            return;
          }
          this.sl = res.data.data.PALLETSTATUS;
          this.hasCheckTph = true;
          this.$refs.xh.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.tph = "";
          alert(err);
        });
    },
    // 检查箱号，并且确认绑定
    checkXh() {
      if (!this.hasCheckKw || !this.hasCheckTph) {
        alert("请先检查库位、托盘号~");
        return;
      }
      // if (this.xhList.length<1) {
      //     alert('至少需要扫描1个箱，不允许绑定~');
      //     return
      // }
      this.loading = true;
      let url = `${$apiUrl}tpx/tpxbd/checkbox?storage=STORAGE_ZMC&kw=${this.kw}&tpcode=${this.tph}&box=${this.xh}&tptype=${this.tplx}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱号：${this.xh}:${res.data.errmsg}`);
            this.xh = "";
            return;
          }
          this.xhList.unshift(this.xh);
          this.xh = "";
        })
        .catch((err) => {
          this.loading = false;
          this.xh = "";
          alert(err);
        });
    },
    // 确定绑定
    sure() {
      if (!this.hasCheckKw || !this.hasCheckTph || this.xhList.length < 1) {
        alert("请按顺序检查[库位、托盘号、箱号]~");
        setCursor(2);
        return;
      }
      if (this.xhList.length != this.sl) {
        if (!confirm("扫描量与预收量不一致，是否确认绑定")) return;
      }
      this.loading = true;
      let sureUrl = `${$apiUrl}tpx/tpxbd/done?storage=STORAGE_ZMC&tpcode=${this.tph}`;
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
    },
    // 清空
    reset() {
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.kw = "";
      this.tplx = 10;
      this.tph = "";
      this.sl = 0; //数量
      this.xh = ""; //箱号
      this.xhList = [];
      this.hasCheckKw = false;
      this.hasCheckTph = false;
      this.hasCheckXh = false;
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