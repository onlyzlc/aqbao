<template>
  <div class="home">
    <div>
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
    </div>
    <div>
      <section>
        <label><input type="radio" name="type" value="0" v-model="active">PM1.0</label>
        <label><input type="radio" name="type" value="1" v-model="active">PM2.5</label>
        <label><input type="radio" name="type" value="2" v-model="active">PM10</label>
        <label><input type="radio" name="type" value="3" v-model="active">100ml空气颗粒物个数</label>
        <label><input type="radio" name="type" value="4" v-model="active">甲醛</label>
        <label><input type="radio" name="type" value="5" v-model="active">温度</label>
        <label><input type="radio" name="type" value="6" v-model="active">湿度</label>
      </section>
    </div>
    <div class="box">
      <chart :prop="chartDatas"/>
    </div>
  </div>
</template>

<script>
import Chart from '../components/chart'
export default {
  name: 'Home',
  components: {
    Chart
  },
  data () {
    return {
      // 空气质量指数顺序定义，根据传感器协议定义
      itemDataDefine: [
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
      // 每一组图表的定义
      // 类别
      active: 0,
      // category: 类型名称
      // dataIndex: 数据源配置映射(每一个图表取那几组数据)
      chartGroups: [
        {
          groupTitle: 'PM1.0',
          dataIndex: [0, 3]
        },
        {
          groupTitle: 'PM2.5',
          dataIndex: [1, 4]
        },
        {
          groupTitle: 'PM10',
          dataIndex: [2, 5]
        },
        {
          groupTitle: '100ml空气颗粒物个数',
          dataIndex: [6, 7, 8, 9, 10, 11]
        },
        {
          groupTitle: '甲醛浓度',
          dataIndex: [12]
        },
        {
          groupTitle: '温度',
          dataIndex: [13]
        },
        {
          groupTitle: '湿度',
          dataIndex: [14]
        }
      ],
      room: '',
      customize_input: [new Date(), new Date()],
      // 当前选取的时段名称
      timePeriod: 'realtime',
      // rawData 即原始数据 = [{time:t1, aq:[采集项a,采集项b...]},{time:t2，aq:[采集项a',采集项b'...]}]
      rawData: [],
      // 最终展示数据，将时间数组单独存放，因为所有图表共用一个时间轴
      // 将采集数值按协议
      // timeLine = [t1,t2,...]
      timeLine: [],
      // itemDatasets = [
      //  {label: '采集项a',
      //  data: [采集项a,采集项a'...]},
      //  {label: '采集项b',
      //  data: [采集项b,采集项b'...]}
      // ]
      itemDatasets: []
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
    },
    // 按图表展示方式将数据条拼合
    chartDatas () {
      const chart = this.chartGroups[this.active]
      const datasets = []
      chart.dataIndex.forEach(el => {
        datasets.push(this.itemDatasets[el])
      })
      return {
        title: chart.groupTitle,
        labels: this.timeLine,
        datasets: datasets
      }
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
    this.itemDataDefine.forEach(element => {
      this.itemDatasets.push({ label: element, data: [] })
    })
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
      this.itemDatasets.forEach(element => { element.data = [] })
    },
    rawDataParse () {
      this.dateReset()
      this.rawData.forEach(element => {
        this.timeLine.push(element.time)
        element.aq.forEach((aqItem, index) => {
          if (index >= this.itemDatasets.length) return
          this.itemDatasets[index].data.push(aqItem)
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
    /* display: flex; */
    /* flex-flow: row wrap; */
  }
  .box {
    /* position: relative;
    height: 200px; */
    /* max-width: 1200px; */
    width: 100%;
  }
</style>
