import cn from 'classnames';
import { cloneDeep, find, set } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import Loader from '../../../../../components/Loader';
import Modal from '../../../../../components/modals/Modal';
import { useProfile } from '../../../../../contexts/profile.context';
import useModalVisibility from '../../../../../hooks/useModalVisibility';
import { useSettings } from '../../../../../hooks/useSettings';
import styles from '../../../../UploadDetails/UploadDetails.module.sass';
import useApiData from '../../../../UploadDetails/useApiData';
import PutOnSaleForm from '../../../Components/PutOnSaleForm';
import classes from '../../../Item.module.sass';

export const PUT_ON_SALE_FORM_ID = 'put-on-sale'

const PutOnSaleControl = ({ putOnSale, updateItem, item }) => {

  const { currencyOptions = [] } = useSettings();
  const { profile } = useProfile();
  const { intervalOptionsList } = useApiData(profile?.account?.id);

  const [requesting, setRequesting] = useState(false);
  const { visible, switchVisible } = useModalVisibility();


  const dataToUpdate = useMemo(() => ({
    type: item.type ?? 'fixed',
    bid: item.bid || undefined,
    price: item.price || undefined,
    currency: currencyOptions.find(c => c.originalName === item.currency?.toLowerCase())?.id,
    start_date: +item.start_date,
    end_date: +item.end_date,
  }), [currencyOptions, item.bid, item.currency, item.end_date, item.price, item.start_date, item.type]);

//originalName
  const onPutOnSale = useCallback(async (values) => {

    try {
      setRequesting(true);

      const data = cloneDeep(item);

      set(data, "colection", data.colection?.id);
      set(data, "account", data.account?.id);
      set(data, "category", data.category?.id);
      set(data, "chain", data.chain?.id);
      set(data, "currency", find(currencyOptions, ["id", values.currency])?.name || 1);
      if (values.end_date) {
        set(data, "end_date", intervalOptionsList.find(({ id }) => +id === values.end_date)?.key || intervalOptionsList[0]?.key);
      }

      const itemSaved = await putOnSale({ ...data, ...values }, item.token_id);

      if (itemSaved) {
        updateItem(itemSaved);
        toast.success("Saved");
      }
    } catch (e) {
      const errorMessage = e?.error?.message || e?.message;
      toast.error(errorMessage);
    } finally {
      setRequesting(false);
    }
  }, [currencyOptions, intervalOptionsList, item, putOnSale, updateItem]);


  return (
    <>
      <div className={classes.inner}>
        <div className={cn(classes.spaceContainer, classes.ownerControls)}>
          <button className={cn("button", classes.button)}
                  onClick={switchVisible}
                  disabled={requesting || visible}
          >
            {
              (requesting || visible)
                ? <Loader />
                : <span>Put on Sale</span>
            }
          </button>
        </div>
      </div>
      <Modal
        visible={visible}
        onClose={switchVisible}
      >
        <Modal.Header title={'Put on sale'} />
        <Modal.Body>
          <PutOnSaleForm
            defaultValues={dataToUpdate}
            isSingleMode={true}
            saving={requesting}
            putOnSale={onPutOnSale}
            intervalOptionsList={intervalOptionsList}
          />
        </Modal.Body>
        <Modal.Footer>
          <div className={styles.foot}>
            <button form={PUT_ON_SALE_FORM_ID}
                    className={cn("button", styles.button)}
                    type='submit'
                    disabled={requesting}
            >
              {
                requesting
                  ? <Loader />
                  : <span>Put On Sale</span>
              }
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PutOnSaleControl;
