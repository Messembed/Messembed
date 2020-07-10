import axios, { AxiosInstance } from 'axios';
import { PaginatedChats } from './interfaces/paginated-chats.interface';
import {
  LabadoMessengerExtSerCreds,
  LabadoMessengerUserCreds,
} from './interfaces/creds.interface';
import _ from 'lodash';
import { Chat } from './interfaces/chat.interface';
import { PersonalChat } from './interfaces/personal-chat.interface';
import { CreateChatData } from './interfaces/create-chat-data.interface';
import { CreateUserData } from './interfaces/create-user-data.interface';
import { User } from './interfaces/user.interface';

const DATE_FIELDS = ['createdAt', 'updatedAt', 'deletedAt'] as const;

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
      data: this.parseDates(data.data, DATE_FIELDS),
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

    return this.parseDates([data], DATE_FIELDS)[0];
  }

  async getPersonalChats(
    creds: LabadoMessengerUserCreds | string,
  ): Promise<PersonalChat[]> {
    const { data } = await this.axios.get<PersonalChat[]>(
      `user/personal-chats`,
      this.getAuthOptions(creds),
    );

    return this.parseDates(data, DATE_FIELDS);
  }

  async createChat(
    createData: CreateChatData,
    creds: LabadoMessengerExtSerCreds | string,
  ): Promise<Chat> {
    const { data } = await this.axios.post(
      'chats',
      createData,
      this.getAuthOptions(creds),
    );

    return this.parseDates<any, Chat>([data], DATE_FIELDS)[0];
  }

  async createUser(
    createData: CreateUserData,
    creds: LabadoMessengerExtSerCreds | string,
  ): Promise<User> {
    const { data } = await this.axios.post(
      'users',
      createData,
      this.getAuthOptions(creds),
    );

    return this.parseDates<any, User>([data], DATE_FIELDS)[0];
  }

  protected parseDates<T extends Record<string, any>, R = T>(
    data: T[],
    dateFields: readonly string[],
  ): R[] {
    data.map(obj => {
      dateFields.forEach(dateField => {
        const date = _.get(obj, dateField);
        _.set(obj, dateField, date && new Date(date));
      });
    });

    return data as R[];
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
