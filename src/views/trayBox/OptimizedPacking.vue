<template>
  <!-- 托盘箱：优化装箱 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box">
      <div class="row row_small"><span class="problem three_em">自库位</span><input @focus="hideVK" v-model="zkw" ref="zkw" @keyup="zkw=zkw.toUpperCase()" @keyup.enter="checkZkw" class="input_small" />
      </div>
      <div class="row row_small"><span class="problem three_em">货品</span><input @focus="hideVK($event,1)" class="two_inp" v-model="hp" ref="hp" @keyup="hp=hp.toUpperCase()" @keyup.enter="checkHp" />
        <span class="problem three_em">装箱量</span><input @focus="hideVK($event,false,true)" v-model="zxl" class="two_inp" ref="zxl" @blur="sureZxl" @keyup.enter="enterZxl" />
      </div>
      <div class="row row_small">
        <span class="problem three_em">箱号</span><input @focus="hideVK($event,3)" v-model="xh" class="two_inp" ref="xh" @keyup="xh=xh.toUpperCase()" @keyup.enter="checkXh" /><span class="problem three_em">至库位</span><input
          @focus="hideVK($event,4)" v-model="tokw" ref="tokw" @keyup="tokw=tokw.toUpperCase()" class="two_inp" @keyup.enter="sure" />
      </div>
      <div class="detail_page">
        <div class="base_info">
          <div class="info_item">
            <p>货主</p>
            <p>{{info.STORERKEY || '未知'}}</p>
          </div>
          <div class="line"></div>

          <div class="info_item">
            <p>包装量</p>
            <p>{{info.PACKKEY >=0?info.PACKKEY:"未知"}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>当前库存</p>
            <p>{{info.NUM >=0?info.NUM:"未知"}}</p>
          </div>
        </div>
        <div class="detail_row" v-show="!hasHidden">
          <span>库位SKU</span>
          <span>{{info.SKU || "未知"}}</span>
        </div>
        <div class="detail_row" v-show="!hasHidden">
          <span>货品</span>
          <span>{{hp || "未知"}}</span>
        </div>
        <div class="detail_row" v-show="!hasHidden">
          <span>推荐库位</span>
          <span>{{info.ZKW || "未知"}}</span>
        </div>
        <div class="detail_row" v-show="!hasHidden">
          <span>说明</span>
          <span>{{info.DESCR || "未知"}}</span>
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
      bodyH: document.body.clientHeight,
      loading: false,
      loadingMsg: "请稍等",
      zkw: "",
      hp: "",
      xh: "",
      zxl: 1,
      tokw: "",
      hasHidden: false, //是否展示表格，当软键盘弹出
      info: {},
      hasCheckZkw: false, //是否检查自库位
      hasCheckHp: false,
    };
  },
  async mounted() {
    this.$refs.zkw.focus();
    window.onresize = () => {
      this.hasHidden = document.body.clientHeight < this.bodyH ? true : false;
    };
  },
  methods: {
    // 检查自库位
    checkZkw() {
      if (!this.zkw) {
        alert("请输入库位~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/yhzx/checkkw?storage=STORAGE_ZMC&kw=${this.zkw}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`自库位${this.zkw}: ${res.data.errmsg}`);
            this.zkw = "";
            return;
          }
          this.hasCheckZkw = true;
          this.$refs.hp.focus();
        })
        .catch((error) => {
          this.loading = false;
          this.zkw = "";
          alert(error);
        });
    },
    // 货品扫描
    checkHp() {
      if (!this.hasCheckZkw) {
        alert("请先扫描自库位~");
        return;
      }
      if (!this.hp) return;
      this.loading = true;
      let url = `${$apiUrl}tpx/yhzx/checksku?storage=STORAGE_ZMC&kw=${this.zkw}&sku=${this.hp}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(res.data.errmsg);
            this.hp = "";
            this.$refs.hp.focus();
            return;
          }
          this.hasCheckHp = true;
          this.info = res.data.data;
          //         "PACKKEY": "1-1-40",       --包装代码，最后40为包装数量
          this.info.PACKKEY = this.info.PACKKEY.substring(
            this.info.PACKKEY.lastIndexOf("-") + 1
          );
          this.$refs.zxl.focus();
        })
        .catch((error) => {
          this.loading = false;
          this.hp = "";
          alert(error);
        });
    },
    // 回车装箱量，判断是否数字格式，光标跳转到箱号栏
    sureZxl() {
      if (!this.info.NUM) {
        alert("请先检查货品~");
        this.zxl = 1;
        return;
      }
      if (
        !isNaN(this.zxl) &&
        this.zxl != 0 &&
        this.zxl <= this.info.NUM &&
        this.zxl <= this.info.PACKKEY
      ) {
        if (this.zxl != this.info.PACKKEY) {
          if (confirm("装箱量与箱数量不一致，是否确定？")) {
            this.$refs.xh.focus();
          } else {
            this.$refs.zxl.focus();
          }
        }
      } else {
        this.zxl = 1;
        this.loading = true;
        this.loadingMsg = `装箱量请小于${
          this.info.NUM > this.info.PACKKEY ? this.info.PACKKEY : this.info.NUM
        }`;
        setTimeout(() => {
          this.loading = false;
          this.loadingMsg = "请稍等";
          this.$refs.zxl.select();
        }, 1200);
      }
    },
    // 装箱量回车
    enterZxl() {
      this.$refs.xh.focus();
    },
    // 检查箱号
    async checkXh() {
      if (!this.hasCheckZkw || !this.hasCheckHp) {
        alert("请按照步骤输入数据~");
        this.xh = "";
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}tpx/yhzx/checkbox?storage=STORAGE_ZMC&box=${this.xh}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱号：${this.xh}: ${res.data.errmsg}`);
            this.xh = "";
            return;
          }
          this.hasCheckZkw = true;
          this.$refs.tokw.focus();
        })
        .catch((error) => {
          this.loading = false;
          this.xh = "";
          alert(error);
        });
    },
    //    回车自库位，确定
    sure() {
      if (!this.hasCheckZkw || !this.hasCheckHp) {
        alert("请按照步骤输入数据~");
        this.xh = "";
        return;
      }
      if (!this.tokw) return;
      this.loading = true;
      let url = `${$apiUrl}tpx/yhzx/done?storage=STORAGE_ZMC&kw=${this.zkw}&sku=${this.hp}&box=${this.xh}&zkw=${this.tokw}&num=${this.zxl}`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(res.data.errmsg);
            this.tokw = "";
            return;
          }
          this.loadingMsg = res.data.errmsg;
          setTimeout(() => {
            this.reset();
          }, 1500);
        })
        .catch((error) => {
          this.loading = false;
          this.tokw = "";
          alert(error);
        });
    },
    reset() {
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.zkw = "";
      this.hp = "";
      this.xh = "";
      this.zxl = 1;
      this.tokw = "";
      this.hasHidden = false;
      this.info = {};
      this.hasCheckZkw = false;
      this.hasCheckHp = false;
      this.$refs.zkw.focus();
    },
    hideVK(e, index, isNum) {
      if (index) {
        this.setCursor(index);
      }
      if (isNum) {
        this.$refs.zxl.select();
      } //数量选中就是全选
      e.target.setAttribute("readonly", true);
      setTimeout(() => {
        e.target.removeAttribute("readonly");
      }, 100);
    },
  },
};
</script>