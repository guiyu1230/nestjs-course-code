import { repl } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const replService = await repl(AppModule);
  replService.setupHistory(".nestjs_repl_history", err => {
    if(err) {
      console.error(err);
    }
  })
}

bootstrap();
