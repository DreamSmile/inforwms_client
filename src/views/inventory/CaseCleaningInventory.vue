<template>
  <!-- 盘点：扫箱盘点 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box" v-show="isFirst">
      <div class="row row_small"><span class="problem">所在库位</span><input v-model="szkw" @focus="hideVK" ref="szkw" @keyup="szkw=szkw.toUpperCase()" @keyup.enter="checkSzkw" class="input_small" />
      </div>
      <div class="row row_small"><span class="problem">库位</span><input v-model="kw" readonly class="no_inp input_small" />
      </div>
      <div class="row row_small"><span class="problem">箱号</span><input v-model="xh" @focus="hideVK($event,2)" ref="xh" @keyup="xh=xh.toUpperCase()" @keyup.enter="checkXh" class="input_small" />
      </div>
      <div class="detail_page flex_deta">
        <div class="base_info">
          <div class="info_item" @click="showTable='rw'">
            <p>任务数</p>
            <p class="btn_span" :style="{textDecoration:showTable=='rw'?'underline':''}">{{rwList.length ||
                            '未知'}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>剩余任务数</p>
            <p>{{rwList.length - okNum}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item" @click="showTable='add'">
            <p>库存增加数</p>
            <p class="btn_span" :style="{textDecoration:showTable=='add'?'underline':''}">
              {{addKCList.length}}</p>
          </div>
        </div>
        <!-- 任务列表 -->
        <div class="tab_title page_tab_title" v-show="!hasHidden && showTable=='rw'">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 6em)">任务库位</span>
          <!-- <span style="width:4em">盘点数</span> -->
          <span style="width:3em">箱数</span>
          <!-- <span style="width:3em">状态</span> -->
        </div>
        <div class="no_list page_no_list" v-show="rwList.length<1 && !hasHidden && showTable=='rw'">扫描所在库位才有数据哦~
        </div>
        <div class="page_table_content" v-show="rwList.length>0 && !hasHidden && showTable=='rw'">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in rwList" :key="i">
            <span style="width:3em">{{i+1}}</span>
            <span style="width:calc(100% - 6em)">{{list.FROMLOC}}</span>
            <!-- <span style="width:4em">{{list.UDF2}}</span> -->
            <span style="width:3em" class="btn_span" @click="showBoxList(i)">{{list.NUM}}</span>
            <!-- <span style="width:3em" :class="list.isOk?'green_bg white_bg':'pink_bg white_bg'">{{list.isOk?"完成":"等待"}}</span> -->
          </div>
        </div>
        <!-- 增加的库存列表 -->
        <div class="tab_title page_tab_title" v-show="!hasHidden && showTable=='add'">
          <span style="width:2em">序号</span>
          <span style="width:7em">SKU</span>
          <span style="width:calc(100% - 12em)">箱号</span>
          <span style="width:2em">数量</span>
        </div>
        <div class="no_list page_no_list" v-show="addKCList.length<1 && !hasHidden && showTable=='add'">
          增加库存后才有数据哦~</div>
        <div class="page_table_content" v-show="addKCList.length>0 && !hasHidden && showTable=='add'">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in addKCList" :key="i">
            <span style="width:2em">{{addKCList.length-i}}</span>
            <span style="width:7em">{{list.sku}}</span>
            <span style="width:calc(100% - 12em)">{{list.box}}</span>
            <span style="width:3em">{{list.num}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="box flex_box" v-show="!isFirst">
      <div class="row row_small"><span class="problem two_em">货品</span><input v-model="sku" @focus="hideVK" ref="sku" @keyup="sku=sku.toUpperCase()" @keyup.enter="getSkuIndfo" class="input_small" />
      </div>
      <div class="row row_small">
        <span class="problem two_em">数量</span><input v-model="sl" ref="sl" @keyup="sl=sl.replace(/\D/g,'')" class="two_inp input_small" @keyup.enter="checkSl" @focus="hideVK" @blur="checkNUM" />
      </div>
      <div class="row row_small"><span class="problem two_em">LPN</span><input v-model="lpn" ref="lpn" @focus="hideVK" @keyup="lpn=lpn.toUpperCase()" class="input_small" /></div>
      <div class="detail_page flex_deta">
        <div class="detail_row">
          <span>货主</span>
          <span>LILANZ</span>
        </div>
        <div class="detail_row">
          <span>库位</span>
          <span>{{kw}}</span>
        </div>
        <div class="detail_row">
          <span>SKU</span>
          <span>{{skuInfo.SKU || '未知'}}</span>
        </div>
        <div class="detail_row">
          <span>包装</span>
          <span>EA</span>
        </div>

      </div>
    </div>
    <div class="btn_box" v-show="!hasHidden">
      <button @click="returnPage" v-show="!isFirst" class="reset_btn">上一页</button>
      <button @click="sureAddKc" v-show="!isFirst">确定增加库存</button>
      <button class="reset_btn" v-show="isFirst" @click="outRw">退出盘点</button>
      <button @click="addKc" v-show="isFirst" class="btn_green">增加库存</button>
      <button @click="checkXh" v-show="isFirst">确认箱号</button>
    </div>
    <!-- 退出盘点原因 -->
    <div class="page_bg" v-show="showOut || showBox" @click="showOut=false"></div>
    <div class="page_box center_box" v-show="showOut">
      <h2>退出盘点原因</h2>
      <div class="row">
        <span class="problem two_em">原因</span>
        <select v-model="yy" class="yy_select">
          <option value="SKIP">跳过(最后盘点{{kw}}任务)</option>
          <option value="EXIT">拒绝(取消所有未完成的任务)</option>
          <option value="SHORT">短少(取消{{kw}}的盘点任务)</option>
        </select>
      </div>
      <div class="btn_box">
        <button class="reset_btn" @click="showOut=false">取消</button>
        <button @click="sureOut(null,true)">确认</button>
      </div>
    </div>
    <!-- 箱数列表信息 -->
    <div class="page_box center_box box_box" v-show="showBox">
      <p class="close" @click="showBox=false">×</p>
      <div>
        <p v-for="(box,i) in boxList" :key="i">{{box}}</p>
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
      szkw: "",
      kw: "",
      xh: "",
      pds: "",
      yy: "SKIP",
      sku: "",
      skuInfo: {}, //增加界面的sku信息
      bz: "",
      dw: "",
      sl: "",
      lpn: "",
      hasCheckSzkw: false,
      hasCheckSku: false,
      okNum: 0,
      rwList: [], //通过检查所在库位得到的任务列表
      okBox: 0, //扫描好了的箱数
      rwIndex: 0,
      showBox: false, //展示扫描过的箱号列表
      boxList: [], //箱号列表
      showOut: false,
      addKCList: [], //手动增加的库存
      showTable: "rw", //展示哪一个表格，rw:任务表，add:添加库存表
    };
  },
  mounted() {
    this.$refs.szkw.focus();
    try {
      _JIAndroidObj.controlGoBack();
    } catch (error) {
      alert("监听返回错误 ");
    }
    window.onresize = () => {
      this.hasHidden = document.body.clientHeight < this.bodyH ? true : false;
    };
    // 返回按钮,当已经在检查，就弹出询问退出原因，否则直接退出
    window.onBackClicked = () => {
      if (this.hasCheckSzkw) {
        this.showOut = true;
      } else {
        _JIAndroidObj.closeWKView();
      }
    };
  },
  methods: {
    // 增加库存输入是否超出数量最大临界值
    checkNUM() {
      if (this.sl > 999) {
        this.loading = true;
        this.loadingMsg = "数量不允许超过999";
        setTimeout(() => {
          this.loading = false;
          this.loadingMsg = "请稍等";
          this.sl = "";
          this.$refs.sl.focus();
        }, 1200);
      }
    },
    // 输入数量后，光标移动到LPN
    checkSl() {
      this.$refs.lpn.focus();
    },
    // 添加库存页面，输入sku获得对应的sku详细信息
    getSkuIndfo() {
      if (!this.sku) {
        alert("请输入sku信息~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}checksku?storage=STORAGE_ZMC&sku=${this.sku}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`SKU：${this.sku}:${res.data.errmsg}`);
            this.sku = "";
            return;
          }
          this.skuInfo = res.data.data;
          this.hasCheckSku = true;
          this.$refs.sl.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.sku = "";
          alert(err);
        });
    },
    // 点击退出按钮
    outRw() {
      if (!this.hasCheckSzkw) {
        alert("请获取任务列表后，再选择退出盘点~");
        return;
      }
      this.showOut = true;
    },
    // 查看扫描过的箱号列表
    showBoxList(index) {
      this.boxList = this.rwList[index].boxList;
      this.showBox = true;
    },
    // 退出任务,询问原因
    sureOut(area, isClick) {
      if (this.yy == "SKIP") {
        if (this.rwList.length <= this.rwIndex + 1) {
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
        this.kw = this.rwList[this.rwIndex].FROMLOC;
        return;
      }
      this.loading = true;
      let url = "";
      if (area) {
        //一键取消其他任务
        url = `${$apiUrl}pd/sxpd/cancel?storage=STORAGE_ZMC&area=${area}&reason=${this.yy}`;
      } else {
        url = `${$apiUrl}pd/sxpd/cancel?storage=STORAGE_ZMC&kw=${this.kw}&reason=${this.yy}`;
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
            // if (isClick) {
            //     _JIAndroidObj.closeWKView()
            //     return;
            // }
            this.loadingMsg = "取消成功";
            setTimeout(() => {
              this.reset();
            }, 1500);
          } else if (this.yy == "SHORT") {
            //取消当前的任务
            this.loading = false;
            this.rwList.splice(this.rwIndex, 1);
            this.showOut = false;
            if (this.rwList.length <= this.rwIndex) {
              this.loadingMsg = "该区域任务完成~";
              this.loading = true;
              setTimeout(() => {
                this.reset();
              }, 1500);
              return;
            }
            this.kw = this.rwList[this.rwIndex].FROMLOC;
          }
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    // 检查所在库位
    checkSzkw() {
      if (!this.szkw) {
        alert("请输入库位~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}pd/sxpd/checkkw?storage=STORAGE_ZMC&kw=${this.szkw}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode == 504) {
            let r = confirm(
              `${this.userName}还有${res.data.errmsg}区任务，不允许开始新任务，是否退出未完成的的任务？`
            );
            if (r) {
              this.yy = "EXIT";
              this.sureOut(res.data.errmsg, false);
            } else {
              this.szkw = "";
              this.$refs.szkw.focus();
            }
            return;
          }
          if (res.data.errcode != 0 && res.data.errcode != 504) {
            alert(`库位${this.szkw}:${res.data.errmsg}`);
            this.szkw = "";
            return;
          }
          this.hasCheckSzkw = true;
          if (res.data.data.length < 1) {
            alert("任务列表为0，无盘点数据~");
            return;
          }
          this.rwList = res.data.data;
          this.rwList.forEach((value, index) => {
            //将对象中所有数据都增加一个字段，用来显示是否该库位已经被盘点
            value["isOk"] = false;
          });
          this.rwList.forEach((value, index) => {
            //将对象中所有数据都增加一个字段，用来显示是否该库位已经被盘点
            value["boxList"] = [];
          });
          this.kw = this.rwList[this.rwIndex].FROMLOC;
          this.$refs.xh.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.szkw = "";
          alert(err);
        });
    },
    // 检查箱号
    checkXh() {
      if (!this.hasCheckSzkw) {
        alert("请先检查库位~");
        this.xh = "";
        return;
      }
      if (!this.xh) {
        alert("请输入箱号~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}pd/sxpd/checkbox?storage=STORAGE_ZMC&kw=${this.szkw}&box=${this.xh}`;
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
          // Object.assign(this.rwList[this.rwIndex], { boxList: [] });
          this.rwList[this.rwIndex].boxList.push(this.xh);
          this.xh = "";
          this.$refs.xh.focus();
          // 当前扫的箱已经是当前任务的最后一个箱，界面提示开始下一个任务
          if (
            this.rwList[this.rwIndex].boxList.length >=
            this.rwList[this.rwIndex].NUM
          ) {
            this.nextWork();
          }
        })
        .catch((err) => {
          this.loading = false;
          this.xh = "";
          alert(err);
        });
    },
    nextWork() {
      this.rwIndex++;
      if (this.rwIndex >= this.rwList.length) {
        this.loading = true;
        this.loadingMsg = "任务全部完成~";
        setTimeout(() => {
          this.reset();
        }, 1500);
      }
    },
    reset() {
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.hasHidden = false;
      this.showHelp = false;
      this.isFirst = true;
      this.szkw = "";
      this.kw = "";
      this.xh = "";
      this.pds = "";
      this.yy = "SKIP";
      this.sku = "";
      this.bz = "";
      this.dw = "";
      this.sl = "";
      this.lpn = "";
      this.hasCheckSzkw = false;
      this.okNum = 0;
      this.rwList = []; //通过检查所在库位得到的任务列表
      this.rwIndex = 0;
      this.showOut = false;
      this.addKCList = [];
      this.showTable = "rw";
      this.$refs.szkw.focus();
    },
    // 清除添加库存界面
    resetSku() {
      this.sku = "";
      this.sl = "";
      this.lpn = "";
      this.hasCheckSku = false;
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.showTable = "add";
      this.$refs.sku.focus();
    },
    //   增加库存界面返回主页面
    returnPage() {
      if (this.hasCheckSku) {
        let r = confirm("返回将清除所填信息，请确认是否返回?");
        if (r) {
          this.resetSku();
          this.isFirst = true;
        }
      } else {
        this.isFirst = true;
      }
    },
    // 增加库存按钮
    addKc() {
      if (!this.hasCheckSzkw) {
        alert("请先检查所在库位~");
        return;
      }
      this.isFirst = false;
      this.$nextTick(() => {
        this.$refs.sku.focus();
      });
    },
    // 确定增加按钮，返回上一个界面
    sureAddKc() {
      if (!this.hasCheckSku) {
        alert("请先检查SUK~");
        return;
      }
      if (this.sl < 1 || !this.lpn) {
        alert("请填写完整数据再添加库存~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}pd/sxpd/addkc?storage=STORAGE_ZMC&sku=${this.sku}&kw=${this.kw}&num=${this.sl}&box=${this.lpn}`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(res.data.errmsg);
            return;
          }
          this.loadingMsg = "添加库存成功";
          this.addKCList.unshift({
            sku: this.skuInfo.SKU,
            num: this.sl,
            box: this.lpn,
          });
          setTimeout(() => {
            this.resetSku();
          }, 1500);
        })
        .catch((err) => {
          this.loading = false;
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
<style scoped>
.center_box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 200px;
}

.center_box > .row {
  flex: 1;
}

.center_box > .btn_box {
  margin-bottom: 0;
}

.box_box {
  justify-content: start;
  padding-top: 0;
}
</style>