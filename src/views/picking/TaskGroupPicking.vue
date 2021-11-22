<template>
  <!-- 拣货：任务组拣货 -->
  <div class="all">
    <head-name></head-name>
    <!-- 主界面，选择区域 -->
    <div class="box flex_box" v-show="isFirst">
      <div class="row row_small">
        <span class="problem">任务类型</span>
        <select v-model="rwlx" class="two_inp two_select" @change="changeRwlx" :disabled="hasCheckQy">
          <option value="ALL">全部</option>
          <option value="103">提总零拣补货任务</option>
          <option value="104">单品零拣提总任务</option>
          <option value="105">多品零拣提总任务</option>
          <option value="PK">提货项</option>
        </select>
        <span class="problem two_em">区域</span>
        <input v-model="qy" ref="qy" class="two_inp" @focus="hideVK" @keyup="qy=qy.toUpperCase()" @keyup.enter="checkQy" />
      </div>
      <div class="detail_page">
        <div class="tab_title page_tab_title">
          <span style="width:2em">序号</span>
          <span style="width:calc(100% - 6em)">区域</span>
          <span style="width:4em">任务数</span>
        </div>
        <div class="no_list page_no_list first_table" v-show="qyList.length<1 && !hasHidden">无可执行的区域任务~</div>
        <div class="page_table_content first_table" v-show="qyList.length>0 && !hasHidden">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in qyList" :key="i" @click="choiceQy(i)">
            <span style="width:2em">{{i+1}}</span>
            <span class="btn_span" style="width:calc(100% - 6em)">{{list.PUTAWAYZONE}}</span>
            <span style="width:4em">{{list.NUM}}</span>
          </div>
        </div>
      </div>
      <div class="btn_box" v-show="!hasHidden">
        <button @click="checkRwz">开始拣货</button>
      </div>
    </div>
    <!-- 拣货界面 -->
    <div class="box flex_box" v-show="!isFirst">
      <div class="row row_small">
        <span class="problem three_em">容器号</span>
        <input v-model="rqh" ref="rqh" @focus="hideVK" class="two_inp" @keyup="rqh=rqh.toUpperCase()" @keyup.enter="checkRqh" />
        <span class="problem three_em">货品</span>
        <input v-model="hp" ref="hp" @focus="hideVK($event,3)" class="two_inp" @keyup="hp=hp.toUpperCase()" @keyup.enter="checkHp" />
      </div>
      <div class="row row_small">
        <span class="problem three_em">数量</span>
        <input v-model="skuNum" class="two_inp" ref="skuNum" @click="selectNum" @keyup="skuNum=skuNum.replace(/\D/g,'')" @blur="loseSkuNum" />
        <span class="problem three_em">SKU</span>
        <input v-model="showRwInfo.SKU" readonly class="two_inp no_inp" />
      </div>
      <div class="row row_small">
        <span class="problem three_em">自库位</span>
        <input v-model="showRwInfo.FROMLOC" class="two_inp no_inp" readonly />
        <span class="problem three_em">任务组</span>
        <input v-model="rwList[rwIndex].RTXTASKGRP" readonly class="two_inp no_inp" />
      </div>
      <div class="detail_page">
        <div class="base_info">
          <div class="info_item">
            <p>货主</p>
            <p>{{showRwInfo.STORERKEY || '未知'}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item" @click="showTable='rwBox'">
            <p>任务数</p>
            <p class="btn_span">{{rwList.length}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>需扫量</p>
            <p>{{showRwInfo.NUM}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item" @click="showTable='skuBox'">
            <p>已扫量</p>
            <p class="btn_span">{{skuList.length}}</p>
          </div>
        </div>
        <!-- 任务列表 -->
        <div class="detail_table_box" v-show="!hasHidden && showTable=='rwBox'">
          <div class="tab_title page_tab_title">
            <span style="width:3em">序号</span>
            <span style="width:calc(100% - 6em)">任务组</span>
            <span style="width:3em">状态</span>
          </div>
          <div class="page_table_content" v-show="rwList.length>0 &&!hasHidden">
            <div class="table_row sku_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in rwList" :key="i">
              <span style="width:3em">{{i+1}}</span>
              <span style="width:calc(100% - 6em)">{{list.RTXTASKGRP}}</span>
              <span style="width:3em" :class="list.isOk?'green_bg white_bg':'pink_bg white_bg'">{{list.isOk?'完成':'等待'}}</span>
            </div>
          </div>
        </div>
        <!-- 货品列表 -->
        <div class="detail_table_box" v-show="!hasHidden && showTable=='skuBox'">
          <div class="tab_title page_tab_title">
            <span style="width:3em">序号</span>
            <span style="width:calc(100% - 7em)">唯一码</span>
            <span style="width:4em">操作</span>
          </div>
          <div class="no_list page_no_list" v-show="skuList.length<1 && !hasHidden">扫描货品才有数据哦~</div>
          <div class="page_table_content" v-show="skuList.length>0 &&!hasHidden">
            <div class="table_row sku_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in skuList" :key="i">
              <span style="width:3em">{{skuList.length - i}}</span>
              <span style="width:calc(100% - 7em)">{{list.hp}}</span>
              <span style="width:4em"><span class="remove_btn" @click="removeSku(i)">移除</span></span>
            </div>
          </div>
        </div>
      </div>
      <div class="btn_box" v-show="!hasHidden">
        <button class="reset_btn" @click="outRw">取消拣货</button>
        <button class="btn_green" @click="showChangeBox=true">换容器</button>
        <button class="btn_green" @click="showAll=true">汇总</button>
        <button @click="sureUp">提交</button>
      </div>
    </div>
    <!-- 加载页面 -->
    <div class="loading_bg" v-show="loading">
      <div class="loading">
        <p>{{loadingMsg}}<span> 。。。</span></p>
      </div>
    </div>
    <!-- 换箱 -->
    <div class="page_bg" v-show="showChangeBox"></div>
    <div class="page_box center_box" v-show="showChangeBox">
      <h2>换容器({{rqh}})</h2>
      <div class="row">
        <input v-model="changeRqh" ref="changeRqh" @focus="hideVK" @keyup="changeRqh=changeRqh.toUpperCase()" />
      </div>
      <div class="btn_box">
        <button class="reset_btn" @click="resetChangeRqh">取消</button>
        <button @click="sureChangeRqh">确认修改容器号</button>
      </div>
    </div>
    <!-- 退出盘点原因 -->
    <div class="page_bg" v-show="showOut" @click="showOut=false"></div>
    <div class="page_box center_box" v-show="showOut">
      <h2>取消拣货原因</h2>
      <div class="row">
        <span class="problem two_em">原因</span>
        <select v-model="yy" class="yy_select">
          <option value="SKIP">跳过(跳过{{rwList[rwIndex].RTXTASKGRP}}任务)</option>
          <option value="EXIT">拒绝(取消所有未完成的任务)</option>
          <option value="SHORT">短拣(取消{{rwList[rwIndex].RTXTASKGRP}}任务)</option>
        </select>
      </div>
      <div class="btn_box">
        <button class="reset_btn" @click="showOut=false">取消</button>
        <button @click="sureOut">确认</button>
      </div>
    </div>
    <!-- 查看汇总信息 -->
    <div class="page_bg" v-show="showAll"></div>
    <div class="page_box center_box num_box" v-show="showAll">
      <p class="close" @click="showAll=false">×</p>
      <div v-if="all.RTXTASKGRP">
        <p><span class="all_em">任务组号：</span>{{all.RTXTASKGRP}}</p>
        <p><span class="all_em">波次类型：</span>{{all.WAVETYPE}}</p>
        <p><span class="all_em">预检总量：</span>{{all.ZSL}}</p>
        <p><span class="all_em">已拣量：</span>{{all.YJL}}</p>
        <p><span class="all_em">未拣量：</span>{{all.ZSL - all.YJL}}</p>
        <!-- <p>短拣量：{{all.hpms}}</p> -->
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
      rwlx: "ALL",
      rwz: "",
      qyList: [], //区域任务数
      rwList: [
        {
          RTXTASKGRP: "",
        },
      ], //所有任务
      rwIndex: 0,
      showRwInfo: {}, //展示在页面上的任务
      rqh: "",
      hp: "",
      skuNum: 0,
      sl: "",
      skuList: [],
      hasCheckQy: false,
      showqyList: false,
      showNum: false,
      changeNum: "",
      changeNumIndex: null,
      showAll: false,
      all: {},
      showOut: false,
      yy: "SKIP",
      changeRqh: "",
      showChangeBox: false,
      isclickBack: false,
      showTable: "rwBox",
    };
  },
  watch: {
    "skuList.length": {
      handler: function (val, old) {
        if (val > old) {
          this.skuNum++;
          if (this.skuNum >= this.showRwInfo.NUM) {
            this.loading = true;
            this.loadingMsg = "该任务完成，请提交~";
            setTimeout(() => {
              this.loadingMsg = "请稍等";
              this.loading = false;
            }, 1200);
          }
        } else if (val < old && val != 0) {
          this.skuNum--;
        } else if (val == 0) {
          this.skuNum = 0;
        }
      },
      deep: true,
    },
  },
  methods: {
    // 移除单个sku
    removeSku(index) {
      this.skuList.splice(index, 1);
    },
    // 数量输入完毕
    loseSkuNum() {
      // 手动输入的数量，必须在扫描量与需扫量之间，修改数量不对需要提示，并且将数据
      if (
        this.skuNum < this.skuList.length ||
        this.skuNum > this.showRwInfo.NUM
      ) {
        this.skuNum = this.skuList.length;
        this.loadingMsg = `不允许超过需扫量${this.showRwInfo.NUM}~`;
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.loadingMsg = "请稍等";
          this.$refs.sl.select();
        }, 1000);
      }
    },
    // 选中数量
    selectNum() {
      this.$refs.skuNum.select();
    },
    // 确定修改容器号
    sureChangeRqh() {
      // if (this.rqh != this.changeRqh) {
      //     let r = confirm(`请确认是否将${this.rqh}修改为${this.changeRqh}？`);
      //     if (!r) return
      //     this.rqh = this.changeRqh;
      // }
      // this.showChangeBox = false;
      // this.changeRqh = "";
      // this.$refs.hp.focus();
      // 接口
      if (this.rqh != this.changeRqh) {
        let r = confirm(`请确认是否将${this.rqh}修改为${this.changeRqh}？`);
        if (!r) return;
        let url = `${$apiUrl}jh/rwzjh/changebox?storage=STORAGE_ZMC&user=${
          this.userName
        }&missionkey=${this.rwList[this.rwIndex].RTXTASKGRP}&box=${
          this.changeRqh
        }`;
        axios
          .get(url)
          .then((res) => {
            this.loading = false;
            if (res.data.errcode != 0) {
              alert(`修改容器号${this.changeRqh}失败:${res.data.errmsg}`);
              this.changeRqh = "";
              this.$refs.changeRqh.focus();
              return;
            }
            this.rqh = this.changeRqh;
            this.showChangeBox = false;
            this.changeRqh = "";
            this.$refs.hp.focus();
          })
          .catch((err) => {
            this.loading = false;
            this.changeRqh = "";
            alert(err);
          });
      }
      this.changeRqh = false;
      this.$refs.hp.focus();
    },
    // 取消换容器号
    resetChangeRqh() {
      this.showChangeBox = false;
      this.changeRqh = "";
      this.$refs.hp.focus();
    },
    // 点击退出按钮
    outRw() {
      this.showOut = true;
    },
    // 退出任务,询问原因
    sureOut() {
      console.log("点击跳过");
      if (this.yy == "SKIP") {
        if (this.rwList.length + 1 <= this.rwIndex) {
          alert("最后一个任务，不允许跳过~");
          return;
        }
        // this.rwIndex++;
        console.log("跳过");
        this.rwList.push(
          ...this.rwList.splice(
            this.rwList.findIndex((el, i) => i === this.rwIndex),
            1
          )
        );
        this.showOut = false;
        // Object.assign(this.showRwInfo, this.rwList[this.rwIndex])
        // this.showRwInfo = this.rwList[this.rwIndex];
        this.checkRwz();
        // console.log(this.rwList[this.rwIndex]);
        this.skuList = [];
        this.rqh = "";
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/rwzjh/cancel?storage=STORAGE_ZMC&user=${
        this.userName
      }&missionkey=${this.rwList[this.rwIndex].RTXTASKGRP}&box=${
        this.rqh || "testBox"
      }&num=${this.skuNum}&reason=${this.yy}`;
      axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(res.data.errmsg);
            return;
          }
          if (this.yy == "EXIT") {
            //取消所有任务
            this.loadingMsg = res.data.errmsg;
            setTimeout(() => {
              this.reset();
            }, 1500);
          } else if (this.yy == "SHORT") {
            //取消当前的任务
            this.loading = false;
            this.rwList.splice(this.rwIndex, 1);
            this.showOut = false;
            this.startNext();
          }
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    // 提交成功后，开始下一个任务
    startNext() {
      this.rwList[this.rwIndex].isOk = true;
      this.rwIndex++;
      if (this.rwIndex >= this.rwList.length) {
        this.loading = true;
        this.loadingMsg = "任务已全部完成~";
        setTimeout(() => {
          this.reset();
        }, 1500);
        return;
      }
      this.loading = false;
    },
    // 确定提交
    sureUp() {
      if (!this.rqh) {
        alert("请输入完整容器号~");
        return;
      }
      if (this.skuNum < 1) {
        alert("货品数量至少为1，才允许提交数据~");
        return;
      }
      if (this.skuNum != this.showRwInfo.NUM) {
        let r = confirm(
          `数量${this.skuNum}与需扫量${this.showRwInfo.NUM}不一致，请确认是否提交~`
        );
        if (!r) return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/rwzjh/check?storage=STORAGE_ZMC&user=${
        this.userName
      }&box=${this.rqh}&missionkey=${
        this.rwList[this.rwIndex].RTXTASKGRP
      }&sku=${this.skuList[0].hp}&num=${this.skuNum}`;
      axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(res.data.errmsg);
            return;
          }
          this.startNext();
        })
        .catch((error) => {
          this.loading = false;
          alert(error);
        });
    },
    // 输入货品，检查
    checkHp() {
      if (!this.rqh) {
        alert("请先扫描容器号~");
        this.hp = "";
        return;
      }
      if (this.skuNum >= this.showRwInfo.NUM) {
        alert(`该任务组只需要${this.showRwInfo.NUM}件货品~`);
        this.hp = "";
        return;
      }
      if (this.hp.substring(0, this.hp.length - 6) != this.showRwInfo.SKU) {
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
      let url = `${$apiUrl}jh/rwzjh/checksku?storage=STORAGE_ZMC&user=${
        this.userName
      }&box=${this.rqh}&missionkey=${
        this.rwList[this.rwIndex].RTXTASKGRP
      }&sku=${this.hp}`;
      axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`货品：${this.hp}：${res.data.errmsg}`);
            this.hp = "";
            return;
          }
          this.skuList.unshift({
            hp: this.hp,
            num: 1,
          });
          this.showTable = "skuBox";
          this.hp = "";
        })
        .catch((error) => {
          this.loading = false;
          this.hp = "";
          alert(error);
        });
    },
    // 设置缓存
    setCache() {
      let RWZJH_CATCH = {
        user: this.userName,
        skuList: this.skuList,
        rwList: this.rwList,
        rwIndex: this.rwIndex,
        showRwInfo: this.showRwInfo,
        rwz: this.rwz,
      };
      localStorage.setItem("RWZJH_CATCH", JSON.stringify(RWZJH_CATCH));
    },
    // 容器号回车
    checkRqh() {
      this.$refs.hp.focus();
    },
    //    检查任务组,获得任务详情
    checkRwz() {
      console.log("开始检查任务组" + this.rwList[this.rwIndex].RTXTASKGRP);
      if (!this.hasCheckQy) {
        alert("请先检查区域~");
        return;
      }
      this.loading = true;
      let url = `${
        $apiUrl
      }jh/rwzjh/checkmission?storage=STORAGE_ZMC&area=${
        this.qy
      }&type=${this.rwlx}&missionkey=${this.rwList[this.rwIndex].RTXTASKGRP}`;
      axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode == 502) {
            this.loading = false;
            if (confirm(`${res.data.errmsg},是否关闭，开始当前任务？`)) {
              this.loading = true;
              let urlCancel = `${$apiUrl}mission/cancel?storage=STORAGE_ZMC`;
              axios
                .get(urlCancel)
                .then((res) => {
                  this.loading = false;
                  if (res.data.errcode != 0) {
                    this.rwz = "";
                    alert(res.data.errmsg);
                    return;
                  }
                  this.checkRwz();
                })
                .catch((err) => {
                  this.loading = false;
                  this.rwz = "";
                  alert(err);
                });
            }
            return;
          }
          if (res.data.errcode != 0) {
            alert(`任务组${this.rwz}：${res.data.errmsg}`);
            this.rwz = "";
            return;
          }
          this.showRwInfo = res.data.data;
          this.isFirst = false;
          this.$nextTick(() => {
            this.$refs.rqh.focus();
          });
          this.getAllInfo(); //获得汇总数据
        })
        .catch((error) => {
          this.loading = false;
          this.rwz = "";
          alert(error);
        });
    },
    // 更换任务类型
    changeRwlx() {
      this, $refs.qy.focus();
    },
    // 选中区域，更换区域
    choiceQy(index) {
      if (this.qy) {
        let r = confirm("是否切换区域，将会重置信息~");
        if (!r) return;
      }
      this.qy = this.qyList[index].PUTAWAYZONE;
      this.checkQy();
    },
    // 检查区域
    checkQy() {
      if (!this.qy) {
        alert("请输入完整区域~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/rwzjh/checkarea?storage=STORAGE_ZMC&area=${this.qy}`;
      axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(`区域${this.qy}：${res.data.errmsg}`);
            this.qy = "";
            return;
          }
          let rwUrl = `${$apiUrl}jh/rwzjh/missionlist?storage=STORAGE_ZMC&type=${this.rwlx}&area=${this.qy}`;
          axios
            .get(rwUrl)
            .then((res) => {
              this.loading = false;
              if (res.data.errcode != 0) {
                alert(`区域${this.qy}：${res.data.errmsg}`);
                this.qy = "";
                return;
              }
              this.hasCheckQy = true;
              this.rwList = res.data.data;
              this.rwList.forEach((value, index) => {
                //是否执行过任务
                value["isOk"] = false;
              });
              this.checkRwz();
            })
            .catch((error) => {
              this.loading = false;
              this.qy = "";
              alert(error);
            });
        })
        .catch((error) => {
          this.loading = false;
          this.qy = "";
          alert(error);
        });
    },
    // 页面加载完成就开始获得区域列表
    getQyList() {
      let url = `${$apiUrl}jh/rwzjh/arealist?storage=STORAGE_ZMC`;
      axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(res.data.errmsg);
            return;
          }
          this.qyList = res.data.data;
        })
        .catch((error) => {
          this.loading = false;
          alert(error);
        });
    },
    // 点击去拣货的时候开始获得所有汇总量
    getAllInfo() {
      let url = `${$apiUrl}jh/rwzjh/pickinfo?storage=STORAGE_ZMC&user=${
        this.userName
      }&missionkey=${this.rwList[this.rwIndex].RTXTASKGRP}`;
      axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            alert(res.data.errmsg);
            return;
          }
          this.all = res.data.data;
        })
        .catch((error) => {
          this.loading = false;
          alert(error);
        });
    },
    reset() {
      this.qy = "";
      this.rwlx = "ALL";
      this.rwz = "";
      this.qyList = []; //区域任务数
      this.rwList = [
        {
          RTXTASKGRP: "",
        },
      ]; //所有任务
      this.rwIndex = 0;
      this.showRwInfo = {}; //展示在页面上的任务
      this.isFirst = true;
      this.rqh = "";
      this.hp = "";
      this.sl = "";
      this.skuList = [];
      this.hasCheckQy = false;
      this.showqyList = false;
      this.showNum = false;
      this.changeNum = "";
      this.changeNumIndex = null;
      this.showAll = false;
      this.all = {};
      this.showOut = false;
      this.yy = "SKIP";
      this.changeRqh = "";
      this.showChangeBox = false;
      this.getQyList();
      this.loading = false;
      this.loadingMsg = "请稍等";
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
  mounted() {
    this.getQyList();
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

.first_table {
  height: calc(100% - 34px);
}

.tables > ul > li {
  display: flex;
}

.sku_row {
  padding: 10px 0;
}

.center_box {
  height: 180px;
  justify-content: flex-start;
}

.num_box {
  padding-top: 0px;
}

.center_box > div > {
  height: calc(100% - 46px);
  overflow: auto;
}

.center_box > div > h2 {
  font-size: 16px;
}

.all_em {
  width: 5em;
  display: inline-block;
  text-align: right;
  line-height: 24px;
}
</style>