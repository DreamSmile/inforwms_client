<template>
  <!-- 收货：设备收货异常箱查询 -->
  <div class="all">
    <head-name></head-name>
    <div class="box">
      <div class="search">
        <span class="problem two_em">箱号</span>
        <input v-model="xh" placeholder="请扫描箱号，查询详情" @keyup.enter="selectXh" @focus="hideVK" ref="xh" @keyup="xh=xh.toUpperCase()" />
        <button class="search_btn" @click="selectXh">查询</button>
      </div>
      <div class="detail_page" v-show="showPage">
        <div class="base_info">
          <div class="info_item">
            <p>货主</p>
            <p>{{info.HZ || '未知'}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>是否混箱</p>
            <p :class="{red_em:info.HX==1}">{{info.HX=="1"?'是':'否'}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>预期收货量</p>
            <p>{{info.YJL || 0}}</p>
          </div>
          <div class="line"></div>
          <div class="info_item">
            <p>实际收获量</p>
            <p>{{info.SJL || 0}}</p>
          </div>
        </div>
        <div class="detail_row">
          <span>箱号</span>
          <span>{{showXh || '未知'}}</span>
        </div>
        <div class="detail_row">
          <span>ERP单据号</span>
          <span>{{info.ERPDJH || '未知'}}</span>
        </div>
        <div class="detail_row">
          <span>ERP单据类型</span>
          <span>{{info.DJLX || '未知'}}</span>
        </div>
        <div class="detail_row">
          <span>ASN单号</span>
          <span>{{info.ASNDH || '未知'}}</span>
        </div>
        <div class="detail_row">
          <span>收货状态</span>
          <span :class="{red_em:info.ZT==0}">{{info.ZT==0?'失败':'成功'}}</span>
        </div>
        <div class="detail_row">
          <span>详情</span>
          <span :class="{red_em:info.ZT==0}">{{info.MSG || '未知'}}</span>
        </div>
      </div>
    </div>
    <!-- 加载页面 -->
    <div class="loading_bg" v-show="loading">
      <div class="loading">
        <p>请稍等<span> 。。。</span></p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loading: false,
      xh: "",
      showXh: "", //当显示查询信息时，输入框箱号清空，信息处显示箱号
      showPage: false,
      info: {}, //错误的所有信息
    };
  },
  mounted() {
    this.$refs.xh.focus();
  },
  methods: {
    hideVK(e) {
      e.target.setAttribute("readonly", true);
      setTimeout(() => {
        e.target.removeAttribute("readonly");
      }, 100);
    },
    // 根据箱号查找详细信息
    selectXh() {
      if (!this.xh) {
        alert("请输入完整箱号~");
        return;
      }
      this.loading = true;
      let url = `${$apiUrl}sh/ycxxx/boxinfo?storage=STORAGE_ZMC&box=${this.xh}`;
      this.axios
        .get(url)
        .then((res) => {
          this.loading = false;
          if (res.data.errcode != 0) {
            alert(`箱号${this.xh}: ${res.data.errmsg}`);
            this.xh = "";
            this.info = {};
            this.showPage = false;
            return;
          }
          this.info = res.data.data;
          this.showPage = true;
          this.showXh = this.xh;
          this.xh = "";
          this.$refs.xh.focus();
        })
        .catch((error) => {
          this.loading = false;
          this.xh = "";
          alert(error);
        });
    },
  },
};
</script>