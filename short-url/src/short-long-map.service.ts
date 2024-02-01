import { Inject, Injectable } from '@nestjs/common';
import { UniqueCodeService } from './unique-code.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ShortLongMap } from './entities/ShortLongMap';
import { UniqueCode } from './entities/UniqueCode';

@Injectable()
export class ShortLongMapService {

  @InjectEntityManager()
  private eneityManager: EntityManager;

  @Inject(UniqueCodeService)
  private uniqueCodeService: UniqueCodeService;

  async getLongUrl(code: string) {
    const map = await this.eneityManager.findOneBy(ShortLongMap, {
      shortUrl: code
    });
    if(!map) {
      return null;
    }
    return map.longUrl;
  }

  async generate(longUrl: string) {
    let uniqueCode = await this.eneityManager.findOneBy(UniqueCode, {
      status: 0
    })

    if(!uniqueCode) {
      uniqueCode = await this.uniqueCodeService.generateCode();
    }
    const map = new ShortLongMap();
    map.shortUrl = uniqueCode.code;
    map.longUrl = longUrl;

    await this.eneityManager.insert(ShortLongMap, map);
    await this.eneityManager.update(UniqueCode, {
      id: uniqueCode.id
    }, {
      status: 1
    });
    return uniqueCode.code;
  }
}
