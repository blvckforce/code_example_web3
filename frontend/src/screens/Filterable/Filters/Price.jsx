import React from "react";
import Accordion from "../../../components/Accordion";
import Dropdown from "../../../components/Dropdown";
import TextInput from "../../../components/TextInput";
import { numberFieldValidation } from '../../../utils/forms';
import styles from "../Filterable.module.sass";

const Price = ({ priceFilter, currencyOptions, setPriceFilter, STEP, applyPriceFilter, ...rest }) => (
  <Accordion
    className={(styles.accordion, styles.dropdown, styles.price)}
    title='Price'
    {...rest}
  >
    <Dropdown
      value={priceFilter.currency}
      options={currencyOptions}
      setValue={(value) =>
        setPriceFilter(prevState => ({ ...prevState, currency: value }))
      }
    />
    <div className={styles.range}>
      <TextInput
        className={styles.field}
        label=''
        name='from'
        type='number'
        step={STEP}
        value={String(priceFilter.from)}
        placeholder='From'
        min={0}
        onChange={
          ev => setPriceFilter(prevState => ({ ...prevState, from: numberFieldValidation(ev.target.value) }))
        }
      />
      <span className={styles.bridge}>to</span>
      <TextInput
        className={styles.field}
        label=''
        name='to'
        min={0}
        type='number'
        step={STEP}
        placeholder='To'
        value={priceFilter.to}
        onChange={(event) =>
          setPriceFilter(prevState => ({ ...prevState, to: numberFieldValidation(event.target.value) }))
        }
      />
    </div>
    <button className='button-full' onClick={applyPriceFilter}>
      Apply
    </button>
  </Accordion>
);

export default Price;
