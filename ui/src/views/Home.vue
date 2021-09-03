<template>
  <div class="home">
    <div class="filter">
      <section>
        <strong>时段:</strong>
        <label><input type="radio" name="timePeriod" value="realtime" v-model="timePeriod">实时</label>
        <label><input type="radio" name="timePeriod" value="lastNight" v-model="timePeriod" title="昨晚8点到今早8点">昨晚</label>
        <label><input type="radio" name="timePeriod" value="1day" v-model="timePeriod">最近24小时</label>
        <label><input type="radio" name="timePeriod" value="7days" v-model="timePeriod">最近7天</label>
        <label><input type="radio" name="timePeriod" value="30days" v-model="timePeriod">最近30天</label>
        <label><input type="radio" name="timePeriod" value="customize" v-model="timePeriod">自定义</label>
        <span v-show="timePeriod === 'customize'">
          <input type="datetime-local" v-model="customize_input[0]">
          <input type="datetime-local" v-model="customize_input[1]" :max="Date()">
          <button @click="search">查询</button>
        </span>
      </section>
      <section>
        <strong>指标参数:</strong>
        <label v-for="(item, index) in chartGroups" :key='index'>
          <input type="radio" name="type" :value="index" v-model="active">{{chartGroups[index].groupTitle}}</label>
      </section>
    </div>
    <div class="box">
      <chart :prop="chartProp"/>
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
      // 根据传感器协议定义空气质量参数顺序
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
      // 每一组图表的定义
      // 类别
      active: 0,
      // category: 类型名称
      // dataIndex: 数据源配置映射(每一个图表取协议中的哪几个指标参数)
      // suggested: 建议值范围, [0,0]等同于无建议
      chartGroups: [
        {
          groupTitle: '<PM10(大气环境)',
          dataIndex: [3, 4, 5],
          suggested: [0, 150],
          stacked: true
        },
        {
          groupTitle: '<PM10(工业环境)',
          dataIndex: [0, 1, 2],
          suggested: [0, 0],
          stacked: true
        },
        {
          groupTitle: '100ml空气颗粒物个数',
          dataIndex: [6, 7, 8, 9, 10, 11],
          suggested: [0, 0]
        },
        {
          groupTitle: '甲醛浓度',
          dataIndex: [12],
          suggested: [0, 100]
        },
        {
          groupTitle: '温度',
          dataIndex: [13],
          suggested: [0, 40]
        },
        {
          groupTitle: '湿度',
          dataIndex: [14],
          suggested: [0, 0]
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
    // 时段区间毫秒表示
    timePeriodMs () {
      const now = new Date()
      const lastNightTime = new Date()
      lastNightTime.setDate(lastNightTime.getDate() - 1)
      switch (this.timePeriod) {
        case 'realtime':
          return [(new Date()).setHours(now.getHours() - 1), Date.now()]
        case 'lastNight':
          return [lastNightTime.setHours(20, 0, 0), (new Date()).setHours(8, 0, 0)]
        case '1day':
          return [(new Date()).setDate(now.getDate() - 1), Date.now()]
        case '7days':
          return [(new Date()).setDate(now.getDate() - 7), Date.now()]
        case '30days':
          return [(new Date()).setDate(now.getDate() - 30), Date.now()]
        case 'customize':
          return [(new Date(this.customize_input[0])).getTime(), (new Date(this.customize_input[1])).getTime()]
      }
      return [0, 0]
    },
    // 按图表展示方式将数据条拼合
    chartProp () {
      // chart指当前激活图表的配置信息
      const chart = this.chartGroups[this.active]
      // 图表各个系列的数据集集合
      const datasets = []
      // 根据当前图表配置的数据指针汇聚
      chart.dataIndex.forEach(el => {
        datasets.push(this.itemDatasets[el])
      })
      return {
        title: chart.groupTitle,
        data: {
          labels: this.timeLine,
          datasets: datasets
        },
        suggestedMin: chart.suggested[0],
        suggestedMax: chart.suggested[1]
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
    // 获取数据
    fetchData () {
      this.axios.get(`history?min=${this.timePeriodMs[0]}&max=${this.timePeriodMs[1]}`)
        .then((response) => {
          console.log('获取到%s条数据', response.data.length)
          this.rawData = response.data
          this.rawDataParse()
        })
    },
    // 数据清空
    dateReset () {
      this.timeLine = []
      this.itemDatasets.forEach(element => { element.data = [] })
    },
    // 解析原始数据,行列转换
    rawDataParse () {
      this.dateReset()
      this.rawData.forEach(element => {
        // element预期格式为: {time:date,aq:[]}
        this.timeLine.push(element.time)
        element.aq.forEach((aqItem, index) => {
          if (index >= this.itemDatasets.length) return
          this.itemDatasets[index].data.push(aqItem)
        }, this)
      }, this)
      console.log('解析原始数据,时间轴长度: %s', this.timeLine.length)
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
    width: 80%;
    margin: auto;
  }
  .box {
    /* position: relative;
    height: 100px; */
    /* max-width: 1200px; */
    width: 100%;
  }
</style>
