import React, { useState } from 'react';
import { useProfile } from '../../../contexts/profile.context';
import Price from '../../Price';
import ModalRow from '../shared/modal-row';
import classes from './styles.module.scss';
import Modal from '../Modal';

const decimals = 4;

/***
 *
 * @param {{
 *   id: number,
 *   itemName: string,
 *   bidderName : string,
 *   price: number,
 *   currency: 'swapp' | 'weth' | string,
 * }} info
 * @param {() => void} onClose
 * @param { boolean } visible
 * @param {(id: number) => Promise<void>} onAccept
 * @param {(id: number) => Promise<void>} onDeny
 * @return {JSX.Element}
 * @constructor
 */

const AcceptBidModal = ({ info = {}, onClose, visible = true, onAccept, onDeny }) => {

  const { currency, price = 0, bidderName, itemName } = info ?? {};
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);

  const agentFee = !isNaN(price / 100 * (profile?.account?.artist?.team?.fee ?? 0)) &&
    (price / 100 * (profile?.account?.artist?.team?.fee ?? 0)).toFixed(decimals);

  let serviceFee = price / 100 * (process.env.REACT_APP_SERVICE_FEE_PERCENT ?? 2.5);
  serviceFee = !isNaN(serviceFee) ? serviceFee?.toFixed(decimals) : 0;


  const total = price - agentFee - serviceFee;

  const onAcceptClick = async () => {
    setLoading(true);
    await onAccept(info.id);
    setLoading(false);
  };

  const onDenyClick = async () => {
    setLoading(true);
    await onDeny(info.id);
    setLoading(false);
  };

  return (
    <Modal visible={visible} onClose={onClose} containerClassName={classes.root}>
      <Modal.Header title={'Accept bid'} />
      <Modal.Body>
        <ModalRow>
          <p>You are about to accept bid for
            {' '}
            <span className={classes.accent}>{itemName || ""}</span>
            {' '}from{' '}
            <span className={classes.accent}>{bidderName || ''}</span>
          </p>
        </ModalRow>

        <ModalRow className={classes.info}>
          <InfoRow title={'Price:'} price={price.toFixed(decimals)} currency={currency} />
          {
            serviceFee > 0 &&
            <InfoRow title={`Service fee: ${process.env.REACT_APP_SERVICE_FEE_PERCENT ?? 2.5}%`}
                     price={serviceFee}
                     currency={currency} />
          }
          {
            agentFee > 0 &&
            <InfoRow title={'Agent fee:'} price={agentFee} currency={currency} />
          }

          <InfoRow title={'You will get'} price={total.toFixed(decimals)} currency={currency} />
        </ModalRow>
      </Modal.Body>
      <Modal.Footer className={classes.footer}>
        <button className='button button-outline button-full' onClick={onDenyClick}
                disabled={loading}>Cancel
        </button>
        <button className='button button-full' onClick={onAcceptClick}
                disabled={loading}>Accept bid
        </button>
      </Modal.Footer>
    </Modal>
  );
};


const InfoRow = ({ title, price, currency }) => {
  return (
    <>
      <p><span>{title}</span>
        <span>
              <span className={classes.accent}>{price}</span>&nbsp;
          <span className={classes.accent}>{currency}</span>&nbsp;
          <span>(
                <Price price={price} currency={currency}
                       convertTo='USD' convertToSymbol='$' showSymbol={true}
                       showCurrency={false} />
            )</span>
            </span>
      </p>
    </>
  );
};

export default AcceptBidModal;


