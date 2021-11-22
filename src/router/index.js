import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/other/Home.vue'
import { getUrl, hasChange } from '../utiles/tools.js'
import { getUser } from '../utiles/apis/common.js'

Vue.use(VueRouter)
// 收货
const PalletReceivingByBox = r => require.ensure([], () => r(require('@/views/receiving/PalletReceivingByBox.vue')), 'palletReceivingByBox');
const ReceivingByBox = r => require.ensure([], () => r(require('@/views/receiving/ReceivingByBox.vue')), 'receivingByBox');
const ErrQuery = r => require.ensure([], () => r(require('@/views/receiving/ErrQuery.vue')), 'errQuery');

// 上架
const PalletOnShelf = r => require.ensure([], () => r(require('@/views/business/PalletOnShelf.vue')), 'palletOnShelf');
const AntiZeroUp = r => require.ensure([], () => r(require('@/views/business/AntiZeroUp.vue')), 'antiZeroUp');
const GroupCarUp = r => require.ensure([], () => r(require('@/views/business/GroupCarUp.vue')), 'groupCarUp');
const TransmissionLineTask = r => require.ensure([], () => r(require('@/views/business/TransmissionLineTask.vue')), 'transmissionLineTask');
const ZeroTransmissionLine = r => require.ensure([], () => r(require('@/views/business/ZeroTransmissionLine.vue')), 'zeroTransmissionLine');
const ElevatorConveyingTray = r => require.ensure([], () => r(require('@/views/business/ElevatorConveyingTray.vue')), 'elevatorConveyingTray');

// 托盘箱
const PalletBoxBinding = r => require.ensure([], () => r(require('@/views/trayBox/PalletBoxBinding.vue')), 'palletBoxBinding');
const PalletBoxUnbound = r => require.ensure([], () => r(require('@/views/trayBox/PalletBoxUnbound.vue')), 'palletBoxUnbound');
const LocationPalletBinding = r => require.ensure([], () => r(require('@/views/trayBox/LocationPalletBinding.vue')), 'locationPalletBinding');
const TrayMove = r => require.ensure([], () => r(require('@/views/trayBox/TrayMove.vue')), 'trayMove');
const OptimizedPacking = r => require.ensure([], () => r(require('@/views/trayBox/OptimizedPacking.vue')), 'optimizedPacking');
const ContainerSorting = r => require.ensure([], () => r(require('@/views/trayBox/ContainerSorting.vue')), 'containerSorting');
const PackingOfGoods = r => require.ensure([], () => r(require('@/views/trayBox/PackingOfGoods.vue')), 'packingOfGoods');
const LPNMove = r => require.ensure([], () => r(require('@/views/trayBox/LPNMove.vue')), 'LPNMove');

// 盘点
const BoxCount = r => require.ensure([], () => r(require('@/views/inventory/BoxCount.vue')), 'BoxCount');
const CaseCleaningInventory = r => require.ensure([], () => r(require('@/views/inventory/CaseCleaningInventory.vue')), 'caseCleaningInventory');
const PickingPositionCounting = r => require.ensure([], () => r(require('@/views/inventory/PickingPositionCounting.vue')), 'pickingPositionCounting');

// 拣货
const RegionalFullConPicking = r => require.ensure([], () => r(require('@/views/picking/RegionalFullConPicking.vue')), 'RegionalFullConPicking');
const RegionalFullConReplenishment = r => require.ensure([], () => r(require('@/views/picking/RegionalFullConReplenishment.vue')), 'regionalFullConReplenishment');
const TaskGroupPicking = r => require.ensure([], () => r(require('@/views/picking/TaskGroupPicking.vue')), 'taskGroupPicking');
const RegisterBoxPicking = r => require.ensure([], () => r(require('@/views/picking/RegisterBoxPicking.vue')), 'registerBoxPicking');
const BySingleGroup = r => require.ensure([], () => r(require('@/views/picking/BySingleGroup.vue')), 'bySingleGroup');
const DistributionAndCollection = r => require.ensure([], () => r(require('@/views/picking/DistributionAndCollection.vue')), 'distributionAndCollection');
const CollectionRelease = r => require.ensure([], () => r(require('@/views/picking/CollectionRelease.vue')), 'collectionRelease');

