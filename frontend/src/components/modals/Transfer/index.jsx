import classes from './styles.module.scss';
import SourceContainer from '../../SourceContainer';
import TransactionStatus from '../../TransactionStatus';
import Modal from '../Modal';
import ModalRow from '../shared/modal-row';

/***
 *
 * @param { boolean } visible
 * @param { Object } item
 * @param { string } hash
 * @param { () => void } onClose
 * @return {JSX.Element}
 * @constructor
 */
const TransferModal = ({ visible = false, onClose, item = {}, hash = '' }) => {
  return (
    <Modal visible={visible} onClose={onClose}>
      <Modal.Header title={'Transfer is completed!'} />
      <Modal.Body>
        <ModalRow className={classes.center}>
          <p>{`Wow! you just transferred ${item.name}. It should be confirmed on the blockchain shortly.`}</p>
        </ModalRow>
        <ModalRow>
          <div className={classes.source}>
            <SourceContainer url={item.image} alt={item.name} className={classes.image} />
          </div>
          <ModalRow>
            <TransactionStatus status={'complete'} hash={hash.toLowerCase()} />
          </ModalRow>
        </ModalRow>
      </Modal.Body>
    </Modal>
  );
};

export default TransferModal;
