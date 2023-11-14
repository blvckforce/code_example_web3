import moment from "moment";
import React, { useState } from "react";
import config from "../../../config";
import { UPLOAD_MODES } from '../../../config/routes';
import { useSettings } from "../../../hooks/useSettings";
import { formFieldNormaliser, isValidDay } from "../../../utils/forms";
import styles from "../UploadDetails.module.sass";
import UploadFile from "../UploadFile";
import Dropdown from "../../../components/Dropdown2";
import Loader from "../../../components/Loader";
import TextInput from "../../../components/TextInput";
import cn from "classnames";
import Switch from "../../../components/Switch";
import Icon from "../../../components/Icon";

const minimalPrice = 1 / 10 ** config.numberInputsDecimalsScale;

const { minBrokerFee, maxBrokerFee, maxRoyalty, minRoyalty } = config.createItem;

const Form = (props) => {
  const {
    item = {},
    defaultValues = {},
    errors,
    isSingleMode,
    updateItem,
    saving,
    setVisiblePropertyModal,
    setVisibleStatModal,
    stats,
    properties,
    setVisiblePreview,
    startCreating,
    categoriesList,
    chainsList,
    intervalOptionsList,
    collectionsList,
    setPreviewType,
  } = props;

  const { currencyOptions = [] } = useSettings();

  const [isUnlockableContent, setIsUnlockableContent] = useState(false);

  function getProperty(key) {
    return item[key] ? item[key] : defaultValues[key];
  }

  const updateItemFromInput = (type, minValue) => (event) => {
    const { name, value } = formFieldNormaliser({ type, event, minValue });
    updateItem(name, value);
  };

  const updateSupply = (event) => {
    let value;

    if (!event?.target?.value) {
      value = event?.target?.value;
    } else if (isSingleMode) {
      value = "1";
    } else {
      value = event?.target?.value;
    }

    updateItemFromInput("integer")({
      ...event,
      target: {
        ...event?.target,
        name: event.target.name,
        value,
      },
    });
  };

  const unlockableSwitcherHandler = (value) => {
    setIsUnlockableContent(value);
    if (!value) {
      item.unlockable = "";
    }
  };


  return (
    <>
      <form className={styles.form}>
        <div className={styles.list}>
          <div className={styles.item}>
            <div className={styles.category}>Upload file</div>
            <div className={styles.note}>
              Drag or choose your file to upload
            </div>
            <UploadFile image={item.image} setImage={(url) => updateItem("image", url)}
                        setPreviewType={setPreviewType}
            />
            {
              <p className={styles.error}>{errors.image}</p>
            }
          </div>
          <div className={styles.item}>
            <div className={styles.category}>Item Details</div>
            <div className={styles.fieldset}>
              <div className={styles.field}>
                {
                  categoriesList
                    ? <Dropdown
                      label={'Category'}
                      value={item.category}
                      options={categoriesList}
                      value_index='id'
                      label_index='name'
                      error={errors.category}
                      defaultValueIndex={categoriesList[0]?.id}
                      setValue={(value) => updateItem("category", value)
                      }
                    />
                    : <div className={styles.saving}><Loader className={styles.loader} /></div>
                }
              </div>
              <TextInput
                className={styles.field}
                onChange={updateItemFromInput()}
                label='Item name'
                name='name'
                type='text'
                value={item.name}
                error={errors.name}
                placeholder='e. g. Redeemable Bitcoin Card with logo"'
                required
              />
              <TextInput
                className={styles.field}
                onChange={updateItemFromInput()}
                label='Description'
                value={getProperty("description")}
                name='description'
                error={errors.description}
                type='textarea'
                placeholder='e. g. “After purchasing you will able to received the logo...”'
                required
              />
            </div>
          </div>
        </div>
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
                    value='fixed'
                    onChange={updateItemFromInput()}
                    defaultChecked={true}
                  />
                  <div className={styles.content} data-checked={getProperty("type") === "fixed"}>
                    <div>🔒</div>
                    <div>Fixed price</div>
                  </div>
                </label>
              </div>
              {
                isSingleMode === true
                  ? (
                    <div className={styles.col6}>
                      <label className={styles.radioCard}>
                        <input
                          name='type'
                          type='radio'
                          value='bid'
                          onChange={updateItemFromInput()}
                          // defaultChecked={getProperty('type') === "bid"}
                        />
                        <div className={styles.content} data-checked={getProperty("type") === "bid"}>
                          <div>🤝</div>
                          <div>Open for bids</div>
                        </div>
                      </label>
                    </div>
                  )
                  : null
              }
            </div>
          </div>
          <div className={styles.fieldset}>
            <TextInput
              className={styles.field}
              onChange={updateSupply}
              label='SUPPLY'
              name='quantity'
              error={errors.quantity}
              value={item.quantity}
              type='text'
              readOnly={item.mode === UPLOAD_MODES.SINGLE}
              placeholder='The number of copies that can be minted. No gas cost to you! Quantities above one coming soon. '
              required
              min={0}
            />
          </div>
          <div className={styles.fieldset}>
            <div className={styles.field}>
              {
                chainsList ?
                  <Dropdown
                    label={'Chains'}
                    value={getProperty("chain")}
                    options={chainsList}
                    value_index='id'
                    label_index='name'
                    defaultValueIndex={chainsList[0]?.id}
                    setValue={(value) => updateItem("chain", value)}
                    error={errors.chain}
                    true
                  />
                  : <div className={styles.saving}><Loader className={styles.loader} /></div>
              }
            </div>
            {
              (item.type === "bid")
                ? (
                  <div>
                    <div className={cn(styles.row, styles.end)}>
                      <div className={cn(styles.col, styles.col9)}>
                        <div className={styles.fieldset}>
                          <TextInput
                            className={styles.field}
                            onChange={updateItemFromInput("number")}
                            label='MINIMUM BID'
                            name='bid'
                            error={errors.bid}
                            value={item.bid}
                            type='number'
                            step={0.1}
                            placeholder='Minimum amount of bid'
                            required
                          />
                        </div>
                      </div>
                      <div className={cn(styles.col, styles.col3)}>
                        <Dropdown
                          label={'Currency'}
                          value={getProperty("currency")}
                          options={currencyOptions}
                          defaultValueIndex={currencyOptions[1]?.id}
                          setValue={(value) => updateItem("currency", value)}
                          error={errors.currency ?? (errors.bid ? <span
                            className={styles.invisible}>{errors.bid}</span> : undefined)}
                        />
                      </div>
                    </div>
                    <MinPriceValue minimalPrice={minimalPrice} type={"price"} />
                    <div className={cn(styles.row, styles.end)}>
                      <div className={cn(styles.col, styles.col7)}>
                        <TextInput
                          placeholder='Date and time'
                          className={styles.field}
                          onChange={updateItemFromInput("date")}
                          label='STARTING DATE'
                          name='start_date'
                          initialViewDate={moment().endOf("day")}
                          isValidDate={isValidDay}
                          minTime={Date.now()}
                          error={errors.start_date ?? (errors.end_date ? <span
                            className={styles.invisible}>{errors.end_date}</span> : undefined)}
                          value={getProperty("start_date")}
                          type='date'
                          required
                        />
                      </div>
                      <div className={cn(styles.col, styles.col5)}>
                        <Dropdown
                          label={'duration time'}
                          value={getProperty("end_date")}
                          options={intervalOptionsList}
                          value_index='id'
                          label_index='label'
                          defaultValueIndex={intervalOptionsList[0]?.id}
                          setValue={(value) => updateItem("end_date", value)}
                          error={errors.end_date ?? (errors.start_date ? <span
                            className={styles.invisible}>{errors.start_date}</span> : undefined)}
                        />
                      </div>
                    </div>
                  </div>
                )
                : null
            }
          </div>
          <div className={styles.mb}>
            {getProperty("type") === "fixed" && (
              <>
                <div className={cn(styles.row, styles.end)}>
                  <div className={cn(styles.col, styles.col9)}>
                    <div className={styles.fieldset}>
                      <TextInput
                        className={styles.field}
                        onChange={updateItemFromInput("number", minimalPrice)}
                        label='PRICE'
                        name='price'
                        error={errors.price}
                        value={item.price}
                        type='number'
                        step={0.1}
                        placeholder='Price'
                        required
                      />
                    </div>
                  </div>
                  <div className={cn(styles.col, styles.col3)}>
                    <Dropdown
                      label={'Currency'}
                      value={getProperty("currency")}
                      options={currencyOptions}
                      defaultValueIndex={currencyOptions[1]?.id}
                      setValue={(value) => updateItem("currency", value)}
                      error={errors.currency ?? (errors.price ? <span
                        className={styles.invisible}>{errors.price}</span> : undefined)}
                    />
                  </div>
                </div>
                <MinPriceValue minimalPrice={minimalPrice} type={"price"} />
              </>
            )}
          </div>

          <div className={styles.labelWrapper}>
            <div className={styles.category}>{"Unlockable Content"}</div>
            <Switch
              value={isUnlockableContent}
              setValue={(value) => unlockableSwitcherHandler(value)}
            />
          </div>

          {
            isUnlockableContent &&
            <TextInput
              className={styles.field}
              onChange={updateItemFromInput()}
              name='unlockable'
              error={errors.unlockable}
              value={item.unlockable}
              type='textarea'
              placeholder='Information that will be unlocked after your token will be soled'
            />
          }
          <div className={styles.option}>
            <div className={styles.box}>
              <div className={styles.category}>Private Content</div>
              <div className={styles.text}>
                Private content is used for NFT drops so that buyers do not see your NFT until you enable it or until
                the auction is started.
              </div>
            </div>
            <Switch
              value={getProperty("isPrivateContent")}
              setValue={(value) => updateItem("isPrivateContent", value)}
            />
          </div>
          <div className={styles.mb}>
            <label htmlFor={"custom_url"} className={styles.category}>Enter url</label>
            <TextInput
              className={styles.field}
              onChange={updateItemFromInput()}
              name='custom_url'
              id='custom_url'
              error={errors.custom_url}
              type='text'
              value={getProperty("custom_url")}
              placeholder='e. g. https://www.dropbox.com/s/oljnr3nhz39ky6r Screen%20Shot%202021-10-03%20at%2...'
              required
            />
          </div>
          <div className={styles.option}>
            <div className={styles.box}>
              <div className={styles.category}>Explicit & Sensitive Content</div>
              <div className={styles.text}>
                Explicit & Sensitive Content
              </div>
            </div>
            <Switch value={getProperty("sensitive")} setValue={(value) => updateItem("sensitive", value)} />
          </div>
          <div className={styles.option}>
            <div className={styles.box}>
              <div className={styles.category}>Properties</div>
              <div className={styles.text}>
                Textual traits that show up as rectangles
              </div>
            </div>
            <button
              className={styles.openmodal}
              type='button'
              onClick={() => setVisiblePropertyModal(true)}
              title='Add Properties'
            >
              <Icon name='plus' size='24' />
            </button>
          </div>
          <div className={cn(styles.option, styles.wrap)}>
            {properties && properties.map((x, index) => (
              x.key ?
                <div className={cn(styles.feature, styles.property)} key={index}>
                  <div>{x.key}</div>
                  <div>{x.value}</div>
                </div>
                : ""
            ))}
          </div>
          <div className={styles.option}>
            <div className={styles.box}>
              <div className={styles.category}>Stats</div>
              <div className={styles.text}>
                Numerical traits that just show as numbers
              </div>
            </div>
            <button
              onClick={() => setVisibleStatModal(true)}
              className={styles.openmodal}
              type='button'
              title='Add stats'>
              <Icon name='plus' size='24' />
            </button>
          </div>
          <div className={cn(styles.option, styles.wrap)}>
            {stats && stats.map((x, index) => (
              x.key ?
                <div className={cn(styles.feature, styles.stat)} key={index}>
                  <div>{x.key}</div>
                  <div>
                    <div>{x.value}</div>
                    <div> of</div>
                    <div>{x.total}</div>
                  </div>
                </div>
                : ""
            ))}
          </div>
          <div className={styles.field}>
            {
              collectionsList
                ? <Dropdown
                  label={'Collection'}
                  value={item.colection}
                  options={collectionsList}
                  value_index='id'
                  label_index='name'
                  error={errors.colection}
                  defaultValueIndex={collectionsList[0]?.id}
                  setValue={(value) => updateItem("colection", value)
                  }
                />
                : <div className={styles.saving}><Loader className={styles.loader} /></div>
            }
          </div>
          <div className={styles.fieldset}>
            <TextInput
              className={cn(styles.field)}
              onChange={updateItemFromInput("number")}
              label='BROKER FEE'
              name='brokerFee'
              error={errors.brokerFee}
              value={getProperty("brokerFee")}
              type='percent'
              placeholder='Broker fee'
              required
              min={0}
              max={25}
            />
            <small>{`Broker fee must be between ${minBrokerFee}% and ${maxBrokerFee}%`}</small>
            <div className={styles.text}>
              Broker fees allow any user to generate a referral link that will allow them to help you sell their art
              through their channels and this fee is deducted from the total price of the NFT
            </div>
          </div>
          <div className={styles.fieldset}>
            <TextInput
              className={cn(styles.field)}
              onChange={updateItemFromInput("number")}
              label='ROYALTIES'
              name='royalty'
              error={errors.royalty}
              value={getProperty("royalty")}
              type='percent'
              placeholder='Royalties'
              required
              min={0}
              max={25}
            />
            <small>{`Royalty fee must be between ${minRoyalty}% and ${maxRoyalty}%`}</small>
          </div>
        </div>
        <div className={styles.foot}>
          <button
            className={cn("button-stroke tablet-show", styles.button)}
            onClick={() => setVisiblePreview(true)}
            type='button'
          >
            Preview
          </button>
          <button
            className={cn("button", styles.button)}
            onClick={startCreating}
            // type="button" hide after form customization
            type='button'
            disabled={saving}
          >
            {getProperty("id") ? <span>Update Item</span> : <span>Create Item</span>}
            {
              saving
                ? <Loader className={styles.loader} />
                : <Icon name='arrow-next' size='10' />
            }
          </button>
          {!styles && <div className={styles.saving}>
            <span>Auto saving</span>
            <Loader className={styles.loader} />
          </div>
          }
        </div>
      </form>
    </>
  );
};

/***
 *
 * @param type : 'price'|'bid'
 * @param minimalPrice : number
 * @return {JSX.Element}
 * @constructor
 */
export const MinPriceValue = ({ type = "price", minimalPrice }) => (
  <div className={styles.fullWidthRow}>
    <small>The minimum {type} is {minimalPrice}</small>
  </div>
);


export default Form;
