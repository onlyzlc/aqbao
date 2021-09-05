const express = require('express');
const app = express();
const appport = 8888;
const mongoose = require('mongoose');
// const mongoDB = 'mongodb://127.0.0.1/aqbao';
const mongoDB = "mongodb+srv://sodar:zlc-7895123@moonsea.8ucon.azure.mongodb.net/aqbao?retryWrites=true&w=majority";
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

const sp = new SerialPort('COM4', {
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

const parser = sp.pipe(new Delimiter({ delimiter: 'BM' }))
// let iAqData = new IAQData
// 存放原始采集数据，时长超过1分钟时，计算平均值后存入minDatasets，并清除
let datasets = []
// 存放要存储的数据
// 每项为一组采集项的每分钟平均值，存放超过60条时上报数据库，并清除
let minDatasets = []
// 最后一次上报时间
let lastUpdateTime = new Date()
parser.on('data', function(d){
  // const json = JSON.stringify(d)
  const frameLength = d.readUInt16BE(0)
  // 瞬时空气质量
  let iaq = []
  for(let i=2; i<=(frameLength+1); i=i+2){
      iaq.push(d.readUInt16BE(i))
  }
  // 如果获取数据不等于协议规定的帧长度就返回
  if (iaq.length !== frameLength/2) return

  if (iaq[13]) iaq[13] = iaq[13] / 10
  if (iaq[14]) iaq[14] = iaq[14] / 10
  // 删掉PMS5003ST中末尾无用的3个字节
  iaq.splice(15,3)
  // 保存数据
  datasets.push({aq: iaq, time: new Date()})
  // 判断采样长度是否超过1分钟，若是则计算平均值
  // datasets:[
  // {time:11:00,aq:[x,y]}
  // {time:11:01,aq:[x',y']}
  // ]
  // result = {time:11:01,aq:[(x+x')/2,(y+y')/2]}
  // minDatasets.push(result)
  if (datasets[datasets.length-1].time - datasets[0].time >= (1000 * 10)){
    console.log("已采样10秒，共%s条数据", datasets.length)
    console.log(datasets)
    let minAvg = []
    // minAvg.length = iaq.length
    for (let i = 0; i < iaq.length; i++) {
      const reducer = (accumulator, item) => accumulator + item.aq[i]
      minAvg.push( datasets.reduce(reducer) / datasets.length )
    }
    minDatasets.push({
      time: datasets[datasets.length-1].time,
      aq: minAvg
    })
    console.log('平均值：')
    console.log(minAvg)
    datasets = []
    if( minDatasets.length >= 5 ){
      save()
    }
  }
  // if( datasets.length >= 600 ){
  //   IAQData.insertMany(datasets, function(err){
  //     if (err) return
  //     // console.log('成功保存%s条', datasets.length);
  //     datasets = []
  //   })
  // }
  // console.log(iaq)
})

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
