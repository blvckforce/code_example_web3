import { SES } from 'aws-sdk';
import config from '../../config';

export const mailerTransport = () => {
  const ses = new SES(config.email.ses);
  return {
    SES: {
      ses,
      aws: ses,
    },
  };
};
