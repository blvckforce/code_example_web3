import { FixedNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import cn from 'classnames';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import config from '../../../config';
import { useBalance } from '../../../hooks/useBalance';
import { useSettings } from '../../../hooks/useSettings';
import useApiData from '../../../screens/UploadDetails/useApiData';
import Convertor from '../../Convertor';
import CurrencyDropdown from '../../CurrencyDropdown';
import Dropdown from '../../Dropdown2';
import Icon from '../../Icon';
import LoaderCircle from '../../LoaderCircle';
import Price from '../../Price';
import TextInput from '../../TextInput';
import ModalRow from '../shared/modal-row';
import classes from './styles.module.scss';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { callWithTimeout, trimNotNumbersSymbols } from '../../../utils/forms';
import Modal from '../../Modal';
import orderingImage from '../../../assets/images/ordering.png';

const minimalPrice = 1 / 10 ** config.numberInputsDecimalsScale;

const MakeOfferModal = ({ visible, onClose = () => undefined, onOffer, currency }) => {

    const [isRequest, setIsRequest] = useState(false);

    const { currencyOptions = [] } = useSettings();
    const { intervalOptionsList } = useApiData();

    const defaultCurrency = useMemo(() => currencyOptions.find(({ originalName }) =>
      originalName === currency?.toLowerCase())?.id ?? currencyOptions?.[0]?.id, [currency, currencyOptions]);

    const defaultExpiration = useMemo(() => intervalOptionsList?.[0]?.key, [intervalOptionsList]);

    const { register, watch, reset, formState: { errors }, setValue, handleSubmit } = useForm({
      defaultValues: {
        amount: undefined,
        currency: defaultCurrency,
        expiration: defaultExpiration,
      },
      reValidateMode: 'onChange',
    });

    const values = watch();
    const selectedCurrency = useMemo(() => currencyOptions.find(({ id }) => id === values.currency)?.originalName,
      [currencyOptions, values.currency]);

    const { balance } = useBalance(selectedCurrency ?? currency);

    const onNumberFieldChange = useCallback((minValue) => value => trimNotNumbersSymbols(value, minValue), []);

    const walletBalance = FixedNumber.fromString(formatEther(balance ?? 0)).round(4);

    // default expiration is undefined when form was initialised
    // it comes async
    useEffect(() => {
      if (values.expiration === undefined && defaultExpiration) {
        setValue('expiration', defaultExpiration);
      }
    }, [defaultExpiration, setValue, values.expiration]);

    const close = () => {
      reset();
      onClose();
    };

    const onOfferClick = useCallback(async (val) => {
      if (val.amount) {
        try {
          setIsRequest(true);
          if (typeof onOffer === 'function') {
            const currency = currencyOptions.find((c) => c.id === val.currency).name;
            const data = await onOffer({
              amount: +val.amount,
              currency,
              endedAt: +(val.expiration * 1000) + Date.now(),
            });

            if (!data.error) callWithTimeout(() => {
              toast.success('Your offer was submitted successfully!');
              close();
            }, 0);
          }
        } catch {
        } finally {
          setIsRequest(false);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onOffer]);

    return (
      <>
        <Modal visible={visible} onClose={close} title={
          isRequest ? 'Approve your SWAPP for transfer' : 'Make an offer'
        }
               outerClassName={classes.root} footer={<Footer isRequest={isRequest} />}
        >

          {
            !isRequest && (
              <>
                <form onSubmit={handleSubmit(onOfferClick)} aria-label={'make an offer'} id={'make-offer-form'}>
                  <ModalRow className={classes.row}>
                    <div className={classes.dropdown}>
                      <CurrencyDropdown
                        label={'price'}
                        saving={isRequest}
                        name={'currency'}
                        setValue={setValue}
                        value={values.currency}
                        currencyOptions={currencyOptions}
                        defaultValueIndex={defaultCurrency}
                      />
                    </div>
                    <div className={classes.input}>
                      <TextInput
                        label={'amount'}
                        type={'number'}
                        className={classes.price}
                        withError={!!(errors.currency || errors.amount)}
                        step={minimalPrice}
                        placeholder={'Amount'}
                        value={values.amount}
                        stateProp={register('amount', {
                          required: { value: true, message: `This field is required.` },
                          min: { value: minimalPrice, message: 'Price is lower then minimum' },
                          setValueAs: onNumberFieldChange(minimalPrice),
                          max: { value: walletBalance, message: `Insufficient balance` },
                        })}
                        suffix={<Amount price={values.amount ?? 0} currency={selectedCurrency} />}
                      />
                    </div>
                  </ModalRow>
                  <ModalRow className={classes.subRow}>

                    <div className={classes.balance}>{
                      balance && (
                        <span>
                  <span>{`Balance: ${walletBalance} `}</span>
                  <span className={classes.currency}>{`${selectedCurrency ?? currency}`}</span>
                </span>
                      )}
                    </div>
                    <Errors><span>{errors.currency?.message ?? errors.amount?.message}</span></Errors>
                  </ModalRow>

                  <ModalRow className={classes.row}>

                    <div className={classes.dropdown}>
                      <Dropdown
                        label={'Offer Expiration'}
                        value={values.expiration}
                        disabled={isRequest}
                        setValue={(value) => setValue("expiration", value)}
                        options={intervalOptionsList}
                        label_index='label'
                        value_index='key'
                        defaultValueIndex={defaultExpiration}
                      />
                    </div>

                    <div className={classes.input}>
                      <TextInput
                        label={'Offer Expiration'}
                        type={'text'}
                        className={classes.price}
                        readOnly
                        value={`${new Date().getHours()}:${new Date().getMinutes()}`}
                        name={'time'}
                        prefix={<Icon name={'timer'} size={20} />}
                      />
                    </div>
                  </ModalRow>
                </form>
              </>
            )
          }
          {
            isRequest && (
              <div className={classes.center}>
                <p>To approve Swapp NFT to trade this token, you must first complete a free (plus gas) transaction. Confirm
                  it in your wallet and keep this tab open! You might notice a very large number being requested for
                  approval - this is simply the maximum amount, meaning you'll never have to do this approval again. It also
                  doesn't allow Swapp NFT to transfer that amount for you - the amount you sign in the next step is all that
                  can be traded on your behalf. Read more here.
                </p>
                <img src={orderingImage} alt='nft order' loading={'lazy'} />
              </div>
            )
          }
        </Modal>
      </>
    );
  }
;


const Amount = ({ price = 0, currency }) => (
  <span className={classes.decimals}>
    <Price price={price} currency={currency}
           convertTo='USD' convertToSymbol='$' showSymbol={true}
           showCurrency={false} />
  </span>
);

const Errors = (props) => (
  <div className={classes.errors} {...props} />
);

const Footer = ({ isRequest }) => (
  !isRequest
    ? (
      <ModalRow className={cn('row', classes.footer)}>
        <button className='button-full' type={'submit'}
                form={'make-offer-form'}
        >
          Make offer
        </button>
        <Convertor />
      </ModalRow>
    ) : (
      <ModalRow className={cn(classes.footer, classes.wait)}>
        <p className={'col'}>Waiting for blockchain confirmation...</p>
        <LoaderCircle className={classes.loader} />
      </ModalRow>
    )
);

export default MakeOfferModal;
