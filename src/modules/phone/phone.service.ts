import { HttpException, Injectable } from '@nestjs/common';
import initMB, { MessageBird } from 'messagebird';
import { env } from 'process';
import { ApiCallingService } from 'src/services/api-calling/api-calling.service';

@Injectable()
export class PhoneService {
  
  //private mb: MessageBird;
  constructor(
    private readonly apiCaller:ApiCallingService,
  ) {
    //this.mb = initMB(env.MESSAGEBIRD_KEY);
  }

  public async searchPhoneNumbers() {

    const data: any = {
      features: 'sms',
      type: 'mobile',
      number: 319,
      search_pattern: 'start',
      limit: 25
    };
    const country = 'US';
    //
    try {
      const numbers =await this.apiCaller.apiCaller('GET', 'https://numbers.messagebird.com/v1/available-phone-numbers/' + country + this.serialize(data), { key: 'AccessKey', value: env.MESSAGEBIRD_KEY });
      return numbers;
    } catch (e) {
      throw e;
    }


  }

  private serialize( obj ) {
    let str = '?' + Object.keys(obj).reduce(function(a, k){
        a.push(k + '=' + encodeURIComponent(obj[k]));
        return a;
    }, []).join('&');
    return str;
}

}
