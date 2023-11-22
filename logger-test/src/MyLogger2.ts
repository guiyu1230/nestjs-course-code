import { ConsoleLogger } from '@nestjs/common';

export class MyLogger2 extends  ConsoleLogger {
  log(message: string, context: string) {
    console.log(`[${context}]`,message)
  }

  error(message: string, context: string) {
    console.log(`[${context}]`,message)
  }

  warn(message: string, context: string) {
    console.log(`[${context}]`,message)
  }
}
