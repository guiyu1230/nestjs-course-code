import Nacos from 'nacos';

const client = new Nacos.NacosNamingClient({
  serverList: ['127.0.0.1:8848'],
  namespace: 'public',
  logger: console
})

client.ready()

client.subscribe('aaaService', content => {
  console.log(content);
})