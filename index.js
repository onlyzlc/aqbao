const express = require('express');
const app = express();
// const port = 3000;
const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1/aqbao';
mongoose.connect(mongoDB,{ useNewUrlParser: true } );
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error",function(err){
  console.log(err);
});
const IAQData = require('./model/model_aq');

const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter');

const port = new SerialPort('COM3', {
  baudRate: 9600
})

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message)
  // let timer = setTimeout(retry, 1000)
})

// function retry () {
//   port.open( function (err) {
//     console.log('串口已打开');
//     clearTimeout(timer)
//   })
// }

const parser = port.pipe(new Delimiter({ delimiter: 'BM' }))
parser.on('data', function(d){
  let iAqData = new IAQData
  // const json = JSON.stringify(d)
  const frameLength = d.readUInt16BE(0)
  // 瞬时空气质量
  let iaq = []
  for(let i=2; i<=(frameLength+1); i=i+2){
      iaq.push(d.readUInt16BE(i))
  }
  // 如果获取数据不等于协议规定的帧长度
  if (iaq.length !== frameLength/2) return
  if (iaq[13]) iaq[13] = iaq[13] / 10
  if (iaq[14]) iaq[14] = iaq[14] / 10
  // 保存数据
  iAqData.aq = iaq
  iAqData.time = new Date()
  iAqData.save(function(err){
    if (err) return
    console.log('保存成功');
  })
  console.log(iaq)
})

app.listen(3000)

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