import fetch, { RequestInit } from 'node-fetch';

import {
  DeworkerOptions,
  IPeerKey,
  IPeerRegisterParams,
  IPeer,
  IResponse,
  IWorkerRegisterParams,
  IWorker,
} from './interface';

export class DeworkerAPI {
  private endpoint?: string;
  private apiKey?: string;

  constructor(options?: DeworkerOptions) {
    this.endpoint = options?.endpoint || 'https://api-staging.deworker.ai';
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

  async getBestRelay(relay?: string): Promise<IResponse<string>> {
    if (relay) {
      return {
        status: 'success',
        data: relay,
      };
    }
    const res = await this.request('/api/v1/peer/relay/best-one');
    return res.json() as Promise<IResponse<string>>;
  }

  async registerWworker(data: IWorkerRegisterParams): Promise<IResponse<IWorker>> {
    const res = await this.request('/api/v1/worker/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return res.json() as Promise<IResponse<IWorker>>;
  }
}

const deworkerAPIClient = new DeworkerAPI();

export default deworkerAPIClient;
