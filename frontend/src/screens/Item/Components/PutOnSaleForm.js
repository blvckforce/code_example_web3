import moment from "moment";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from 'react-hook-form';
import CurrencyDropdown from '../../../components/CurrencyDropdown';
import config from '../../../config';
import { useSettings } from "../../../hooks/useSettings";
import { isValidDay, setNumberValueWithMinvalue } from "../../../utils/forms";
import { MinPriceValue } from '../../UploadDetails/Components/Form';
import styles from "../../UploadDetails/UploadDetails.module.sass";
import Dropdown from "../../../components/Dropdown2";
import TextInput from "../../../components/TextInput";
import cn from "classnames";
import { PUT_ON_SALE_FORM_ID } from '../Control/bodies/OwnerContent/PutOnSaleControl';

const minimalPrice = 1 / 10 ** config.numberInputsDecimalsScale;


export const ITEM_TYPES = {
  FIXED: 'fixed',
  BID: 'bid',
};

const bidPriceFields = ['start_date', 'end_date', ITEM_TYPES.BID];
const fixedPriceFields = ['price'];

const PutOnSaleForm = ({
                         isSingleMode, saving, intervalOptionsList,
                         defaultValues = {}, putOnSale,
                       }) => {
  const { currencyOptions = [] } = useSettings();


  const defaultCurrency = useMemo(() => currencyOptions?.[0]?.id, [currencyOptions]);
  const defaultEndDate = useMemo(() => intervalOptionsList?.[0]?.key, [intervalOptionsList]);

  const { formState: { errors }, setError, clearErrors, watch, handleSubmit, setValue, register } = useForm({
    defaultValues: {
      type: defaultValues.type ?? ITEM_TYPES.FIXED,
      start_date: defaultValues.start_date ?? undefined,
      bid: defaultValues.bid ?? undefined,
      end_date: defaultValues.end_date ?? defaultEndDate,
      currency: defaultValues.currency ?? defaultCurrency,
    },
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  const values = watch();

  // reset end date dropdown and currency dropdown to prevent unexpected behavior
  useEffect(() => {
    const resetCurrency = () => setValue('currency', defaultCurrency);
    const resetEndDate = () => setValue('end_date', defaultEndDate);

    if (values.type === ITEM_TYPES.BID) {
      resetCurrency();
      resetEndDate();
    }

    if (values.type === ITEM_TYPES.FIXED) {
      resetCurrency();
      resetEndDate();
    }

  }, [defaultCurrency, defaultEndDate, setValue, values.type]);


  const prePutOnSale = useCallback(async (values) => {

      const val = { ...values };
      const type = val.type;

      if (type === ITEM_TYPES.BID) {
        // date validation
        if (val.start_date <= Date.now()) {
          setError('start_date', { message: 'STARTING DATE is Invalid' });
          return;
        } else {
          clearErrors('start_date');
        }

        // clean from other values
        fixedPriceFields.forEach((field) => {
          delete val[field];
        });
      }

      if (type === ITEM_TYPES.FIXED) {

        // clean from other values
        bidPriceFields.forEach((field) => {
          delete val[field];
        });
      }

      await putOnSale(val);

    }, [clearErrors, putOnSale, setError],
  );

  const onDateChange = e => {
    clearErrors('start_date');
    setValue('start_date', +e.target.value);
  };

  return (
    <>
      <form onSubmit={handleSubmit(prePutOnSale)} id={PUT_ON_SALE_FORM_ID}>
        <div className={styles.options}>
          <div className={styles.fieldset}>
            <div className={cn(styles.row, styles.row_mobile)}>
              <div
                className={cn({
                  [styles.col6]: isSingleMode,
                  [styles.col12]: !isSingleMode,
                })}
              >
                <label className={styles.radioCard}>
                  <input
                    name='type'
                    type='radio'
                    value={ITEM_TYPES.FIXED}
                    disabled={saving}
                    checked={values.type === ITEM_TYPES.FIXED}
                    {...register("type")}
                  />
                  <div className={styles.content} data-checked={values.type === ITEM_TYPES.FIXED}>
                    <div>🔒</div>
                    <div>Fixed price</div>
                  </div>
                </label>
              </div>
              {
                isSingleMode === true
                && (
                  <div className={styles.col6}>
                    <label className={styles.radioCard}>
                      <input
                        name='type'
                        type='radio'
                        value={ITEM_TYPES.BID}
                        disabled={saving}
                        checked={values.type === ITEM_TYPES.BID}
                        {...register("type")}
                      />
                      <div className={styles.content} data-checked={values.type === ITEM_TYPES.BID}>
                        <div>🤝</div>
                        <div>Open for bids</div>
                      </div>
                    </label>
                  </div>
                )
              }
            </div>
          </div>
          <div className={styles.fieldset}>
            {
              (values.type === ITEM_TYPES.BID)
              && (
                <div>
                  <div className={cn(styles.row, styles.end)}>
                    <div className={cn(styles.col, styles.col7)}>
                      <div className={styles.fieldset}>
                        <TextInput
                          className={styles.field}
                          label='MINIMUM BID'
                          name={ITEM_TYPES.BID}
                          value={values.bid}
                          type='number'
                          // min={minimalPrice}
                          step={minimalPrice}
                          placeholder='Minimum amount of bid'
                          stateProp={register(ITEM_TYPES.BID, {
                            required: { value: true, message: 'Invalid amount of bid' },
                            min: { value: minimalPrice, message: `The minimum amount of bid is ${minimalPrice}` },
                            setValueAs: setNumberValueWithMinvalue(minimalPrice),
                          })}
                          error={errors.bid?.message}
                          disabled={saving}
                        />
                      </div>
                    </div>
                    <div className={cn(styles.col, styles.col5)}>
                      <CurrencyDropdown
                        value={values.currency}
                        defaultValueIndex={defaultValues.currency}
                        setValue={setValue}
                        saving={saving}
                        currencyOptions={currencyOptions}
                        errors={errors.currency?.message ?? (errors.bid?.message ? <span
                          className={styles.invisible}>{errors.bid.message}</span> : undefined)} />
                    </div>
                  </div>
                  <MinPriceValue type={ITEM_TYPES.BID} minimalPrice={minimalPrice} />
                  <div className={cn(styles.row, styles.end)}>
                    <div className={cn(styles.col, styles.col7)}>
                      <TextInput
                        disabled={false}
                        placeholder='Date and time'
                        className={styles.field}
                        label='STARTING DATE'
                        name='start_date'
                        value={values.start_date}
                        onChange={onDateChange}
                        initialViewDate={moment().endOf("day")}
                        isValidDate={isValidDay}
                        minTime={Date.now()}
                        error={errors.start_date?.message ?? (errors.end_date?.message ? <span
                          className={styles.invisible}>{errors.end_date.message}</span> : undefined)}
                        type='date'
                        required
                      />
                    </div>
                    <div className={cn(styles.col, styles.col5)}>
                      <Dropdown
                        label={'duration time'}
                        value={values.end_date}
                        options={intervalOptionsList}
                        value_index='key'
                        disabled={saving}
                        label_index='label'
                        setValue={(value) => setValue("end_date", value)}
                        defaultValueIndex={defaultEndDate}
                        error={errors.end_date?.message ?? (errors.start_date?.message ? <span
                          className={styles.invisible}>{errors.start_date.message}</span> : undefined)}
                      />

                    </div>
                  </div>
                </div>
              )
            }
          </div>
          <div className={styles.mb}>
            {values.type === ITEM_TYPES.FIXED && (
              <>
                <div className={cn(styles.row, styles.end)}>
                  <div className={cn(styles.col, styles.col7)}>
                    <div className={styles.fieldset}>
                      <TextInput
                        className={styles.field}
                        label='PRICE'
                        name='price'
                        value={values.price}
                        type='number'
                        step={minimalPrice}
                        placeholder='Price'
                        required
                        stateProp={register('price', {
                          required: true,
                          min: { value: minimalPrice, message: `The minimum price is ${minimalPrice}` },
                          setValueAs: setNumberValueWithMinvalue(minimalPrice),
                        })}
                        error={errors.price?.message}
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className={cn(styles.col, styles.col5)}>
                    <CurrencyDropdown value={values.currency}
                                      defaultValueIndex={defaultValues.currency}
                                      errors={
                                        errors.currency?.message ?? (errors.price?.message ? <span
                                          className={styles.invisible}>{errors.price.message}</span> : undefined)
                                      } currencyOptions={currencyOptions}
                                      saving={saving} setValue={setValue} />
                  </div>
                </div>
                <MinPriceValue type={'price'} minimalPrice={minimalPrice} />
              </>
            )}
          </div>
        </div>
      </form>
    </>
  );
};


export default PutOnSaleForm;
