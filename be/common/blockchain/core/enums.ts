import { ERC721Abi } from './abi';

export enum ContractType {
  C1155 = '1155',
  C721 = '721',
}

export const ContractAbi = {
  721: ERC721Abi,
};
