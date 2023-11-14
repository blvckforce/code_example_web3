import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router";
import cn from "classnames";
import SEO from '../../../components/SEO';
import SourceContainer from "../../../components/SourceContainer";
import WithInputHeightWrapper from "../../../components/WithInputHeightWrapper";
import config from "../../../config";
import NAVIGATE_ROUTES from "../../../config/routes";
import { useProfile } from "../../../contexts/profile.context";
import { setEngValueWithLimit, trimNonEnglishCharacters } from "../../../utils/forms";
import { checkFileBeforeCreateNFTUpload, getFileExtension } from "../../UploadDetails/utils";
import styles from "./Verification.module.sass";
import TextInput from "../../../components/TextInput";
import { Link } from "react-router-dom";
import Icon from "../../../components/Icon";
import { getFilePathBlob } from "../../../utils/helpers";
import TextArea from "../../../components/TextArea";
import Loader from "../../../components/Loader";
import { AgentServices } from "../../../services/API";
import Modal from "../../../components/Modal";
import ConnectWallet from "../../../components/ConnectWallet";
import { useGlobalState } from "../../../contexts/Global";
import toast from "react-hot-toast";
import { parseAccount, updateUserArtistProfile } from "../../../utils/wallet";
import Notice from "../../../components/Notice";
import VerifyTwitter from "../VerifyTwitter";
import TagInput from "../../../components/TagInput";

