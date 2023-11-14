import { Injectable } from '@nestjs/common';
import config from 'config';
import { NFTMarketSolidAbi } from '../../abi';
import { FinishSaleProps } from './NFT-market-solid.interfaces';
import { RawHttpContract } from '../../core/contacts/raw-http-contract.service';


@Injectable()
export class NFTMarketSolidContract extends RawHttpContract {

  createInstance(contractAddress: string, httProviderAddress: string) {
    this.setProvider(httProviderAddress).setAddress(contractAddress).setAbi(NFTMarketSolidAbi);
    return this;
  }

  addWallet(privateKey: string) {
    this.provider.eth.accounts.wallet.add(privateKey);
    return this;
  }

  async finishSale(dto: FinishSaleProps, privateKey: string) {
    const adminAccount = this.provider.eth.accounts.privateKeyToAccount(privateKey);
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    const tx = this.contract.methods.finishSale(
      [dto.nftId, dto.nftTokenId, dto.brokerFee, dto.price, 1, dto.amount, dto.nonce, dto.saleType],
      [dto.sender, this.address, dto.brokerAddress || zeroAddress, dto.recipient, dto.currencyAddress],
      dto.signature,
    );

    const gas = await tx.estimateGas({ from: adminAccount.address });
    const gasPrice = await this.provider.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await this.provider.eth.getTransactionCount(adminAccount.address);
    const txData = {
      from: adminAccount.address,
      to: this.contract.options.address,
      data: data,
      gas,
      gasPrice,
      nonce,
      // chain: 'ropsten',
      // hardfork: 'istanbul',
    };

    return this.provider.eth.sendTransaction(txData);
  }
}
