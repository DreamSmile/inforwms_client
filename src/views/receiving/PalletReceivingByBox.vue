<template>
  <!-- 收货：托盘按箱收货 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box">
      <div class="row row_small">
        <span class="problem three_em">库位</span>
        <input v-model="kw" class="two_inp input_small" @keyup.enter="checkKw" @focus="hideVK" ref="kw" @keyup="kw=kw.toUpperCase()" />
        <span class="problem three_em">托盘类</span>
        <select v-model="tplx" @change="changeTplx" class="two_inp two_select">
          <option :value="10">普通</option>
          <option :value="20">鞋类</option>
          <option :value="30">立库</option>
          <option :value="40">其他</option>
          <option :value="50">退货托盘</option>
        </select>
      </div>
      <div class="row row_small">
        <span class="problem three_em">托盘号</span>
        <input v-model="tph" class="two_inp input_small" @keyup.enter="checkTph" @focus="hideVK($event,1)" ref="tph" @keyup="tph=tph.toUpperCase()" />
        <span class="problem three_em" @click="showList=true">箱号</span><input v-model="xh" class="two_inp" @keyup.enter="checkXh" @focus="hideVK($event,2)" ref="xh" @keyup="xh=xh.toUpperCase()" />
      </div>
      <div class="row row_small">
        <span class="problem three_em">货品</span><input v-model="rfid" class="two_inp input_small" ref="rfid" @keyup.enter="rfSave" @focus="hideVK($event,3)" @keyup="rfid=rfid.toUpperCase()" />
        <span class="problem three_em">ASN号</span><input v-model="info.ASN" class="two_inp no_inp input_small" readonly ref="asn" />
      </div>
      <div class="detail_page flex_deta">
        <div class="base_info">
          <div class="info_item">
            <p>货主</p>
            <p>{{info.HZ || "未知"}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>码拖箱数</p>
            <p>{{info.NUM>=0?info.NUM:"未知"}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>箱数</p>
            <p>{{info.XS>=0?info.XS:"未知"}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>预收</p>
            <p>{{info.YSL>=0?info.YSL:"未知"}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>收箱</p>
            <p>{{smxs}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>已扫量</p>
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
            <span style="width:20%">{{rfList.length - i}}</span>
            <span style="width:calc(100% - 8em)">{{list}}</span>
            <span style="width:5em"><span class="remove_btn" @click="remove_rf(i)">移除</span></span>
          </div>
        </div>
      </div>
      <div class="btn_box" v-show="!hasHidden">
        <!-- <button @click="reset(true)" class="reset_btn">重置</button> -->
        <button @click="showRf=true" class="btn_green" v-show="isOver">托盘详情</button>
        <button @click="openRF" class="btn_green">{{!isOpenRFID?"扫":"关"}}RFID</button>
        <button @click="resetBox" class="btn_green">收箱</button>
        <button @click="sure">确认收货</button>
      </div>
    </div>
    <!-- 已经绑定的托盘详细信息，仅发生在504 -->
    <div class="page_bg" v-show="showRf" @click.stop="showRf=false"></div>
    <div class="page_box" v-show="showRf">
      <div class="page_content">
        <div class="tables">
          <ul>
            <li class="table_row tab_title_page">
              <span style="width:40px">序号</span>
              <span style="width:140px">箱号</span>
              <span style="width:130px">ASN号</span>
              <span style="width:150px">sku</span>
              <span style="width:40px">数量</span>
              <span style="width:40px">实收</span>
            </li>
            <li class="table_row" v-show="boxList>0">已绑定的托盘号才会有数据哦~</li>
            <li class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in boxList" :key="i">
              <span style="width:40px">{{i+1}}</span>
              <span style="width:140px">{{list.XH}}</span>
              <span style="width:130px">{{list.ASN}}</span>
              <span style="width:150px">{{list.HH}}</span>
              <span style="width:40px">{{list.NUM}}</span>
              <span style="width:40px">{{list.SSL}}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="loading_bg" v-show="loading">
      <div class="loading">
        <p>{{loadingMsg}}<span> 。。。</span></p>
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
      loading: false,
      loadingMsg: "请稍等",
      kw: "",
      tplx: 10,
      tph: "",
      xh: "",
      hasCheckKw: false, //是否检查过库位
      boxList: [], //箱号列表
      showList: true, //箱号列表是否展示
      info: {},
      hasHidden: false,
      info: {}, //基本数据
      showRf: false,
      rfid: "",
      rfList: [], //扫描的rf
      smxs: 0,
      isOpenRFID: false,
      isOver: false, //是否是已经绑定的箱号
    };
  },
  async mounted() {
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
      if (!this.hasCheckKw || !this.tph || !this.xh) {
        alert("请检查库位、托盘号、箱号后，开启rfid扫描~");
        setCursor(4);
        return;
      }
      this.isOpenRFID = !this.isOpenRFID;
      try {
        if (!this.isOpenRFID) {
          _JIAndroidObj.RFID_Stop();
        } else {
          _JIAndroidObj.RFID_Start(1000); //功率
        }
      } catch (error) {
        alert(error);
      }
    },
    // 收箱重新再扫箱和rf
    resetBox() {
      if (!this.hasCheckKw || !this.xh) {
        alert("请按照步骤操作~");
        return;
      }
      if (this.rfList.length < 1) {
        alert("扫描的货品数量需要大于1~");
        return;
      }
      if (this.rfList.length != this.info.YSL) {
        let r = confirm("预收量与实收量不一致，请确定是否保存");
        if (!r) return;
      }
      this.loading = true;
      let postData = `storage=STORAGE_ZMC&tpcode=${this.tph}&kw=${
        this.kw
      }&box=${this.xh}&skulist=${this.rfList.toString()}`;
      return this.axios
        .post(`${this.$apiUrl}sh/tpxsh/addsku`, postData, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        })
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱号${this.xh}: ${res.data.errmsg}`);
            return false;
          }
          this.xh = "";
          this.rfList = [];
          this.smxs++;
          Object.assign(this.info, {
            HZ: "",
            YSL: -1,
            XS: -1,
            ASN: "",
          });
          this.$refs.xh.focus();
          if (this.smxs + this.info.XS == this.info.NUM) {
            alert(`箱扫描完毕:${this.info.NUM}，请确认收货~`);
          }
          return true;
        })
        .catch((error) => {
          this.loading = false;
          alert(error);
          return false;
        });
    },
    // 扫描rf,将数据存入表格,rf为接口获得sku+6位唯一值
    rfSave() {
      return new Promise((reslove, reject) => {
        if (!this.rfid) {
          alert("请扫描完整货品~");
          reject();
          return;
        }
        if (this.rfList.indexOf(this.rfid) != -1) {
          alert(`${this.rfid}重复扫描~`);
          this.rfid = "";
          reject();
          return;
        }
        if (this.rfList.length > 0) {
          let rfListSku = this.rfList[0].substring(
            0,
            this.rfList[0].length - 6
          );
          if (rfListSku != this.rfid.substring(0, this.rfid.length - 6)) {
            alert(`货品${this.rfid}：sku与其他sku不一致~`);
            this.rfid = "";
            reject();
          }
        }
        this.loading = true;
        let url = `${this.$apiUrl}sh/axsh/checksku?storage=STORAGE_ZMC&box=${this.xh}&sku=${this.rfid}`;
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
      });
    },
    // 扫描的货品的this.axios
    // rf扫描处理
    rusultHandel(res) {
      return new Promise((reslove, reject) => {
        if (this.rfList.indexOf(res) != -1) {
          //重复扫描
          return;
        }
        if (this.rfList.length > 0) {
          let rfListSku = this.rfList[0].substring(
            0,
            this.rfList[0].length - 6
          );
          if (rfListSku != res.substring(0, res.length - 6)) {
            alert(`货品${this.rfid}：sku与其他sku不一致~`);
            reject();
          }
        }
        this.loading = true;
        let url = `${this.$apiUrl}sh/axsh/checksku?storage=STORAGE_ZMC&box=${this.xh}&sku=${this.rfid}`;
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
            this.rfList.unshift(res);
            reslove();
          })
          .catch((error) => {
            this.loading = false;
            this.rfid = "";
            alert(error);
          });
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
    // 执行检查库位，检查箱号，绑定箱列表（额外界面），确认绑定
    // 回车检查库位
    checkKw() {
      if (!this.kw) {
        alert("请输入库位~");
        return;
      }
      this.loading = true;
      let url = `${this.$apiUrl}sh/tpxsh/checkkw?storage=STORAGE_ZMC&kw=${this.kw}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`库位${this.kw}: ${res.data.errmsg}`);
            this.kw = "";
            return;
          }
          this.$refs.tph.focus();
          this.hasCheckKw = true;
        })
        .catch((error) => {
          this.loading = false;
          this.kw = "";
          alert(error);
        });
    },
    // 更换托盘类型
    changeTplx(val) {
      console.log("更换类型" + val);
    },
    // 回车托盘号，并且将自库位，更换类型，托盘号都设置为不能选择
    checkTph() {
      if (!this.hasCheckKw) {
        alert("请先检查库位~");
        return;
      }
      if (!this.tph) {
        alert("请输入完整托盘号~");
        return;
      }
      this.loading = true;
      let url = `${this.$apiUrl}sh/tpxsh/checktp?storage=STORAGE_ZMC&tpcode=${this.tph}&tptype=${this.tplx}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode == 504) {
            let listUrl = `${this.$apiUrl}sh/tpxsh/boxlist?storage=STORAGE_ZMC&tpcode=${this.tph}`;
            this.axios
              .get(listUrl)
              .then((res) => {
                if (res.data.errcode != 0) {
                  this.tph = "";
                  alert(`托盘号${this.tph}: ${res.data.errmsg}`);
                  return;
                }
                this.boxList = res.data.data.boxList;
                this.isOver = true;
                alert(`托盘号${this.tph}: 已绑定,请点击"托盘详情"查看数据~`);
                this.tph = "";
              })
              .catch((error) => {
                this.tph = "";
                alert(error);
              });
            return;
          }
          this.isOver = false;
          this.boxList = [];
          if (res.data.errcode != 0) {
            alert(`托盘号${this.tph}: ${res.data.errmsg}`);
            this.tph = "";
            return;
          }
          this.$refs.xh.focus();
          this.info = res.data.data;
        })
        .catch((error) => {
          this.loading = false;
          this.tph = "";
          alert(error);
        });
    },
    // 箱号回车
    checkXh() {
      if (this.smxs + this.info.XS == this.info.NUM) {
        alert(`箱扫描完毕:${this.info.NUM}，不允许扫描箱号~`);
        this.xh = "";
        return;
      }
      this.loading = true;
      let postData = `storage=STORAGE_ZMC&tpcode=${this.tph}&kw=${this.kw}&box=${this.xh}`;
      this.axios
        .post(`${this.$apiUrl}sh/tpxsh/checkbox`, postData, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        })
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱号${this.xh}: ${res.data.errmsg}`);
            this.xh = "";
            return;
          }
          Object.assign(this.info, res.data.data);
          this.$refs.rfid.focus();
        })
        .catch((error) => {
          this.loading = false;
          this.xh = "";
          alert(error);
        });
    },
    // 确定收货
    async sure() {
      if (!this.hasCheckKw) {
        alert("请检查库位后再确定收货~");
        return;
      }
      let msg = null;
      if (this.xh) {
        msg = await this.resetBox();
        if (!msg) return;
      }
      if (this.smxs + this.info.XS < this.info.NUM) {
        let r = confirm(`当前托盘扫描箱数为小于码拖箱数请确认是否收货~`);
        if (r == false) return;
      }
      this.loading = true;
      let url = `${this.$apiUrl}sh/tpxsh/done?storage=STORAGE_ZMC&tpcode=${this.tph}`;
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
      this.tplx = 10;
      this.tph = "";
      this.xh = "";
      this.info = {};
      this.boxList = []; //箱号列表
      this.showList = false; //是否展示箱号列表
      this.hasCheckKw = false; //是否检查过库位
      this.rfid = "";
      this.smxs = 0;
      this.rfList = [];
      this.loading = false;
      this.loadingMsg = "请稍等";
    },
  },
};
function RFID_Scan_CallBack(status, msg) {
  if (status == "21" || status == "22") {
    return;
  } else if (status == "0" || status == "1" || status == "2" || status == "4") {
    let res = JSON.parse(msg);
    for (let i = 0; i < res.data.length; i++) {
      let sku = decode(res.data[i].epc);
      if (sku.length >= 12) {
        app.rusultHandel(sku); //将转码后的suk数据处理
      }
    }
  }
}
</script>