// 发运
const ShippingComBox = r => require.ensure([], () => r(require('@/views/shipping/CombinedBox.vue')), 'shippingComBox');
const CollectionAndShip = r => require.ensure([], () => r(require('@/views/shipping/CollectionAndShip.vue')), 'collectionAndShip');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/palletReceivingByBox',
    name: 'PalletReceivingByBox',
    component: PalletReceivingByBox,
    meta: { title: '托盘按箱收货', url: 'receiving/PalletReceivingByBox' }
  },
  {
    path: '/receivingByBox',
    name: 'ReceivingByBox',
    component: ReceivingByBox,
    meta: { title: '按箱收货', url: 'receiving/ReceivingByBox' }
  },
  {
    path: '/errQuery',
    name: 'ErrQuery',
    component: ErrQuery,
    meta: { title: '设备收货异常箱查询', url: 'receiving/ErrQuery' }
  },
  {
    path: '/palletOnShelf',
    name: 'PalletOnShelf',
    component: PalletOnShelf,
    meta: { title: '托盘上架', url: 'business/PalletOnShelf' }
  },
  {
    path: '/antiZeroUp',
    name: 'AntiZeroUp',
    component: AntiZeroUp,
    meta: { title: '货品反零捡位', url: 'business/AntiZeroUp' }
  },
  {
    path: '/GroupCarUp',
    name: 'GroupCarUp',
    component: GroupCarUp,
    meta: { title: '组车上架', url: 'business/GroupCarUp' }
  },
  {
    path: '/transmissionLineTask',
    name: 'TransmissionLineTask',
    component: TransmissionLineTask,
    meta: { title: '传输线任务生成', url: 'business/TransmissionLineTask' }
  },
  {
    path: '/zeroTransmissionLine',
    name: 'ZeroTransmissionLine',
    component: ZeroTransmissionLine,
    meta: { title: '零捡位传输线任务生成', url: 'business/ZeroTransmissionLine' }
  }, {
    path: '/elevatorConveyingTray',
    name: 'ElevatorConveyingTray',
    component: ElevatorConveyingTray,
    meta: { title: '提升机输送托盘任务生成', url: 'business/ElevatorConveyingTray' }
  },
  {
    path: '/palletBoxBinding',
    name: 'PalletBoxBinding',
    component: PalletBoxBinding,
    meta: { title: '托盘箱绑定', url: 'trayBox/PalletBoxBinding' }
  }, {
    path: '/palletBoxUnbound',
    name: 'PalletBoxUnbound',
    component: PalletBoxUnbound,
    meta: { title: '托盘箱解绑', url: 'trayBox/PalletBoxUnbound' }
  }, {
    path: '/locationPalletBinding',
    name: 'LocationPalletBinding',
    component: LocationPalletBinding,
    meta: { title: '库位托盘绑定', url: 'trayBox/LocationPalletBinding' }
  }, {
    path: '/trayMove',
    name: 'TrayMove',
    component: TrayMove,
    meta: { title: '托盘移动', url: 'trayBox/TrayMove' }
  }, {
    path: '/optimizedPacking',
    name: 'OptimizedPacking',
    component: OptimizedPacking,
    meta: { title: '优化装箱', url: 'trayBox/OptimizedPacking' }
  }, {
    path: '/containerSorting',
    name: 'ContainerSorting',
    component: ContainerSorting,
    meta: { title: '货箱分理', url: 'trayBox/ContainerSorting' }
  },
  {
    path: '/packingOfGoods',
    name: 'PackingOfGoods',
    component: PackingOfGoods,
    meta: { title: '货品装箱', url: 'trayBox/PackingOfGoods' }
  }, {
    path: '/LPNMove',
    name: 'LPNMove',
    component: LPNMove,
    meta: { title: 'LPN移动(箱移动)', url: 'trayBox/LPNMove' }
  },
  {
    path: '/boxCount',
    name: 'BoxCount',
    component: BoxCount,
    meta: { title: '箱数盘点', url: 'inventory/BoxCount' }
  },
  {
    path: '/caseCleaningInventory',
    name: 'CaseCleaningInventory',
    component: CaseCleaningInventory,
    meta: { title: '扫箱盘点', url: 'inventory/CaseCleaningInventory' }
  }, {
    path: '/pickingPositionCounting',
    name: 'PickingPositionCounting',
    component: PickingPositionCounting,
    meta: { title: '拣选位盘点', url: 'inventory/PickingPositionCounting' }
  },
  {
    path: '/regionalFullConPicking',
    name: 'RegionalFullConPicking',
    component: RegionalFullConPicking,
    meta: { title: '区域整箱拣货', url: 'picking/RegionalFullConPicking' }
  },
  {
    path: '/regionalFullConReplenishment',
    name: 'RegionalFullConReplenishment',
    component: RegionalFullConReplenishment,
    meta: { title: '区域整箱补货', url: 'picking/RegionalFullConReplenishment' }
  }, {
    path: '/taskGroupPicking',
    name: 'TaskGroupPicking',
    component: TaskGroupPicking,
    meta: { title: '任务组拣货', url: 'picking/TaskGroupPicking' }
  }, {
    path: '/registerBoxPicking',
    name: 'RegisterBoxPicking',
    component: RegisterBoxPicking,
    meta: { title: '注册箱拣货', url: 'picking/RegisterBoxPicking' }
  }, {
    path: '/bySingleGroup',
    name: 'BySingleGroup',
    component: BySingleGroup,
    meta: { title: '按单组车', url: 'picking/BySingleGroup' }
  }, {
    path: '/distributionAndCollection',
    name: 'DistributionAndCollection',
    component: DistributionAndCollection,
    meta: { title: '多品分播集货', url: 'picking/DistributionAndCollection' }
  }, {
    path: '/collectionRelease',
    name: 'CollectionRelease',
    component: CollectionRelease,
    meta: { title: '多品分播集货释放', url: 'picking/CollectionRelease' }
  },
  {
    path: '/shippingComBox',
    name: 'ShippingComBox',
    component: ShippingComBox,
    meta: { title: '并箱', url: 'shipping/CombinedBox' }
  },
  {
    path: '/collectionAndShip',
    name: 'CollectionAndShip',
    component: CollectionAndShip,
    meta: { title: '集货发运', url: 'shipping/CollectionAndShip' }
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach(async (to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  let userToken = getUrl("apptoken") || '3f2e86cacbb2f9e5';
  if (!localStorage.getItem('IM_USER_INFO') || hasChange()) {//用户信息丢失
    console.log('没有用户');
    getUser(userToken).then((res) => {
      if (!res.data.cname) {
        alert('登录人员名称获取失败，请联系it人员');
        return;
      }
      localStorage.setItem('IM_USER_INFO', JSON.stringify(res.data));
      localStorage.setItem('IM_USER_TOKEN', userToken)
      // alert(JSON.stringify(res.data))
      next();
      return
    }).catch((error) => {
      alert(error);
    });
  }
  next()
})
export default router
