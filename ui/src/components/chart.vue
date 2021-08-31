<template>
    <div>
        <canvas :id='elid'></canvas>
    </div>
</template>
<script>
import Chart from 'chart.js/auto'
import 'chartjs-adapter-moment'
export default {
  props: ['prop'],
  data () {
    return {
      elid: ''
      // labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      // value: [12, 19, 3, 5, 2, 3]
    }
  },
  // 分配随机ID
  beforeMount () {
    this.elid = 'lnchart' + (10000 * Math.random().toFixed(4)).toString()
  },
  mounted () {
    // 颜色选取
    var myChart = new Chart(this.elid, {
      type: 'line',
      data: {
        labels: this.prop.labels,
        datasets: [{
          // label: '# of Votes',
          data: this.prop.value,
          borderColor: 'rgba(255, 99, 132, 1)'
        }]
      },
      options: {
        // 延迟刷新
        resizeDelay: 300,
        // 这里统一调整点线等元素样式
        elements: {
          line: {
            tension: 0.1,
            borderWidth: 3,
            borderColor: 'rgba(153, 102, 255, 1)'
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
              // stepSize: 20,
              tooltipFormat: 'M-D HH:mm:ss',
              displayFormats: {
                hour: 'M-D HH:mm'
              }
            },
            max: this.prop.max,
            min: this.prop.min
          }
        },
        plugins: {
          title: {
            display: true,
            text: this.prop.title
          }
        }
      }
    })
    myChart.update('none')
  }
}
</script>
