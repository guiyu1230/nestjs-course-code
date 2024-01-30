这节我们学习了定时任务，用到 @nestjs/scheduler 这个包。

主要有 cron、timeout、interval 这 3 种任务。

其中 cron 是依赖 cron 包实现的，而后两种则是对原生 api 的封装。

我们学习了 cron 表达式，还是挺复杂的，当然，你也可以直接用 CronExpression 的一些常量。

此外，你还可以注入 SchedulerRegistery 来对定时任务做增删改查。

定时任务里可以注入 service，来定时执行一些逻辑，在特定业务场景下是很有用的。

### cron表达式
![image](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a3625307fea4b7b8da80b2872ed4a65~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=912&h=232&e=png&b=202020)

cron 表达式有这 7 个字段：

![image](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f92a440ff82e4d34971c5216ae91afd7~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=1390&h=726&e=png&b=fdfdfd)

其中年是可选的，所以一般都是 6 个。

每个字段都可以写 * ，比如秒写 * 就代表每秒都会触发，日期写 * 就代表每天都会触发。

但当你指定了具体的日期的时候，星期得写 ？

比如表达式是

```
7 12 13 10 * ?
```

就是每月 10 号的 13:12:07 执行这个定时任务。

但这时候你不知道是星期几，如果写 * 代表不管哪天都会执行，这时候就要写 ?，代表忽略星期。

同样，你指定了星期的时候，日期也可能和它冲突，这时候也要指定 ?

但只有日期和星期可以指定 ？，因为只有这俩字段是相互影响的。

除了指定一个值外，还可以指定范围，比如分钟指定 20-30，

```
0 20-30 * * * *
```

这个表达式就是从 20 到 30 的每分钟每个第 0 秒都会执行。

当然也可以指定枚举值，通过 , 分隔

比如每小时的第 5 和 第 10 分钟的第 0 秒执行定时任务：
```
0 5,10 * * * *
```

而且还可以通过 / 指定每隔多少时间触发一次。

比如从第 5 分钟开始，每隔 10 分钟触发一次：
```
0 5/10 * * * *
```
此外，日期和星期还支持几个特殊字符：
![image](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/73a4c83260754c39b9b2e0112a21600b~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=1042&h=568&e=png&b=fdfcfc)

L 是 last，L 用在星期的位置就是星期六：
```
* * * ? * L
```

L 用在日期的位置就是每月最后一天：
```
* * * L * ?
```

W 代表工作日 workday，只能用在日期位置，代表从周一到周五
```
* * * W * ?
```

当你指定 2W 的时候，代表每月的第而个工作日：
```
* * * 2W * ?
```

LW 可以在指定日期时连用，代表每月最后一个工作日：
```
* * * LW * ?
```

星期的位置还可以用 4#3 表示每个月第 3 周的星期三：
```
* * * ? * 4#3
```

同理，每个月的第二周的星期天就是这样：
```
* * * ? * 1#2
```

此外，星期几除了可以用从 1（星期天） 到 7（星期六） 的数字外，还可以用单词的前三个字母：SUN, MON, TUE, WED, THU, FRI, SAT

我们来看几个例子：

每隔 5 秒执行一次:
```
*/5 * * * * ?
```

每天 5-15 点整点触发：
```
0 0 5-15 * * ?  
```

每天 10 点、14 点、16 点触发：
```
0 0 10,14,16 * * ?   
```

每个星期三中午12点：
```
0 0 12 ? * WED
```

每周二、四、六下午五点：
```
0 0 17 ? * TUES,THUR,SAT
```

每月最后一天 22 点执行一次：
```
0 0 22 L * ?
```

2023 年至 2025 年的每月的最后一个星期五上午 9:30 触发
```
0 30 9 ? * 6L 2023-2025 
```

每月的第三个星期五上午 10:15 触发：
```
0 15 10 ? * 6#3 
```

## 创建定时任务
```ts
// task.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { AaaService } from './aaa/aaa.service';

@Injectable()
export class TaskService {

  @Inject(AaaService)
  private aaaService: AaaService;

  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: 'task1',
    timeZone: 'Asia/shanghai'
  })
  handleCron() {
    const a = this.aaaService.findAll();
    console.log('task execute', a);
  }

  @Interval('task2', 500)
  task2() {
    console.log('task2');
  }

  @Timeout('task3', 3000)
  task3() {
    console.log('task3');
  }
}
```

## 管理定时任务，也就是对它做增删改
- 我们可以注入` SchedulerRegistry `来动态增删定时任务。
```ts
import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskService } from './task.service';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { AaaModule } from './aaa/aaa.module';
import { CronJob, CronTime } from 'cron';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AaaModule
  ],
  controllers: [AppController],
  providers: [AppService, TaskService],
})
export class AppModule implements OnApplicationBootstrap{

  @Inject(SchedulerRegistry)
  private schedulerRegistry: SchedulerRegistry;
  // 在onApplicationBootstrap生命周期管理
  onApplicationBootstrap() {
    // 查询定时任务
    const crons = this.schedulerRegistry.getCronJobs();
    // 关闭定时任务
    crons.forEach((item, key) => {
      console.log(item, key);
      
      item.stop();
      this.schedulerRegistry.deleteCronJob(key);
    })
    // 管理interval任务
    const intervals = this.schedulerRegistry.getIntervals();
    intervals.forEach(item => {
      const interval = this.schedulerRegistry.getInterval(item);
      clearInterval(interval);

      this.schedulerRegistry.deleteInterval(item);
    })
    // 管理timeout任务
    const timeouts = this.schedulerRegistry.getTimeouts();
    timeouts.forEach(item => {
      const timeout = this.schedulerRegistry.getTimeout(item);
      clearTimeout(timeout);

      this.schedulerRegistry.deleteTimeout(item);
    })

    console.log(this.schedulerRegistry.getCronJobs());
    console.log(this.schedulerRegistry.getIntervals());
    console.log(this.schedulerRegistry.getTimeouts());
    // 新建定时任务. 并加入任务
    const job: any = new CronJob(`0/5 * * * * *`, () => {
      console.log('cron job');
    });
  
    this.schedulerRegistry.addCronJob('job1', job);
    job.start();
    // 新建interval任务. 并加入任务
    const interval = setInterval(() => {
      console.log('interval job')
    }, 3000)
    this.schedulerRegistry.addInterval('job2', interval);
    // 新建timeout任务. 并加入任务
    const timeout = setTimeout(() => {
      console.log('timeout job');
    }, 5000);
    this.schedulerRegistry.addTimeout('job3', timeout);
  }
}
```
