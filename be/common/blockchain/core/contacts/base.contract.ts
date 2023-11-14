import { provider as Provider } from 'web3-core';
import { AbiItem } from 'web3-utils';
import { Web3 } from '../../../constants';
import { EventType, MethodsType, TContract } from '../types';

export interface IBaseContract {
  readonly contract: TContract;
  readonly address: string;
  readonly provider: typeof Web3;
  readonly events: EventType;
  readonly methods: MethodsType;
  name():Promise<string | null>;
  contractURI():Promise<string | null>;
  symbol():Promise<string | null>;
}

// export class BaseContract implements IBaseContract {
//   private readonly _contract: TContract;
//
//   private readonly web3Provider: typeof Web3;
//
//   private _address: string;
//
//   constructor(provider: Provider, contractAddress: string, abi: AbiItem[] | AbiItem) {
//     this.web3Provider = new Web3(provider);
//     this._contract = new this.web3Provider.eth.Contract(abi, contractAddress);
//     this._address = contractAddress;
//   }
//
//   get contract(): TContract {
//     return this._contract;
//   }
//
//   get address(): string {
//     return this._address;
//   }
//
//   get provider(): typeof Web3 {
//     return this.web3Provider;
//   }
//
//   get events(): EventType {
//     return this.contract.events;
//   }
//
//   get methods(): MethodsType {
//     return this.contract.methods;
//   }
//
//   async name(): Promise<string | null> {
//     try {
//       return await this.methods.name().call();
//     } catch {
//       return null;
//     }
//   }
//
//   async contractURI(): Promise<string | null> {
//     try {
//       return await this.methods.contractURI().call();
//     } catch {
//       return null;
//     }
//   }
//
//   async symbol(): Promise<string | null> {
//     try {
//       return await this.methods.symbol().call();
//     } catch {
//       return null;
//     }
//   }
// }
