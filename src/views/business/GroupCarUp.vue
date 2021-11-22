<template>
  <!-- 上架：组车上架 -->
  <div class="all">
    <head-name></head-name>
    <div class="box flex_box" v-show="isFirst">
      <div class="row row_small"><span class="problem two_em">箱</span><input v-model="xh" @focus="hideVK" ref="xh" @keyup="xh=xh.toUpperCase()" @keyup.enter="checkTP" /> </div>
      <div class="row row_small"><span class="problem two_em">箱</span><input v-model="boxArr.length" readonly class="no_inp" />
      </div>
      <div class="detail_page flex_deta">
        <div class="tab_title page_tab_title" v-show="!hasHidden">
          <span style="width:3em">序号</span>
          <span style="width:calc(100% - 8em)">箱号</span>
          <span style="width:5em">操作</span>
        </div>
        <div class="no_list page_no_list table_content" v-show="boxArr.length<1 && !hasHidden">扫描箱号才有数据哦~</div>
        <div class="page_table_content table_content" v-show="boxArr.length>0 && !hasHidden">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in boxArr" :key="i">
            <span style="width:3em">{{i+1}}</span>
            <span style="width:calc(100% - 8em)">{{list}}</span>
            <span style="width:5em"><span class="remove_btn" @click="remove_box(i)">移除</span></span>
          </div>
        </div>
      </div>
      <div class="btn_box" v-show="!hasHidden">
        <button @click="showUp" class="one_btn" v-show="isFirst">确认生成任务</button>
      </div>
    </div>
    <!-- 任务界面 -->
    <div class="box flex_box" v-show="!isFirst">
      <div class="row row_small"><span class="problem">任务箱号</span><input v-model="work.BOX" readonly class="no_inp input_small" />
      </div>
      <div class="row row_small"><span class="problem">箱号</span><input v-model="xh2" @focus="hideVK" ref="xh2" @keyup="xh2=xh2.toUpperCase()" @keyup.enter="checkBox" class="input_small" /> </div>
      <div class="row row_small"><span class="problem">推荐库位</span><input v-model="work.KW" readonly class="no_inp input_small" />
      </div>
      <div class="row row_small"><span class="problem">至库位</span><input v-model="tokw" @focus="hideVK" ref="tokw" @keyup="tokw=tokw.toUpperCase()" @keyup.enter="next" class="input_small" /> </div>
      <div class="detail_page flex_deta">
        <div class="base_info">
          <div class="info_item">
            <p>格号</p>
            <p>{{work.GH}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>容量</p>
            <p>{{work.LOCATIONHANDLING}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>任务量</p>
            <p>{{workList.length || '未知'}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>剩余任务数</p>
            <p>{{workList.length - workIndex}}</p>
          </div>
        </div>
        <div class="tab_title page_tab_title" v-show="!hasHidden">
          <span style="width:3em">序号</span>
          <span style="width:calc(50% - 3.5em)">任务箱号</span>
          <span style="width:calc(50% - 3.5em)">至库位</span>
          <span style="width:4em">状态</span>
        </div>
        <div class="page_table_content" v-show=" !hasHidden">
          <div class="table_row" :style="{backgroundColor:i%2==0?'#FAFAFA':''}" v-for="(list,i) in workList" :key="i">
            <span style="width:3em">{{i+1}}</span>
            <span style="width:calc(50% - 3.5em)">{{list.BOX}}</span>
            <span style="width:calc(50% - 3.5em)">{{list.kw}}</span>
            <span style="width:4em" :class="list.isOk?'green_bg white_bg':'pink_bg white_bg'">{{list.isOk?"完成":"等待"}}</span>
          </div>
        </div>
      </div>
      <div class="btn_box" v-show="!hasHidden">
        <button @click="jump" class="one_btn" v-show="!isFirst">跳过</button>
      </div>
    </div>
    <div class="loading_bg" v-show="loading">
      <div class="loading">
        <p>{{loadingMsg}}<span> 。。。</span></p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
    data(){
        return{
             bodyH: document.body.clientHeight,
            hasHidden: false,//是否展示表格，当软键盘弹出
            isFirst: true,//true展示箱数等信息，false展示的是弹出层组车任务
            xh: "",//箱号
            // 组装
            rl: 0,//容量
            sl: 1,//数量,为当前货箱中货品的总数量,写死，一直都是1
            xh2: "",//输入一遍当前箱号，判断是否一致
            tokw: "",//至库位
            loading: false,
            boxArr: [],//下发任务前需要发送给后端的箱号列表
            workList: [],
            // workList: [{ GH: 1, LOCATIONHANDLING: "9", BOX: "B20001", CARNO: "0000000171", KW: "test" }, { GH: 2, LOCATIONHANDLING: "9", BOX: "B10001", CARNO: "0000000171", KW: "HAHA" }
            // ],//下发任务后，接口获取的任务列表
            work: {},//展示在界面上的任务
            workIndex: 0,//工作数组下标
            loadingMsg: "请稍等",
        }
    },
      async mounted() {
            if (localStorage.getItem('adzc')) {
                try {
                    let data = JSON.parse(localStorage.getItem('adzc'));
                    // 缓存6小时，过期将清除
                    if (data.userName == this.userName && data.time + 21600000 < new Date().getTime()) {
                        if (confirm('是否使用缓存数据？')) {
                            this.workList = data.workList;
                            this.workIndex = data.workIndex;
                            this.work = this.workList[this.workIndex];
                            this.isFirst = false;
                            this.$nextTick(() => {
                                this.$refs.xh2.focus();
                            })
                        } else {
                            localStorage.removeItem('adzc')
                        }
                    } else {
                        localStorage.removeItem('adzc')
                    }
                } catch (error) {
                    alert('缓存解析出错')
                }
            }
            this.$refs.xh.focus();
            window.onresize = () => { this.hasHidden = document.body.clientHeight < this.bodyH ? true : false };
            try {
                _JIAndroidObj.controlGoBack();
            } catch (error) {
                alert("PDA监听返回错误 ")
            }
        },
        methods: {
            // 移除某箱号
            remove_box(index) {
                this.boxArr.splice(index, 1);
                this.$refs.xh.focus();
            },
            // 隐藏键盘
            hideVK(e) {
                e.target.setAttribute('readonly', true);
                setTimeout(() => {
                    e.target.removeAttribute('readonly');
                }, 100);
            },
            // 组车功能界面
            // 检查任务箱号
            checkTP() {
                if (!this.xh) {
                    alert('请检查箱号是否完整~');
                    return;
                }
                if (this.boxArr.indexOf(this.xh) != -1) {
                    alert(this.xh + '重复添加~');
                    this.xh = "";
                    return;
                }
                this.loading = true;
                let url = `${$apiUrl}sj/zcsj/checkBox?storage=STORAGE_ZMC&box=${this.xh}`;
                this.axios.get(url)
                    .then((res) => {
                        this.loading = false;
                        if (res.data.errcode != 0) {
                            alert("箱号" + this.xh + " : " + res.data.errmsg);
                            this.xh = "";
                            return;
                        }
                        this.boxArr.unshift(this.xh);
                        this.xh = "";
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.xh = "";
                        alert(error);
                    });
            },
            // 确定生成任务，弹出小车上架界面
            showUp() {
                if (this.boxArr.length < 1) {
                    alert('箱数大于0才能生成任务');
                    return;
                }
                this.loading = true;
                let url = `${$apiUrl}sj/zcsj/missionlist?storage=STORAGE_ZMC&boxlist=${this.boxArr}`;
                this.axios.get(url)
                    .then((res) => {
                        this.loading = false;
                        if (res.data.errcode != 0) {
                            alert(res.data.errmsg);
                            return;
                        }
                        if (res.data.data.length < 1) {
                            alert(`${this.boxArr}: 没有可以执行的任务`);
                            return;
                        }
                        this.$nextTick(() => {
                            this.$refs.xh2.focus();
                        });
                        this.workList = res.data.data;
                        this.work = res.data.data[this.workIndex];//先将第一个数据展示在页面上
                        this.isFirst = false;
                        this.workList.forEach((value, index) => {
                            value['isOk'] = false;
                            value['kw'] = '未知'
                        })
                    })
                    .catch((error) => {
                        this.loading = false;
                        alert(error);
                    });
            },
            // 输入箱号，判断是否跟当前任务箱号一致
            checkBox() {
                if (this.xh2 === this.work.BOX) {
                    this.$refs.tokw.focus();
                    return true;
                } else {
                    alert(`箱号${this.xh2}：请按照任务箱号扫描`);
                    this.xh2 = "";
                    return false;
                }
            },
            //输入至库位，判断与当前任务的库位是否一致
            checkToKw() {
                return new Promise((resolve, reject) => {
                    this.work.KW = "test"
                    if (this.tokw === this.work.KW || this.work.KW == 'UNKNOWN') {
                        this.$refs.tokw.blur()
                        resolve(true)
                    } else {
                        this.loading = true;
                        this.loadingMsg = `库位：${this.tokw}与推荐库位：${this.work.KW}不一致~`
                        setTimeout(() => {
                            this.loading = false;
                            this.loadingMsg = "请稍等"
                            resolve(true)
                        }, 1200)
                    }
                })

            },
            // 跳过
            jump() {
                if (this.workIndex == this.workList.length - 1) {
                    alert('该任务已经是最后一个任务了');
                    return;
                }
                let r = confirm("是否把当前任务放到最后执行？");
                if (r) {
                    this.xh2 = "";
                    this.tokw = "";
                    this.workList.push(...this.workList.splice(this.workList.findIndex((el, i) => i === this.workIndex), 1))
                    this.work = this.workList[this.workIndex];
                    this.$refs.xh2.focus();
                }
            },
            // 下一个任务
            async next() {
                this.checkToKw().then(() => {
                    this.loading = true;
                    let url = `${$apiUrl}sj/zcsj/comfirm?storage=STORAGE_ZMC&box=${this.work.BOX}&kw=${this.tokw}&carno=${this.work.CARNO}`;
                    this.axios.get(url)
                        .then((res) => {
                            this.loading = false;
                            if (res.data.errcode != 0) {
                                this.tokw = "";
                                alert(res.data.errmsg);
                                return;
                            }
                            this.workList[this.workIndex].isOk = true;
                            this.workList[this.workIndex].kw = this.tokw;
                            this.workIndex++;
                            if (this.workList.length <= this.workIndex) {
                                this.loadingMsg = "任务执行完成~";
                                this.loading = true;
                                setTimeout(() => {
                                    this.returnPage();
                                }, 1200);
                            } else {
                                this.work = this.workList[this.workIndex];
                                this.xh2 = "";
                                this.tokw = "";
                                this.$refs.xh2.focus();
                            }
                        })
                        .catch((error) => {
                            this.loading = false;
                            alert(error);
                        });
                })
            },
            // 返回功能组
            returnPage() {
                this.isFirst = true;
                this.boxArr = [];
                this.work = {
                    BOX: "",
                    GH: "",
                    LOCATIONHANDLING: 0
                };
                this.workIndex = 0;
                this.xh2 = "";//输入一遍当前箱号，判断是否一致
                this.tokw = "";//至库位
                this.loading = false;
                this.loadingMsg = "请稍等";
                this.$nextTick(() => {
                    this.$refs.xh.focus();
                })
            },
        }
   
}
</script>