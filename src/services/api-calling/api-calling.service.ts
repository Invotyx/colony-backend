import { HttpException, HttpService, Injectable } from '@nestjs/common';

@Injectable()
export class ApiCallingService {
  constructor() {
    //
  }
  private httpService = new HttpService();
  async apiCaller(
    method: string,
    uri: string,
    apiKey: { key: string; value: string },
    data?: any,
  ): Promise<any> {
    if (data) {
      data = JSON.stringify(data);
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: apiKey.key + ' ' + apiKey.value,
    };

    if (method.toUpperCase() == 'GET') {
      try {
        const res = await this.httpService
          .request({
            data: data,
            method: 'GET',
            url: uri,
            headers: headers,
          })
          .toPromise();
        return res.data;
      } catch (e) {
        throw new HttpException(await e.response.data, await e.response.status);
      }
    }

    if (method.toUpperCase() == 'POST') {
      try {
        const response = await this.httpService
          .request({
            data: data,
            method: 'POST',
            url: uri,
            headers: headers,
          })
          .toPromise();

        return response.data;
      } catch (e) {
        throw new HttpException(await e.response.data, await e.response.status);
      }
    }

    if (method.toUpperCase() == 'PUT') {
      try {
        const response = await this.httpService
          .request({
            data: data,
            method: 'PUT',
            url: uri,
            headers: headers,
          })
          .toPromise();
        return response.data;
      } catch (e) {
        throw new HttpException(await e.response.data, await e.response.status);
      }
    }

    if (method.toUpperCase() == 'DELETE') {
      try {
        const response = await this.httpService
          .request({
            data: data,
            method: 'DELETE',
            url: uri,
            headers: headers,
          })
          .toPromise();
        return response.data;
      } catch (e) {
        throw new HttpException(await e.response.data, await e.response.status);
      }
    }
  }
}
