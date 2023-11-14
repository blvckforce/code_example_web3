import { Injectable } from '@nestjs/common';
import { AbiItem } from 'web3-utils';
import { Web3 } from '../../../constants';
import { EventType, MethodsType, TContract } from '../types';
import { IBaseContract } from './base.contract';

export interface IRawHttpContract extends IBaseContract {
  setAddress(address: string): this;

  setProvider(httpProviderAddress: string): this;

  setAbi(abi: AbiItem): this;
}

@Injectable()
export class RawHttpContract implements IRawHttpContract {
  protected _contract: TContract;

  protected web3Provider;

  protected _address: string;

  protected  abi: AbiItem;

  setAddress(address: string): this {
    this._address = address;
    this.updateContract();
    return this;
  }

  setProvider(httpProviderAddress: string) {
    this.web3Provider = new Web3(httpProviderAddress);
    return this;
  }

  setAbi(abi: AbiItem): this {
    this.abi = abi;
    this.updateContract();
    return this;
  }

  get contract(): TContract {
    if (!this._contract) {
      this._contract = new this.web3Provider.eth.Contract(this.abi, this.address);
    }
    return this._contract;
  }

  get provider(): typeof Web3 {
    return this.web3Provider;
  }

  get address(): string {
    return this._address;
  }

  get events(): EventType {
    return this.contract.events;
  }

  get methods(): MethodsType {
    return this.contract.methods;
  }

  protected updateContract() {
    if (!this.web3Provider) {
      throw new Error('Provider has not been set');
    }
    if (this._address && this.abi) {
      this._contract = new this.web3Provider.eth.Contract(this.abi, this.address);
    }
  }

  async name(): Promise<string | null> {
    try {
      return await this.methods.name().call();
    } catch {
      return null;
    }
  }

  async contractURI(): Promise<string | null> {
    try {
      return await this.methods.contractURI().call();
    } catch {
      return null;
    }
  }

  async symbol(): Promise<string | null> {
    try {
      return await this.methods.symbol()
        .call();
    } catch {
      return null;
    }
  }
}
