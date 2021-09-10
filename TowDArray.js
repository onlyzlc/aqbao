module.exports = function(){
    Object.defineProperties(Array.prototype, {
        getColAvgVals: {
            writable: false,
            enumerable: false,
            configurable: true,
            value: function () {
                const validArrs = this.filter(subArr => subArr.length>0)
                if(validArrs.length === 0) return
                let summary = []
                const crossArrs = this.crossArrs()
                crossArrs.forEach(el => {
                    let sum = el.reduce((acc, item) => acc + item)
                    summary.push(Math.round(sum * 100 / el.length) / 100)
                })
                return summary
              }
        },
        crossArrs: {
            writable: false,
            enumerable: false,
            configurable: true,
            value: function () {
                let colAmount = 1
                // 找出最宽列数
                for (let i = 0; i < this.length-1; i++) {
                    colAmount = Math.max(this[i+1].length, this[i].length)
                }
                // 行列转换
                let result = []
                for (let i = 0; i < colAmount; i++) {
                    let _row = []
                    for (let j = 0; j < this.length; j++) {
                        const el = this[j][i]
                        if (el) _row.push(el)
                    }
                    result.push(_row)
                }
                return result
            }
        }
    })
}

// Array.prototype.getColAvgVals = 

// Array.prototype.crossArrs = function () {
//     let colAmount = 1
//     // 找出最宽列数
//     for (let i = 0; i < this.length-1; i++) {
//         colAmount = Math.max(this[i+1].length, this[i].length)
//     }
//     // 行列转换
//     let result = []
//     for (let i = 0; i < colAmount; i++) {
//         let _row = []
//         for (let j = 0; j < this.length; j++) {
//             const el = this[j][i]
//             if (el) _row.push(el)
//         }
//         result.push(_row)
//     }
//     return result
// }

// const testA = [
//     [2,1,7],
//     [],
//     [2,3,4,3]
// ]

// console.log(testA.getColAvgVals())