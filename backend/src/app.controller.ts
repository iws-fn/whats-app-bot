import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Sse,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { fromEvent, map, Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Readable } from 'stream';
import * as csv from 'csv-parser';
import { uniqBy, uniq } from 'lodash';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  auth(): void {
    return this.appService.auth();
  }

  @Sse('qr')
  qr(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'qr').pipe(
      map((payload) => {
        return { data: payload } as MessageEvent;
      }),
    );
  }

  @Sse('authenticated')
  authenticated(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'authenticated').pipe(
      map((_) => {
        return { data: 'ready' } as MessageEvent;
      }),
    );
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
      storage: memoryStorage(), // Store file in memory instead of disk
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(csv)$/)) {
          return callback(new Error('Only CSV files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    const stream = Readable.from(file.buffer.toString());

    const result = new Promise<any[]>((resolve, reject) => {
      const results = [];
      stream
        .pipe(csv())
        .on('data', (data) => {
          return results.push(data);
        })
        .on('end', () => {
          console.log('end')
          resolve(results);
        })
        .on('error', (error) => {
          console.log('error');
          reject(error);
        });
    });

    const data = await result;
    const onlyEkb = data.filter((item) => item['Город']?.includes('Екатеринбург'));

    const formatted = onlyEkb.map((item) => {
      return {
        phoneNumber: item['Телефон для мессенджера'] || item['Телефон для звонка'],
        fio: item['ФИО учителя'] || item['ФИО педагога'],
        io: item['ИО учителя'],
      };
    });
    console.log(formatted.map(item => item.phoneNumber));
    return uniqBy(formatted, 'phoneNumber')
  }

  @Post('send')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
      storage: memoryStorage(),
    }),
  )
  async send(
    @Body('data') dataString: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const body = JSON.parse(dataString);
    return this.appService.sendMessage(body, file);
  }
}
