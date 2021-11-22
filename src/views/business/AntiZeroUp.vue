<template>
  <!-- 上架：货品返零捡位 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box">
      <div class="row row_small">
        <span class="problem three_em">自库位</span><input v-model="kw" @focus="hideVK" ref="kw" @keyup="kw=kw.toUpperCase()" @keyup.enter="checkMySite" class="input_small " />
      </div>
      <div class="row row_small">
        <span class="problem three_em" v-show="hasBox==0">箱号</span>
        <input v-model="xh" v-show="hasBox==0" @focus="hideVK($event,1)" ref="xh" @keyup="xh=xh.toUpperCase()" @keyup.enter="checkBox" class="input_small two_inp" />
        <span class="problem three_em">库位:荐</span><input v-model="tjkw" class="two_inp no_inp" readonly />
      </div>
      <div class="row row_small">
        <span class="problem three_em">货号</span>
        <input v-model="hp" @focus="hideVK($event,2)" ref="hp" class="two_inp input_small" @keyup="hp=hp.toUpperCase()" @keyup.enter="checkSkuEnter" />
        <span class="problem three_em">至库位</span>
        <input v-model="tokw" ref="tokw" @keyup="tokw=tokw.toUpperCase()" @keyup.enter="checkMoveEnter" class="two_inp input_small" @focus="hideVK" />
      </div>
      <div class="detail_page flex_deta">
        <div class="base_info">
          <div class="info_item">
            <p>货主</p>
            <p>LILANZ</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>扫描量</p>
            <p>{{skuList.length}}</p>
          </div>
        </div>
        <div class="tab_title page_tab_title" v-show="!hasHidden">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 8em)">唯一码</span>
          <span style="width:5em">操作</span>
        </div>
        <div class="no_list page_no_list" v-show="skuList.length<1 && !hasHidden">扫描货品才有数据哦~</div>
        <div class="page_table_content" v-show="skuList.length>0 && !hasHidden">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in skuList" :key="i">
            <span style="width:3em">{{skuList.length - i}}</span>
            <span style="width:calc(100% - 8em)" class="btn_span" @click="showSkuFun(i)">{{list.hp}}</span>
            <span style="width:5em"><span class="remove_btn" @click="removeSku(i)">移除</span></span>
          </div>
        </div>
      </div>
      <!-- 展示货品列表的描述和至库位 -->
      <div class="page_bg" v-show="showSku" @click="showSku=false"></div>
      <div class="page_box center_box" v-show="showSku">
        <p class="close" @click="showSku=false">×</p>
        <div class="">
          <h2>描述</h2>
          <p>{{skuInfo.hpms}}</p>
        </div>
      </div>
      <div class="loading_bg" v-show="loading">
        <div class="loading">
          <p>{{loadingMsg}}<span> 。。。</span></p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      kw: "", //自库位
      xh: "", //箱号
      hp: "", //货品
      skuList: [], //sku列表扫描
      sml: 0, //扫描量
      tokw: "", //至库位
      hasBox: 0, //是否展示箱号，根据检查自库位接口获得loseID参数决定1：不输入0：需要验证箱号
      loading: false,
      hasCheckKw: false, //是否检查过自库位
      hasCheckXh: false,
      loadingMsg: "请稍等",
      showList: false,
      hasHidden: false,
      skuInfo: {},
      showSku: false,
      tjkw: "",
    };
  },
  mounted() {
    this.$refs.kw.focus();
    window.onresize = () => {
      this.hasHidden = document.body.clientHeight < this.bodyH ? true : false;
    };
  },
  methods: {
    // 移除表格中的sku
    removeSku(index) {
      this.skuList.splice(index, 1);
    },
    // 点击表格中的sku,展示详情
    showSkuFun(index) {
      this.skuInfo = this.skuList[index];
      this.showSku = true;
    },
    // 检查自库位
    checkMySite() {
      if (!this.kw) {
        alert("请输入完整自库位信息~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}sj/hpflj/checkkw?storage=STORAGE_ZMC&kw=${this.kw}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`自库位${this.kw}: ${res.data.errmsg}`);
            this.kw = "";
            return;
          }
          this.hasBox = res.data.data.LOSEID; //是否丢失id,1:不输入箱号，0：要输入
          this.hasCheckKw = true;
          this.sml = res.data.data.searchRecord.length;
          if (this.hasBox == 0) {
            this.$refs.xh.focus();
          } else {
            this.$refs.hp.focus();
          }
        })
        .catch((error) => {
          this.loading = false;
          this.kw = "";
          alert(error);
        });
    },
    // 检查sku回车，根据hasBox判断是去哪个接口
    checkSkuEnter() {
      if (!this.hasCheckKw) {
        alert("请先检查自库位~");
        return;
      }
      if (!this.hasCheckXh && this.hasBox == 0) {
        alert("请先检查箱号~");
        return;
      }
      if (!this.kw || !this.hp) {
        alert("请检查自库位、货品SKU~");
        return;
      }
      if (!this.checkSKUList(this.hp)) {
        //判断出当前输入的码不是同一批
        return;
      }
      this.loading = true;
      // 此处根据hasBox参数来决定接口Url是否有box参数1:不需要箱号，0：需要箱号
      let url = "";
      if (this.hasBox == 0) {
        //需要验证箱号,不丢失箱号
        url = `${$apiUrl}sj/hpflj/checksku2?storage=STORAGE_ZMC&kw=${this.kw}&sku=${this.hp}&box=${this.xh}`;
      } else if (this.hasBox == 1) {
        //丢失箱号
        url = `${$apiUrl}sj/hpflj/checksku?storage=STORAGE_ZMC&kw=${this.kw}&sku=${this.hp}`;
      } else {
        alert(`LOSEID为${this.hasBox}: 参数传递有误，请联系it人员`);
        return;
      }
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`货品${this.hp}: ${res.data.errmsg}`);
            this.hp = "";
            return;
          }
          this.tjkw = res.data.data.LOC;
          this.skuList.unshift({ hp: this.hp, hpms: res.data.data.DESCR });
          this.sml++;
          this.hp = "";
        })
        .catch((error) => {
          this.loading = false;
          this.hp = "";
          alert(error);
        });
    },
    //    至库位回车
    checkMoveEnter() {
      if (!this.hasCheckKw) {
        alert("请先检查自库位~");
        return;
      }
      if (!this.kw || !this.tokw) {
        alert("请检查自库位、至库位~");
        return;
      }
      if (this.hasBox == 0 && !this.xh) {
        alert("请检查箱号~");
        return;
      }
      this.loading = true;
      // 此处根据hasBox参数来决定接口Url是否有box参数1:不需要箱号，0：需要箱号
      let url = "";
      if (this.hasBox == 0) {
        //需要验证箱号,不丢失箱号
        url = `${$apiUrl}sj/hpflj/checkdonekw2?storage=STORAGE_ZMC&ykw=${this.kw}&zkw=${this.tokw}&box=${this.xh}`;
      } else if (this.hasBox == 1) {
        //丢失箱号
        url = `${$apiUrl}sj/hpflj/checkdonekw?storage=STORAGE_ZMC&ykw=${this.kw}&zkw=${this.tokw}`;
      } else {
        alert(`LOSEID为${this.hasBox}: 参数传递有误，请联系it人员`);
        return;
      }
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
          }, 1500);
        })
        .catch((error) => {
          this.loading = false;
          alert(error);
        });
    },
    // 不丢失ID检查箱  回车测试箱号
    checkBox() {
      if (!this.xh) {
        alert("请检查至箱号数据是否完整！");
        return;
      }
      if (!this.hasCheckKw) {
        alert("请先检查自库位");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}sj/hpflj/checkbox?storage=STORAGE_ZMC&box=${this.xh}&kw=${this.kw}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(res.data.errmsg);
            this.xh = "";
            return;
          }
          this.hasCheckXh = true;
          this.$refs.hp.focus();
        })
        .catch((error) => {
          this.loading = false;
          this.xh = "";
          alert(error);
        });
    },
    // 每个扫描的sku都要检查，后六位随便，前面要一致，不然要提醒用户
    checkSKUList(sku) {
      if (this.skuList.length > 0) {
        if (
          this.skuList.find((el, index) => {
            return el.hp == sku;
          })
        ) {
          alert("重复添加啦~");
          this.hp = "";
          return false;
        }
        let skuListSku = this.skuList[0].hp.substring(
          0,
          this.skuList[0].hp.length - 6
        );
        if (skuListSku != sku.substring(0, sku.length - 6)) {
          alert(`货品${sku}：sku与其他sku不一致~`);
          this.hp = "";
          return false;
        }
      }
      return true;
    },
    // 清除界面上所有数据
    reset() {
      this.kw = "";
      this.hp = "";
      this.hpms = "";
      this.tokw = "";
      this.xh = "";
      this.sml = 0;
      this.skuList = [];
      this.loadingMsg = "请稍等";
      this.loading = false;
      this.hasCheckKw = false;
      this.$refs.kw.focus();
      this.tjkw = "";
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