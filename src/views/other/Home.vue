<template>
  <div class="index">
    <div>
      <h1>收货</h1>
      <div style="width:50%;height:10px"></div>
      <button @click="goPage('PalletReceivingByBox')">托盘按箱收货</button>
      <button @click="goPage('ReceivingByBox')">按箱收货</button>
      <button @click="goPage('ErrQuery')">设备收货异常箱查询</button>
      <div style="width:50%;height:40px"></div>
    </div>
    <div>
      <h1>上架</h1>
      <div style="width:50%;height:10px"></div>
      <button @click="goPage('PalletOnShelf')">托盘上架</button>
      <button @click="goPage('AntiZeroUp')">货品返零捡位</button>
      <button @click="goPage('GroupCarUp')">组车上架</button>
      <button @click="goPage('TransmissionLineTask')">传输线任务生成</button>
      <button @click="goPage('ZeroTransmissionLine')">零捡位传输线任务生成</button>
      <button @click="goPage('ElevatorConveyingTray')">提升机输送托盘任务生成</button>
    </div>
    <div>
      <h1>托盘箱</h1>
      <div style="width:50%;height:10px"></div>
      <button @click="goPage('PalletBoxBinding')">托盘箱绑定</button>
      <button @click="goPage('PalletBoxUnbound')">托盘箱解绑</button>
      <button @click="goPage('LocationPalletBinding')">库位托盘绑定</button>
      <button @click="goPage('TrayMove')">托盘移动</button>
      <button @click="goPage('OptimizedPacking')">优化装箱</button>
      <button @click="goPage('ContainerSorting')">货箱分理</button>
      <button @click="goPage('PackingOfGoods')">货品装箱</button>
      <button @click="goPage('LPNMove')">LPN移动</button>
    </div>
    <div>
      <h1>盘点</h1>
      <div style="width:50%;height:10px"></div>
      <button @click="goPage('BoxCount')">箱数盘点</button>
      <button @click="goPage('CaseCleaningInventory')">扫箱盘点</button>
      <button @click="goPage('PickingPositionCounting')">拣选位盘点</button>
      <div style="width:50%;height:40px"></div>
    </div>
    <div>
      <h1>拣货</h1>
      <div style="width:50%;height:10px"></div>
      <button @click="goPage('RegisterBoxPicking')">区域整箱拣货</button>
      <button @click="goPage('RegionalFullConReplenishment')">区域整箱补货</button>
      <button @click="goPage('TaskGroupPicking')">任务组拣货</button>
      <button @click="goPage('RegisterBoxPicking')">注册箱拣货</button>
      <button @click="goPage('BySingleGroup')">按单组车</button>
      <button @click="goPage('DistributionAndCollection')">多品分播集货</button>
      <button @click="goPage('CollectionRelease')">多品分拨集货释放</button>
    </div>
    <div>
      <h1>发运</h1>
      <div style="width:50%;height:10px"></div>
      <button @click="goPage('shippingComBox')">并箱</button>
      <button @click="goPage('CollectionAndShip')">集货发运</button>
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    goPage(name) {
      let { origin, pathname } = window.location;
      //   let url = `${origin}/#/${name}`;
      window.open(`${origin}/#/${name}`);
    },
  },
};
</script>
<style scoped>
.index {
  max-width: 540px;
  margin: auto;
}
div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  box-sizing: border-box;
  width: 100%;
}

button {
  width: 46%;
  flex: none;
  margin: 4px 0;
}
</style>