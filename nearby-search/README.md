我们经常会使用基于位置的功能，比如附近的充电宝、酒店，打车，附近的人等功能。

这些都是基于 redis 实现的，因为 redis 有 geo 的数据结构，可以方便的计算两点的距离，计算某个半径内的点。

前端部分使用地图的 sdk 分别在搜出的点处绘制 marker 就好了。

geo 的底层数据结构是 zset，所以可以使用 zset 的命令。

我们在 Nest 里封装了 geoadd、geopos、zrange、georadius 等 redis 命令。实现了添加点，搜索附近的点的功能。

以后再用这类附近的 xxx 功能，你是否会想起 redis 呢？

```js
// 添加位置信息
// geoadd loc 13.361389 38.115556 "guangguang" 15.087269 37.502669 "dongdong" 
async geoAdd(key: string, posName: string, posLoc: [number, number]) {
    return await this.redisClient.geoAdd(key, {
        longitude: posLoc[0],
        latitude: posLoc[1],
        member: posName
    })
}

// 获取key为positions name为guang的经纬度
// geopos positions guang
async geoPos(key: string, posName: string) {
    const res = await this.redisClient.geoPos(key, posName);

    return {
        name: posName,
        longitude: res[0].longitude,
        latitude: res[0].latitude
    }
}

// 获取key为positions所有人的经纬度信息
// 1. this.redisClient.zRange('positions', 0, -1);
// zRange positions 0 -1
// 获取所有人的name集合
// 2. 循环 geopos positions <name>
// geopos positions dong
// 获取所有人的经纬度信息
async geoList(key: string) {
    const positions = await this.redisClient.zRange(key, 0, -1);

    const list = [];
    for(let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const res = await this.geoPos(key, pos);
        list.push(res);
    }
    return list;
}

// 搜索radius范围内的任务信息
// 1. 使用this.redisClient.geoRadius获取所有的name集合
// georadius positions 15 37 5000 km
// 2. 循环 geopos positions <name>获取所有人的经纬信息
async geoSearch(key: string, pos: [number, number], radius: number) {
    const positions = await this.redisClient.geoRadius(key, {
        longitude: pos[0],
        latitude: pos[1]
    }, radius, 'km');

    const list = [];
    for(let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const res = await this.geoPos(key, pos);
        list.push(res);
    }
    return list;
}
```

## redis 是 key-value 的数据库，value 有很多种类型：

- `string`： 可以存数字、字符串，比如存验证码就是这种类型
- `hash`：存一个 map 的结构，比如文章的点赞数、收藏数、阅读量，就可以用 hash 存
- `set`：存去重后的集合数据，支持交集、并集等计算，常用来实现关注关系，比如可以用交集取出互相关注的用户
- `zset`：排序的集合，可以指定一个分数，按照分数排序。我们每天看的文章热榜、微博热榜等各种排行榜，都是 zset 做的
- `list`：存列表数据
- `geo`：存地理位置，支持地理位置之间的距离计算、按照半径搜索附近的位置

其中，geo 的数据结构，就可以用来实现附近的人等功能。

## 总结redis GEO相关命令
![image](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5e010dc001c742ee998f14e3b4f988f3~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=1096&h=438&s=111789&e=png&b=fefefe)

- `geoadd`: 添加地理位置坐标
- `geopos`: 获取地理位置坐标
- `geodist`: 计算两个位置之间的距离
- `georadius`: 根据用户给定的经纬度坐标获取指定范围内的地理位置集合
- `georadiusbymember`: 根据存储在位置集合里面的某个地点获取指定范围内的地理位置集合
- `geohash`: 返回一个或多个位置对象的 geohash 值

```sh
# 添加地理位置坐标
geoadd positions 13.361389 38.115556 "guangguang" 15.087269 37.502669 "dongdong"

# 获取地理位置坐标
# {longitude: 15.087269, latitude: 37.502669,}
geopos positions 'dongdong'

# 获取key为positions的所有子集name
zRange positions 0 -1

# 根据用户给定的经纬度坐标获取指定范围内的地理位置集合name
georadius positions 15 37 5000 km
```

```js
// 添加地理位置坐标
this.redisClient.geoAdd('positions', {
    longitude: 13.361389,
    latitude: 38.115556,
    member: 'guangguang'
})

// 获取地理位置坐标
// {longitude: 15.087269, latitude: 37.502669,}
const res = await this.redisClient.geoPos('positions', 'dongdong');

// 获取key为positions的所有子集name
const positions = await this.redisClient.zRange('positions', 0, -1);

// 根据用户给定的经纬度坐标获取指定范围内的地理位置集合name
const positions = await this.redisClient.geoRadius('positions', {
    longitude: 15,
    latitude: 37
}, 5000, 'km');
```
