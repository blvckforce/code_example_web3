import { toast } from 'react-hot-toast';
import { copyToClipboard, printWallatAddress } from '../../utils/helpers';
import StatusTag from '../StatusTag';
import classes from './styles.module.scss';

/***
 *
 * @param {'processing' | 'complete'} status
 * @param { string } hash
 * @return {JSX.Element}
 * @constructor
 */
const TransactionStatus = ({ status = 'processing', hash }) => {

  const onHashClick = async () => {
    await copyToClipboard(hash);
    toast.success('Copied to clipboard!')
  };

  return (
    <div className={classes.table} role={'table'}>
      <div className={classes.thead} role={'rowheader'}>
        <div role={'columnheader'}>
          Status
        </div>
        <div role={'columnheader'}>
          Transaction hash
        </div>
      </div>

      <div className={classes.tbody} role={'rowgroup'}>
        <div role={'row'}>
          <div role={'cell'}>
            <StatusTag status={'success'}>{status}</StatusTag>
          </div>
          <div role={'cell'}>
            <button className={classes.hash} onClick={onHashClick}>
              {printWallatAddress(hash)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;
