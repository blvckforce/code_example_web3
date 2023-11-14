import cn from "classnames";
import config from '../../../config';
import { useSettings } from "../../../hooks/useSettings";
import { modesList } from '../../../utils/forms';
import styles from "../UploadDetails.module.sass";
import Form from "./Form";
import Preview from "../Preview";
import React, { useState } from "react";

const CreationForm = (props) => {
  const {
    errors,
    toggleMode,
    defaultValues = {},
    item,
    modeParam,
    defaultValue,
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
    visiblePreview,
    collectionsList,
  } = props;

  const { currencyOptions = [] } = useSettings();
  const [previewType, setPreviewType] = useState("image");

  const getPreviewData = () => {
    const currency = currencyOptions.find(({ id }) => id === item.currency)?.name;

    return ({
      ...defaultValue,
      ...item,
      image: item?.image ? item.image : defaultValue?.image,
      currency,
    });
  };

  function getProperty(key) {
    return item[key] ? item[key] : defaultValues[key];
  }

  return (
    <div className={cn("container", styles.container)}>
      <div className={styles.wrapper}>
        <div className={styles.head}>
          <div className={cn("h3", styles.title)}>
            {getProperty("id") ? "Update Item" : "Create new item"}
          </div>

          {config.upload.multiple &&
            !getProperty("id") &&
            <button
              className={cn("button-stroke button-small", styles.button)}
              onClick={toggleMode}
            >
              Switch to <span
              className={styles.mode}>{item.mode === modesList[0] ? modesList[1] : modesList[0]}</span>
            </button>
          }

        </div>

        {
          config.upload.multiple &&
          <div className={styles.description}>
            <p>
              Choose <span>“Single”</span> if you want your collectible to be
              one of a kind or <span>“Multiple”</span> if you want to sell one
              collectible multiple times
            </p>
          </div>
        }

        <Form
          item={item}
          errors={errors}
          modeParam={modeParam}
          defaultValues={defaultValue}
          isSingleMode={isSingleMode}
          updateItem={updateItem}
          saving={saving}
          setVisiblePropertyModal={setVisiblePropertyModal}
          setVisibleStatModal={setVisibleStatModal}
          stats={stats}
          properties={properties}
          setVisiblePreview={setVisiblePreview}
          startCreating={startCreating}
          categoriesList={categoriesList}
          collectionsList={collectionsList}
          chainsList={chainsList}
          intervalOptionsList={intervalOptionsList}
          setPreviewType={setPreviewType}
        />

      </div>
      <Preview
        previewType={previewType}
        className={cn(styles.preview, { [styles.active]: visiblePreview })}
        item={getPreviewData()}
        onClose={() => setVisiblePreview(false)}
      />
    </div>
  );
};

export default CreationForm;
