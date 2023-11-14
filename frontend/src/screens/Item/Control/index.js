import { toLower } from 'lodash-es';
import React, { useState } from "react";
import TransferModal from '../../../components/modals/Transfer';
import NAVIGATE_ROUTES from '../../../config/routes';
import { useProfile } from '../../../contexts/profile.context';
import FixedPriceControls from './bodies/FixedPriceControls';
import MakeOfferControls from './bodies/MakeOfferControls';
import SilentAuction from "./bodies/SilentAuction";
import Checkout from "./Checkout";
import { Redirect } from "react-router";
import Accept from "./Accept";
import ControlsWrapper from "./ControlsWrapper";
import PutSale from "./PutSale";
import SuccessfullyPurchased from "./SuccessfullyPurchased";
import Modal from "../../../components/Modal";
import { useGlobalState } from "../../../contexts/Global";

const Control = ({ item, updateItem, agent, isOwner }) => {

  const { account } = useGlobalState();
  const { profile: { isAuthorized = false } = {} } = useProfile();

  const [visibleModalPurchase, setVisibleModalPurchase] = useState(false);
  const [visibleModalAccept, setVisibleModalAccept] = useState(false);
  const [visibleModalSale, setVisibleModalSale] = useState(false);

  const [purchaseTransaction, setPurchaseTransaction] = useState(null);

  const [redirect, setRedirect] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");


  const accountString = account ? "(" + account.substr(-4) + ")" : "";
  const paymentOptions = [{
    id: "wallet",
    label: `wallet${accountString}`,
  }];

  const servicePercent = item?.currency?.toLowerCase() !== "swapp"
    ? +process.env.REACT_APP_SERVICE_FEE_PERCENT || 0
    : 0;

  const price = item.price || item.bid;
  const auction = item.type === "bid";
  const fixed = item.type === 'fixed';
  const onSale = item.on_sale;

  const serviceFee = +(servicePercent / 100 * price).toFixed(12);

  const changeVisibleModalAccept = () => setVisibleModalAccept(prevState => !prevState);
  const changeVisibleModalSale = () => setVisibleModalSale(prevState => !prevState);

  const closeMarketModal = () => {
    setVisibleModalPurchase(false);
    if (purchaseTransaction) {
      setRedirect(true);
    }
  };

  if (!item.id) {
    return null;
  }

  if (redirect) {
    return <Redirect to={NAVIGATE_ROUTES.PROFILE} />;
  }

  if (toLower(item?.seller) === toLower(account)) {
    return null;
  }

  return (
    <>
      <TransferModal />
      {
        onSale && fixed && (
          <ControlsWrapper>
            <FixedPriceControls item={item} setVisibleModalPurchase={setVisibleModalPurchase}
                                serviceFee={serviceFee} paymentMethod={paymentMethod}
                                servicePercent={servicePercent} isOwner={isOwner}
                                paymentOptions={paymentOptions} setPaymentMethod={setPaymentMethod}
                                updateItem={updateItem}
            />
          </ControlsWrapper>
        )
      }

      {
        onSale && auction &&
        <ControlsWrapper>
          <SilentAuction owner={isOwner} item={item}
                         serviceFee={servicePercent}
                         agentFee={agent?.fee ?? 0}
                         updateItem={updateItem}
          />
        </ControlsWrapper>
      }

      {
        !onSale && isAuthorized && (
          <ControlsWrapper>
            <MakeOfferControls owner={isOwner} onPutOnSale={changeVisibleModalSale}
                               item={item} updateItem={updateItem} />
          </ControlsWrapper>
        )
      }

      <Modal
        visible={visibleModalPurchase}
        onClose={closeMarketModal}
      >
        {!purchaseTransaction && (
          <Checkout
            serviceFee={serviceFee}
            item={item}
            updateItem={updateItem}
            onSuccess={setPurchaseTransaction}
            onClose={closeMarketModal}
          />
        )}
        {purchaseTransaction && <SuccessfullyPurchased transaction={purchaseTransaction} />}
      </Modal>

      <Modal
        visible={visibleModalAccept}
        onClose={changeVisibleModalAccept}
      >
        <Accept />
      </Modal>
      <Modal
        visible={visibleModalSale}
        onClose={changeVisibleModalSale}
      >
        <PutSale />
      </Modal>
    </>
  );
};


export default Control;
