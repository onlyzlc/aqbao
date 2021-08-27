<template>
  <div class="home">
    <div class="box" v-for="(item, index) in dataDefine" :key='item'>
      <chart :prop="{title:item, labels: timeLine, value: datasets[index], min:timePeriod[0], max:timePeriod[1]}"/>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Chart from '../components/chart.vue'
const now = new Date()
const timePeriodOption = {
  realtime: [Date() - 60000, Date()],
  lastNight: [new Date(now - 24 * 3600 * 1000).setHours(20, 0, 0), now.setHours(20, 0, 0)]
}
// const fackData = require(fackData.js)
export default {
  name: 'Home',
  components: {
    Chart
  },
  data () {
    return {
      dataDefine: [
        'PM1.0 浓度（CF=1，标准颗粒物）单位μg/m3',
        'PM2.5 浓度（CF=1，标准颗粒物）单位μg/m3',
        'PM10 浓度（CF=1，标准颗粒物）单位μg/m3',
        'PM1.0 浓度（大气环境下）单位μg/m3',
        'PM2.5 浓度（大气环境下）单位μg/m3',
        'PM10 浓度 （大气环境下）单位μg/m3',
        '0.1 升空气中直径在 0.3μm 以上颗粒物个数',
        '0.1 升空气中直径在 0.5μm 以上颗粒物个数',
        '0.1 升空气中直径在 1.0μm 以上颗粒物个数',
        '0.1 升空气中直径在 2.5μm 以上颗粒物个数',
        '0.1 升空气中直径在 5.0μm 以上颗粒物个数',
        '0.1 升空气中直径在 10μm 以上颗粒物个数',
        '甲醛浓度数值 单位：μg/m³',
        '温度 单位：℃',
        '湿度 单位：％'
      ],
      room: '',
      timePeriod: timePeriodOption.realtime,
      rawData: [],
      timeLine: [],
      datasets: []
    }
  },
  created () {
    this.dataDefine.forEach(element => {
      this.datasets.push([])
    })
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.rawData = require('./fakedata')
      this.rawData.forEach(element => {
        this.timeLine.push(element.time)
        element.aq.forEach((aqItem, index) => {
          if (index >= this.datasets.length) return
          if (index === 13 || index === 14) aqItem = aqItem / 10
          this.datasets[index].push(aqItem)
        }, this)
      }, this)
    }
  }
}
</script>
<style>
  .home {
    display: flex;
    flex-flow: row wrap;
  }
  .box {
    /* position: relative;
    height: 200px; */
    max-width: 600px;
    width: 100%;
  }
</style>
