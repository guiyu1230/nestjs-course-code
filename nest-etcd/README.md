这节我们做了 Nest 和 etcd 的集成。

或者加一个 provider 创建连接，然后直接注入 etcdClient 来 put、get、del、watch。

或者再做一步，封装一个动态模块来用，用的时候再传入连接配置

和集成 Redis 的时候差不多。

注册中心和配置中心是微服务体系必不可少的组件，后面会大量用到。

## 将第三方模块自定义配置成动态模块

### 在app.module.ts全局注册第三方模块
- 全局注册第三方模块功能
- 全局使用第三方api功能
```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Etcd3 } from 'etcd3';

@Module({
  imports: [AaaModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'ETCD_CLIENT',
      useFactory() {
        const client = new Etcd3({
          hosts: 'http://localhost:2379',
          auth: {
            username: 'root',
            password: 'guang'
          }
        });
        return client;
      }
    }
  ],
})
export class AppModule {}

// app.controller.ts
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Etcd3 } from 'etcd3';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject('ETCD_CLIENT')
  private etcdClient: Etcd3;

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('put')
  async put(@Query('value') value: string) {
    await this.etcdClient.put('aaa').value(value);
    return 'done';
  }

  @Get('get')
  async get() {
    return await this.etcdClient.get('aaa').string();
  }

  @Get('del')
  async del() {
    await this.etcdClient.delete().key('aaa');
    return 'done';
  }
}
```

### 将第三方模块封装成本地模块(非动态模块)
- 在本地模块中注册第三方模块
- 本地模块封装第三方功能. 使用的是本地模块能力
```ts
// src/etcd/etcd.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { EtcdService } from './etcd.service';
import { Etcd3, IOptions } from 'etcd3';

export const ETCD_CLIENT_TOKEN = 'ETCD_CLIENT';

export const ETCD_CLIENT_OPTIONS_TOKEN = 'ETCD_CLIENT_OPTIONS';

@Module({
  providers: [
    EtcdService,
    {
      provide: 'ETCD_CLIENT',
      useFactory() {
        const client = new Etcd3({
          hosts: 'http://localhost:2379',
          auth: {
            username: 'root',
            password: 'guang'
          }
        })
        return client;
      }
    }
  ],
  exports: [
    EtcdService
  ]
})
export class EtcdModule {}


// 本地封装第三方功能
// src/etcd/etcd.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Etcd3 } from 'etcd3';

@Injectable()
export class EtcdService {

  @Inject('ETCD_CLIENT')
  private client: Etcd3;

  // 保存配置
  async saveConfig(key, value) {
    await this.client.put(key).value(value);
  }

  // 读取配置
  async getConfig(key) {
    return await this.client.get(key).string();
  }

  // 服务注册
  async registerService(serviceName, instanceId, metadata) {
    const key = `/services/${serviceName}/${instanceId}`;
    const lease = this.client.lease(10);
    await lease.put(key).value(JSON.stringify(metadata));
    lease.on('lost', async () => {
      console.log('租约续期, 重新注册...');
      await this.registerService(serviceName, instanceId, metadata);
    });
  }

  // 服务发现
  async discoverService(serviceName) {
    const instances = await this.client.getAll().prefix(`/services/${serviceName}`).strings();
    return Object.entries(instances).map(([key, value]) => JSON.parse(value));
  }

  // 监听服务变更
  async watchService(serviceName, callback) {
    const watcher = await this.client.watch().prefix(`/services/${serviceName}`).create();
    watcher.on('put', async event => {
      console.log('新的服务节点添加:', event.key.toString());
      callback(await this.discoverService(serviceName));
    }).on('delete', async event => {
      console.log('服务节点删除:', event.key.toString());
      callback(await this.discoverService(serviceName));
    })
  }
}

// 调用本地模块EtcdService能力
// src/aaa/aaa.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query } from '@nestjs/common';
import { AaaService } from './aaa.service';
import { EtcdService } from 'src/etcd/etcd.service';


@Controller('aaa')
export class AaaController {
  constructor(private readonly aaaService: AaaService) {}

  @Inject(EtcdService)
  private etcdService: EtcdService;

  @Get('save')
  async saveConfig(@Query('value') value: string) {
    await this.etcdService.saveConfig('aaa', value);
    return 'done';
  }

  @Get('get')
  async getConfig() {
    return await this.etcdService.getConfig('aaa');
  }
}
```


