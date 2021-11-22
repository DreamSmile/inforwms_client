<template>
  <!-- 收货：按箱收货 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box">
      <div class="row row_small"><span class="problem two_em">库位</span><input v-model="kw" :class="['two_inp',{no_inp:hasCheckKw}]" @keyup.enter="checkKw" @focus="hideVK" ref="kw" @keyup="kw=kw.toUpperCase()" class="two_inp input_small" />
        <span class="problem three_em" @click="showList=true">箱号</span><input v-model="xh" @keyup.enter="checkXh" @focus="hideVK($event,1)" ref="xh" @keyup="xh=xh.toUpperCase()" :class="['two_inp input_small',{no_inp:hasCheckXh}]" />
      </div>
      <div class="row row_small">
        <span class="problem two_em">货品</span><input v-model="rfid" class="two_inp input_small" ref="rfid" @keyup.enter="rfSave" @focus="hideVK($event,2)" @keyup="rfid=rfid.toUpperCase()" />
        <span class="problem three_em">ASN号</span><input v-model="info.ASN" class="two_inp no_inp input_small" readonly ref="asn" />
      </div>
      <div class="detail_page">
        <div class="base_info">
          <div class="info_item">
            <p>货主</p>
            <p>{{info.HZ || '未知'}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>是否混箱</p>
            <p :class="{red_em:info.MIXMARK==1}">{{info.MIXMARK=="1"?'是':'否'}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>预收量</p>
            <p>{{info.TOTALQTY>=0?info.TOTALQTY:"未知"}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>实收量</p>
            <p>{{rfList.length}}</p>
          </div>
        </div>
        <div class="tab_title page_tab_title" v-show="!hasHidden">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 8em)">唯一码</span>
          <span style="width:5em">操作</span>
        </div>
        <div class="no_list page_no_list" v-show="rfList.length<1 && !hasHidden">扫描货品才有数据哦~</div>
        <div class="page_table_content" v-show="rfList.length>0 && !hasHidden">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in rfList" :key="i">
            <span style="width:3em">{{rfList.length - i}}</span>
            <span style="width:calc(100% - 8em)">{{list}}</span>
            <span style="width:5em"><span class="remove_btn" @click="remove_rf(i)">移除</span></span>
          </div>
        </div>
      </div>
      <div class="btn_box" v-show="!hasHidden">
        <button @click="showRf=true" class="btn_green" v-show="isOver">详情</button>
        <button @click="openRF" class="btn_green">{{!isOpenRFID?"扫":"关"}}RFID</button>
        <button @click="sure">确认收货</button>
      </div>
    </div>
    <div class="loading_bg" v-show="loading">
      <div class="loading">
        <p>{{loadingMsg}}<span> 。。。</span></p>
      </div>
    </div>
    <!-- 绑定的数据：只有在检查箱号504时才显示 -->
    <div class="page_bg" v-show="showRf" @click.stop="showRf=false"></div>
    <div class="page_box" v-show="showRf">
      <div class="detail_table">
        <div class="tab_title">
          <span style="width:10%;min-width:2em">序号</span>
          <span style="width:35%">箱号</span>
          <span style="width:45%">SKU</span>
          <span style="width:10%;min-width:2em">数量</span>
        </div>
        <div class="no_list" v-show="boxList.length==0">没有数据~</div>
        <div class="table_content" v-show="boxList.length>0">
          <div class="table_row table_data" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in boxList" :key="i">
            <span style="width:10%;min-width:2em">{{i+1}}</span>
            <span style="width:35%">{{list.ID}}</span>
            <span style="width:45%">{{list.SKU}}</span>
            <span style="width:10%;min-width:2em">{{list.QTY}}</span>
          </div>
        </div>
      </div>
    </div>
    <remote-script src="http://tm.lilanz.com/oa/api/lilanzAppWVJBridge-0.1.6.min.js?ver=0.1"></remote-script>
    <remote-script src="http://tm.lilanz.com/oa/project/rfid/js/rfid.js"></remote-script>
  </div>
</template>
<script>
export default {
  data() {
    return {
      bodyH: document.body.clientHeight,
      hasHidden: false,
      loading: false,
      userName: "",
      loadingMsg: "请稍等",
      kw: "",
      xh: "",
      hz: "",
      info: {},
      boxList: [], //箱号列表
      showList: false, //是否展示箱号列表
      hasCheckKw: false, //是否检查过库位
      hasCheckXh: false, //是否检查过箱号
      skuList: [], //接口获得数据，将使用在扫描rf中，rf=sku+6位唯一值
      showRf: false,
      rfid: "",
      rfl: 0, //扫描的rf量
      rfList: [], //扫描的rf
      isOpenRFID: false, //是否开始rfid
      isOver: false,
    };
  },
  mounted() {
    this.$refs.kw.focus();
    window.onresize = () => {
      this.hasHidden = document.body.clientHeight < this.bodyH ? true : false;
    };
    try {
      _JIAndroidObj.RFID_Init();
    } catch (error) {
      alert("初始化rfid功能失败");
    }
  },
  methods: {
    // 去除某rfid
    remove_rf(index) {
      this.rfList.splice(index, 1);
    },
    // 开启RFID接口
    openRF() {
      if (!this.hasCheckKw || !this.hasCheckXh) {
        alert("请检查库位、箱号后，开启rfid扫描~");
        setCursor(2);
        return;
      }
      // if (this.skuList.length < 1) { alert("请检查库位和箱号后，开启rfid扫描~"); return; }
      this.isOpenRFID = !this.isOpenRFID;
      try {
        if (!this.isOpenRFID) {
          _JIAndroidObj.RFID_Stop();
        } else {
          _JIAndroidObj.RFID_Start(1000);
        }
      } catch (error) {
        alert(error);
      }
    },
    // 扫描rf,将数据存入表格,rf为接口获得sku+6位唯一值
    rfSave() {
      if (!this.rfid) {
        alert("请扫描完整货品~");
        return;
      }
      if (this.rfList.indexOf(this.rfid) != -1) {
        alert(`${this.rfid}重复扫描~`);
        this.rfid = "";
        return;
      }
      if (this.rfList.length > 0) {
        let rfListSku = this.rfList[0].substring(0, this.rfList[0].length - 6);
        console.log(rfListSku);
        if (rfListSku != this.rfid.substring(0, this.rfid.length - 6)) {
          alert(`货品${this.rfid}：sku与其他sku不一致~`);
          this.rfid = "";
          return;
        }
      }
      this.loading = true;
      let url = `${$apiUrl}sh/axsh/checksku?storage=STORAGE_ZMC&box=${this.xh}&sku=${this.rfid}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`货品${this.rfid}: ${res.data.errmsg}`);
            this.rfid = "";
            reject();
            return;
          }
          this.rfList.unshift(this.rfid);
          this.rfid = "";
        })
        .catch((error) => {
          this.loading = false;
          this.rfid = "";
          alert(error);
        });
    },
    // rf扫描处理
    rusultHandel(res) {
      if (this.rfList.indexOf(res) != -1) {
        //重复扫描
        return;
      }
      if (this.rfList.length > 0) {
        let rfListSku = this.rfList[0].substring(0, this.rfList[0].length - 6);
        if (rfListSku != res.substring(0, res.length - 6)) {
          return;
        }
      }
      this.rfList.unshift(res);
    },
    // 执行检查库位，检查箱号，绑定箱列表（额外界面），确认绑定
    // 回车检查库位
    checkKw() {
      if (!this.kw) {
        alert("请输入库位~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}sh/axsh/checkkw?storage=STORAGE_ZMC&kw=${this.kw}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`库位${this.kw}: ${res.data.errmsg}`);
            this.kw = "";
            return;
          }
          this.hasCheckKw = true;
          this.$refs.xh.focus();
        })
        .catch((error) => {
          this.loading = false;
          this.kw = "";
          alert(error);
        });
    },
    // 检查箱号并获得货品数据
    checkXh() {
      if (!this.hasCheckKw || !this.kw) {
        alert("请先检查库位~");
        return;
      }
      if (!this.xh) {
        alert("请输入完整箱号");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}sh/axsh/checkbox?storage=STORAGE_ZMC&box=${this.xh}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          // 当该箱是已经绑定过的
          if (res.data.errcode == 504) {
            // 获得绑定的数据
            let listUrl = `${$apiUrl}sh/axsh/boxlist?storage=STORAGE_ZMC&box=${this.xh}`;
            this.axios
              .get(listUrl)
              .then((resData) => {
                this.loading = false;
                if (resData.data.errcode != 0) {
                  this.xh = "";
                  alert(`箱号${this.xh}: ${resData.data.errmsg}`);
                  return;
                }
                this.boxList = resData.data.data;
                this.isOver = true;
                alert(`箱号${this.xh}: 已绑定,请点击"详情"查看数据~`);
                this.xh = "";
              })
              .catch((error) => {
                this.loading = false;
                this.xh = "";
                alert(error);
              });
            return;
          }
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(`箱号${this.xh}: ${res.data.errmsg}`);
            this.xh = "";
            return;
          }
          this.boxList = []; //清除掉504展示的绑定箱数据
          this.isOver = false;
          this.$refs.rfid.focus();
          this.hasCheckXh = true;
          this.info = res.data.data;
        })
        .catch((error) => {
          this.loading = false;
          this.xh = "";
          alert(error);
        });
    },
    // 确认收货
    sure() {
      if (!this.hasCheckKw || !this.hasCheckXh) {
        alert("请检查库位和箱号后再确定收货~");
        return;
      }
      if (this.rfList.length < 1) {
        alert("请扫描货品再确认收货~");
        return;
      }
      if (this.rfList.length != this.info.TOTALQTY) {
        if (!confirm("预收量与实收量不一致，请确定是否收货")) {
          return;
        }
      }
      this.loading = true;
      let postData = `storage=STORAGE_ZMC&box=${this.xh}&kw=${this.kw}&user=${
        this.userName
      }&skulist=${this.rfList.toString()}`;
      this.axios
        .post(`${$apiUrl}sh/axsh/done`, postData, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        })
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(res.data.errmsg);
            return;
          }
          this.loadingMsg = res.data.errmsg;
          this.loading = true;
          setTimeout(() => {
            this.reset(false);
          }, 1500);
        })
        .catch((error) => {
          this.loading = false;
          alert(error);
        });
    },
    reset() {
      this.$refs.kw.focus();
      this.kw = "";
      this.xh = "";
      this.hz = "";
      this.info = {};
      this.boxList = []; //箱号列表
      this.showList = false; //是否展示箱号列表
      this.hasCheckKw = false; //是否检查过库位
      this.hasCheckXh = false; //是否检查过箱号
      this.skuList = []; //接口获得数据，将使用在扫描rf中，rf=sku+6位唯一值
      this.showRf = false;
      this.rfid = "";
      this.rfl = 0; //扫描的rf量
      this.rfList = [];
      this.loading = false;
      this.loadingMsg = "请稍等";
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