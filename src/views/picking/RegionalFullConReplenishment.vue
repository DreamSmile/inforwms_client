<template>
  <!-- 拣货：区域整箱补货 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box">
      <div class="row row_small">
        <span class="problem three_em">排序</span>
        <select v-model="px" class="two_inp two_select input_small" :disabled="hasCheckQy">
          <option :value="1">升序</option>
          <option :value="0">降序</option>
        </select>
        <span class="problem three_em">区域</span>
        <input v-model="qy" ref="qy" class="two_inp input_small" @focus="hideVK" @keyup="qy=qy.toUpperCase()" @keyup.enter="checkQy" />
      </div>
      <div class="row row_small"><span class="problem three_em">自库位</span><input v-model="showRw.FROMLOC" readonly class="two_inp no_inp input_small" />
        <span class="problem three_em">自箱号</span><input :value="showRw.FROMID || ''" readonly class="two_inp no_inp input_small" />
      </div>
      <div class="row row_small">
        <span class="problem three_em">至库位</span><input :value="showRw.SKU ? 'PICKTO' : ''" readonly class="two_inp no_inp input_small" />
        <span class="problem three_em">至箱号</span><input v-model="zlpn" class="two_inp input_small" @focus="hideVK($event,5)" ref="zlpn" @keyup="zlpn=zlpn.toUpperCase()" />

      </div>
      <div class="detail_page">
        <div class="base_info" :class="hasHidden?'overTab':''">
          <div class="info_item" @click="showTable='main'">
            <p>货主</p>
            <p class="btn_span" :style="{textDecoration:showTable=='main'?'underline':''}">
              {{showRw.STORERKEY || '未知'}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item" @click="showTable='rw'">
            <p>任务数</p>
            <p class="btn_span" :style="{textDecoration:showTable=='rw'?'underline':''}">{{rwList.length ||
                            "未知"}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>未完成</p>
            <p>{{rwList.length - okBox || "未知"}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item" @click="showTable='okBox'">
            <p>完成数</p>
            <p class="btn_span" :style="{textDecoration:showTable=='okBox'?'underline':''}">{{okBox}}</p>
          </div>
        </div>
        <div class="detail_row" v-show="!hasHidden && showTable=='main'">
          <span>箱规格</span>
          <span>{{showRw.PACKKEY || '未知'}}</span>
        </div>
        <div class="detail_row" v-show="!hasHidden && showTable=='main'">
          <span>SKU</span>
          <span>{{showRw.SKU || '未知'}}</span>
        </div>
        <!-- 任务列表 -->
        <div class="tab_title page_tab_title" v-show="!hasHidden && showTable=='rw'">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 6em)">任务库位</span>
          <span style="width:3em">状态</span>
        </div>
        <div class="no_list page_no_list" v-show="rwList.length==0 && !hasHidden && showTable=='rw'">
          扫描区域后才有数据哦~</div>
        <div class="page_table_content" v-show="rwList.length>0 && !hasHidden && showTable=='rw'">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in rwList" :key="i">
            <span style="width:3em">{{i+1}}</span>
            <span style="width:calc(100% - 6em)">{{list.FROMLOC}}</span>
            <span style="width:3em" :class="list.isOk?'green_bg white_bg':'pink_bg white_bg'">{{list.isOk?"完成":"等待"}}</span>
          </div>
        </div>
        <!-- 扫描过得箱号列表 -->
        <div class="tab_title page_tab_title" v-show="!hasHidden && showTable=='okBox'">
          <span style="width:2em">序号</span>
          <span style="width:calc(50% - 1em)">自箱号</span>
          <span style="width:calc(50% - 1em)">至箱号</span>
        </div>
        <div class="no_list page_no_list" v-show="okBoxList.length<1 && !hasHidden && showTable=='okBox'">
          确认货箱后后才有数据哦~</div>
        <div class="table_content page_table_content" v-show="okBoxList.length>0 && !hasHidden && showTable=='okBox'">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in reverseBoxList" :key="i">
            <span style="width:2em">{{okBoxList.length-i}}</span>
            <span style="width:calc(50% - 1em)">{{list.zxh}}</span>
            <span style="width:calc(50% - 1em)">{{list.toXh}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="btn_box" v-show="!hasHidden">
      <button class="reset_btn" @click="outRw">取消补货</button>
      <button @click="checkZxh">确认货箱</button>
    </div>
    <!-- 取消补货原因 -->
    <div class="page_bg" v-show="showOut" @click="showOut=false"></div>
    <div class="page_box center_box" v-show="showOut">
      <h2>退出补货</h2>
      <div class="row">
        <span class="problem two_em">原因</span>
        <select v-model="yy" class="yy_select">
          <option value="SKIP">跳过(最后执行{{showRw.FROMLOC}}任务)</option>
          <option value="EXIT">拒绝(取消所有未完成的任务)</option>
          <option value="SHORT">短拣(取消{{showRw.FROMLOC}}任务)</option>
        </select>
      </div>
      <div class="btn_box">
        <button class="reset_btn" @click="showOut=false">取消</button>
        <button @click="sureOut">确认</button>
      </div>
    </div>
    <!-- rf扫描 -->
    <div class="page_bg" v-show="showRwPage" @click.stop="showRwPage=false"></div>
    <div class="page_box" v-show="showRwPage">
      <div class="detail_table rw_list">
        <div class="tab_title ">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 6em)">任务库位</span>
          <span style="width:3em">状态</span>
        </div>
        <div class="no_list rw_list_table" v-show="rwList.length==0">检查区域后才有数据哦~</div>
        <div class="table_content rw_list_table" v-show="rwList.length>0">
          <div class="table_row table_data" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in rwList" :key="i">
            <span style="width:3em">{{i+1}}</span>
            <span style="width:calc(100% - 6em)">{{list.FROMLOC}}</span>
            <span style="width:3em" :class="list.isOk?'green_bg white_bg':'pink_bg white_bg'">{{list.isOk?"完成":"等待"}}</span>
          </div>
        </div>
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
      px: 1,
      qy: "",
      zkw: "",
      zlpn: "",
      info: {},
      hasCheckQy: false,
      rwList: [],
      showRw: {},
      rwIndex: 0,
      okBox: 0, //已经扫过的箱数
      showOut: false,
      yy: "SKIP",
      showTable: "main",
      okBoxList: [],
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
  computed: {
    reverseBoxList: function () {
      return this.okBoxList.reverse();
    },
  },
  methods: {
    // 点击退出按钮
    outRw() {
      if (!this.hasCheckQy) {
        alert("请获取任务列表后，再选择取消补货~");
        return;
      }
      this.showOut = true;
    },
    // 退出任务,询问原因
    sureOut(kwName) {
      if (this.yy == "SKIP") {
        if (this.rwIndex + 1 >= this.rwList.length) {
          alert("当前已经是最后一个任务~");
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
        this.zlpn = "";
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/qyzxjh/cancel?storage=STORAGE_ZMC&kw=${this.showRw.FROMLOC}&type=${this.px}&box=${this.showRw.FROMID}&reason=${this.yy}`;
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
            this.loadingMsg = "取消成功";
            setTimeout(() => {
              this.reset();
            }, 1500);
          } else if (this.yy == "SHORT") {
            //取消当前的任务
            this.loading = false;
            this.rwList.splice(this.rwIndex, 1);
            this.showOut = false;
            if (this.rwList.length == this.okBox) {
              this.loadingMsg = "该区域任务完成~";
              this.loading = true;
              setTimeout(() => {
                this.reset();
              }, 1500);
              return;
            }
            this.showRw = this.rwList[this.rwIndex];
            this.zlpn = "";
          }
        })
        .catch((err) => {
          this.loading = false;
          alert(err);
        });
    },
    // 检查至箱号
    checkZxh() {
      if (!this.hasCheckQy) {
        alert("请先检查至区域~");
        this.zlpn = "";
        return;
      }
      if (!this.zlpn) {
        alert("请输入完整箱号~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/qyzxbh/check?storage=STORAGE_ZMC&area=${this.qy}&type=${this.px}&box=${this.showRw.FROMID}&zbox=${this.zlpn}&missiontype=${this.showRw.TASKTYPE}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱号${this.zlpn}:${res.data.errmsg}`);
            this.$refs.zlpn.focus();
            this.zlpn = "";
            return;
          }
          this.okBox++;
          this.$refs.zlpn.focus();
          this.rwList[this.rwIndex].isOk = true;
          this.showTable = "okBox"; //页面展示扫描过得箱号
          this.okBoxList.push({
            NO: this.rwIndex,
            zxh: this.showRw.FROMID,
            toXh: this.zlpn,
          });
          this.zlpn = "";
          this.rwIndex++;
          if (this.rwIndex >= this.rwList.length) {
            this.loadingMsg = "该区域任务完成~";
            this.loading = true;
            setTimeout(() => {
              this.reset();
            }, 1500);
          } else {
            this.showRw = this.rwList[this.rwIndex];
          }
        })
        .catch((err) => {
          this.loading = false;
          this.zlpn = "";
          alert(err);
        });
    },
    // 检查区域，并且获得任务列表
    checkQy() {
      if (!this.qy) {
        alert("请输入完整区域~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}jh/qyzxbh/checkarea?storage=STORAGE_ZMC&area=${this.qy}`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.data.errcode != 0) {
            this.loading = false;
            alert(`区域${this.qy}:${res.data.errmsg}`);
            this.qy = "";
            return;
          }
          let getIfoUrl = `${$apiUrl}jh/qyzxbh/checkmission?storage=STORAGE_ZMC&area=${this.qy}&type=${this.px}`;
          this.axios
            .get(getIfoUrl)
            .then((res) => {
              this.loading = false;
              if (res.data.errcode != 0) {
                alert(`区域${this.qy}:${res.data.errmsg}`);
                this.qy = "";
                return;
              }
              if (res.data.data.length < 1) {
                alert("任务列表为空，请尝试更换区域~");
                return;
              }
              this.rwList = res.data.data;
              this.rwList.forEach((value, index) => {
                //将对象中所有数据都增加一个字段，用来显示是否该库位已经被盘点
                value["isOk"] = false;
              });
              this.showRw = this.rwList[this.rwIndex]; //界面先展示第一个任务
              this.hasCheckQy = true;
              this.$refs.zlpn.focus();
            })
            .catch((err) => {
              this.loading = false;
              this.qy = "";
              alert(err);
            });
        })
        .catch((err) => {
          this.loading = false;
          this.qy = "";
          alert(err);
        });
    },
    reset() {
      this.loading = false;
      this.loadingMsg = "请稍等";
      this.hasHidden = false;
      this.px = 1;
      this.qy = "";
      this.zkw = "";
      this.zlpn = "";
      this.info = {};
      this.hasCheckQy = false;
      this.rwList = [];
      this.showRw = {};
      this.rwIndex = 0;
      this.okBox = 0;
      this.showOut = false;
      this.yy = "SKIP";
      this.$refs.qy.focus();
      this.showOut = false;
      this.okBoxList = [];
      this.showTable = "main";
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