export interface FinishSaleProps {
  nftId: number,
  nftTokenId: number,
  brokerFee: number,
  price: string,
  amount: number,
  nonce: number,
  saleType: number,
  sender: string,
  brokerAddress: string,
  recipient: string,
  currencyAddress: string,
  signature: string,
}
