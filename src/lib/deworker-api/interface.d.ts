export interface DeworkerOptions {
  endpoint?: string;
  apiKey?: string;
}

export type IResponse<D> =
  | {
      status: 'success';
      data: D;
    }
  | { status: 'fail'; msg: string; code: number };

export interface IPeerKey {
  id: string;
  publicKey: string;
  privateKey: string;
}

export interface IPeerRegisterParams {
  peerId: string;
  workerId: string;
}

export interface IWorkerRegisterParams
  extends Pick<
    IWorker,
    'workerId' | 'nameForHuman' | 'nameForModel' | 'descriptionForHuman' | 'descriptionForModel' | 'skills' | 'avatar'
  > {}

export interface IWorker {
  workerId: string;
  nameForHuman: string;
  nameForModel: string;
  descriptionForHuman: string;
  descriptionForModel: string;
  skills: {
    name: string;
    nameForHuman: string;
    descriptionForHuman: string;
    descriptionForModel: string;
    tools: string[];
  }[];
  tools: {
    name: string;
    nameForHuman: string;
    descriptionForHuman: string;
    descriptionForModel: string;
    requestSchema: { type: Schema.Types.Mixed };
    responseSchema: { type: Schema.Types.Mixed };
  }[];
  avatar: string;
  joinedAt: Date;
  creator: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPeer {
  _id: string;
  peerId: string;
  address: string;
  user: string;
  workerId: string;
  user: string;
  locked: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
