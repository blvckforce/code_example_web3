import React, { useState } from "react";
import cn from "classnames";
import TwitterErrors from "../../../components/TwitterErros";
import WithInputHeightWrapper from "../../../components/WithInputHeightWrapper";
import { useProfile } from "../../../contexts/profile.context";
import styles from "./VerifyTwitter.module.sass";
import TextInput from "../../../components/TextInput";
import Icon from "../../../components/Icon";
import Loader from "../../../components/Loader";
import { AccountServices } from "../../../services/API";
import Notice from "../../../components/Notice";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { copyToClipboard } from "../../../utils/helpers";
import { getSignature } from "../../../utils/wallet";
import { useGlobalState } from "../../../contexts/Global";

const twitterStatusPattern = /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/gm;

const VerifyTwitter = ({ className, callback }) => {
  const [twitterLoading, setTwitterLoading] = useState(false);
  const { profile, setProfile } = useProfile();
  const { account, web3 } = useGlobalState();
  const {
    register: addInput,
    trigger,
    setError,
    formState: { errors },
    getValues,
    watch,
  } = useForm();

  const inputs = watch();

  const [twitterVerification, setTwitterVerification] = useState({ username: "", verified: false });

  const postTweet = () => {
    if (!profile.isAuthorized)
      return toast.error("Wallet is required before twitter verification");

    window.open(`https://twitter.com/intent/tweet?text=${profile?.account?.address}`, "_blank");
  };
  /**Handler for verifying Twitter handle validity */
  const verifyTweet = async (evt) => {
    evt.preventDefault();

    //Trigger the validity of twitter input once verify account is clicked!
    const validForm = await trigger("twitter", { shouldFocus: true });
    if (!validForm) return;

    const url = getValues("twitter");

    if (!profile.isAuthorized)
      return toast.error("Wallet is required before twitter verification");

    if (!url)
      return toast.error("Kindly paste tweet url");

    setTwitterLoading(true);
    const provider = web3.library;
    if (!provider) {
      toast("Connect wallet to perform this action");
      return;
    }
    const signer = provider.getSigner();
    const signature = await getSignature(true, signer, account);
    if (!signature) return;
    const config = {
      headers: {
        'x-signature': signature
      }
    };
    //validate the username from backend
    const result = await AccountServices.verifyTweet(url, profile.account.address, config);

    setTwitterLoading(false);

    if (result.error) {

      return setError("twitter", {
        type: "notExist",
        message: result.message,
      });
    }

    if (!result.data)
      return setError("twitter", {
        type: "notExist",
        message: "Service Error validating twitter account",
      });


    if (result.data.verified === true && result.data.account) {

      setProfile(prev => ({ ...prev, account: { ...prev.account, ...result.data.account } }));

      setTwitterVerification({ username: result.data.username, verified: true });

      if (typeof callback === "function") callback();
    } else {

      setTwitterVerification({ username: "", verified: false });
      setError("twitter", {
        type: "notExist",
        message: "Error validating twitter account. Confirm you post right tweet url that contain the wallet address",
      });
    }
  };


  const copyAccount = () => {
    copyToClipboard(profile?.account?.address);
    toast.success("Copied!");
  };

  if (!profile?.account?.address)
    return (<Notice message='Connect Wallet to verify twitter' />);
  else
    return (
      <div className={cn(className, styles.container)}>
        <div className={cn("row", styles.row)}>
          <div className={styles.relative}>
            <button onClick={copyAccount} type='button' className={styles.copy}>
              <Icon name='clipboard' size='18' />
            </button>
            <TextInput
              className={styles.field}
              label='Post a public tweet that contains your wallet address'
              type='text'
              placeholder=''
              value={inputs.tweet ? inputs.tweet : profile?.account?.address}
              stateProp={addInput("tweet", { required: true })}
              disabled={true}
            />
          </div>

          <WithInputHeightWrapper>
            <button
              className={cn("button", "button-small", styles.button)}
              type='button'
              onClick={postTweet}
            >
              <div className={cn("row", styles.twitter)}>
                <Icon name='twitter' />
                <span>Tweet</span>
              </div>
            </button>
          </WithInputHeightWrapper>

        </div>
        <div className={cn("row", styles.row)}>
          <TextInput
            className={styles.field}
            label='Paste the URL of your tweet to verify your profile'
            type='text'
            placeholder='Tweet URL'
            value={inputs.twitter}
            stateProp={addInput("twitter", {
              required: true,
              pattern: twitterStatusPattern,
            })}
            error={errors.twitter && <TwitterErrors errors={errors} styles={styles} />}
          />
          <WithInputHeightWrapper withErrors
                                  error={errors.twitter && <TwitterErrors errors={errors} styles={styles} />}>
            <button
              className={cn(
                "button",
                "button-small",
                "button-outline",
                styles.button,
                styles.confirm,
                { [styles.error]: errors.twitter?.type },
              )}
              type='button'
              onClick={verifyTweet}
            >
              <span>Confirm</span>
            </button>
          </WithInputHeightWrapper>
        </div>
        {
          twitterLoading &&
          <div className={styles.twitterVerified}>
            <Loader />
          </div>
        }

        {
          (!twitterLoading && twitterVerification.verified) &&
          <div className={styles.twitterVerified}>
            <Icon name='approved' size='44' />
            <div>{twitterVerification.username}</div>
          </div>
        }
      </div>
    );
};


export default VerifyTwitter;
