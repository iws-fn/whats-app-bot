import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client, LocalAuth } from 'whatsapp-web.js';
@Injectable()
export class AppService {
  client: Client;
  constructor(private readonly eventEmitter: EventEmitter2) {
    this.client = new Client({
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: 'C:\\Users\\iwans\\.cache\\puppeteer\\chrome\\win64-142.0.7444.61\\chrome-win64\\chrome.exe',
      },
      authStrategy: new LocalAuth(),
    });
    this.client.initialize();
  }
  auth(): void {
    if (this.client) {
      this.client.on('ready', () => {
        console.log('im ready!');
      });

      this.client.on('qr', (qr) => {
        console.log(qr);
        this.eventEmitter.emit('qr', qr);
      });

      this.client.on('authenticated', () => {
        console.log('auth!');
        this.eventEmitter.emit('authenticated');
      });
    }
  }

  async sendMessage(body: { phoneNumber: string; text: string }[]) {
    const chats = await Promise.all(
      body.map((item) => this.client.getChatById(`${item.phoneNumber}@c.us`)),
    );

    const messages = chats.map((chat, index) =>
      chat.sendMessage(body[index].text),
    );

    return Promise.all(messages);
  }
}
