<template>
  <!-- 拣货：按单组车 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box" v-show="isFirst">
      <!-- <div class="row row_small">
                <span class="problem three_em">辅助人</span>
                <input v-model="fzr" class="two_inp" />
                <span class="problem three_em">波次</span>
                <input v-model="bc" class="two_inp" />
            </div> -->
      <div class="row row_small">
        <span class="problem three_em">区域</span>
        <input @focus="hideVK" v-model="qy" ref="qy" class="input_small two_inp" @keyup="qy=qy.toUpperCase()" @keyup.enter="checkQy" />
        <span class="problem three_em">箱号</span>
        <input class="input_small two_inp" v-model="xh" ref="xh" @focus="hideVK($event,1)" @keyup="xh=xh.toUpperCase()" @keyup.enter="checkXh" />
      </div>

      <div class="row row_small">
        <span class="problem three_em">订单号</span>
        <input readonly v-model="showRw.ORDERKEY" class="no_inp two_inp" />
        <span class="problem three_em">任务号</span>
        <input readonly v-model="showRw.RTXTASKGRP" class="no_inp two_inp" />
      </div>

      <div class="detail_page flex_deta">
        <div class="base_info">
          <div class="info_item" @click="showTable='rwBox'">
            <p>箱数</p>
            <!-- <p class="btn_span" :style="{textDecoration:showTable=='rwBox'?'underline':''}">{{parseInt(zdxs)
                            >= 0 ? zdxs : "未知"}}</p> -->
            <p>{{rwList.length || "未知"}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item" @click="showTable='main'">
            <p>完成量</p>
            <p>{{okXh}}</p>
          </div>
        </div>
        <div class="detail_table_box" v-show="!hasHidden">
          <div class="tab_title page_tab_title">
            <span style="width:3em">序号</span>
            <span style="width:calc(100% - 6em)">箱号</span>
            <span style="width:3em">状态</span>
          </div>
          <div class="no_list page_no_list" v-show="rwList.length<1 && !hasHidden">
            扫描区域才有数据哦~</div>
          <div class="page_table_content">
            <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in rwList" :key="i">
              <span style="width:3em">{{i+1}}</span>
              <span style="width:calc(100% - 6em)">{{list.TOID}}</span>
              <span style="width:3em" :class="list.isOk?'green_bg white_bg':'pink_bg white_bg'">{{list.isOk?'完成':'等待'}}</span>
            </div>
          </div>
        </div>

      </div>
      <div class="btn_box" v-show="!hasHidden">
        <button class="reset_btn" @click="clickOut">退出拣货</button>
        <button class="reset_btn" @click="clearZcjl">清空组车记录</button>
        <button @click="goRw">开始组车</button>
      </div>
    </div>
    <!-- 完成任务界面 -->
    <div class="box flex_box" v-show="!isFirst">
      <div class="row row_small">
        <span class="problem three_em">SKU</span>
        <input v-model="showRw.SKU" class="no_inp input_small" readonly />
      </div>
      <div class="row row_small">
        <span class="problem three_em">至箱号</span>
        <input class="input_small no_inp" v-model="showRw.TOID" ref="xh2" readonly @keyup.enter="checkXh2" />
      </div>
      <div class="row row_small">
        <span class="problem three_em">货品</span>
        <input v-model="hp" class="two_inp" ref="hp" @keyup="hp=hp.toUpperCase()" @focus="hideVK" @keyup.enter="checkHp" />
        <span class="problem two_em">数量</span>
        <input v-model="sl" ref="sl" :class="['two_inp',isSinglePick?'no_inp':'']" :disabled='isSinglePick' @keyup="sl=sl.replace(/\D/g,'')" @click="selectSl" @blur="loseSl" />
      </div>
      <div class="detail_page">
        <div class="base_info">
          <div class="info_item" @click="showTable='main'">
            <p>格号</p>
            <p class="btn_span" :style="{textDecoration:showTable=='main'?'underline':''}">
              {{showRw.SEQNO ||
                            '未知'}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item" @click="showTable='rwBox'">
            <p>任务数</p>
            <p class="btn_span" :style="{textDecoration:showTable=='rwBox'?'underline':''}">
              {{rwList.length}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>剩余任务</p>
            <p>{{rwList.length - rwIndex}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>数量</p>
            <p>{{showRw.QTY}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item" @click="showTable='skuBox'">
            <p>已扫量</p>
            <p class="btn_span" :style="{textDecoration:showTable=='skuBox'?'underline':''}">
              {{skuList.length}}</p>
          </div>
        </div>
        <!-- 当前任务的详细信息 -->
        <div class="detail_row_box" v-show="showTable=='main'">
          <div class="detail_row">
            <span>订单号</span>
            <span>{{showRw.ORDERKEY || '未知'}}</span>
          </div>
          <div class="detail_row">
            <span>任务组号</span>
            <span>{{showRw.RTXTASKGRP || '未知'}}</span>
          </div>
          <div class="detail_row">
            <span>自库位</span>
            <span>{{showRw.FROMLOC || '未知'}}</span>
          </div>
          <div class="detail_row">
            <span>箱号</span>
            <span>{{showRw.FROMID || '未知'}}</span>
          </div>
        </div>
        <!-- 任务列表 -->
        <div class="detail_table_box" v-show="!hasHidden && showTable=='rwBox'">
          <div class="tab_title page_tab_title">
            <span style="width:3em">序号</span>
            <span style="width:calc(100% - 6em)">箱号</span>
            <span style="width:3em">状态</span>
          </div>
          <div class="page_table_content">
            <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in rwList" :key="i">
              <span style="width:3em">{{i+1}}</span>
              <span style="width:calc(100% - 6em)">{{list.TOID}}</span>
              <span style="width:3em" :class="list.isOk?'green_bg white_bg':'pink_bg white_bg'">{{list.isOk?'完成':'等待'}}</span>
            </div>
          </div>
        </div>
        <!-- 当前任务扫描的sku量 -->
        <div class="detail_table_box" v-show="!hasHidden && showTable=='skuBox'">
          <div class="tab_title page_tab_title">
            <span style="width:3em">序号</span>
            <span style="width:calc(100% - 8em)">唯一码</span>
            <span style="width:5em">操作</span>
          </div>
          <div class="no_list page_no_list" v-show="skuList.length<1">
            扫描货品才有数据哦~</div>
          <div class="page_table_content" v-show="skuList.length>0">
            <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in skuList" :key="i">
              <span style="width:3em">{{skuList.length-i}}</span>
              <span style="width:calc(100% - 8em)">{{list.hp}}</span>
              <span style="width:5em"><span class="remove_btn" @click="removeHp(i)">移除</span></span>
            </div>
          </div>
        </div>
      </div>
      <div class="btn_box" v-show="!hasHidden">
        <button class="reset_btn" @click="showOut=true">退出</button>
        <button class="btn_green" @click="changePickType">{{isSinglePick?'批量':'单拣'}}</button>
        <button class="btn_green" @click="showHisList=true">库存({{kcList.length}})</button>
        <button class="btn_green" @click="showChangeBox=true">换箱</button>
        <button @click="sureRw">提交</button>
      </div>
    </div>
    <!-- 换箱 -->
    <div class="page_bg" v-show="showChangeBox"></div>
    <div class="page_box center_box" v-show="showChangeBox">
      <h2>换容器({{showRw.TOID}})</h2>
      <div class="row">
        <input v-model="changeToBox" ref="changeToBox" @focus="hideVK" @keyup="changeToBox=changeToBox.toUpperCase()" />
      </div>
      <div class="btn_box">
        <button class="reset_btn" @click="resetChangeToXh">取消</button>
        <button @click="sureChangeToXh">确认换箱</button>
      </div>
    </div>
    <!-- 库位库存列表 -->
    <div class="page_bg" v-show="showHisList" @click="showHisList=false"></div>
    <div class="page_box" v-show="showHisList">
      <div class="detail_table">
        <div class="tab_title">
          <span style="width:3em">序号</span>
          <span style="width: calc(50% - 2em)">库位</span>
          <span style="width:calc(50% - 2em)">LPN</span>
        </div>
        <div class="no_list" v-show="kcList.length==0" style="height:calc(100% - 34px)">无数据~</div>
        <div class="table_content" v-show="kcList.length>0" style="height:calc(100% - 34px)">
          <div class="table_row table_data" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in kcList" :key="i">
            <span style="width:3em">{{i+1}}</span>
            <span style="width:calc(50% - 2em)">{{list.LOC}}</span>
            <span style="width:calc(50% - 2em)">{{list.ID}}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 退出拣货原因 -->
    <div class="page_bg" v-show="showOut" @click="showOut=false"></div>
    <div class="page_box center_box" v-show="showOut">
      <h2>退出拣货原因</h2>
      <div class="row">
        <span class="problem two_em">原因</span>
        <select v-model="yy" class="yy_select">
          <option value="SKIP">跳过(最后执行{{showRw.TOID}}任务)</option>
          <option value="EXIT">拒绝(取消所有未完成的任务)</option>
          <option value="SHORT">短拣(取消{{showRw.TOID}}任务)</option>
        </select>
      </div>
      <div class="btn_box">
        <button class="reset_btn" @click="showOut=false">取消</button>
        <button @click="sureOut(null,true)">确认</button>
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
      isFirst: true,
      qy: "",
      xh: "",
      ddh: "",
      fzr: "",
      bc: "",
      zdxs: "",
      // xhList: [],
      okXh: 0,
      // rwList: [
      //     { "LOSEID": "1", "TOID": "BX1", "QTY": 3, "RTXTASKGRP": "T000000003", "FROMLOC": "GBLJLOC039", "TASKDETAILKEY": "0000000506", "ORDERKEY": "0000000091", "SKU": "20DBL0410170", "FROMID": " " },
      //     { "LOSEID": "1", "TOID": "Z1", "QTY": 3, "RTXTASKGRP": "5", "FROMLOC": "D01-01-1", "TASKDETAILKEY": "3", "ORDERKEY": " ", "SKU": "20JXL3160140", "FROMID": "D1" },
      //     { "LOSEID": "1", "TOID": "T1", "QTY": 1, "RTXTASKGRP": "5", "FROMLOC": "D01-01-1", "TASKDETAILKEY": "4", "ORDERKEY": " ", "SKU": "20QXL3160140", "FROMID": "D2" },
      //     { "LOSEID": "0", "TOID": "M1", "QTY": 4, "RTXTASKGRP": "5", "FROMLOC": "D01-01-1", "TASKDETAILKEY": "5", "ORDERKEY": " ", "SKU": "20QXL3160140", "FROMID": "D2" }
      // ],
      rwList: [],
      rwIndex: 0,
      showRw: {},
      // showRw: { "LOSEID": "1", "LOT": "0000000091", "TOID": "BB", "QTY": 33, "RTXTASKGRP": "T000000003", "FROMLOC": "GBLJLOC039", "TASKDETAILKEY": "0000000506", "ORDERKEY": "0000000091", "SKU": "20DBL0410170", "FROMID": " " },
      hp: "",
      sl: "",
      xh2: "",
      skuList: [],
      showTable: "main",
      hasCheckQy: false,
      showOut: false,
      yy: "SKIP",
      isclickBack: false,
      showChangeBox: false,
      changeToBox: "",
      showHisList: false,
      kcList: [],
      isSinglePick: true, //默认单拣
    };
  },
  watch: {
    "skuList.length": {
      handler: function (val, old) {
        if (val > old) {
          this.sl++;
          if (this.sl >= this.showRw.QTY) {
            this.loading = true;
            this.loadingMsg = "该任务完成，请提交~";
            setTimeout(() => {
              this.loadingMsg = "请稍等";
              this.loading = false;
            }, 1200);
          }
        } else if (val < old && val != 0) {
          this.sl--;
        } else if (val == 0) {
          this.sl = 0;
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.$refs.qy.focus();
    // this.showRw = this.rwList[this.rwIndex];
    // this.zdxs = 4
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
    // 退出拣货按钮
    clickOut() {
      if (!this.hasCheckQy) {
        alert("请先检查区域~");
        setCursor(1);
      } else {
        this.showOut = true;
      }
    },
    // 更换拣货类型 isSinglePick？'单拣':'批量'
    changePickType() {
      if (this.skuList.length > 0) {
        if (this.isSinglePick) {
          if (!confirm("切换成批量模式，是否带入已扫数据？")) {
            this.skuList.length = 0;
            this.sl = 0;
          }
          this.isSinglePick = false;
        } else {
          if (confirm("切换成单拣，将会清除已扫描sku,请谨慎操作~")) {
            this.isSinglePick = true;
            this.sl = 0;
            this.skuList.length = 0;
          }
        }
        return;
      }
      this.isSinglePick = !this.isSinglePick;
      this.$refs.hp.focus();
    },
    // 获得库位库存列表
    getKcList() {
      let url = `${$apiUrl}jh/adzc/getstorage?storage=STORAGE_ZMC&lot=${this.showRw.LOT}&kw=${this.showRw.FROMLOC}&sku=${this.showRw.SKU}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(res.data.errmsg);
            return;
          }
          this.kcList = res.data.data;
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    // 取消换箱
    resetChangeToXh() {
      this.showChangeBox = false;
      this.changeToBox = "";
      this.$refs.hp.focus();
    },
    // 确定换箱
    sureChangeToXh() {
      if (this.showRw.TOID != this.changeToBox) {
        if (
          !confirm(`请确认是否将${this.showRw.TOID}修改为${this.changeToBox}？`)
        )
          return;
        let url = `${$apiUrl}jh/adzc/checkbox2?storage=STORAGE_ZMC&missionid=${this.showRw.TASKDETAILKEY}&box=${this.showRw.TOID}&zbox=${this.changeToBox}`;
        this.axios
          .get(url)
          .then((res) => {
            this.loading = false;
            if (res.data.errcode != 0) {
              alert(`修改的箱号${this.changeToBox}:${res.data.errmsg}`);
              this.changeToBox = "";
              return;
            }
            this.showRw.TOID = this.changeToBox;
            this.showChangeBox = false;
            this.changeToBox = "";
            this.$refs.hp.focus();
          })
          .catch((err) => {
            this.loading = false;
            this.changeToBox = "";
            alert(err);
          });
      }
      this.showChangeBox = false;
      this.$refs.hp.focus();
    },
    // 移除货品
    removeHp(index) {
      this.skuList.splice(index, 1);
      this.$refs.hp.focus();
    },
    // 界面二检查箱号
    checkXh2() {
      if (!this.xh2) {
        alert("请输入完整箱号~");
        return;
      }
      let url = `${$apiUrl}jh/adzc/checkbox2?storage=STORAGE_ZMC&rwz=${this.showRw.RTXTASKGRP}&missionid=${this.showRw.TASKDETAILKEY}&box=${this.showRw.TOID}&number=${this.sl}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱号${this.xh}:${res.data.errmsg}`);
            this.xh = "";
            return;
          }
          this.$refs.hp.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.xh = "";
          alert(err);
        });
    },
    // 提交任务，成功后开始下一个任务
    sureRw() {
      if (this.skuList.length < 1) {
        alert("请扫描货品再提交任务~");
        this.showTable = "skuBox";
        this.$refs.hp.focus();
        return;
      }
      if (this.sl != this.showRw.QTY) {
        if (!confirm("数量不一致，是否提交任务？")) return;
      }
      this.loading = true;
      let url = ""; //两个界面合为一个后，需要根据LOSEID参数来调用不同的完成组车接口
      if (this.showRw.LOSEID == 1) {
        url = `${$apiUrl}jh/adzc/checktobox?storage=STORAGE_ZMC&rwz=${this.showRw.RTXTASKGRP}&sku=${this.skuList[0].hp}&box=${this.showRw.TOID}&number=${this.sl}`;
      } else if (this.showRw.LOSEID == 0) {
        url = `${$apiUrl}jh/adzc/checktobox2?storage=STORAGE_ZMC&rwz=${this.showRw.RTXTASKGRP}&sku=${this.skuList[0].hp}&box=${this.showRw.TOID}&number=${this.sl}`;
      } else {
        alert(
          "参数不合法，请联系IT人员，错误参数LOSEID为：" + this.showRw.LOSEID
        );
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
          this.rwList[this.rwIndex].isOk = true;
          this.rwIndex++;
          if (this.rwIndex >= this.rwList.length) {
            this.loadingMsg = "任务全部完成~";
            this.loading = true;
            setTimeout(() => {
              this.reset();
            }, 1200);
            return;
          }
          this.resetRw();
          this.showRw = this.rwList[this.rwIndex];
          this.getKcList();
          this.$refs.hp.focus();
          this.showTable = "rwBox";
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    // 拣货，检查货品
    checkHp() {
      if (this.sl >= this.showRw.QTY) {
        alert(`该任务只需要${this.showRw.QTY}件货品~`);
        this.hp = "";
        return;
      }
      if (this.hp.substring(0, this.hp.length - 6) != this.showRw.SKU) {
        alert(`${this.hp}：SKU不符合~`);
        this.hp = "";
        return;
      }
      if (
        this.skuList.find((el, index) => {
          return el.hp == this.hp;
        })
      ) {
        alert(`${this.hp}重复扫描~`);
        this.hp = "";
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/adzc/checksku?storage=STORAGE_ZMC&sku=${this.hp}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`货品${this.hp}：${res.data.errmsg}`);
            this.hp = "";
            return;
          }
          this.showTable = "skuBox";
          this.skuList.unshift({ hp: this.hp });
          this.hp = "";
        })
        .catch((error) => {
          this.loading = false;
          this.hp = "";
          alert(error);
        });
    },
    // 选中数量
    selectSl() {
      this.$refs.sl.select();
    },
    // 拣货时，用户维护了数量，检查数量输入是否正确
    loseSl() {
      // 手动输入的数量，必须在扫描量与需扫量之间，修改数量不对需要提示，并且将数据
      if (this.sl < this.skuList.length || this.sl > this.showRw.QTY) {
        this.sl = this.skuList.length;
        this.loadingMsg = "数量输入不规范~";
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.loadingMsg = "请稍等";
        }, 1000);
      }
    },
    // 检查区域
    checkQy() {
      if (!this.qy) {
        alert("请输入完整区域~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/adzc/checkarea?storage=STORAGE_ZMC&area=${this.qy}&fzr=${this.fzr}&bc=${this.bc}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode == 504) {
            if (confirm(`${res.data.errmsg},是否关闭，开始当前任务？`)) {
              this.loading = true;
              let urlCancel = `${$apiUrl}mission/cancel?storage=STORAGE_ZMC`;
              this.axios
                .get(urlCancel)
                .then((res) => {
                  this.loading = false;
                  if (res.data.errcode != 0) {
                    this.qy = "";
                    alert(res.data.errmsg);
                    return;
                  }
                  this.checkQy();
                })
                .catch((err) => {
                  this.loading = false;
                  this.qy = "";
                  alert(err);
                });
            } else {
              this.qy = "";
            }
            return;
          }
          if (res.data.errcode != 0) {
            alert(`区域${this.qy}:${res.data.errmsg}`);
            this.qy = "";
            return;
          }
          this.rwList = res.data.data;
          this.hasCheckQy = true;
          if (this.rwList.length < 1) {
            alert(`区域${this.qy}:没有任务~`);
            return;
          }
          this.$refs.xh.focus();
          try {
            this.rwList.forEach((value, index) => {
              //是否执行过任务，格号
              value["isOk"] = false;
              value["SEQNO"] = index + 1;
            });
            this.showRw = this.rwList[this.rwIndex];
            console.log(this.showRw);

            this.zdxs = res.data.data.length;
          } catch (error) {
            console.log("有错误");
          }
        })
        .catch((err) => {
          this.loading = false;
          this.qy = "";
          alert(err);
        });
    },
    // 检查箱号界面一，根据任务列表循环检查箱号,成功后将箱号插入任务列表的至箱号中
    checkXh() {
      // 测试结束
      if (!this.hasCheckQy) {
        alert("请先检查区域~");
        this.xh = "";
        return;
      }
      if (!this.xh) {
        alert("请输入完整箱号~");
        return;
      }
      if (this.okXh >= this.zdxs) {
        alert("已达到最大扫描量，请开始组车~");
        this.xh = "";
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/adzc/checkbox?storage=STORAGE_ZMC&rwz=${this.showRw.RTXTASKGRP}&box=${this.xh}&missionid=${this.showRw.TASKDETAILKEY}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱号${this.xh}:${res.data.errmsg}`);
            this.xh = "";
            return;
          }
          // this.xhList.unshift({ xh: this.xh });
          this.rwList[this.rwIndex].isOk = true;
          this.rwList[this.rwIndex].TOID = this.xh;
          this.xh = "";
          this.okXh++;
          if (this.okXh >= this.zdxs) {
            this.loading = true;
            this.loadingMsg = "箱号数量正确，请开始组车";
            setTimeout(() => {
              this.loadingMsg = "请稍等";
              this.loading = false;
            }, 1200);
            return;
          }
          this.rwIndex++;
          this.showRw = this.rwList[this.rwIndex];
        })
        .catch((err) => {
          this.loading = false;
          this.xh = "";
          alert(err);
        });
    },
    // 清空组车记录按钮
    clearZcjl() {
      if (!this.hasCheckQy) {
        alert("请先检查区域~");
        return;
      }
      if (!confirm("请确认是否删除组车的所有数据？")) return;
      this.loading = true;
      let url = `${$apiUrl}jh/adzc/clean?storage=STORAGE_ZMC&rwz=${this.showRw.RTXTASKGRP}`;
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
    // 开始下一个任务要清除的界面
    resetRw() {
      this.sl = 0;
      this.skuList = [];
      if (this.rwIndex >= this.rwList.length) {
        this.loading = true;
        this.loadingMsg = "任务全部完成~";
        setTimeout(() => {
          this.reset();
        }, 1500);
        return;
      }
      this.showRw = this.rwList[this.rwIndex];
    },
    // 清除组车记录后的清除
    resetFirst() {
      this.qy = "";
      this.xh = "";
      this.zch = "";
      this.sl = 0;
      this.zdxs = "";
      this.okXh = 0;
      // this.xhList = [];
      this.hasCheckQy = false;
      this.loadingMsg = "请稍等";
      this.loading = false;
      this.$refs.qy.focus();
    },
    // 点击开始组车按钮，跳转到任务界面
    goRw() {
      if (!this.hasCheckQy) {
        alert("请先检查区域~");
        return;
      }
      if (this.okXh < 1) {
        alert("请先扫描箱号~");
        this.$refs.xh.focus();
        return;
      }
      if (this.okXh != parseInt(this.zdxs)) {
        alert(`必须扫描${this.zdxs}个箱子才允许开始组车！`);
        return;
      }
      this.isFirst = false;
      this.rwList.forEach((value, index) => {
        //将对象中所有数据都增加一个字段，用来显示该任务是否执行过
        value["isOk"] = false;
      });
      this.rwIndex = 0;
      this.okXh = 0;
      this.showRw = this.rwList[this.rwIndex];
      this.getKcList();
      this.$nextTick(() => {
        this.$refs.hp.focus();
      });
    },
    // 退出任务,询问原因
    sureOut(area, isClick) {
      this.showTable = "rwBox";
      if (this.yy == "SKIP") {
        if (this.rwList.length - 1 <= this.rwIndex) {
          alert("最后一个任务，不允许跳过~");
          return;
        }
        this.rwList.push(
          ...this.rwList.splice(
            this.rwList.findIndex((el, i) => i === this.rwIndex),
            1
          )
        );
        this.showOut = false;
        this.showRw = this.rwList[this.rwIndex];
        this.resetRw();
        return;
      }
      this.loading = true;
      let url = "";
      if (area) {
        //一键取消其他任务
        url = `${$apiUrl}jh/adzc/cancel?storage=STORAGE_ZMC&area=${area}&reason=${this.yy}&rwz=${this.showRw.RTXTASKGRP}&missionid=${this.showRw.TASKDETAILKEY}`;
      } else {
        url = `${$apiUrl}jh/adzc/cancel?storage=STORAGE_ZMC&rwz=${this.showRw.RTXTASKGRP}&reason=${this.yy}&missionid=${this.showRw.TASKDETAILKEY}`;
      }
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(res.data.errmsg);
            return;
          }
          if (this.yy == "EXIT") {
            //取消所有任务
            if (this.isclickBack) {
              try {
                _JIAndroidObj.closeWKView();
              } catch (error) {
                alert("PDA关闭页面失败");
              }
              // return;
            }
            this.loadingMsg = "取消成功";
            setTimeout(() => {
              this.reset();
            }, 1500);
          } else if (this.yy == "SHORT") {
            //取消当前的任务
            this.loading = false;
            this.rwList.splice(this.rwIndex, 1);
            this.showOut = false;
            this.resetRw();
          }
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    // 取消所有信息
    reset() {
      this.isFirst = true;
      this.qy = "";
      this.xh = "";
      this.zch = "";
      this.zdxs = "";
      this.rwList = [];
      this.rwIndex = 0;
      this.showRw = {};
      this.hp = "";
      this.sl = "";
      this.okXh = 0;
      this.skuList = [];
      this.showTable = "main";
      this.hasCheckQy = false;
      this.loadingMsg = "请稍等";
      this.loading = false;
      this.showOut = false;
      this.isclickBack = false;
      this.showChangeBox = false;
      this.changeToBox = "";
      this.showHisList = false;
      this.kcList = [];
      this.$nextTick(() => {
        this.$refs.qy.focus();
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
<style scoped>
.center_box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 200px;
}

.kc_box {
  height: 50%;
  display: block;
}

.list_box {
  overflow: auto;
}

.close {
  line-height: 10px;
}

.center_box > .row {
  flex: 1;
}

.center_box > .btn_box {
  margin-bottom: 0;
}
</style>