### 将第三方模块封装成动态模块
- 将第三方模块封装成动态模块 全局注册
- 可搭配`@nestjs/config`使用
```ts
// app.module.ts
EtcdModule.forRoot({
  hosts: 'http://localhost:2379',
  auth: {
    username: 'root',
    password: 'guang'
  }
})
EtcdModule.forRootAsync({
  async useFactory(configService: ConfigService) {
    await 111;
    return {
      hosts: configService.get('etcd_hosts'),
      auth: {
        username: configService.get('etcd_auth_username'),
        password: configService.get('etcd_auth_password')
      }
    }
  },
  inject: [ConfigService]
})

// src/etcd/etcd.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { EtcdService } from './etcd.service';
import { Etcd3, IOptions } from 'etcd3';

export const ETCD_CLIENT_TOKEN = 'ETCD_CLIENT';

export const ETCD_CLIENT_OPTIONS_TOKEN = 'ETCD_CLIENT_OPTIONS';

export interface EtcdModuleAsyncOptions {
  useFactory?: (...args: any[]) => Promise<IOptions> | IOptions;
  inject?: any[];
}

@Module({}) 
export class EtcdModule {

  static forRoot(options?: IOptions): DynamicModule {
    return {
      module: EtcdModule,
      providers: [
        EtcdService,
        {
          provide: ETCD_CLIENT_TOKEN,
          useFactory(options: IOptions) {
            const client = new Etcd3(options);
            return client;
          },
          inject: [ETCD_CLIENT_OPTIONS_TOKEN]
        },
        {
          provide: ETCD_CLIENT_OPTIONS_TOKEN,
          useValue: options
        }
      ],
      exports: [
        EtcdService
      ]
    }
  }

  static forRootAsync(options: EtcdModuleAsyncOptions): DynamicModule {
    return {
      module: EtcdModule,
      providers: [
        EtcdService,
        {
          provide: ETCD_CLIENT_TOKEN,
          useFactory(options: IOptions) {
            const client = new Etcd3(options);
            return client;
          },
          inject: [ETCD_CLIENT_OPTIONS_TOKEN]
        },
        {
          provide: ETCD_CLIENT_OPTIONS_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject || []
        }
      ],
      exports: [
        EtcdService
      ]
    }
  }
}

// 本地封装第三方功能
// src/etcd/etcd.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Etcd3 } from 'etcd3';

@Injectable()
export class EtcdService {

  @Inject('ETCD_CLIENT')
  private client: Etcd3;

  // 保存配置
  async saveConfig(key, value) {
    await this.client.put(key).value(value);
  }

  // 读取配置
  async getConfig(key) {
    return await this.client.get(key).string();
  }

  // 服务注册
  async registerService(serviceName, instanceId, metadata) {
    const key = `/services/${serviceName}/${instanceId}`;
    const lease = this.client.lease(10);
    await lease.put(key).value(JSON.stringify(metadata));
    lease.on('lost', async () => {
      console.log('租约续期, 重新注册...');
      await this.registerService(serviceName, instanceId, metadata);
    });
  }

  // 服务发现
  async discoverService(serviceName) {
    const instances = await this.client.getAll().prefix(`/services/${serviceName}`).strings();
    return Object.entries(instances).map(([key, value]) => JSON.parse(value));
  }

  // 监听服务变更
  async watchService(serviceName, callback) {
    const watcher = await this.client.watch().prefix(`/services/${serviceName}`).create();
    watcher.on('put', async event => {
      console.log('新的服务节点添加:', event.key.toString());
      callback(await this.discoverService(serviceName));
    }).on('delete', async event => {
      console.log('服务节点删除:', event.key.toString());
      callback(await this.discoverService(serviceName));
    })
  }
}
```