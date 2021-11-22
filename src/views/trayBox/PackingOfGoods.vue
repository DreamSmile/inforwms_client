<template>
  <!-- 托盘箱：货品装箱 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box">
      <div class="row row_small"><span class="problem three_em">自库位:</span><input @focus="hideVK" v-model="zkw" class="two_inp" ref="zkw" @keyup="zkw=zkw.toUpperCase()" @keyup.enter="checkZkw" />
        <span class="problem three_em">至库位:</span><input @focus="hideVK($event,1)" v-model="tokw" class="two_inp" ref="tokw" @keyup="tokw=tokw.toUpperCase()" @keyup.enter="checkTokw" />
      </div>
      <div class="row row_small">
        <span class="problem three_em">箱号:</span><input @focus="hideVK($event,2)" v-model="xh" class="two_inp" ref="xh" @keyup="xh=xh.toUpperCase()" @keyup.enter="checkXh" />
        <span class="problem three_em">箱型:</span>
        <select v-model="xx" @change="changeSel" :disabled="skuList.length>0" class="two_inp two_select">
          <option :value="10">整箱</option>
          <option :value="20">混箱</option>
        </select>
      </div>
      <div class="row row_small">
        <span class="problem three_em">货品:</span><input @focus="hideVK($event,3)" v-model="hp" class="two_inp" ref="hp" @keyup="hp=hp.toUpperCase()" @keyup.enter="checkHp" />
        <!-- <span class="problem three_em" v-show="xx==10">装箱量:</span><input v-show="xx==10" v-model="zxl"
                    class="two_inp no_inp" readonly /> -->
        <span class="problem three_em" v-show="xx==20">扫描量:</span><input v-show="xx==20" v-model="skuList.length" class="two_inp no_inp" readonly />
      </div>
      <div class="detail_page">
        <div class="base_info" v-show="xx==10">
          <div class="info_item">
            <p>装箱量</p>
            <p>{{zxl}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>已占用</p>
            <p>{{oldZxl}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>已扫量</p>
            <p>{{skuList.length}}</p>
          </div>
        </div>
        <div class="tab_title page_tab_title">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 3em)">唯一码</span>
        </div>
        <div :class="['no_list page_no_list',xx==20?'table_content':'']" v-show="skuList.length<1 && !hasHidden">
          扫描条码才有数据哦~</div>
        <div :class="['page_table_content',xx==20?'table_content':'']" v-show="skuList.length>0 && !hasHidden">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in skuList" :key="i">
            <span style="width:3em">{{skuList.length - i}}</span>
            <span style="width:calc(100% - 3em)">{{list.name}}</span>
          </div>
        </div>
      </div>
      <div class="btn_box" v-show="!hasHidden">
        <button class="reset_btn" @click="resetXh">清空货箱</button>
        <button @click="sure">提交</button>
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
      loading: false,
      loadingMsg: "请稍等",
      zkw: "",
      tokw: "",
      xh: "",
      xx: 10,
      hp: "",
      hasHidden: false, //是否展示表格，当软键盘弹出
      info: {},
      skuList: [],
      hasCheckZkw: false,
      hasCheckTokw: false,
      hasCheckXh: false,
      zxl: 0,
      oldZxl: 0,
      isFirstCheckSku: true,
    };
  },
   mounted() {
    this.$refs.zkw.focus();
    try {
      _JIAndroidObj.controlGoBack();
    } catch (error) {
      alert("监听返回错误 ");
    }
    window.onresize = () => {
      this.hasHidden = document.body.clientHeight < this.bodyH ? true : false;
    };
  },
  methods: {
    // 移除货品
    removeHp(index) {
      this.skuList.splice(index, 1);
      this.$refs.hp.focus();
    },
    // 检查自库位
    checkZkw() {
      if (!this.zkw) {
        alert("请输入完整自库位~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/hpzx/checkkw?storage=STORAGE_ZMC&kw=${this.zkw}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`自库位${this.zkw}: ${res.data.errmsg}`);
            this.zkw = "";
            return;
          }
          this.$refs.tokw.focus();
          this.hasCheckZkw = true;
        })
        .catch((error) => {
          this.loading = false;
          this.zkw = "";
          alert(error);
        });
    },
    //    检查至库位
    checkTokw() {
      if (!this.hasCheckZkw) {
        alert("请先检查自库位~");
        this.tokw = "";
        return;
      }
      if (!this.tokw) {
        alert("请输入完整至库位~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/hpzx/checkzkw?storage=STORAGE_ZMC&zkw=${this.tokw}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`至库位${this.tokw}: ${res.data.errmsg}`);
            this.tokw = "";
            return;
          }
          this.$refs.xh.focus();
          this.hasCheckTokw = true;
        })
        .catch((error) => {
          this.loading = false;
          this.tokw = "";
          alert(error);
        });
    },
    // 检查箱号
    checkXh() {
      if (!this.hasCheckZkw || !this.hasCheckTokw) {
        alert("请先检查自库位与至库位~");
        this.xh = "";
        return;
      }
      if (!this.xh) {
        alert("请输入完整箱号~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/hpzx/checkbox?storage=STORAGE_ZMC&kw=${this.zkw}&zkw=${this.tokw}&box=${this.xh}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱号${this.xh}: ${res.data.errmsg}`);
            this.xh = "";
            return;
          }
          this.$refs.hp.focus();
          this.hasCheckXh = true;
        })
        .catch((error) => {
          this.loading = false;
          this.xh = "";
          alert(error);
        });
    },
    // 更换箱型，将光标跳转
    changeSel() {
      this.$refs.hp.focus();
    },
    // 输入货号，两种模式，箱型为整箱的时候只要扫描一个sku就提交，混箱的时候就要循环扫描多个sku
    checkHp() {
      if (!this.hasCheckZkw || !this.hasCheckTokw || !this.hasCheckXh) {
        alert("请先检查自库位、至库位、箱号~");
        this.hp = "";
        return;
      }
      if (this.hp.length < 16) {
        alert("货品长度要大于16哦~~");
        this.hp = "";
        return;
      }
      if (
        this.xx == 10 &&
        this.zxl <= this.skuList.length &&
        this.skuList.length > 0
      ) {
        alert(`只需要${this.zxl}件货品~`);
        return;
      }
      // 在整箱模式下，sku需要一致
      if (this.skuList.length > 0) {
        // 不管整箱还是混箱都要限制唯一值
        if (
          this.skuList.find((el, index) => {
            return el.name == this.hp;
          })
        ) {
          alert("重复添加啦~");
          this.hp = "";
          return;
        }
        let skuListSku = this.skuList[0].name.substring(
          0,
          this.skuList[0].name.length - 6
        );
        if (
          skuListSku != this.hp.substring(0, this.hp.length - 6) &&
          this.xx == 10
        ) {
          alert(`整箱模式下，货品${this.hp}：sku与其他sku不一致~`);
          this.hp = "";
          return;
        }
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/hpzx/checksku?storage=STORAGE_ZMC&kw=${this.zkw}&zkw=${this.tokw}&box=${this.xh}&sku=${this.hp}&boxtype=${this.xx}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`货品${this.hp}: ${res.data.errmsg}`);
            this.hp = "";
            return;
          }
          if (this.xx == 10) {
            this.zxl = res.data.data.QTY;
            if (this.isFirstCheckSku) {
              this.oldZxl = res.data.data.NUM;
            }
          }
          this.skuList.unshift({ name: this.hp });
          this.$refs.hp.focus();
          this.isFirstCheckSku = false;
          this.hp = "";
          if (
            this.xx == 10 &&
            this.zxl <= this.skuList.length + this.oldZxl &&
            this.skuList.length > 0
          ) {
            this.loading = true;
            this.loadingMsg = "已达到最大装箱量，请提交~";
            setTimeout(() => {
              this.loadingMsg = "请稍等";
              this.loading = false;
            }, 1200);
          }
        })
        .catch((error) => {
          this.loading = false;
          this.hp = "";
          alert(error);
        });
    },
    // 清空箱号重置所有数据
    resetXh() {
      let r = confirm("清空货箱，会重置所有数据，请确认是否清空");
      if (!r) return;
      if (!this.hasCheckZkw || !this.hasCheckTokw || !this.hasCheckXh) {
        alert("请先检查自库位与至库位~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/hpzx/clean?storage=STORAGE_ZMC&kw=${this.zkw}&zkw=${this.tokw}&box=${this.xh}`;
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
        .catch((error) => {
          this.loading = false;
          alert(error);
        });
    },
    // 确定提交
    sure() {
      if (!this.hasCheckZkw || !this.hasCheckTokw || !this.hasCheckXh) {
        alert("请先检查自库位、至库位、箱号~");
        return;
      }
      if (this.xx == 10 && this.zxl < this.skuList.length + this.oldZxl) {
        if (!confirm("数量未达到装箱量是否确认提交？")) return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/hpzx/done?storage=STORAGE_ZMC&kw=${this.zkw}&zkw=${this.tokw}&box=${this.xh}`;
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
        .catch((error) => {
          this.loading = false;
          alert(error);
        });
    },
    reset() {
      this.zkw = "";
      this.tokw = "";
      this.xh = "";
      this.xx = 10;
      this.hp = "";
      this.hasHidden = false; //是否展示表格，当软键盘弹出
      this.info = {};
      this.skuList = [];
      this.hasCheckZkw = false;
      this.hasCheckTokw = false;
      this.hasCheckXh = false;
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.$refs.zkw.focus();
      this.zxl = 0;
      this.oldZxl = 0;
      this.isFirstCheckSku = true;
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