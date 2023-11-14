import { filter, kebabCase } from 'lodash-es';
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { withRouter } from "react-router-dom";
import cn from "classnames";
import TwitterErrors from "../../../components/TwitterErros";
import config from "../../../config";
import NAVIGATE_ROUTES from '../../../config/routes';
import { useProfile } from "../../../contexts/profile.context";
import {
  callWithTimeout, getUrlWithPrefixPattern,
  setEngValueWithLimit, trimNonEnglishCharacters, withPrefixAndLimitUrlChange,
} from "../../../utils/forms";
import { checkProfileUniqueUri } from '../../../utils/requests';
import styles from "./ProfileEdit.module.sass";
import TextInput from "../../../components/TextInput";
import TextArea from "../../../components/TextArea";
import Icon from "../../../components/Icon";
import { updateUserProfile } from "../../../utils/wallet";
import toast from "react-hot-toast";
import { useGlobalState } from "../../../contexts/Global";
import Modal from "../../../components/Modal";
import AddMoreSocial from "./AddMoreSocial";
import LoaderCircle from "../../../components/LoaderCircle";
import VerifyTwitter from "../../Profile/VerifyTwitter";

const breadcrumbs = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Edit Profile",
  },
];

//Regex pattern for general validated urls
const urlPattern =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

//Regex pattern for custom url(the url has to start with swapp.nft/)
const customUrlPattern = getUrlWithPrefixPattern(config.customArtistUrlPrefix);
const twitterHandlePattern = /^@?(\w){1,15}$/gm;


const defaultValues = {
  name: "",
  slug: "",
  bio: "",
  portfolio_url: "",
  twitter: "",
};


