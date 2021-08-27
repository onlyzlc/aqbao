const express = require('express');
const app = express();
// const port = 3000;
const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1/aqbao';
mongoose.connect(mongoDB,{ useNewUrlParser: true } );
mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.on("error",console.error.bind(console,'MongoDB 连接错误:'));
const IAQData = require('./model/model_aq');

const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter');
const port = new SerialPort('COM3', {
  baudRate: 9600
})

// Open errors will be emitted as an error event
port.on('error', function(err) {
    console.log('Error: ', err.message)
  })

const parser = port.pipe(new Delimiter({ delimiter: 'BM' }))
parser.on('data', function(d){
  let iAqData = new IAQData
  // const json = JSON.stringify(d)
  const length = d.readUInt16BE(0)
  // 瞬时空气质量
  let iaq = []
  for(let i=2; i<=(length+1); i=i+2){
      iaq.push(d.readUInt16BE(i))
  }
  // iAqData.iAqData = 
  console.log(iaq)
    
})


