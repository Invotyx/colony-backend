import { HttpService, Injectable } from '@nestjs/common';

@Injectable()
export class ApiCallingService {
  constructor(private httpService: HttpService) {}

  async apiCaller(method: string, uri: string, data: any): Promise<any> {
    if (data) {
      data = JSON.stringify(data);
    }

    const baseURL = process.env.MIDDELWARE_URI;
    const headers = {
      'Content-Type': 'application/json',
      apiKey: '398741e350bfb64e70ca86758e70744691718c0d',
    };

    if (method.toUpperCase() == 'GET') {
      return await this.httpService
        .request({
          data: data,
          method: 'POST',
          baseURL: baseURL,
          url: uri,
          headers: headers,
        })
        .toPromise();
    }

    if (method.toUpperCase() == 'POST') {
      try {
        const response = await this.httpService
          .request({
            data: data,
            method: 'POST',
            baseURL: baseURL,
            url: uri,
            headers: headers,
          })
          .toPromise();

        return response;
      } catch (e) {
        console.log(e);
        throw e;
      }
    }

    if (method.toUpperCase() == 'PUT') {
      return await this.httpService
        .request({
          data: data,
          method: 'PUT',
          baseURL: baseURL,
          url: uri,
          headers: headers,
        })
        .toPromise();
    }
  }
}