/** A Screen for editing User's profile */
const ProfileEdit = ({ title, history }) => {

  const { account, web3 } = useGlobalState();
  const { profile, setProfile } = useProfile();

  const [moreSocialInputs, setMoreSocialInputs] = useState([]);
  const [showMoreSocial, setShowMoreSocial] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [visibleModalVerifyTwitter, setVisibleModalVerifyTwitter] = useState(false);

  const [saving, setSaving] = useState(false);

  //using useForm() hooks to easily manage the states of profile fields
  const {
    //for adding new inputs with a tag name (e.g addInput("name"))
    register: addInput,
    getValues,
    //to trigger focus on inputs a tag name(e.g trigger("name"))
    trigger,
    // to watch value updates
    watch,
    // A submit handler
    handleSubmit,
    // to manually set values to input with a tag name
    // (e.g setValue("name","value"))
    setValue,
    // to manually set Error message for inputs with a tag name
    //(e.g setError("name",{type:"type",message:"message"}))
    formState: { errors, touchedFields },
    setError, clearErrors,
    resetField,
  } = useForm();

  const resetForm = () => {

    const values = getValues();

    Object.keys(values).forEach(name => {
      resetField(name, { defaultValue: defaultValues[name] || account[name] });
    });

    setMoreSocialInputs([]);
  };

  //Watching the values of fields and store it in "inputs" object
  const inputs = watch();

  /**An handler for adding more social inputs */
  const onAddMoreSocial = () => {
    setShowMoreSocial(true);
  };

  const handleSocialAdded = (data) => {
    setMoreSocialInputs((oldData) => [...oldData, data]);
    setShowMoreSocial(false);
  };

  const removeSocial = ({ title, url }) => {
    setMoreSocialInputs((oldData) => filter(oldData,(item) => !(item.title === title && item.url === url)))
  }

  const onCloseMoreSocial = () => {
    setShowMoreSocial(false);
  };

  /** Uploaded avatar handler */
  const getUploadedPic = useCallback(async (event) => {
    event.preventDefault();

    try {
      const file = event.target.files[0];

      const formData = new FormData();

      formData.append("files", file);
      formData.append("field", "avatar");

      const provider = web3.library;
      if (!provider) {
        toast("Connect wallet to perform this action");
        return;
      }

      setAvatarUploading(true);

      const signer = provider.getSigner();

      let profileUpdate = await updateUserProfile(
        account,
        formData,
        true,
        signer,
        "file",
      );
      if (profileUpdate) {
        setProfile(prev => ({ ...prev, account: { ...prev.account, ...profileUpdate } }));
      }
    } catch (e) {
      console.log(e);
    } finally {
      setAvatarUploading(false);
    }
  }, [account, setProfile, web3.library]);

  /** Handler for making the final upload */
  const onUpdate = useCallback(async (data) => {
    // validate url

    try {
      setSaving(true);
      const slug = data.slug?.replace(config.customArtistUrlPrefix, '');
      if (!slug) return;

      const { exists } = await checkProfileUniqueUri(slug, profile?.account?.id);

      if (exists) {
        setError('slug', {
          message: 'This URL already exists, try something else',
        });
        return;
      } else {
        clearErrors('slug');
      }

      data.socials = moreSocialInputs

      const provider = web3.library;

      if (!provider) {
        toast("Connect wallet to perform this action");
        return;
      }
      try {

        const signer = provider.getSigner();

        const profileUpdate = await updateUserProfile(account, { ...data, slug: slug }, true, signer);

        if (profileUpdate) {
          setProfile(prev => ({ ...prev, account: { ...prev.account, ...profileUpdate } }));
          toast.success("Saved");
          callWithTimeout(() => history.push(NAVIGATE_ROUTES.PROFILE), 100);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }, [account, clearErrors, history, profile?.account?.id, setError, setProfile, web3.library, moreSocialInputs]);

  /** A helper function for generating key to store
   * each social input value
   */
  const getSocialKey = (title) => `socials[${title.toLowerCase()}]`;


  /**A helper function for setting default values
   * of inputs from the previously stored data
   * using the setValue of each inputs
   */
  const fillUptheForms = () => {

    const { socials, ...values } = getValues();
    const isEmptyForm = Object.values(values).every(i => !i);


    if (isEmptyForm) {
      setValue("name", profile.account.name || defaultValues["name"]);
      setValue("slug", profile.account.slug || defaultValues["slug"]);
      setValue("bio", profile.account.bio || defaultValues["bio"]);
      setValue("portfolio_url", profile.account.portfolio_url || defaultValues["portfolio_url"]);
      setValue("twitter", profile.account.twitter || "");
    } else {
      Object.entries(values).forEach(([name, value]) => {
        /* removing socials like objects fill */
        if (typeof value !== "object")
          setValue(name, profile.account[name] || value || "");
      });
    }

    //Loop through the socials in account then,assign
    //it to input state value

    if (socials !== undefined) {
      Object.entries(socials).forEach(([title, url]) => {
        setValue(getSocialKey(title), url);
      });
    } else {
      if (profile.account.socials)
        profile.account.socials.forEach((data) => {
          setValue(getSocialKey(data.title), data.url);
        });
    }
  };

  useEffect(() => {
    //Use Mock Account for Testing
    // prepareMockData();

    if (!profile) return;

    //if user had more socials stored already, copy it
    // and set it to moreSocial state
    if (profile.account?.socials)
      setMoreSocialInputs(profile.account.socials);

    //Fill up the forms with default values
    fillUptheForms();
  }, [profile]);

  useEffect(() => {
    if (profile) {
      if (!profile.account.slug) {
        if (inputs.name && !touchedFields.slug) setValue('slug', kebabCase(inputs.name));
      }

    }
  }, [inputs.name, profile, profile.account.slug, setValue, touchedFields.slug]);


  const switchVisibleModalVerifyTwitter = () => setVisibleModalVerifyTwitter(prevState => !prevState);

  const onTwitterValidationSuccess = () => callWithTimeout(switchVisibleModalVerifyTwitter, 500);

  return (
    <>
      <div className={styles.container}>
        <h1 className={cn("h2", styles.title)}>{title}</h1>
        <form onSubmit={handleSubmit(onUpdate)} aria-label={'profile edit'}>
          <div className={styles.user}>
            <div className={styles.avatar}>
              <img
                src={profile.avatar || profile.account?.avatar || "/images/content/pic_place_holder.png"}
                alt='Avatar'
              />
              {avatarUploading && <LoaderCircle className={styles.loading} />}
            </div>
            <div className={styles.details}>
              <div className={styles.stage}>Profile photo</div>
              <div className={styles.text}>
                We recommend an image of at least 400x400. Gifs work too{" "}
                <span role='img' aria-label='hooray'>🙌</span>
              </div>
              <div className={styles.file}>
                <button
                  className={cn("button-stroke button-small", styles.button)}
                >
                  Upload
                </button>
                <input
                  className={styles.load}
                  type='file'
                  accept={process.env.REACT_APP_UPLOAD_IMG_FORMATS}
                  onChange={getUploadedPic}
                />
                {errors.avatar?.type === "required" && (
                  <span className={styles.error}>Please Upload an image</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.list}>
              <div className={styles.item}>
                <div className={styles.category}>Account info</div>
                <div className={styles.fieldset}>
                  <TextInput
                    className={styles.field}
                    // defaultValue={profile.account.name}
                    value={inputs.name}
                    label='display name'
                    name='name'
                    type='text'
                    placeholder='Enter your display name'
                    stateProp={addInput("name", {
                      required: true,
                      setValueAs: setEngValueWithLimit(config.profile.maxNameLength),
                    })}
                    error={
                      errors.name?.type === "required" && (
                        <span>Please Enter your Name</span>
                      )
                    }
                  />

                  <TextInput
                    className={styles.field}
                    label='Custom url'
                    // defaultValue={profile.account.slug}
                    value={inputs.slug}
                    name='slug'
                    type='text'
                    placeholder={`${config.customArtistUrlPrefix}Your custom URL`}
                    // required
                    stateProp={addInput("slug", {
                      required: { value: true, message: 'Custom Url field is required' },
                      pattern: { value: customUrlPattern, message: 'Custom url should not contain only numbers' },
                      setValueAs: withPrefixAndLimitUrlChange(config.customArtistUrlPrefix, config.profile.maxLinkLength),
                    })}
                    error={errors.slug?.message}
                  />
                  <TextArea
                    className={styles.field}
                    label='Bio'
                    name='bio'
                    // defaultValue={profile.account.bio}
                    value={inputs.bio}
                    placeholder='About yourselt in a few words'
                    // required="required"
                    stateProp={addInput("bio", {
                      required: true,
                      minLength: { value: config.createItem.minBioLength },
                      maxLength: { value: config.createItem.maxBioLength },
                      setValueAs: setEngValueWithLimit(config.createItem.maxBioLength),
                    })}
                    error={
                      errors.bio?.type === "required" ? (
                        <span>Please Describe yourself</span>
                      ) : (
                        errors.bio?.type === "minLength" && (
                          <span>You need to describe yourself in between {config.createItem.minBioLength} and {config.createItem.maxBioLength} chars</span>
                        )
                      )
                    }
                  />
                </div>
              </div>
              <div className={styles.item}>
                <div className={styles.category}>Social</div>
                <div className={styles.fieldset}>
                  <TextInput
                    className={styles.field}
                    label='portfolio or website'
                    name='portfolio_url'
                    // defaultValue={profile.account.portfolio_url}
                    value={inputs.portfolio_url}
                    type='text'
                    placeholder='Enter URL'
                    // required
                    stateProp={addInput("portfolio_url", {
                      required: true,
                      pattern: urlPattern,
                      setValueAs: trimNonEnglishCharacters,
                    })}
                    error={
                      errors.portfolio_url?.type === "pattern" ? (
                        <span>Please enter a valid url</span>
                      ) : (
                        errors.portfolio_url?.type === "required" && (
                          <span>Portfolio url field is required</span>
                        )
                      )
                    }
                  />
                  <div className={styles.box}>
                    <TextInput
                      className={styles.field}
                      label='twitter'
                      name='twitter'
                      type='text'
                      disabled={true}
                      //   defaultValue={profile.account.twitter}
                      value={inputs.twitter}
                      placeholder='@twitter username'
                      stateProp={addInput("twitter", {
                        required: true,
                        pattern: twitterHandlePattern,
                      })}
                      error={
                        <TwitterErrors styles={styles} errors={errors} />
                      }
                      suffix={
                        <button
                          className={cn(
                            "button-stroke button-small",
                            styles.button,
                          )}
                          type='button'
                          onClick={switchVisibleModalVerifyTwitter}
                        >
                          Verify account
                        </button>
                      }
                    />

                  </div>
                </div>
                {moreSocialInputs.map((data) => {
                  return (
                    <div className={styles.box} key={data.title + data.url}>
                      <TextInput
                          className={cn(styles.field, styles.m_social)}
                          label={data.title.toUpperCase()}
                          name='Social'
                          type='text'
                          //   defaultValue={data.url}
                          //   value={data.url}
                          value={data.url}
                          stateProp={addInput(getSocialKey(data.title), {
                            required: true,
                          })}
                          suffix={
                            (
                                <button
                                  className={cn("button-stroke", "button-small", styles.button)}
                                  onClick={() => removeSocial({ title: data.title, url: data.url })}
                                >
                                  Remove
                                </button>
                            )
                          }
                      />
                      {/*<button
                                            className={cn(
                                                "button-stroke button-small",
                                                styles.button,
                                                styles.m_btn
                                            )}
                                            type="button"
                                            onClick={() => verifyUrl(data.url)}
                                        >
                                            Verify {data.title}
                                            </button>*/}
                    </div>
                  );
                })}
                <button
                  type='button'
                  className={cn("button-stroke button-small", styles.button)}
                  onClick={onAddMoreSocial}
                >
                  <Icon name='plus-circle' size='16' />
                  <span>Add more social account</span>
                </button>
              </div>
            </div>
            <div className={styles.note}>
              To update your settings you should sign message through your
              wallet. Click 'Update profile' then sign the message
            </div>
            <div className={styles.btns}>
              <button className={cn("button", styles.button)} disabled={saving}>
                Update Profile
              </button>
              <button className={styles.clear}
                      type={"reset"}
                      onClick={resetForm}
              >
                <Icon name='circle-close' size='24' />
                Clear all
              </button>
            </div>
          </div>
        </form>
        <Modal
          visible={showMoreSocial}
          outerClassName={styles.wallet_modal}
          containerClassName={styles.wallet_modal_container}
          onClose={onCloseMoreSocial}
        >
          <AddMoreSocial onAdded={handleSocialAdded} />
        </Modal>
        <Modal
          visible={visibleModalVerifyTwitter}
          onClose={switchVisibleModalVerifyTwitter}
        >
          <VerifyTwitter callback={onTwitterValidationSuccess} />
        </Modal>
      </div>
    </>
  );
};

export default withRouter(ProfileEdit);
