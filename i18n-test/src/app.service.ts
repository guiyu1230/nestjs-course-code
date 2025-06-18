import { Injectable, Inject } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {

  @Inject()
  i18n: I18nService;

  getHello(): string {
    return this.i18n.t('test.hello', { 
      lang: (I18nContext.current() as any).lang,
      args: {
        name: 'guang'
      }
    });
  }
}
