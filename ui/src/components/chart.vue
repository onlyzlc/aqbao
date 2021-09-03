<template>
    <div id='chartBox'>
        <canvas :id='elid'></canvas>
    </div>
</template>
<script>
import Chart from 'chart.js/auto'
import 'chartjs-adapter-moment'
// var chartDom, chart
export default {
  props: ['prop'],
  data () {
    return {
      elid: '',
      chart: {},
      config: {
        type: 'line',
        // data: this.prop.data,
        options: {
          // 延迟刷新
          resizeDelay: 500,
          // 这里统一调整点线等元素样式
          elements: {
            line: {
              tension: 0.1,
              borderWidth: 2,
              borderColor: [
                'rgba(38, 70, 83, 1)',
                'rgba(42, 157, 143, 1)',
                'rgba(233, 196, 106, 1)',
                'rgba(244, 162, 97, 1)',
                'rgba(231, 111, 81, 1)',
                'rgba(120, 32, 23, 1)'
              ]
            },
            point: {
              radius: 0
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMin: 0,
              suggestedMax: 30
            },
            x: {
              type: 'time',
              time: {
                // unit: 'minute',
                tooltipFormat: 'M-D HH:mm:ss',
                displayFormats: {
                  hour: 'M-D HH:mm',
                  minute: 'HH:mm'
                }
              }
            }
          },
          plugins: {
            title: {
              display: true
              // text: this.prop.title
            }
          }
        }
      }
    }
  },
  // 分配随机ID
  beforeMount () {
    this.elid = 'lnchart' + (10000 * Math.random().toFixed(4)).toString()
  },
  watch: {
    prop: function () {
      // 不知为何没有自动更新数据,这里只能手动再赋值一次
      this.config.data = this.prop.data
      this.config.options.plugins.title.text = this.prop.title
      this.config.options.scales.y.suggestedMin = this.prop.suggestedMin
      this.config.options.scales.y.suggestedMax = this.prop.suggestedMax
      this.chart.update('normal')
    }
  },
  mounted () {
    this.chart = new Chart(this.elid, this.config)
  }
}
</script>
