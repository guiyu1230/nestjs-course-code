import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Logger } from '@nestjs/common';
import { FiveService } from './five.service';
import { CreateFiveDto } from './dto/create-five.dto';
import { UpdateFiveDto } from './dto/update-five.dto';
import { ThirdValidationPipe } from 'src/third/third.pipe'; // 和ValidationPipe效果相同
import { AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from './five.pipe'; // file管道参数过滤
import { MyFileValidator } from './five.validate';

@Controller('five')
export class FiveController {
  constructor(private readonly fiveService: FiveService) {}

  private logger = new Logger();

  /**
   * 自定义入参校验
   * @param createFiveDto - 入参
   * @returns 返回出参
   */
  @Post()
  create(@Body(new ThirdValidationPipe()) createFiveDto: CreateFiveDto) {
    return this.fiveService.create(createFiveDto);
  }

  /**
   * 查看日志
   * @returns 查看日志 
   */
  @Get()
  findAll() {

    this.logger.debug('aaa', FiveController.name);
    this.logger.error('bbb', FiveController.name);
    this.logger.log('ccc', FiveController.name);
    this.logger.verbose('ddd', FiveController.name);
    this.logger.warn('eee', FiveController.name);

    return this.fiveService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fiveService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFiveDto: UpdateFiveDto) {
    return this.fiveService.update(+id, updateFiveDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fiveService.remove(+id);
  }

  /**
   * 单文件上传
   * @param file - 返回文件
   * @param body - 返回主体
   * @returns 返回结果
   */
  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('aaa', {
    dest: 'uploads'
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body) {
    console.log('body', body);
    console.log('file', file);
    return {
      status: 200,
      success: true
    }
  }

  /**
   * 多文件上传
   */
  @Post('uploadFiles')
  @UseInterceptors(FilesInterceptor('bbb', 3, {
    dest: 'uploads'
  }))
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body) {
    console.log('body', body);
    console.log('file', files);
    return {
      status: 200,
      success: true
    }
  }

  /**
   * 多文件文件属性指定
   */
  @Post('uploadFileFields')
  @UseInterceptors(FileFieldsInterceptor([
      { name: 'aaa', maxCount: 2 },
      { name: 'bbb', maxCount: 3 },
  ], {
      dest: 'uploads'
  }))
  uploadFileFields(@UploadedFiles() files: { aaa?: Express.Multer.File[], bbb?: Express.Multer.File[] }, @Body() body) {
      console.log('body', body);
      console.log('files', files);
  }

  /**
   * 任意文件属性指定
   */
  @Post('uploadAnyFiles')
  @UseInterceptors(AnyFilesInterceptor({
      dest: 'uploads'
  }))
  uploadAnyFiles(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body) {
      console.log('body', body);
      console.log('files', files);
  }

  /**
   * 单文件管道类型校验-FileSizeValidationPipe
   */
  @Post('fileValidatePipe')
  @UseInterceptors(FileInterceptor('aaa', {
    dest: 'uploads'
  }))
  fileValidatePipe(@UploadedFile(FileSizeValidationPipe) file: Express.Multer.File, @Body() body) {
    console.log('body', body);
    console.log('file', file);
    return {
      status: 200,
      success: true
    }
  }

  /**
   * 文件类型验证Validate
   */
  @Post('uploadFileValidate')
  @UseInterceptors(FileInterceptor('aaa', {
      dest: 'uploads'
  }))
  uploadFileValidate(@UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 1000000 }),
        new FileTypeValidator({ fileType: 'image/jpeg' }),
        // new MyFileValidator({})  //自定义校验
      ],
  })) file: Express.Multer.File, @Body() body) {
      console.log('body', body);
      console.log('file', file);
  }
}