//Regex pattern for general validated urls
const urlPattern =
  /([\w+]+\:\/\/)?([\w\d-]+\.)*[\w-]+[\.\:]\w+([\/\?\=\&\#\.]?[\w-]+)*\/?/;
//Regex pattern for email address
const emailPattern =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const ArtistVerification = () => {
  const [files, setFiles] = useState([]);
  const [visibleModalConnectWallet, setVisibleModalConnectWallet] =
    useState(false);
  const { account, web3, GOVContract } = useGlobalState();
  const { profile, setProfile, logout } = useProfile();

  const [tokenError, setTokenError] = useState("");
  const [invite, setInvite] = useState();
  const [busy, setBusy] = useState(false);
  const [socials, setSocials] = useState([]);

  const { token } = useParams();
  const history = useHistory();

  const {
    register: addInput,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm();

  const inputs = watch();

  const handleWallet = async () => {
    setVisibleModalConnectWallet(true);
  };

  const updateFile = (event) => {

    if (event.target.files) {

      Object.values(event.target.files).forEach(file => {

        const { type, size, name } = file ?? {};

        if (!name) {
          toast.error(`Can't get the file name`);
          return;
        }
        const ext = getFileExtension(name);

        const { error, success } = checkFileBeforeCreateNFTUpload(type, size, ext);

        if (error) toast.error(error, name);

        if (success) setFiles(prevState => {

          if (prevState.length < config.upload.multipleLimit) {
            return [...prevState, file];
          } else {
            toast.error(`Limit is ${config.upload.multipleLimit} file(s)`);
            return prevState;
          }
        });
      });
    }
  };

  const onApply = async (data) => {
    if (!profile?.isAuthorized)
      return toast.error("Login is required to perform this action.");

    if (!profile?.account?.twitter)
      return toast.error("Twitter verification is required");

    if (!socials || !socials.length)
      return toast.error("Provide at least one social media account");

    if (!data.portfolio_url && !files.length)
      return toast.error("Provide either sample files or link to your portfolio");

    data.social_media = socials.join(", ");

    const formData = new FormData();

    if (token)
      formData.append("code", token);

    files.forEach(file => {
      formData.append(`files`, file, file.name);
    });

    for (const key in data) {
      formData.append(key, data[key]);
    }

    //send form to db for approval
    const provider = web3.library;
    if (!provider) {
      toast("Connect wallet to perform this action");
      return;
    }

    const signer = provider.getSigner();

    setBusy(true);
    let profileUpdate = await updateUserArtistProfile(
      account,
      formData,
      true,
      signer,
    );
    setBusy(false);

    if (profileUpdate) {

      //register on bc
      if (invite && invite.account) {

        try {

          const agentAddress = invite.account.address;

          const isAgent = await GOVContract.isAgent(agentAddress);

          if (!isAgent)
            return toast.error("Invite must be from a registered agent");

          setBusy(true);

          await GOVContract.registerAsAgentArtist(agentAddress);

          setBusy(false);

        } catch (e) {

          toast.error(e.message);
          setBusy(false);
          return;
        }
      }

      setProfile(prev => ({ ...prev, account: profileUpdate }));
      toast.success("Verification pending approval");

      history.push("/profile");
    }
  };

  useEffect(() => {
    setValue("wallet", profile?.account?.address);
  }, [profile?.account?.address]);

  useEffect(() => {

    //verify the registration token validity
    const verifyToken = async () => {

      const data = await AgentServices.getInvite(token);

      if (!data)
        return setTokenError("Invalid invite token");

      if (data.error || !data.data)
        return setTokenError(data.message);

      if (!data)
        return setTokenError("Invalid invitation token");

      if (data.account)
        data.account = parseAccount(data.account);

      setInvite(data);
    };
    if (token)
      verifyToken();

  }, [token]);

  useEffect(() => {
    if (profile.isAuthorized) {
      if (profile.account.artist)
        if (profile.account.artist.status === "approved")
          setTokenError(`You have enrolled as an artist and your application is ${profile.account.artist.status}.`);
    }
  }, [profile]);

  const switchVisibleModalConnectWallet = () => setVisibleModalConnectWallet(prevState => !prevState);

  if (tokenError) return (
    <>
      <SEO title={'Join to us'} url={window.location.href} />
      <Notice
        action={<Link to={NAVIGATE_ROUTES.PROFILE} className={cn("button button-outline")}>Visit Profile</Link>}
        message={tokenError} className={styles.notice} />
    </>
  );

  return (
    <>
      <SEO title={'Join to us'} url={window.location.href} />

      <div className={cn("container", styles.section)}>
        <form onSubmit={handleSubmit(onApply, (e) => console.log(e))}>
          <div className={styles.head}>
            <h1 className={cn("h2", styles.title)}>Apply as an Artist</h1>
            <h6 className={cn("h5", styles.title, styles.sub_title)}>
              Hey, dear artist! Fill the application form below! And become an
              artist on Swapp NFT!
            </h6>
          </div>
          {invite &&
            <div className={cn(styles.container, styles.agent)}>
              <div className='row'>
                <img src={invite?.account?.avatar || "/images/content/avatar.png"} />
                <div className={cn("row", styles.agent_name_block)}>
                  <span>The inviting agent:</span>
                  <span className={styles.name}>{invite?.account?.name}</span>
                </div>
              </div>
              <div className={styles.fee}>
                Agents Fees - {invite?.account?.agent.default_fee}%
              </div>
            </div>
          }
          {/* First Section */}
          <div className={styles.container}>
            <div className={cn("row")}>
              <div>
                <h4 className={cn("h4", styles.title)}>Wallet Connection</h4>
                <h6 className={cn("h5", styles.title, styles.subtitle)}>
                  Firstly, you should connect your Crypto Wallet to our platform
                </h6>
              </div>
              <h6 className={cn("h6", styles.title)}>STEP 1 / 4</h6>
            </div>

            <div className={cn("row", styles.row, styles.wallet)}>
              <TextInput
                className={styles.field}
                disabled={true}
                label='Wallet'
                type='text'
                placeholder='Here will be your wallet number'
                value={inputs.wallet}
                stateProp={addInput("wallet", { required: true })}
                error={errors?.wallet && "Connect Your wallet"}
              />

              {profile.isAuthorized ?
                <WithInputHeightWrapper>
                  <button
                    className={cn("button", "button-small button-pink", styles.button)}
                    type='button'
                    onClick={logout}
                  >
                    Disconnect
                  </button>
                </WithInputHeightWrapper>

                :
                <WithInputHeightWrapper>
                  <button
                    className={cn("button", "button-small", styles.button)}
                    type='button'
                    onClick={handleWallet}
                  >
                    Connect wallet
                  </button>
                </WithInputHeightWrapper>

              }
            </div>

            <div className={styles.readmore}>
              <h5>
                Don’t know how to create wallet?!
                <br /> <a className={styles.more} href='#'>Read more</a> about it!
              </h5>
            </div>
          </div>
          {/* Second section */}
          <div className={styles.container}>
            <div className={cn("row")}>
              <div>
                <h4 className={cn("h4", styles.title)}>Artist Info</h4>
              </div>
              <h6 className={cn("h6", styles.title)}>STEP 2 / 4</h6>
            </div>
            <div className={cn("row", styles.row)}>
              <TextInput
                className={cn(styles.field, styles.gap)}
                label='FIRST NAME'
                type='text'
                placeholder='Enter your first name'
                value={inputs.first_name}
                stateProp={addInput("first_name", {
                  required: true,
                  setValueAs: setEngValueWithLimit(config.createItem.maxPropertyNameLength),
                })}
                error={
                  errors.first_name?.type === "required" && (
                    <span>Please Enter your Name</span>
                  )
                }
              />
              <TextInput
                className={styles.field}
                label='LAST NAME'
                type='text'
                placeholder='Enter your last name'
                value={inputs.last_name}
                stateProp={addInput("last_name", {
                  required: true,
                  setValueAs: setEngValueWithLimit(config.artist.maxNameLength),
                })}
                error={
                  errors.last_name?.type === "required" && (
                    <span>Please Enter your last name</span>
                  )
                }
              />
            </div>
            <div>
              <TagInput className={styles.field}
                        label='Hi! What about your social media?'
                        name='social_media'
                        type='text'
                        placeholder='e.g. Instagram, Facebook, etc.'
                        setValue={setSocials}
              />

              <TextInput
                className={styles.field}
                label='What kind of art do you create?'
                type='text'
                placeholder='e.g. Paintprints, Photos, Soundtracks, 3D, etc.'
                value={inputs.art_type}
                stateProp={addInput("art_type", {
                  required: true,
                  setValueAs: setEngValueWithLimit(config.artist.maxNameLength),
                })}
                error={
                  errors.art_type?.type === "required" && (
                    <span>Please Enter your type of art</span>
                  )
                }
              />
              <TextInput
                className={styles.field}
                label='Email'
                type='text'
                placeholder='Enter your Email'
                value={inputs.email}
                stateProp={addInput("email", {
                  required: true,
                  pattern: emailPattern,
                  setValueAs: trimNonEnglishCharacters,
                })}
                error={
                  errors.email?.type === "required" ? (
                    <span>Please Enter your Email address</span>
                  ) : (
                    errors.email?.type === "pattern" && (
                      <span>Please Enter a valid Email address</span>
                    )
                  )
                }
              />
              <TextInput
                className={styles.field}
                label='Provide a link on your portfolio'
                type='text'
                placeholder='Behance, Dribbble, Soundcloud, Itunes '
                value={inputs.portfolio_url}
                stateProp={addInput("portfolio_url", {
                  required: { value: false, message: "Portfolio url field is required" },
                  pattern: { value: urlPattern, message: "Please enter a valid url" },
                  setValueAs: trimNonEnglishCharacters,
                })}
                error={errors.portfolio_url?.message}
              />
            </div>
            <div className={styles.work}>
              <div>
                <h3 className={cn("h6", styles.title)}>
                  Or show us up to {config.upload.multipleLimit} of your best works
                </h3>
                <h6 className={cn("h5", styles.title, styles.subtitle, styles.dragerText)}>
                  {files.length > 0
                    ? (
                      <>
                        <span>{`${files.length} Uploaded sample${files.length > 1 ? "s" : ""}`}</span>
                        <button className={cn("button button-small button-pink")}
                                onClick={() => setFiles([])}>
                          Clear all
                        </button>
                      </>
                    )
                    : ""
                  }
                </h6>
              </div>
              <div
                className={cn(styles.body, styles.active)}
              >
                <div className={cn("container", styles.container)}>
                  <div className={styles.file}>
                    <input type='file' onChange={updateFile} multiple={true}
                           accept={process.env.REACT_APP_UPLOAD_IMG_FORMATS} />
                    <div className={styles.wrap}>
                      <h6 className={cn("h5", styles.title, styles.subtitle)}>
                        Drag or choose your file to upload
                        ({`max. of ${process.env.REACT_APP_FILE_UPLOAD_LIMIT || "5"} mb`})
                      </h6>
                      <div className={styles.draggerDescription}>
                        <div>
                          <Icon name='upload-file' size='28' />
                        </div>
                        <div>
                          <span
                            className={styles.info}>{`${config.upload.formats?.join(", ").toUpperCase()}. Max ${config.upload.maximumSize}MB.`}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* FIXME: RE-RENDERS */}
              <FilesPreview files={files} />
            </div>
            <TextArea
              className={styles.field}
              label='Briefly tell us about yourself!'
              name='bio'
              value={inputs.bio}
              stateProp={
                addInput("bio", {
                  required: { value: true, message: "Please Describe yourself" },
                  minLength: {
                    value: config.createItem.minBioLength,
                    message: `You need to describe yourself between ${config.createItem.minBioLength} and ${config.createItem.maxBioLength} characters`,
                  },
                  maxLength: {
                    value: config.createItem.maxBioLength,
                    message: `You need to describe yourself between ${config.createItem.minBioLength} and ${config.createItem.maxBioLength} characters`,
                  },
                  setValueAs: setEngValueWithLimit(config.createItem.maxBioLength),
                })
              }
              error={errors.bio?.message} />
          </div>
          {/* Third Section */}
          <div className={styles.container}>
            <div className={cn("row")}>
              <h4 className={cn("h4", styles.title)}>Verification</h4>
              <h6 className={cn("h6", styles.title)}>STEP 3 / 4</h6>
            </div>
            <VerifyTwitter />
          </div>
          <div className={cn("row", styles.row, styles.center)}>
            <button
              type='submit'
              className={cn(
                "button",
                "button-small",
                styles.button,
                styles.confirm,
              )}
              disabled={busy}
            >
              {busy ? <Loader className={styles.c_item} /> : <span>Apply</span>}
            </button>
          </div>
        </form>
        <Modal
          title={'Connect Wallet'}
          visible={visibleModalConnectWallet}
          outerClassName={styles.wallet_modal}
          containerClassName={styles.wallet_modal_container}
          onClose={switchVisibleModalConnectWallet}
        >
          <ConnectWallet onConnected={switchVisibleModalConnectWallet} />
        </Modal>
      </div>
    </>
  );
};

/***
 *
 * @param files:[Object] - files
 * @return {JSX.Element}
 * @constructor
 */
const FilesPreview = ({ files = [] }) => (
  <div className={styles.file_previews}>
    {
      files.map((file, index) => (
        <SourceContainer url={getFilePathBlob(file)} key={index} type={file.type?.split("/")?.[0]} />
      ))
    }
  </div>
);


export default ArtistVerification;
