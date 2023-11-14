import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import cn from "classnames";
import config from "../../../../config";
import NAVIGATE_ROUTES from '../../../../config/routes';
import { useProfile } from "../../../../contexts/profile.context";
import { useContract } from "../../../../hooks/useContract";
import { callWithTimeout, setEngValueWithLimit, trimNonEnglishCharacters } from "../../../../utils/forms";
import styles from "./SignUpForm.module.sass";
import TextInput from "../../../../components/TextInput";
import TextArea from "../../../../components/TextArea";
import Icon from "../../../../components/Icon";
import { updateUserProfile } from "../../../../utils/wallet";
import Loader from "../../../../components/Loader";
import toast from "react-hot-toast";
import { useGlobalState } from "../../../../contexts/Global";
import Modal from "../../../../components/Modal";
import AddMoreSocial from "../../../AccountSettings/ProfileEdit/AddMoreSocial";
import LoaderCircle from "../../../../components/LoaderCircle";
import Image from "../../../../components/Image";
import { connectorByMedia } from "../../../../utils/connectors";
import ConnectWallet from "../../../../components/ConnectWallet";
import { printWallatAddress } from "../../../../utils/helpers";
import { useWallet } from "../../../../hooks/useWallet";
import { useHistory } from "react-router";
import VerifyTwitter from "../../../Profile/VerifyTwitter";

//Regex pattern for general validated urls
const urlPattern =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

//Regex pattern for custom url(the url has to start with swapp.nft/)
const customUrlPattern =
  /^(https?:\/\/)?swapp.nft\/[a-zA-Z][a-zA-Z0-9]{3,30}$/gm;

const twitterHandlePattern = /^@?(\w){1,15}$/gm;

