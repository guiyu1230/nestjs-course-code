## Nacos实现微服务配置中心和注册中心

作为注册中心就是注册服务的实例，比如 aaaService 有多个服务实例的时候，可以分别用 registerService、deregisterInstance、getAllInstances、subscribe 实现新增、删除、查询、监听。

作为配置中心就是管理配置，可以分别用 publishSingle、remove、getConfig、subscribe 实现新增（修改）、删除、查询、监听。

nacos 相比 etcd，多了内置的控制台页面，比较方便。

### 安装nacos Docker镜像
```sh
docker pull nacos/nacos-server

docker run --env=MODE=standalone  -p 8848:8848  -d nacos/nacos-server:latest

mkdir nacos-node-test
cd ./nacos-node-test
npm init -y
# 安装nacos包
npm install --save nacos
```

```js
// 注册中心 ----NacosNamingClient----
import Nacos from 'nacos'

const client = new Nacos.NacosNamingClient({
    serverList: ['127.0.0.1:8848'],
    namespace: 'public',
    logger: console
})

await client.ready()


const aaaServiceName = 'aaaService'
// 注册服务
const instance1 =  {
    ip: '127.0.0.1',
    port: 8080
}
client.registerInstance(aaaServiceName, instance1)

const instance2 =  {
    ip: '127.0.0.1',
    port: 8081
}
client.registerInstance(aaaServiceName, instance2)

// 取消注册
const instance1 = {
  ip: '127.0.0.1',
  port: 8080
}
client.deregisterInstance(aaaServiceName, instance1)

const instance2 = {
  ip: '127.0.0.1',
  port: 8081
}
client.deregisterInstance(aaaServiceName, instance2)

// 服务发现
const instances = await client.getAllInstances('aaaService');
console.log(instances)

// 监听变化
client.subscribe('aaaService', content => {
  console.log(content);
})




// 配置中心 ---NacosConfigClient-----
import { NacosConfigClient } from "nacos";

const client = new NacosConfigClient({
  serverAddr: 'localhost:8848',
})

// 新增配置
const content = await client.publishSingle('config', 'DEFAULT_GROUP', '{"host":"127.0.0.1","port":8848}')

// 删除配置
await client.remove('config', 'DEFAULT_GROUP')

// 查询配置
const config = await client.getConfig('config', 'DEFAULT_GROUP')

// 监听配置
client.subscribe(
  { dataId: 'config', group: 'DEFAULT_GROUP', },
  content => {
      console.log(content)
  }
)
```