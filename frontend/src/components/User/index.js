import React, { useEffect, useState } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import { useProfile } from "../../contexts/profile.context";
import useModalVisibility from '../../hooks/useModalVisibility';
import API from "../../services/API";
import { copyToClipboard } from "../../utils/helpers";
import Icon from "../Icon";
import Image from "../Image";
import Modal from "../Modal";
import Report from "../Report";
import styles from "./User.module.sass";

// import { isStepDivisible } from "react-range/lib/utils";

const shareUrlFacebook = "https://ui8.net";
const shareUrlTwitter = "https://ui8.net";

const User = ({ className, agent, type }) => {
  const [isFollow, setFollow] = useState(false);

  const [visibleShare, setVisibleShare] = useState(false);
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [visibleCopied, setVisibleCopied] = useState(false);

  const { visible: visibleModalReport, switchVisible: switchVisibleModalReport } = useModalVisibility();

  const { profile } = useProfile();
  const [social, setSocial] = useState([]);

  // const walletAddress = "0xc4c16a645...b21a";

  const account = profile.account;
  const walletAddress = account.address;
  const bio = account.bio;
  const loggedInAddress = profile?.account?.address;

  const copyWalletAddress = async () => {
    await copyToClipboard(walletAddress);
    setVisibleCopied(true);
    setTimeout(function() {
      setVisibleCopied(false);
    }, 1000);
  };
  const toggleShare = () => {
    setVisibleMenu(false);
    setVisibleShare(!visibleShare);
  };
  const toggleMenu = () => {
    setVisibleShare(false);
    setVisibleMenu(!visibleMenu);
  };

  const toggleFollow = async (evt) => {
    evt.preventDefault();
    //follow: is the person to follow but for testing let follow
    //the logged in user
    const data = { follower: loggedInAddress, follow: loggedInAddress };
    const result = isFollow ? await API.unfollow(data) : await API.follow(data);
    // if (result.data) setFollow(!isFollow);
    console.log(result?.data ?? result.error);
  };
  useEffect(() => {

    //set Social links
    setSocial([{ url: profile?.account?.twitter, title: "twitter" }]);
    profile.account.socials?.forEach((item) => {
      setSocial((prev) => [...prev, item]);
    });

    //follow(the last parameter): is the person to follow but for testing let follow
    //the logged in user
    const checkIfFollow = async () => {
      const result = await API.isFollow(loggedInAddress, loggedInAddress);
      if (result?.data != null) setFollow(result.data);
      console.log(result?.data ?? result.error);
    };

    checkIfFollow().catch();
  }, [isFollow, loggedInAddress, profile?.account.socials, profile?.account?.twitter]);

  return (
    <>
      <div className={cn(styles.user, className)}>
        <div className={styles.avatar}>
          <img
            src={profile.account?.avatar || "/images/content/avatar.png"}
            alt='Avatar'
          />
        </div>

        {agent && (
          <div className={styles.agent}>
            <button className={cn("button", styles.button)} onClick={null}>
              <span className={styles.label}>Agent</span>
              <Image src='/images/content/verified_account.png' />
            </button>
            <h1 className={cn("h4", styles.title)}>{profile.account.name}</h1>
          </div>
        )}

        <button className={styles.code} onClick={copyWalletAddress}>
          <span className={styles.number}>{walletAddress}</span>
          <Icon className={styles.copy} name='clipboard' size='18' />
        </button>
        <span
          className={cn(styles.copied, {
            [styles.hide]: !visibleCopied,
            "shake": visibleCopied,
          })}
        >
          Copied !
        </span>
        <div className={styles.bio}>
          {`${bio}`.split("\n").map((text, index) => (
            <div key={index}>{text}</div>
          ))}
        </div>
        {/* <div> */}
        {type !== "collection" && social.map((social, index) => {
          let image = <Icon className={styles.icon} name='globe' />;
          let fill = undefined;
          const url = social?.url?.replace("https://", "");
          if (social?.title === "twitter") {
            image = (
              <Image
                className={styles.icon}
                src='/images/socials/twitter.png'
              />
            );
          }
          return (
            <span key={index} className={styles.social}>
              {image}
              <span>{url}</span>
            </span>
          );
        })}
        {/* </div> */}
        <div className={styles.control}>
          {!agent && (
            <div className={styles.btns}>
              {type !== "collection" && <Link
                className={cn("button-stroke button-small", styles.button)}
                to='account-settings/profile'
              >
                <span>Edit profile</span>
                <Icon name='edit' size='16' />
              </Link>}

              <button
                className={cn(
                  "button-circle-stroke button-small",
                  { [styles.active]: visibleShare },
                  styles.button,
                )}
                onClick={toggleShare}
              >
                <Icon name='share' size='20' />
              </button>
              <button
                className={cn(
                  "button-circle-stroke button-small",
                  styles.button,
                )}
                onClick={toggleMenu}
              >
                <Icon name='more' size='20' />
              </button>
            </div>
          )}
          {/* <div className={styles.btns}>
            <Link
              className={cn("button-stroke button-small", styles.button)}
              to="account-settings/profile"
            >
              <span>Edit profile</span>
              <Icon name="edit" size="16" />
            </Link>

            <button
              className={cn(
                "button-circle-stroke button-small",
                { [styles.active]: visibleShare },
                styles.button
              )}
              onClick={toggleShare}
            >
              <Icon name="share" size="20" />
            </button>
            <button
              className={cn("button-circle-stroke button-small", styles.button)}
              onClick={toggleMenu}
            >
              <Icon name="more" size="20" />
            </button>
          </div> */}
          <div className={cn(styles.box, { [styles.active]: visibleShare })}>
            <div className={styles.stage}>Share link to this page</div>
            <div className={styles.share}>
              <TwitterShareButton
                className={styles.direction}
                url={shareUrlTwitter}
              >
                <span className={styles.icon}>
                  <Icon name='twitter' size='20' />
                </span>
              </TwitterShareButton>
              <FacebookShareButton
                className={styles.direction}
                url={shareUrlFacebook}
              >
                <span className={styles.icon}>
                  <Icon name='facebook' size='20' />
                </span>
              </FacebookShareButton>
            </div>
          </div>
          <div className={cn(styles.box, { [styles.active]: visibleMenu })}>
            <div className={styles.menu}>
              <button
                className={cn(
                  "button-circle-stroke button-small",
                  styles.button,
                )}
                onClick={switchVisibleModalReport}
              >
                <Icon name='report' size='20' />
              </button>
              <button
                className={cn(
                  "button button-small",
                  { [styles.active]: isFollow },
                  styles.button,
                )}
                onClick={toggleFollow}
              >
                <span>Follow</span>
                <span>Unfollow</span>
              </button>
              {/* <button
                className={cn(
                  "button button-small",
                  { [styles.active]: visible },
                  styles.button
                )}
                onClick={() => setVisible(!visible)}
              >
                <span>Follow</span>
                <span>Unfollow</span>
              </button> */}
            </div>
          </div>
        </div>
      </div>
      <Modal
        title={'Report'}
        visible={visibleModalReport}
        onClose={switchVisibleModalReport}
      >
        <Report
          account={account}
          onCancel={switchVisibleModalReport}
        />
      </Modal>
      {/* <Modal
        visible={visibleModalReport}
        onClose={() => setVisibleModalReport(false)}
      >
        <Report />
      </Modal> */}
    </>
  );
};

export default User;