/** A Signup screen */
const SignUpForm = ({ title }) => {

  const history = useHistory();
  const { wallet } = useWallet();
  const { account, web3 } = useGlobalState();
  const { GOVContract } = useContract();
  const { profile, setProfile, logout } = useProfile();

  const [twitterLoading, setTwitterLoading] = useState(false);
  const [moreSocialInputs, setMoreSocialInputs] = useState([]);
  const [showMoreSocial, setShowMoreSocial] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [pristine, setPristine] = useState(true);
  const [busy, setBusy] = useState(false);
  const [visibleModalConnectWallet, setVisibleModalConnectWallet] = useState(false);
  const [visibleModalVerifyTwitter, setVisibleModalVerifyTwitter] = useState(false);


  const changeVisibilityVerifyTwitterModal = () => setVisibleModalVerifyTwitter(prevState => !prevState);

  //using useForm() hooks to easily manage the states of profile fields
  const {
    //for adding new inputs with a tag name (e.g addInput("name"))
    register: addInput,
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
    formState: { errors },
  } = useForm();

  //Watching the values of fields and store it in "inputs" object
  const inputs = watch();

  /**Handler for verifying Twitter handle validity */
  const verifyTwitterHandle = async (evt) => {

    evt.preventDefault();
    setTwitterLoading(true);

    setVisibleModalVerifyTwitter(true);

    setTwitterLoading(false);
  };

  /**An handler for adding more social inputs */
  const onAddMoreSocial = () => {
    setShowMoreSocial(true);
  };

  const handleSocialAdded = (data) => {

    //console.log(data);
    setMoreSocialInputs([...moreSocialInputs, data]);
    setShowMoreSocial(false);
  };

  const onCloseMoreSocial = () => {
    setShowMoreSocial(false);
  };

  /** Uploaded avatar handler */
  const getUploadedPic = async (event) => {

    event.preventDefault();

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
      setProfile(prevState => ({ ...prevState, account: { ...prevState.account, ...profileUpdate } }));
    }

    setAvatarUploading(false);
  };

  /** Handler for making the final upload */
  const onUpdate = async (data) => {
    data.agency = true;
    if (data.socials) {

      const socials = data.socials;
      data.socials = [];

      for (const key in socials) {

        data.socials.push({ title: key, url: socials[key] });
      }
    }

    const provider = web3.library;

    if (!provider) {

      toast("Connect wallet to perform this action");
      return;
    }

    setBusy(true);

    //register on bc
    try {
      const isAgent = await GOVContract.isAgent(account);
      if (!isAgent) {

        if (!GOVContract) {
          throw new Error("No gov contract specified");
        }

        const txGOVContract = await GOVContract.registerAsAgent();
        await txGOVContract.wait();
      }

    } catch (e) {
      toast.error(e.message);
      setBusy(false);
      return;
    }


    const signer = provider.getSigner();
    try {
      const profileUpdate = await updateUserProfile(account, data, true, signer);


      if (profileUpdate) {

        setProfile(prevState => ({ ...prevState, account: { ...prevState.account, ...profileUpdate } }));

        toast.success("Saved");

        setBusy(false);

        //navigate to agent profile
        history.push(NAVIGATE_ROUTES.PROFILE);
      }

    } catch (e) {
      setBusy(false);
      console.error(e);
    }

  };

  /** A helper function for generating key to store
   * each social input value
   */
  const getSocialKey = (title) => `socials[${title.toLowerCase()}]`;

  /**A helper function for setting default values
   * of inputs from the previously stored data
   * using the setValue of each inputs
   */
  const fillUptheForms = () => {
    setValue("twitter", profile.account.twitter);

    if (pristine) {

      setValue("name", profile.account.name);
      setValue("agency.default_fee", profile.account?.agent?.default_fee);
      setValue("custom_url", profile.account.custom_url);
      setValue("bio", profile.account.bio);
      setValue("portfolio_url", profile.account.portfolio_url);

      if (profile.account.socials) {
        //if user had more socials stored already, copy it
        // and set it to moreSocial state

        setMoreSocialInputs(profile.account.socials);
      }

      setPristine(false);
    }
  };

  const changeVisibleModalConnectWallet = () => setVisibleModalConnectWallet(prevState => !prevState);

  useEffect(() => {

    if (!profile?.account?.id) return;

    //Fill up the forms with default values
    fillUptheForms();

  }, [profile]);

  const onTwitterValidationSuccess = () => callWithTimeout(changeVisibilityVerifyTwitterModal, 500);

  const bioErrorLengthMessage = `You need to describe yourself in between ${config.createItem.minBioLength} and ${config.createItem.maxBioLength} chars`;

  return (
    <>
      <div className={cn("container", styles.container)}>
        <div className={styles.head}>
          <h1 className={cn("h4", styles.title)}>{title}</h1>
          {
            !web3.active ?
              <button
                className={cn(
                  "button-stroke button-small",
                  styles.button,
                  styles.btn_border,
                )}
                onClick={changeVisibleModalConnectWallet}
              >
                <Icon name='wallet' />
                <span>Connect Wallet</span>
              </button>
              :
              <button
                className={cn(
                  "button-stroke button-small",
                  styles.button,
                  styles.btn_border,
                  styles.wallet,
                )}
                onClick={logout}
              >
                <Image className={styles.icon} src={connectorByMedia[wallet]?.image} />
                <span>{printWallatAddress(account)}</span>
                <Icon className={styles.icon_right} name='exit' />
              </button>
          }
        </div>
        <form className={styles.form} onSubmit={handleSubmit(onUpdate)}>
          <div className={styles.user}>
            <div className={styles.avatar}>
              <img
                src={
                  profile.account?.avatar ||
                  "/images/content/pic_place_holder.png"
                }
                alt='Avatar'
              />
              {avatarUploading && <LoaderCircle className={styles.loading} />}
            </div>
            <div className={styles.details}>
              <div className={styles.stage}>Profile photo</div>
              <div className={styles.text}>
                We recommend an image of at least 400x400. Gifs work too{" "}
                <span role='img' aria-label='hooray'>
                                    🙌
                                </span>
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
                <div className={styles.fieldset}>
                  <TextInput
                    className={styles.field}
                    // defaultValue={profile.account.name}
                    value={inputs?.name || ""}
                    label='display name'
                    name='name'
                    type='text'
                    placeholder='Enter your display name'
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

                  {/*<TextInput*/}
                  {/*    className={styles.field}*/}
                  {/*    // defaultValue={profile.account.name}*/}
                  {/*    value={inputs?.agency?.default_fee || ''}*/}
                  {/*    label="default fee (%)"*/}
                  {/*    name="agency.default_fee"*/}
                  {/*    type="number"*/}
                  {/*    placeholder="Enter your default fee for artist, max of 50"*/}
                  {/*    stateProp={addInput("agency.default_fee", { required: false, max: 25 })}*/}
                  {/*    max="50"*/}
                  {/*/>*/}

                  <TextArea
                    className={styles.field}
                    label='Bio'
                    name='bio'
                    // defaultValue={profile.account.bio}
                    value={inputs.bio}
                    placeholder='About yourself in a few words'
                    // required="required"
                    stateProp={addInput("bio", {
                      required: { value: true, message: "Please Describe yourself" },
                      minLength: { value: config.createItem.minBioLength, message: bioErrorLengthMessage },
                      maxLength: { value: config.createItem.maxBioLength, message: bioErrorLengthMessage },
                      setValueAs: setEngValueWithLimit(config.createItem.maxBioLength),
                    })}
                    error={errors.bio?.message ?? ""}
                  />
                </div>
              </div>
              <div className={styles.item}>
                <div className={styles.fieldset}>
                  <div className={cn(styles.box, { [styles.has_error]: errors.twitter })}>
                    <TextInput
                      className={styles.field}
                      label='twitter'
                      name='twitter'
                      type='text'
                      disabled={true}
                      //   defaultValue={profile.account.twitter}
                      value={inputs?.twitter || ""}
                      placeholder='@twitter username'
                      stateProp={addInput("twitter", {
                        required: true,
                        pattern: twitterHandlePattern,
                        setValueAs: trimNonEnglishCharacters,
                      })}
                      error={
                        <div className={styles.c_row}>
                          {errors.twitter?.type === "pattern" ? (
                            <span>Please enter a valid twitter handle</span>
                          ) : errors.twitter?.type === "required" ? (
                            <span>Twitter handle field is required</span>
                          ) : (
                            (errors.twitter?.type === "notExist" ||
                              errors.twitter?.type === "exist") && (
                              <span
                                className={
                                  errors.twitter?.type === "exist"
                                    ? styles.label
                                    : styles.error
                                }
                              >{errors.twitter?.message}</span>
                            )
                          )}
                          {twitterLoading && (
                            <Loader className={styles.c_item} />
                          )}
                        </div>
                      }
                    />
                    <button
                      className={cn(
                        "button-stroke button-small",
                        styles.button,
                      )}
                      type='button'
                      onClick={verifyTwitterHandle}
                    >
                      Verify account
                    </button>
                  </div>
                </div>
                {moreSocialInputs.map((data, index) => (
                  <div className={styles.box} key={index}>
                    <TextInput
                      className={cn(styles.field, styles.m_social)}
                      label={data.title.toUpperCase()}
                      name='Social'
                      type='text'
                      //   defaultValue={data.url}
                      value={data.url}
                      //value={inputs[getSocialKey(data.title)]?.url}
                      stateProp={addInput(data.title, {
                        required: true,
                        setValueAs: trimNonEnglishCharacters,
                      })}
                    />
                  </div>
                ))}
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
            <div className={styles.btns}>
              <button className={cn("button", styles.button)} disabled={busy || avatarUploading}>
                {
                  busy
                    ? <Loader />
                    : profile.account.name
                      ? "Update Account"
                      : "Create Account"
                }
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
          title={'Connect Wallet'}
          visible={visibleModalConnectWallet}
          outerClassName={styles.wallet_modal}
          containerClassName={styles.wallet_modal_container}
          onClose={changeVisibleModalConnectWallet}
        >
          <ConnectWallet onConnected={changeVisibleModalConnectWallet} />
        </Modal>

        <Modal
          visible={visibleModalVerifyTwitter}
          onClose={changeVisibilityVerifyTwitterModal}
        >
          <VerifyTwitter callback={onTwitterValidationSuccess} />
        </Modal>
      </div>
    </>
  );
};

export default SignUpForm;
