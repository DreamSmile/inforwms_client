<template>
  <!-- 拣货：注册箱拣货 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box" v-show="isFirst">
      <div class="row row_small">
        <span class="problem three_em">区域</span>
        <input @focus="hideVK" v-model="qy" ref="qy" class="input_small" @keyup="qy=qy.toUpperCase()" @keyup.enter="checkQy" />
      </div>
      <div class="row row_small">
        <span class="problem three_em">箱号</span>
        <input class="input_small" v-model="xh" ref="xh" @focus="hideVK($event,1)" @keyup="xh=xh.toUpperCase()" @keyup.enter="checkXh" />
      </div>
      <div class="row row_small">
        <span class="problem three_em">组车号</span>
        <input readonly v-model="zch" class="no_inp two_inp" />
        <span class="problem three_em">任务号</span>
        <input readonly v-model="rwh" class="no_inp two_inp" />
      </div>
      <div class="detail_page flex_deta">
        <div class="base_info">
          <div class="info_item">
            <p>箱数</p>
            <p>{{parseInt(zdxs) >= 0 ? zdxs : "未知"}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>已绑数</p>
            <p>{{xhList.length}}</p>
          </div>
        </div>
        <!-- 任务数 -->
        <div class="tab_title page_tab_title" v-show="!hasHidden">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 3em)" class="work_br">箱号</span>
        </div>
        <div class="no_list page_no_list" v-show="xhList.length<1 && !hasHidden">
          扫描箱号才有数据哦~</div>
        <div class="page_table_content" v-show="xhList.length>0 && !hasHidden">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in xhList" :key="i">
            <span style="width:3em">{{i+1}}</span>
            <span style="width:calc(100% - 3em)">{{list.xh}}</span>
          </div>
        </div>
      </div>
      <div class="btn_box" v-show="!hasHidden">
        <button class="reset_btn" @click="clearZcjl">清空组车记录</button>
        <button @click="goRw">开始组车</button>
      </div>
    </div>
    <!-- 完成任务界面 -->
    <div class="box flex_box" v-show="!isFirst">
      <div class="row row_small">
        <span class="problem two_em">SKU</span>
        <input v-model="showRw.SKU" class="input_small no_inp" readonly />
      </div>
      <div class="row row_small"></div>
      <div class="row row_small">
        <span class="problem two_em">货品</span>
        <input v-model="hp" class="two_inp" ref="hp" @keyup="hp=hp.toUpperCase()" @focus="hideVK" @keyup.enter="checkHp" />
        <span class="problem three_em">数量</span>
        <input v-model="sl" ref="sl" class="two_inp" @keyup="sl=sl.replace(/\D/g,'')" @click="selectSl" @blur="loseSl" />
      </div>
      <div class="detail_page">
        <div class="base_info">
          <div class="info_item" @click="showTable='main'">
            <p>格号</p>
            <p class="btn_span" :style="{textDecoration:showTable=='main'?'underline':''}">{{showRw.SEQNO ||
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
        <div class="detail_row_box" v-show="showTable=='main'">
          <div class="detail_row">
            <span>单位</span>
            <span>EA</span>
          </div>
          <div class="detail_row">
            <span>任务组号</span>
            <span>{{showRw.RTXTASKGRP || '未知'}}</span>
          </div>
          <div class="detail_row">
            <span>箱号</span>
            <span>{{showRw.TOID || '未知'}}</span>
          </div>
          <div class="detail_row">
            <span>自库位</span>
            <span>{{showRw.FROMLOC || '未知'}}</span>
          </div>
          <div class="detail_row">
            <span>至库位</span>
            <span>{{showRw.TOLOC || '未知'}}</span>
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
            <span style="width:calc(100% - 3em)">唯一码</span>
          </div>
          <div class="no_list page_no_list" v-show="skuList.length<1">
            扫描货品才有数据哦~</div>
          <div class="page_table_content" v-show="skuList.length>0">
            <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in skuList" :key="i">
              <span style="width:3em">{{skuList.length-i}}</span>
              <span style="width:calc(100% - 3em)">{{list.hp}}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="btn_box" v-show="!hasHidden">
        <button class="reset_btn" @click="showOut=true">退出拣货</button>
        <button @click="sureRw">提交</button>
      </div>
    </div>
    <!-- 退出盘点原因 -->
    <div class="page_bg" v-show="showOut" @click="showOut=false"></div>
    <div class="page_box center_box" v-show="showOut">
      <h2>退出盘点原因</h2>
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
      zch: "",
      rwh: "",
      zdxs: "",
      xhList: [],
      rwList: [],
      rwIndex: 0,
      showRw: {},
      hp: "",
      sl: "",
      skuList: [],
      showTable: "main",
      hasCheckQy: false,
      showOut: false,
      yy: "SKIP",
      isclickBack: false,
    };
  },
  mounted() {
    this.$refs.qy.focus();
    try {
      _JIAndroidObj.controlGoBack();
    } catch (error) {
      alert("监听返回错误 ");
    }
    window.onresize = () => {
      this.hasHidden = document.body.clientHeight < this.bodyH ? true : false;
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
        } else if (val < old) {
          this.skuNum--;
        }
      },
      deep: true,
    },
  },
  methods: {
    // 提交任务，成功后开始下一个任务
    sureRw() {
      if (this.skuList.length < 1) {
        alert("请扫描货品再提交任务~");
        this.showTable = "skuBox";
        this.$refs.hp.focus();
        return;
      }
      if (this.sl != this.showRw.QTY) {
        let r = confirm("数量不一致，是否提交任务？");
        if (!r) return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/zcxjh/checknumber?storage=STORAGE_ZMC&rwz=${this.showRw.RTXTASKGRP}&sku=${this.skuList[0].hp}&box=${this.showRw.TOID}&number=${this.sl}`;
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
          this.resetRw();
          this.showRw = this.rwList[this.rwIndex];
          this.$refs.hp.focus();
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
      let url = `${$apiUrl}jh/zcxjh/checksku?storage=STORAGE_ZMC&sku=${this.hp}`;
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
      let url = `${$apiUrl}jh/zcxjh/checkarea?storage=STORAGE_ZMC&area=${this.qy}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`区域${this.qy}:${res.data.errmsg}`);
            this.qy = "";
            return;
          }
          this.hasCheckQy = true;
          this.$refs.xh.focus();
          this.zdxs = res.data.data.NSQLVALUE;
        })
        .catch((err) => {
          this.loading = false;
          this.qy = "";
          alert(err);
        });
    },
    // 检查箱号，第一次检查的时候，需要获取任务号，后面再次扫描需要传递第一次扫描箱号获得的任务号
    checkXh() {
      if (!this.hasCheckQy) {
        alert("请先检查区域~");
        this.xh = "";
        return;
      }
      if (!this.xh) {
        alert("请输入完整箱号~");
        return;
      }
      if (this.xhList.length >= this.zdxs) {
        alert("已达到最大扫描量，请开始组车~");
        this.xh = "";
        return;
      }
      if (
        this.xhList.find((el, index) => {
          return el.xh == this.xh;
        })
      ) {
        alert("重复添加啦~");
        this.xh = "";
        return;
      }
      this.loading = true;
      let url = "";
      if (this.xhList.length > 0) {
        //不是第一次扫描箱号，需要传递任务号
        url = `${$apiUrl}jh/zcxjh/checkbox?storage=STORAGE_ZMC&rwz=${this.rwz}&area=${this.qy}&zch=${this.zch}&box=${this.xh}`;
      } else {
        url = `${$apiUrl}jh/zcxjh/checkbox?storage=STORAGE_ZMC&box=${this.xh}&area=${this.qy}`;
      }
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱号${this.xh}:${res.data.errmsg}`);
            this.xh = "";
            return;
          }
          if (this.xhList.length < 1) {
            //第一次检查箱号，返回组车号和任务号
            this.zch = res.data.data.GROUPNUMBER;
            this.rwh = res.data.data.RTXTASKGRP;
          }
          this.xhList.unshift({ xh: this.xh });
          this.xh = "";
          if (this.xhList.length >= this.zdxs) {
            this.loading = true;
            this.loadingMsg = "箱号数量正确，请开始组车";
            setTimeout(() => {
              this.loadingMsg = "请稍等";
              this.loading = false;
            }, 1200);
          }
        })
        .catch((err) => {
          this.loading = false;
          this.xh = "";
          alert(err);
        });
    },
    // 清空组车记录按钮
    clearZcjl() {
      if (!this.hasCheckQy || this.xhList.length < 1) {
        alert("检查区域并扫描箱号后才允许清空组车记录~");
        return;
      }
      let r = confirm("请确认是否删除组车的所有数据？");
      if (!r) return;
      this.loading = true;
      let url = `${$apiUrl}/jh/zcxjh/cleangroup?storage=STORAGE_ZMC&zch=${this.zch}`;
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
            this.resetFirst();
          }, 1500);
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    // 开始下一个任务要清除的界面
    resetRw() {
      this.sl = "";
      this.skuList = [];
      if (this.rwIndex >= this.rwList.length) {
        this.loading = true;
        this.loadingMsg = "任务全部完成~";
        setTimeout(() => {
          this.reset();
        }, 1500);
      }
    },
    // 清除组车记录后的清除
    resetFirst() {
      this.qy = "";
      this.xh = "";
      this.zch = "";
      this.rwh = "";
      this.zdxs = "";
      this.xhList = [];
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
      if (this.xhList.length < 1) {
        alert("请先生成箱号任务~");
        this.$refs.xh.focus();
        return;
      }
      if (this.xhList.length != parseInt(this.zdxs)) {
        if (!confirm("箱号列表数量与需要数量不一致，是否生成组车任务？"))
          return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/zcxjh/checkgroup?storage=STORAGE_ZMC&area=${this.qy}&zch=${this.zch}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(res.data.errmsg);
            return;
          }
          this.rwList = res.data.data;
          if (this.rwList.length < 1) {
            alert("生成的任务数量为0,请联系工作人员~");
            return;
          }
          this.isFirst = false;
          this.rwList.forEach((value, index) => {
            //将对象中所有数据都增加一个字段，用来显示该任务是否执行过
            value["isOk"] = false;
          });
          this.showRw = this.rwList[this.rwIndex];
          this.$nextTick(() => {
            this.$refs.hp.focus();
          });
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
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
        url = `${$apiUrl}jh/zcxjh/cancel?storage=STORAGE_ZMC&area=${area}&reason=${this.yy}&rwz=${this.showRw.RTXTASKGRP}&missionid=${this.showRw.TASKDETAILKEY}`;
      } else {
        url = `${$apiUrl}jh/zcxjh/cancel?storage=STORAGE_ZMC&rwz=${this.showRw.RTXTASKGRP}&reason=${this.yy}&missionid=${this.showRw.TASKDETAILKEY}`;
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
      this.rwh = "";
      this.zdxs = "";
      this.xhList = [];
      this.rwList = [];
      this.rwIndex = 0;
      this.showRw = {};
      this.hp = "";
      this.sl = "";
      this.skuList = [];
      this.showTable = "main";
      this.hasCheckQy = false;
      this.loadingMsg = "请稍等";
      this.loading = false;
      this.showOut = false;
      this.isclickBack = false;
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

.center_box > .row {
  flex: 1;
}

.center_box > .btn_box {
  margin-bottom: 0;
}
</style>