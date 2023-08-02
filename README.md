# 手机号归属地数据

手机归属地数据csv版本
从phone.dat文件中读出最新数据，写入csv文件，2023年2月版文件为phone_address.csv,共497191条数据

数据来源：<https://github.com/lovedboy/phone> ，该库提供了csv文件下载，但数据是几年前的。

此库在原始 <https://github.com/conzi/phone> 基础上加入导出csv功能；
# 用法：
将最新的phone.dat移到目录下，运行node read_dat.js，生成最新的csv文件
