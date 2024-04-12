import fetch, { RequestInit } from 'node-fetch';

import {
  DeworkerOptions,
  IPeerKey,
  IPeerRegisterParams,
  IPeer,
  IResponse,
  ISubworkerRegisterParams,
  ISubworker,
} from './interface';

export class DeworkerAPI {
  private endpoint?: string;
  private apiKey?: string;

  constructor(options?: DeworkerOptions) {
    this.endpoint = options?.endpoint || 'http://localhost:6000';
    this.apiKey = options?.apiKey;
  }

  private async request(input: RequestInfo, init?: RequestInit) {
    const opt = Object.assign({}, init);
    opt.headers = {
      'Content-Type': 'application/json',
      ...init?.headers,
      Authorization: `Bearer ${this.apiKey}`,
    };

    const url = `${this.endpoint}${input}`;
    return fetch(url, opt as RequestInit);
  }

  async generateKey(): Promise<IResponse<IPeerKey>> {
    const res = await this.request('/api/v1/peer/key', {
      method: 'POST',
    });
    return res.json() as Promise<IResponse<IPeerKey>>;
  }

  async registerPeer(data: IPeerRegisterParams): Promise<IResponse<IPeer>> {
    const res = await this.request('/api/v1/peer/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json() as Promise<IResponse<IPeer>>;
  }

  async getBestRelay(): Promise<IResponse<string>> {
    const res = await this.request('/api/v1/peer/relay/best-one', );
    return res.json() as Promise<IResponse<string>>;
  }

  async registerSubworker(data: ISubworkerRegisterParams): Promise<IResponse<ISubworker>> {
    const res = await this.request('/api/v1/subworker/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return res.json() as Promise<IResponse<ISubworker>>;
  }
}

const deworkerAPIClient = new DeworkerAPI();

export default deworkerAPIClient;
