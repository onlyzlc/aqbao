<template>
  <div class="home">
    <section>
      <label><input type="radio" name="timePeriod" value="realtime" v-model="timePeriod">实时</label>
      <label><input type="radio" name="timePeriod" value="lastNight" v-model="timePeriod">昨晚</label>
      <label><input type="radio" name="timePeriod" value="customize" v-model="timePeriod">自定义</label>
      <span v-show="timePeriod === 'customize'">
        <input type="datetime-local" v-model="customize_input[0]">
        <input type="datetime-local" v-model="customize_input[1]" :max="Date()">
        <button @click="search">查询</button>
      </span>
    </section>
    <div class="box" v-for="(item, index) in dataDefine" :key='item'>
      <chart :prop="{title:item,labels: timeLine,value: datasets[index],min:timePeriodMs[0],max:timePeriodMs[1]}"/>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Chart from '../components/chart.vue'
// const today = new Date()
// const lastNightTime = new Date()
// lastNightTime.setDate(today.getDate() - 1)

export default {
  name: 'Home',
  components: {
    Chart
  },
  data () {
    return {
      // 空气质量指数顺序定义，根据传感器协议定义
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
      suggestedMin: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -10, 20],
      suggestedMax: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 50, 100],
      room: '',
      // 定义常用时段值
      // timePeriodOption: {
      //   realtime: [this.realtime_start, Date.now()],
      //   lastNight: [lastNightTime.setHours(20, 0, 0), today.setHours(20, 0, 0)],
      //   customize: [(new Date(this.customize_start)).getTime(), (new Date(this.customize_end)).getTime()]
      // },
      customize_input: [new Date(), new Date()],
      // 当前选取的时段名称
      timePeriod: 'realtime',
      // rawData 即原始数据 = [{time:t1, aq:[采集项a,采集项b...]},{time:t2，aq:[采集项a',采集项b'...]}]
      rawData: [],
      // 最终展示数据，将时间数组单独存放，因为所有图表共用一个时间轴
      // 将采集数值按协议
      // timeLine = [t1,t2,...]
      // datasets = [[采集项a,采集项a'...], [采集项b,采集项b'...]]
      timeLine: [],
      datasets: []
    }
  },
  computed: {
    timePeriodMs () {
      const now = new Date()
      const lastNightTime = new Date()
      lastNightTime.setDate(lastNightTime.getDate() - 1)
      switch (this.timePeriod) {
        case 'realtime':
          return [now.setHours(now.getHours() - 1), Date.now()]
        case 'lastNight':
          return [lastNightTime.setHours(20, 0, 0), now.setHours(8, 0, 0)]
        case 'customize':
          return [(new Date(this.customize_input[0])).getTime(), (new Date(this.customize_input[1])).getTime()]
      }
      return [0, 0]
    }
  },
  watch: {
    timePeriod: function (value) {
      if (value === 'customize') {
        this.search()
      } else this.fetchData()
    }
  },
  created () {
    this.dataDefine.forEach(element => {
      this.datasets.push([])
    })
    this.timeLine = []
    this.timePeriod = 'lastNight'
    this.fetchData()
  },
  methods: {
    fetchData () {
      // this.rawData = require('./fakedata')
      this.axios.get(`history?min=${this.timePeriodMs[0]}&max=${this.timePeriodMs[1]}`)
        .then((response) => {
          console.log('获取到%s条数据', response.data.length)
          this.rawData = response.data
          this.rawDataParse()
        })
    },
    dateReset () {
      this.timeLine = []
      this.datasets.forEach(element => { element = [] })
    },
    rawDataParse () {
      this.dateReset()
      this.rawData.forEach(element => {
        this.timeLine.push(element.time)
        element.aq.forEach((aqItem, index) => {
          if (index >= this.datasets.length) return
          this.datasets[index].push(aqItem)
        }, this)
      }, this)
    },
    search () {
      // 输入框校验
      if ((new Date(this.customize_input[0])).getTime() < (new Date(this.customize_input[1])).getTime()) {
        this.fetchData()
      }
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
    /* max-width: 1200px; */
    width: 100%;
  }
</style>
