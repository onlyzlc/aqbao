const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter')
const port = new SerialPort('COM3', {
  baudRate: 9600
})

// Open errors will be emitted as an error event
port.on('error', function(err) {
    console.log('Error: ', err.message)
  })

const parser = port.pipe(new Delimiter({ delimiter: 'BM' }))
parser.on('data', function(d){
    // const json = JSON.stringify(d)
    const length = d.readUInt16BE(0)
    let arr = []
    for(let i=2; i<=(length+1); i=i+2){
        arr.push(d.readUInt16BE(i))
    }
    console.log(arr)
})


