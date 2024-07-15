import { BadRequestException, Controller, Get, Inject, Query } from '@nestjs/common';
import * as Minio from 'minio';

@Controller('minio')
export class MinioController {

  @Inject('MINIO_CLIENT')
  private minioClient: Minio.Client;

  @Get('presignedUrl')
  presignedPutObject(@Query('name') name: string) {
    if(!name) {
      throw new BadRequestException('文件名必传')
    }
    return this.minioClient.presignedPutObject('meeting-room-booking-system', name, 3600)
  }
}
