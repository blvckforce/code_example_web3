/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-implied-eval */
import { ApiProperty } from '@nestjs/swagger';
import * as _ from 'lodash';
import Model from 'sequelize/types/lib/model';
import sequelize, { Op } from 'sequelize';
import config from 'config';
import * as util from 'util';
import { ResponseSuccess } from '../../dto/responce.dto';
import { currencyOptions, Web3 } from '../../constants';
import { QueueProcessorMethodsNames } from '../../constants/queues/methods-names';
import { Queue } from 'bull';
import { CoinGeckoClient } from 'coingecko-api-v3';
import { NftPropertyDisplayType, NftPropertyType } from '../../../modules/nfts/enums';
import { Sequelize } from 'sequelize-typescript';

const getTypeName = (type: Function | [Function]) =>
  typeof type === 'function'
    ? type.name
    : `${_.chain(type).map('name').join().value()}Array`;

export const getResponseSuccessDto = (
  type: Function,
  isArray?: boolean,
): Function => {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const schema = new Function();

  Object.defineProperty(schema, 'name', {
    value: `ResponseSuccess${getTypeName(type)}${
      isArray === true ? 'Array' : ''
    }`,
  });

  ApiProperty({ type: String })(schema.prototype, 'message');
  ApiProperty({ type: type })(schema.prototype, 'data');
  ApiProperty({ type: Boolean })(schema.prototype, 'success');
  return schema;
};

export const getPaginationResponseDto = (
  type: Function | [Function],
): Function => {
  const schema = new Function();

  Object.defineProperty(schema, 'name', {
    value: `PaginationResponse${getTypeName(type)}`,
  });

  ApiProperty({ type: Number })(schema.prototype, 'totalItems');
  ApiProperty({ type: Number })(schema.prototype, 'totalPages');
  ApiProperty({ type: Number })(schema.prototype, 'currentPage');
  ApiProperty({ type: Number })(schema.prototype, 'pageSize');
  ApiProperty({ type: Number })(schema.prototype, 'unreadItems');
  ApiProperty({ type: type })(schema.prototype, 'rows');

  return schema;
};

export const setType = (
  options,
  type,
  processor: (type: Function | [Function]) => Function,
) => {
  switch (typeof type) {
    case 'function': {
      _.set(options, 'type', processor(type));
      break;
    }
    case 'object': {
      if (_.isArray(type)) {
        _.set(options, 'type', processor(<[Function]>type));
      } else {
        _.set(options, 'type', type);
      }
      break;
    }
    default: {
      _.set(options, 'type', type);
    }
  }
};

// export const getPublicUserInclude = (
//   includeOptions: IncludeOptions | FindAndCountOptions = {},
// ) => {
//   const { include: additionalInclude, ...options } = includeOptions;
//
//   const include: Includeable[] = [
//     {
//       model: FT(FileSchema),
//       attributes: ['path'],
//     },
//   ];
//
//   if (!_.isEmpty(additionalInclude)) {
//     const includeable = _.flattenDeep([additionalInclude]);
//     _.forEach(includeable, (x) => include.push(x));
//   }
//
//   return {
//     model: FT(require('../src/modules/user/schemas/user.schema').UserSchema),
//     attributes: [
//       'id',
//       'fullName',
//       'email',
//       'phone',
//       'notes',
//       'type',
//       'companyId',
//       'createdAt',
//     ],
//     include,
//     ...options,
//   };
// };

export const getSearchQuery = (
  searchValue: string | number,
  columnNames: string[] = ['fullName', 'email', 'phone'],
) =>
  _.map(columnNames, (columnName) => ({
    name: sequelize.where(
      sequelize.fn('LOWER', sequelize.col(columnName)),
      'LIKE',
      '%' + searchValue + '%',
    ),
  }));

export const getLikeSearch = (
  search: string | number,
  columns: string[] = [],
): Record<string, Record<symbol, string> | number>[] => {
  return _.map(columns, (column) => ({
    [`${column}`]: {
      [Op.like]: `%${search}%`,
    },
  }));
};

export const toJSON = (data) => data?.toJSON();

export const getResponse = (infoMessage) => (data) =>
  new ResponseSuccess(infoMessage, data);

export const getQueueId = (id, queueName?, jobName?) => {
  const name = _.get(config, ['queue', queueName, 'jobs', jobName], 'id');
  return _.join([id, '_', name], '');
};

export const queueId = {
  calendar(id, jobName) {
    return getQueueId(id, 'calendar', jobName);
  },
};

/**
 * This function fix sequelize types
 *
 * Problem @Example
 * class A<Q> {
 *  field: Q;
 *  constructor(pro: string) {
 *    console.log(pro);
 *    return this;
 *  }
 *}
 *
 * class B extends A<string> {
 *  stringVar = 'string';
 *}
 * class C extends A<number> {
 *  numberVar = 5;
 *}
 *
 * function G(M: typeof A) {
 *  const a = new M('123');
 *  console.log(a.field);
 *}
 *
 * G(B); - gives error
 * G(C); - gives error
 *
 * @param model
 */
export const FT = (model) => {
  type T = typeof Model;
  return <T>(<unknown>model);
};

export const encode = (string: string): string =>
  Buffer.from(string).toString('base64');
export const decode = (string: string): string =>
  Buffer.from(string, 'base64').toString('ascii');

export const encodeJson = (data: Record<any, any>): string =>
  encode(util.format('%j', data));

export const decodeJson = <T extends Record<any, any>>(string: string): T =>
  JSON.parse(decode(string));

const baseCurrency = 'ether';

export const convertCurrency = (currency) => {
  return _.find(currencyOptions, ({ address }) => address === currency)?.originalName || baseCurrency;
};

export const getCurrencyAddress = (currencyOriginalName) => {
  return _.find(currencyOptions, ({ originalName }) => originalName === currencyOriginalName)?.address || '';
};

export const toEther = (value) => Web3.utils.toWei(_.toString(value), 'ether');
export const toWei = (value) => Web3.utils.toWei(_.toString(value));

export const clearQueueJobs = async (queue: Queue, name: QueueProcessorMethodsNames, logger) => {
  const promises = _.chain(await queue.getRepeatableJobs())
    .filter(['name', name])
    .map(async ({ key }) => {
      logger.debug(`Removing job ${key}`);
      try {
        await queue.removeRepeatableByKey(key);
      } catch (e) {
        _.noop();
      }
    })
    .value();

  return Promise.all(promises);
};

export const exchangeRatesOnline = (from: string, to: string) => {
  const client = new CoinGeckoClient({
    timeout: 5000,
    autoRetry: true,
  });
  return client.simplePrice({
    vs_currencies: to,
    ids: from,
  });
};

export const cleanStr = (str: string): string => _.chain(str).replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').value();

export const prepareNftPropertiesForSave = (properties: any[] = []) => {
  return [
    ...properties.map(p => {
      // TODO: add percentage
      let displayType = NftPropertyDisplayType.string;
      if (!_.isNaN(+p.value)) {
        displayType = NftPropertyDisplayType.number;
      }

      if (p.total) {
        return {
          key: p.key,
          type: NftPropertyType.stats,
          value: p.value,
          maxValue: p.total,
          displayType: NftPropertyDisplayType.number,
        };
      }

      return {
        key: p.key,
        type: NftPropertyType.properties,
        value: p.value,
        displayType,
      };
    }),
  ];
};

export const getWhereForContactAddress = (address: string, colName = 'address') => {
  return Sequelize.where(
    Sequelize.fn('lower', Sequelize.col(colName)),
    Sequelize.fn('lower', address),
  );
};
