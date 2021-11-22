<template>
  <!-- 盘点：箱数盘点 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box">
      <div class="row row_small"><span class="problem">所在库位</span><input class="input_small" v-model="szkw" @focus="hideVK" ref="szkw" @keyup="szkw=szkw.toUpperCase()" @keyup.enter="checkSzkw" />
      </div>
      <div class="row row_small"><span class="problem">库位</span><input class="input_small no_inp" v-model="kw" readonly />
      </div>
      <div class="row row_small"><span class="problem">箱数</span><input class="input_small" v-model="xs" @focus="hideVK($event,2)" ref="xs" @keyup="xs=xs.replace(/\D/g,'')" @blur="checkNUM" />
      </div>
      <div class=" detail_page flex_deta">
        <div class="base_info">
          <div class="info_item">
            <p>任务数</p>
            <p>{{rwList.length || '未知'}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>剩余任务数</p>
            <p>{{rwList.length - okNum}}</p>
          </div>
        </div>
        <div class="tab_title page_tab_title" v-show="!hasHidden">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 7em)">任务库位</span>
          <!-- <span style="width:4em">盘点次</span> -->
          <span style="width:4em">状态</span>
        </div>
        <div class="no_list page_no_list" v-show="rwList.length<1 && !hasHidden">扫描所在库位才有数据哦~</div>
        <div class="page_table_content" v-show="rwList.length>0 && !hasHidden">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in rwList" :key="i">
            <span style="width:3em">{{i+1}}</span>
            <span style="width:calc(100% - 7em)">{{list.FROMLOC}}</span>
            <!-- <span style="width:4em">{{list.UDF2}}</span> -->
            <span style="width:4em" :class="list.isOk?'green_bg white_bg':'pink_bg white_bg'">{{list.isOk?"完成":"等待"}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="btn_box" v-show="!hasHidden">
      <button class="reset_btn" @click="outRw">退出盘点</button>
      <!-- <button class="btn_green" @click="showDetails">任务详情</button> -->
      <button @click="checkXs">确认箱数</button>
    </div>
    <!-- 退出盘点原因 -->
    <div class="page_bg" v-show="showOut" @click="showOut=false"></div>
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
      szkw: "",
      kw: "",
      okNum: 0,
      rwList: [], //通过检查所在库位得到的任务列表
      rwIndex: 0,
      xs: "",
      yy: "SKIP",
      hasCheckSzKw: false,
      showOut: false,
    };
  },
  mounted() {
    this.$refs.szkw.focus();
    try {
      _JIAndroidObj.controlGoBack();
    } catch (error) {
      alert("PDA监听返回错误 ");
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
    // 数量输入是否超出数量最大临界值
    checkNUM() {
      if (this.xs > 999) {
        this.loading = true;
        this.loadingMsg = "数量不允许超过999";
        setTimeout(() => {
          this.loading = false;
          this.loadingMsg = "请稍等";
          this.xs = "";
          this.$refs.xs.focus();
        }, 1200);
      }
    },
    // 点击退出按钮
    outRw() {
      if (!this.kw) {
        alert("请获取任务列表后，再选择退出盘点~");
        return;
      }
      this.showOut = true;
    },
    // 退出任务,询问原因
    sureOut(area, isClick) {
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
        this.kw = this.rwList[this.rwIndex].FROMLOC;
        return;
      }
      this.loading = true;
      let url = "";
      if (area) {
        //一键取消其他任务
        url = `${$apiUrl}pd/xspd/cancel?storage=STORAGE_ZMC&area=${area}&reason=${this.yy}`;
      } else {
        url = `${$apiUrl}pd/xspd/cancel?storage=STORAGE_ZMC&kw=${this.kw}&reason=${this.yy}`;
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
            if (!isClick) {
              _JIAndroidObj.closeWKView();
              return;
            }
            this.loadingMsg = res.data.errmsg;
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
    // 检查所在库位,获得任务列表
    checkSzkw() {
      if (!this.szkw) {
        alert("请输入所在库位~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}pd/xspd/checkkw?storage=STORAGE_ZMC&kw=${this.szkw}`;
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
          if (res.data.data.length < 1) {
            alert("任务列表为0，无盘点数据~");
            return;
          }
          this.rwList = res.data.data;
          this.rwList.forEach((value, index) => {
            //将对象中所有数据都增加一个字段，用来显示是否该库位已经被盘点
            value["isOk"] = false;
          });
          this.kw = this.rwList[this.rwIndex].FROMLOC;
          this.hasCheckSzKw = true;
          this.$refs.xs.focus();
        })
        .catch((err) => {
          this.loading = false;
          this.szkw = "";
          alert(err);
        });
    },
    // 检查箱数
    checkXs() {
      if (!this.hasCheckSzKw) {
        alert("请先检查所在库位~");
        this.xs = "";
        return;
      }
      if (!this.xs) {
        alert("请输入箱数~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}pd/xspd/checkbox?storage=STORAGE_ZMC&kw=${this.kw}&boxnumber=${this.xs}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱数${this.xs}:${res.data.errmsg}`);
          }
          this.okNum++;
          this.rwList[this.rwIndex].isOk = true;
          this.xs = "";
          this.rwIndex++;
          if (this.rwIndex >= this.rwList.length) {
            //已经是最后一个
            this.loadingMsg = "任务全部完成~";
            this.loading = true;
            setTimeout(() => {
              this.reset();
            }, 1500);
          } else {
            this.kw = this.rwList[this.rwIndex].FROMLOC;
            this.$refs.xs.focus();
          }
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    reset() {
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.hasHidden = false;
      this.showHelp = false;
      this.szkw = "";
      this.kw = "";
      this.okNum = 0;
      this.rwList = [];
      this.rwIndex = 0;
      this.xs = "";
      this.yy = "SKIP";
      this.hasCheckSzKw = false;
      this.showOut = false;
      this.$refs.szkw.focus();
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