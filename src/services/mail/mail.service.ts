import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Options as MailOptions } from 'nodemailer/lib/mailer';
import { AppConfig } from '../../configs/app.config';
import { MailConfig,MailerConfig } from '../../configs/mail.config';
import { InlineCSS } from '../../shared/inline-css';

@Injectable()
export class MailBuilder implements OnModuleInit {
  #layout = '';
  #layoutParam = {
    headerUrl: '',
    headerContent: '',
    content: '',
    footer: '',
  };
  constructor() {}

  async onModuleInit() {
    this.init();
  }

  private async init() {
    const app = await AppConfig();
    this.#layoutParam.headerContent = app.name;
    this.#layoutParam.headerUrl = app.url;
    this.#layoutParam.footer = `© ${new Date().getFullYear()} ${
      app.name
    }. All rights reserved.`;
  }

  async build(
    data: { content: string },
    options: { inlineCss?: boolean } = {}
  ) {
    //let htmlContent = this.#layout({ ...this.#layoutParam, ...data });
    let htmlContent;
    if (options.inlineCss) {
      htmlContent = InlineCSS(htmlContent);
    }

    return htmlContent;
  }
}

const mailConfig = MailConfig();

@Injectable()
export class MailClient implements OnModuleInit {
  
  #from = { address: '', name: '' };
  #transport = nodemailer.createTransport(MailerConfig().mailerConfig);

  async onModuleInit() {
    this.init();
  }

  private async init() {
    const mailConfig = await MailConfig();
    this.#from.address = mailConfig.from.address;
    this.#from.name = mailConfig.from.name;
  }

  send(mailData: MailOptions) {
    const mailOptions: MailOptions = {
      from: mailData.from || this.#from,
      ...mailData,
    };
    return this.#transport.sendMail(mailOptions);
  }
}
