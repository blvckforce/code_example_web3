// eslint-disable-next-line @typescript-eslint/no-var-requires
export const Web3 = require('web3');

export const currencyOptions = [
  {
    id: 1,
    name: 'SWAPP',
    originalName: 'swapp',
    address: '0x037B0D163c12636dBb8171AA8F387C5e30ad6c5F',
  },
  {
    id: 2,
    name: 'ETH',
    originalName: 'ether',
    address: '0x0000000000000000000000000000000000000000',
  },
  {
    id: 3,
    name: 'WETH',
    originalName: 'weth',
    address: '0xDA03EB86FCb3eB6d07dDB4Fac0adF5B542f0A084',
  },
];

export const urlRegEx = /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??[-+=&;%@.\w_]*#?[.!/\\\w]*)?)/;
