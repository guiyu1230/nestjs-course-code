微服务架构的系统中少不了配置中心和注册中心。

不同服务的配置需要统一管理，并且在更新后通知所有的服务，所以需要配置中心。

微服务的节点可能动态的增加或者删除，依赖他的服务在调用之前需要知道有哪些实例可用，所以需要注册中心。

服务启动的时候注册到注册中心，并定时续租期，调用别的服务的时候，可以查一下有哪些服务实例可用，也就是服务注册、服务发现功能。

注册中心和配置中心可以用 etcd 来做，它就是一个专业做这件事的中间件，k8s 就是用的它来做的配置和服务注册中心。

我们用 docker 跑了 etcd server，它内置了命令行工具 etcdctl 可以用来和 server 交互。

常用的命令有 put、get、del、watch 等。

在 node 里可以通过 etcd3 这个包来操作 etcd server。

稍微封装一下就可以实现配置管理和服务注册、发现的功能。

在微服务架构的后端系统中，配置中心、注册中心是必不可少的组件，不管是 java、go 还是 Node.js。

### etcd命令行配置
```sh
# 初次执行命令要加上 --user、--password 的参数才可以
etcdctl get --user=root --password=guang key

# 设置环境变量就可永久登录
export ETCDCTL_USER=root
export ETCDCTL_PASSWORD=guang

# 设置
etcdctl put key value
# 获取
etcdctl get key
# 删除
etcdctl del key
# 监听字段变化
etcdctl watch key

etcdctl put /services/a xxxx
etcdctl put /services/b yyyy

etcdctl get /services/a
etcdctl get /services/b

etcdctl get --prefix /services 

etcdctl del /servcies/a
etcdctl del --prefix /services
```

### node服务方法
```js
const { Etcd3 } = require('etcd3');
const client = new Etcd3({
    hosts: 'http://localhost:2379',
    auth: {
        username: 'root',
        password: 'guang'
    }
});

// 保存配置
async function saveConfig(key, value) {
    await client.put(key).value(value);
}

// 读取配置
async function getConfig(key) {
    return await client.get(key).string();
}

// 删除配置
async function deleteConfig(key) {
    await client.delete().key(key);
}
   
// 服务注册
async function registerService(serviceName, instanceId, metadata) {
    const key = `/services/${serviceName}/${instanceId}`;
    const lease = client.lease(10);
    await lease.put(key).value(JSON.stringify(metadata));
    lease.on('lost', async () => {
        console.log('租约过期，重新注册...');
        await registerService(serviceName, instanceId, metadata);
    });
}

// 服务发现
async function discoverService(serviceName) {
    const instances = await client.getAll().prefix(`/services/${serviceName}`).strings();
    return Object.entries(instances).map(([key, value]) => JSON.parse(value));
}

// 监听服务变更
async function watchService(serviceName, callback) {
    const watcher = await client.watch().prefix(`/services/${serviceName}`).create();
    watcher.on('put', async event => {
        console.log('新的服务节点添加:', event.key.toString());
        callback(await discoverService(serviceName));
    }).on('delete', async event => {
        console.log('服务节点删除:', event.key.toString());
        callback(await discoverService(serviceName));
    });
}

// (async function main() {
//     await saveConfig('config-key', 'config-value');
//     const configValue = await getConfig('config-key');
//     console.log('Config value:', configValue);
// })();

(async function main() {
    const serviceName = 'my_service';
    
    await registerService(serviceName, 'instance_1', { host: 'localhost', port:3000 });
    await registerService(serviceName, 'instance_2', { host: 'localhost', port:3002 });

    const instances = await discoverService(serviceName);
    console.log('所有服务节点:', instances);

    watchService(serviceName, updatedInstances => {
        console.log('服务节点有变动:', updatedInstances);
    });
})();
```