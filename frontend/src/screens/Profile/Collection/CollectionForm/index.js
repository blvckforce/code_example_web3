import { kebabCase } from 'lodash-es';
import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import { useForm } from "react-hook-form";
import config from "../../../../config";
import { getUrlWithPrefixPattern, setEngValueWithLimit, withPrefixAndLimitUrlChange } from "../../../../utils/forms";
import { checkCollectionUniqueUri } from '../../../../utils/requests';
import { checkFileBeforeUpload } from "../../../../utils/upload";
import styles from "./NewCollection.module.sass";
import LoaderCircle from "../../../../components/LoaderCircle";
import TextInput from "../../../../components/TextInput";
import TextArea from "../../../../components/TextArea";
import toast from "react-hot-toast";
import { createCollection, updateCollection } from "../../../../utils/wallet";
import Loader from "../../../../components/Loader";
import { useGlobalState } from "../../../../contexts/Global";
import { getFilePathBlob } from "../../../../utils/helpers";

const shortUrlPrefix = config.collection.urlPrefix;
const placeholder = "/images/content/pic_place_holder.png";

const { maxFileSize, imageTypes } = config.collection;
const urlPattern = getUrlWithPrefixPattern(shortUrlPrefix);

const CollectionForm = (
  { collectionId, onAdded, onClose, btnText = "Create Collection", title = "Create new collection", defaultValues },
) => {

  const [uploading, setUploading] = useState({ avatar: false, background: false });
  const [images, setImages] = useState({
    avatar: defaultValues?.images?.avatar || placeholder,
    background: defaultValues?.images?.background || placeholder,
  });
  const [files, setFiles] = useState({ avatar: null, background: null });
  const [busy, setBusy] = useState(false);

  const { web3, account } = useGlobalState();

  const {
    //for adding new inputs with a tag name (e.g addInput("displayName"))
    register: addInput,
    // A submit handler
    getValues,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, touchedFields },
    setFocus,
    watch,
    setValue,
  } = useForm();

  const fillUpTheForms = () => {

    const { ...values } = getValues();
    const isEmptyForm = Object.values(values).every(i => !i);


    if (isEmptyForm) {
      setValue("name", defaultValues?.name || "");
      setValue("bio", defaultValues?.bio || "");
      setValue("slug", defaultValues.slug || "");
      setValue("color", defaultValues.color || "#000000");
    } else {
      Object.entries(values).forEach(([name, value]) => {
        /* removing socials like objects fill */
        if (typeof value !== "object")
          if (defaultValues) {
            if (name === "slug")
              setValue(name, defaultValues[name].replace(shortUrlPrefix, "") || value || "");

            else
              setValue(name, defaultValues[name] || value || "");
          } else {
            setValue(name, value || "");
          }
      });
    }

  };

  useEffect(() => {
    fillUpTheForms();
  }, [defaultValues]);

  const inputs = watch();

  useEffect(() => {
    if (inputs.name && !touchedFields.slug) setValue('slug', kebabCase(inputs.name));
  }, [inputs.name, setValue, touchedFields]);

  const setLoading = (key, value) => setUploading(prevState => ({ ...prevState, ...{ [key]: value } }));

  const setImage = useCallback((key, value) => {
    setImages(prevState => ({ ...prevState, ...{ [key]: value } }));
  }, []);

  const onSubmit = useCallback(async (data) => {

    try {
      setBusy(true);
      data.slug = data.slug?.replace(shortUrlPrefix, '');

      if (!data.slug) {
        setError("slug", {
          message: `Url should not be empty`,
          type: "error",
        });
        setFocus('slug');
        return;
      } else {
        clearErrors('slug');
      }

      const { exists } = await checkCollectionUniqueUri(data.slug);

      if (exists) {
        setError('slug', {
          message: 'URL already exists',
          type: 'error',
        });
        setFocus('slug');
        return;
      } else {
        clearErrors('slug');
      }

      //add prefix to url
      data.token = data.name.toLowerCase().replaceAll(' ', '_');
      data.url = data.slug;
      const formData = new FormData();

      Object.keys(files).forEach(fileKey => {
        if (files[fileKey]) formData.append(`files_${fileKey}`, files[fileKey], fileKey);
      });

      Object.keys(data).forEach(dataKey => {
        if (data[dataKey]) formData.append(dataKey, data[dataKey]);
      });

      //send form to db for approval
      const provider = web3.library;
      if (!provider) {

        toast("Connect wallet to perform this action");
        return;
      }

      try {
        const signer = provider.getSigner();


        let collection;

        if (collectionId) {
          collection = await updateCollection(
            collectionId,
            account,
            formData,
            true,
            signer,
          );
        } else {
          collection = await createCollection(
            account,
            formData,
            true,
            signer,
          );
        }

        if (collection) {
          toast.success("Success!");
          onAdded(collection);
          onClose();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setBusy(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }

  }, [account, clearErrors, collectionId, files, setError, web3.library]);

  const uploadImage = useCallback((event) => {

    const file = event.target.files?.[0];
    const inputName = event.target.name;

    if (!file)
      return;

    const { type, size, name } = file;

    if (!name) {
      toast.error("Error detecting file name");
      return;
    }
    const ext = name?.split(".").slice(-1)[0] ?? '';

    const { error, success } = checkFileBeforeUpload(type, size, ext,
      imageTypes.split(","), maxFileSize);

    if (!success) {
      if (error) toast.error(error);
      return;
    }
    setLoading(inputName, true);

    setFiles(prevState => ({ ...prevState, ...{ [inputName]: file } }));

    let image = getFilePathBlob(file);

    if (image) setImage(inputName, image);

    setLoading(inputName, false);
  }, [setImage]);

  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      <h6 className={cn(styles.subtitle, styles.text)}>
        To upload your works, you need to pass the artist verification on our
        website, which will take you a few minutes.
      </h6>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={cn("row", styles.row)}>
          <div className={styles.user}>
            <div className={styles.avatar}>
              <img src={images.background} alt='cover' />
              {uploading.background && <LoaderCircle className={styles.loading} />}
            </div>
            <div className={styles.details}>
              <div className={styles.stage}>Cover Image</div>
              <p className={styles.text}>
                We recommend an image of at least 400x400. Gifs work too{" "}
                <span role='img' aria-label='hooray'>
                                    🙌
                                </span>
                {" "}
                Max {process.env.REACT_APP_FILE_UPLOAD_LIMIT || 5}Mb.
              </p>
              <div className={styles.file}>
                <button
                  className={cn("button-stroke button-small", styles.button)}
                >
                  Upload
                </button>
                <input
                  className={styles.load}
                  type='file'
                  name='background'
                  accept='image/*'
                  onChange={uploadImage} //cover_img,avatar
                />
              </div>
            </div>
          </div>

          <div className={styles.user}>
            <div className={styles.avatar}>
              <img src={images.avatar} alt='Avatar' />
              {uploading.avatar && <LoaderCircle className={styles.loading} />}
            </div>
            <div className={styles.details}>
              <div className={styles.stage}>Avatar</div>
              <p className={styles.text}>
                We recommend an image of at least 400x400. Gifs work too{" "}
                <span role='img' aria-label='hooray'>
                                    🙌
                                </span>
                {" "}
                Max {config.collection.maxFileSize}Mb.
              </p>
              <div className={styles.file}>
                <button
                  className={cn("button-stroke button-small", styles.button)}
                >
                  Upload
                </button>
                <input
                  className={styles.load}
                  type='file'
                  name='avatar'
                  accept='image/*'
                  onChange={uploadImage}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.group}>
          <div className={styles.fieldset}>
            <TextInput
              className={styles.field}
              label='DISPLAY NAME (REQUIRED)'
              name='Name'
              type='text'
              placeholder='Enter collection name'
              value={inputs.name || ""}
              stateProp={addInput("name", {
                required: true,
                setValueAs: setEngValueWithLimit(config.createItem.maxPropertyNameLength),
              })}
              error={
                errors.name?.type === "required" && (
                  <span>Please Enter your Name</span>
                )
              }
            />

            <TextInput
              className={cn(styles.field, (!config.collection.colorVisible && styles.hidden))}
              label='Color'
              name='color'
              type='color'
              placeholder='Color'
              value={inputs.color}
              stateProp={addInput("color", { required: true })}
              error={
                errors.color?.type === "required" && (
                  <span>Please enter color</span>
                )
              }
            />
          </div>


          <div className={cn(styles.fieldset, styles.step2)}>
            <TextArea
              className={styles.field}
              label='Description (Optional)'
              name='desc'
              value={inputs?.bio || ""}
              placeholder='Give a description'
              stateProp={addInput("bio", {
                minLength: {
                  value: config.createItem.minBioLength,
                  message: `You need to a description of between ${config.createItem.minBioLength} and ${config.createItem.maxBioLength} characters`,
                },
                maxLength: {
                  value: config.createItem.maxBioLength,
                  message: `You need to a description of between ${config.createItem.minBioLength} and ${config.createItem.maxBioLength} characters`,
                },
                setValueAs: setEngValueWithLimit(config.createItem.maxBioLength),
              })}
              error={errors.bio?.message} />

            <TextInput
              label='Short url (Will be used as public URL)'
              name='slug'
              type='text'
              value={inputs.slug}
              placeholder='Enter token symbol'
              stateProp={addInput("slug", {
                setValueAs: withPrefixAndLimitUrlChange(shortUrlPrefix, config.profile.maxLinkLength),
                required: { value: true, message: 'This field is required' },
                pattern: { value: urlPattern, message: 'The URL should not contain only numbers' },
              })}
              error={errors.slug?.message}
            />
          </div>
        </div>
        <button className={cn("button", styles.submit)}
                disabled={busy} type={'submit'} aria-label={btnText}
        >
          {busy ? <Loader /> : btnText}
        </button>
      </form>
    </div>
  );
};

export default CollectionForm;
