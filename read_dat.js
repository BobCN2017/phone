const fs = require('fs')
const path = require('path')

const buf = fs.readFileSync(path.join(__dirname, 'phone.dat'))
const indexOffset = buf.readInt32LE(4, 4)
const size = (buf.length - indexOffset) / 9
console.log("size:",size)
const opMap = [
  '异常',
  '移动', // 1
  '联通', // 2
  '电信', // 3
  '电信虚拟运营商', // 4
  '联通虚拟运营商', // 5
  '移动虚拟运营商' // 6
]

function formatResult (phone, opType, content) {
  var arr = (content || '||||').split('|')
  return {
    phone: phone,
    op: opMap[opType],
    province: arr[0],
    city: arr[1],
    zipcode: arr[2],
    areacode: arr[3]
  }
}

function find (phoneOrigin) {
  var phone = parseInt((phoneOrigin + '').substr(0, 7))
  var left = 0
  var right = size - 1
  while (left <= right) {
    var pos = ((right + left) / 2) | 0
    var index = buf.readInt32LE(indexOffset + pos * 9, 4)
    if (index < phone) {
      if (left === pos) {
        return formatResult(phoneOrigin, 0, null)
      }
      left = pos
    } else if (index > phone) {
      if (right === pos) {
        return formatResult(phoneOrigin, 0, null)
      }
      right = pos
    } else {
      // match 
      var infoOffset = buf.readInt32LE(indexOffset + pos * 9 + 4, 4)
      var phoneType = buf.readInt8(indexOffset + pos * 9 + 8, 1)
      var content = buf.slice(infoOffset, infoOffset + 100)
      var endIdx = 0
      while (endIdx < 100 && content[endIdx] !== '\n') {
        endIdx++
      }
      return formatResult(phoneOrigin, phoneType, content.toString('utf8', 0, endIdx))
    }
  }
}

module.exports = find

// 创建输出CSV文件
const outputFilePath = path.join(__dirname, 'phone_address.csv')

// 写入CSV文件头
fs.writeFileSync(outputFilePath, 'Phone,Operator,Province,City,ZipCode,AreaCode\n')

// 遍历buf并将结果写入CSV文件
for (let i = 0; i < size; i++) {
  const phoneNumber = buf.readInt32LE(indexOffset + i * 9, 4)
  const result = find(phoneNumber)
  const csvRow = `${result.phone},${result.op},${result.province},${result.city},${result.zipcode},${result.areacode}\n`
  fs.appendFileSync(outputFilePath, csvRow)
}

console.log('CSV file created:', outputFilePath)