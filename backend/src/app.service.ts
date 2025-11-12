import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as puppeteer from 'puppeteer';

@Injectable()
export class AppService {
  client: Client;
  constructor(private readonly eventEmitter: EventEmitter2) {
    this.client = new Client({
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: puppeteer.executablePath(),
      },
      authStrategy: new LocalAuth(),
    });
    
    // Set up event listeners immediately
    this.client.on('ready', () => {
      console.log('✅ WhatsApp client is ready!');
    });

    this.client.on('qr', (qr) => {
      console.log('📱 QR Code received:');
      console.log(qr);
      this.eventEmitter.emit('qr', qr);
    });

    this.client.on('authenticated', () => {
      console.log('✅ WhatsApp authenticated!');
      this.eventEmitter.emit('authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ Authentication failed:', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('🔌 WhatsApp disconnected:', reason);
    });

    // Initialize the client
    console.log('🚀 Initializing WhatsApp client...');
    this.client.initialize();
  }
  
  auth(): void {
    // This method is now just for compatibility
    // Event listeners are already set up in constructor
  }

  async sendMessage(
    body: { phoneNumber: string; text: string }[],
    file?: Express.Multer.File,
  ) {
    const chats = await Promise.all(
      body.map((item) => this.client.getChatById(`${item.phoneNumber}@c.us`)),
    );

    // Если есть файл, создаем MessageMedia из него
    let media: MessageMedia | undefined;
    if (file) {
      media = new MessageMedia(
        file.mimetype,
        file.buffer.toString('base64'),
        file.originalname,
      );
    }

    const messages = chats.map((chat, index) => {
      if (media) {
        // Отправляем файл с текстом в caption
        return chat.sendMessage(media, { caption: body[index].text });
      } else {
        // Только текст
        return chat.sendMessage(body[index].text);
      }
    });

    return Promise.all(messages);
  }
}
