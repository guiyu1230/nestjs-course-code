import { Global, Module } from '@nestjs/common';
import * as minio from 'minio';

export const MINIO_CLIENT = 'MINIO_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: MINIO_CLIENT,
      async useFactory() {
        const client = new minio.Client({
          endPoint: 'localhost',
          port: 9000,
          useSSL: false,
          accessKey: 'S3GYVJCM1LE06O1J3RQ0',
          secretKey: 'umUwYB4pQ4LhUl9iXAOLT3RpcnMXa+ow6+qUitCw'
        })
        return client;
      }
    }
  ],
  exports: [MINIO_CLIENT]
})
export class MinioModule {}
