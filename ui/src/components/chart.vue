<template>
    <div id='chartBox'>
        <canvas :id='elid'></canvas>
    </div>
</template>
<script>
import Chart from 'chart.js/auto'
import 'chartjs-adapter-moment'
const chartBox = document.getElementById('chartBox')
var chart = document.createElement('canvas')
chart.id = 'lnchart' + (10000 * Math.random().toFixed(4)).toString()
chartBox.appendChild(chart)
export default {
  props: ['prop'],
  data () {
    return {
      elid: '',
      // chart: {},
      config: {
        type: 'line',
        data: {
          labels: this.prop.labels,
          datasets: this.prop.datasets
        },
        options: {
          // 延迟刷新
          resizeDelay: 300,
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
              beginAtZero: true
            },
            x: {
              type: 'time',
              time: {
                unit: 'minute',
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
              display: true,
              text: this.prop.title
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
      chart.update('normal')
    }
  },
  mounted () {
    chart = new Chart(this.elid, this.config)
  }
}
</script>
