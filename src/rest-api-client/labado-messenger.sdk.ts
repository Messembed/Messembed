import axios, { AxiosInstance } from 'axios';
import { PaginatedChats } from './interfaces/paginated-chats.interface';
import {
  LabadoMessengerExtSerCreds,
  LabadoMessengerUserCreds,
} from './interfaces/creds.interface';
import _ from 'lodash';
import { Chat } from './interfaces/chat.interface';
import { PersonalChat } from './interfaces/personal-chat.interface';

export class LabadoMessengerSdk {
  protected axios: AxiosInstance;

  constructor(baseURL: string) {
    this.axios = axios.create({ baseURL });
  }

  async getAllChats(
    creds: LabadoMessengerExtSerCreds | string,
  ): Promise<PaginatedChats> {
    const { data } = await this.axios.get<PaginatedChats>(
      'chats',
      this.getAuthOptions(creds),
    );

    const result = {
      ...data,
      data: this.parseDates(data.data, ['createdAt', 'updatedAt', 'deletedAt']),
    };

    return result;
  }

  async getChat(
    chatId: number | string,
    creds: LabadoMessengerExtSerCreds | string,
  ): Promise<Chat> {
    const { data } = await this.axios.get(
      `chats/${chatId}`,
      this.getAuthOptions(creds),
    );

    return this.parseDates([data], ['createdAt', 'updatedAt', 'deletedAt'])[0];
  }

  async getPersonalChats(
    creds: LabadoMessengerUserCreds | string,
  ): Promise<PersonalChat[]> {
    const { data } = await this.axios.get<PersonalChat[]>(
      `user/personal-chats`,
      this.getAuthOptions(creds),
    );

    return this.parseDates(data, ['createdAt', 'updatedAt', 'deletedAt']);
  }

  protected parseDates<T extends Record<string, any>>(
    data: T[],
    dateFields: string[],
  ): T[] {
    data.map(obj => {
      dateFields.forEach(dateField => {
        const date = _.get(obj, dateField);
        _.set(obj, dateField, date && new Date(date));
      });
    });

    return data;
  }

  protected getAuthOptions(
    creds: LabadoMessengerUserCreds | LabadoMessengerExtSerCreds | string,
  ): { auth?: any; headers: any } {
    const authOptions = {
      auth: undefined,
      headers: {} as Record<string, string>,
    };

    if (typeof creds === 'string') {
      authOptions.headers.authorization = creds;
    } else if ('password' in creds) {
      authOptions.auth = {
        username: 'external-service',
        password: creds.password,
      };
    } else {
      authOptions.headers.authorization = `Bearer ${creds.accessToken}`;
    }

    return authOptions;
  }
}
