const express = require('express');
const app = express();
const appport = 8888;
const mongoose = require('mongoose');
const uri_local = 'mongodb://127.0.0.1/aqbao';
const uri_remote = "mongodb+srv://sodar:zlc-7895123@moonsea.8ucon.azure.mongodb.net/aqbao?retryWrites=true&w=majority";
const mongoDB = process.env.NODE_ENV === 'dev'? uri_local : uri_remote
mongoose.connect(mongoDB,{ useNewUrlParser: true, useUnifiedTopology: true} );
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error",function(err){
  console.log(err);
});
db.once('open', function() {
  console.log('数据库已连接：'+mongoDB)
});
const IAQData = require('./model/model_aq');

const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter');

const sp = new SerialPort('COM3', {
  baudRate: 9600
})

// Open errors will be emitted as an error event
sp.on('error', function(err) {
  console.log('Error: ', err.message)
  // let timer = setTimeout(retry, 1000)
})

// function retry () {
//   sp.open( function (err) {
//     console.log('串口已打开');
//     clearTimeout(timer)
//   })
// }
// PMS5003ST 每串数据起始符为 0x42 0x4d,对应字母 BM, 根据起始符将二进制数据拆分
const parser = sp.pipe(new Delimiter({ delimiter: 'BM' }))
// let iAqData = new IAQData
// 存放原始采集数据，时长超过1分钟时，计算平均值后存入minDatasets，并清除
let sensorDatasets = []
// 存放要存储的数据
// 每项为一组采集项的每分钟平均值，存放超过60条时上报数据库，并清除
let minDatasets = []
// 最后一次上报时间
let lastUpdateTime = new Date()
parser.on('data', function(d){
  // const json = JSON.stringify(d)
  const frameLength = d.readUInt16BE(0)
  // 传感器瞬时空气质量
  let sensorData = []
  // 初级初步处理(高低位合并)
  for(let i=2; i<=(frameLength+1); i=i+2){
      sensorData.push(d.readUInt16BE(i))
  }
  // 如果获取数据不等于协议规定的帧长度就返回
  if (sensorData.length !== frameLength/2) return
  // 将14,15位的温度/湿度转换真实数值
  if (sensorData[13]) sensorData[13] = sensorData[13] / 10
  if (sensorData[14]) sensorData[14] = sensorData[14] / 10
  // 去除PMS5003ST中末尾无用的3个数值
  sensorData.splice(15,3)
  // 保存数据
  sensorDatasets.push({aq: sensorData, time: new Date()})
  // 判断采样长度是否超过1分钟，若是则计算平均值
  // sensorDatasets:[
  // {time:11:00,aq:[x,y]}
  // {time:11:01,aq:[x',y']}
  // ]
  // result = {time:11:01,aq:[(x+x')/2,(y+y')/2]}
  // minDatasets.push(result)
  if (sensorDatasets[sensorDatasets.length-1].time - sensorDatasets[0].time >= (1000 * 60)){
    let minAvg = []
    // minAvg.length = sensorData.length
    for (let i = 0; i < sensorData.length; i++) {
      let x = i
      // 累加器
      const reducer = (accumulator, item) => accumulator + item.aq[x]
      // 注意: reduce的第二个参数(即acc的初始值) 0 必不可少, 因为该数组是二维数组, reduce 累加器初始值将会是一个数组元素
      const itemAvg = Math.round((sensorDatasets.reduce(reducer, 0) *100 / sensorDatasets.length))/100
      minAvg.push(itemAvg)
    }
    minDatasets.push({
      time: sensorDatasets[sensorDatasets.length-1].time,
      aq: minAvg
    })
    console.log('平均值：')
    console.log(minAvg)
    sensorDatasets = []
    if( minDatasets.length >= 5 ){
      save()
    }
  }
  // if( sensorDatasets.length >= 600 ){
  //   IAQData.insertMany(sensorDatasets, function(err){
  //     if (err) return
  //     // console.log('成功保存%s条', sensorDatasets.length);
  //     sensorDatasets = []
  //   })
  // }
  // console.log(sensorData)
})
// 对一个二维数组按列求平均值汇总
function getColAvgVals (rows) {
  let summary = []
  let colAmount = rows[0].length
  for (let i = 0; i < colAmount; i++) {
    const reducer = (acc, item) => acc + item[i]
    // 注意: reduce的第二个参数(即acc的初始值) 0 必不可少, 因为该数组是二维数组, reduce 累加器初始值将会是一个数组元素
    const itemAvg = Math.round((rows.reduce(reducer, 0) *100 / rows.length))/100
    summary.push(itemAvg)
  }
  return summary
}

function save(){
  IAQData.insertMany(minDatasets, function(err){
    if (err) return
    console.log('成功保存%s条', minDatasets.length);
    minDatasets = []
  })
}

app.listen(appport)
app.use(express.static('public'));
console.log('已启动，在端口：'+ appport)

// 中间件:响应头设置
app.use('/', (req, res, next) => {
  res.set("Access-Control-Allow-Methods", "*");
  next();
});

app.get('/api/history', function (req, res) {
  
  IAQData.find({
    time: {$gte: req.query.min, $lte: req.query.max}
  },
  'aq time' ,
  function (err, doc) {
    if (err) res.sendStatus(404)
    res.status(200).json(doc)
  })
})
