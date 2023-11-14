import MakeOfferModal from '../../../../components/modals/MakeOffer';
import TransferModal from '../../../../components/modals/Transfer';
import { useAuctionMethods } from '../../../../hooks/useAuctionMethods';
import useMakeOfferMethods from '../../../../hooks/useMakeOfferMethods';
import useModalVisibility from '../../../../hooks/useModalVisibility';
import PutOnSaleControl from './OwnerContent/PutOnSaleControl';

const MakeOfferControls = ({ owner = false, item = {}, updateItem }) => {

  const { putOnSale } = useAuctionMethods();
  const { visible, switchVisible } = useModalVisibility();
  const { makeOffer } = useMakeOfferMethods(owner, item?.id);

  const makeOfferRequest = async (values) => makeOffer(item, values);

  return (
    <>
      {
        owner
          ? <PutOnSaleControl putOnSale={putOnSale} item={item} updateItem={updateItem} /> /* FIXME: put on sale */
          : <button className='button-full' onClick={switchVisible}>Make an offer</button>
      }

      {
        owner && (
          <>
            <TransferModal />
          </>
        )
      }

      <MakeOfferModal
        visible={visible}
        onClose={switchVisible}
        onOffer={makeOfferRequest}
        ownerName={item.account?.name || item.account?.address}
        name={item.name}
        currency={item.currency}
      />
    </>
  );
};

export default MakeOfferControls;
