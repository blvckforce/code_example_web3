import { find } from 'lodash-es';
import React, { useEffect, useState } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import OutsideClickHandler from "react-outside-click-handler";
import { socialLinkIcon } from '../../utils/components/socialLinkIcon';
import styles from "./Details.module.sass";
import NAVIGATE_ROUTES from "../../config/routes";
import { useProfile } from "../../contexts/profile.context";
import Icon from "../../components/Icon";
import Report from "../../components/Report";
import Modal from "../../components/Modal";
import { copyToClipboard, printWallatAddress } from "../../utils/helpers";
import API from "../../services/API";

const Details = ({
                   className, details, canEdit, editBtnText = "Edit",
                   canApproved = false, editLink, onEdit, children,
                 }) => {
  const [followingID, setFollowingID] = useState(0);

  const [visibleShare, setVisibleShare] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [visibleCopied, setVisibleCopied] = useState(false);
  const [visibleModalReport, setVisibleModalReport] = useState(false);
  const { profile } = useProfile();
  const [social, setSocial] = useState([]);

  const walletAddress = details.address;
  const bio = details.bio;

  const profileUrl = `${window.location.host}${NAVIGATE_ROUTES.PROFILE}/${details?.id}`;

  const copyWalletAddress = async () => {

   await copyToClipboard(walletAddress);
    setVisibleCopied(true);
    setTimeout(function() {
      setVisibleCopied(false);
    }, 1000);
  };

  const toggleShare = () => {
    setShowMoreMenu(false);
    setVisibleShare(!visibleShare);
  };

  const toggleMenu = () => {
    setVisibleShare(false);
    setShowMoreMenu(!showMoreMenu);
  };

  const toggleFollow = async (evt) => {
    evt.preventDefault();
    //follow: is the person to follow but for testing let follow
    //the logged in user
    const data = { account: details.id, follower: profile.account.id };
    const resp = followingID
      ? await API.unfollow(followingID)
      : await API.follow(data);

    if (resp.data && !resp.error)
      setFollowingID(followingID ? 0 : resp.data.id);
  };

  useEffect(() => {

    setSocial([{ url: details?.twitter, title: "twitter" }]);

    details.socials?.forEach((item) => {
      setSocial((prev) => [...prev, item]);
    });

    const checkIfFollowing = async () => {
      if (followingID !== 0) return;

      const resp = await API.followers(
        `?account=${details.id}&follower=${profile.account.id}`,
      );
      if (resp && resp.data && resp.data.length)
        setFollowingID(resp.data[0]?.id);
    };

    if (profile?.account?.id && details?.id)
      checkIfFollowing().catch();

  }, [details, profile]);

  return (
      <>
        <div className={cn(styles.user, className)}>
          <div className={styles.avatar}>
            <img
                src={details?.avatar || "/images/content/avatar.png"}
                alt='Avatar'
            />
            {profile.isApprovedArtist(details) &&
            <span className={styles.status}>
              <Icon name='approved' size='30' />
            </span>
          }
        </div>


        {details?.agent && (
          <div className={styles.agent}>
            <button className={cn("button", "button-small", styles.button)} onClick={null}>
              <span className={styles.label}>Agent</span>
              {details?.agent?.verified && (
                <Icon name='verified_account' size={24} />
              )}
            </button>
          </div>
        )}

        {
          <h2 className={cn("h2", styles.title)}>
            {/*{`${details?.artist?.first_name || ''} ${details?.artist?.last_name || ''}`}*/}
            {details?.name ? details.name : ""}
          </h2>
        }


        <span className={styles.social}>{find(social, ({ title }) => title === "twitter")?.url}</span>

        {walletAddress &&
          <>
            <button className={styles.code} onClick={copyWalletAddress}>
                            <span className={styles.number}>
                                {printWallatAddress(walletAddress)}
                            </span>
              <Icon className={styles.copy} name='clipboard' size='18' />
            </button>
            <span
              className={cn(styles.copied, {
                [styles.hide]: !visibleCopied,
                "shake": visibleCopied,
              })}
            >Copied !</span>
          </>
        }

        {children}

        <div className={styles.bio}>
          {bio && (`${bio}`.split("\n").map((text, index) => (
            <div key={index}>{text ?? ""}</div>
          )))}
        </div>

        {social && social.map((social, index) => {

          const url = social?.url?.replace(/^http(s)?\/\//, "");
          if (!url) return null;


          let prefix = `https://`;

          let Image = () => null;
          // twitter url is not a link
          // twitter url pattern is @XXX
          if (social?.title === "twitter") {
            prefix += 'twitter.com';
            Image = () => socialLinkIcon(social.title);
          } else {
            Image = () => socialLinkIcon(url);
          }

          return (
            <a href={prefix + '/' + social.url} key={index}
               className={styles.social} target={'_blank'}
               rel={"noopener noreferrer"}>
              <Image />
              <span>{url}</span>
            </a>
          );
        })}

        {details?.id &&
          <OutsideClickHandler
            onOutsideClick={() => {
              setShowMoreMenu(false);
              setVisibleShare(false);
            }}
          >
            <div className={styles.control}>
              <div className={styles.btns}>
                {canEdit && (
                  <>
                    {(!profile.isApprovedArtist(details) && canApproved && !details?.artist?.first_name) &&
                      <Link
                        className={cn("button-stroke button-small", styles.button, styles.verify)}
                        to={NAVIGATE_ROUTES.ARTIST_VERIFICATION}
                      >
                        <span>Become a Verified Artist</span>
                        <Icon name='check' size='16' />
                      </Link>
                    }
                    {editLink ?
                      <Link
                        className={cn("button-stroke button-small", styles.button)}
                        to={editLink}
                      >
                        <span>{editBtnText}</span>
                        <Icon name='edit' size='16' />
                      </Link>
                      :
                      <button
                        className={cn("button-stroke button-small", styles.button)}
                        onClick={onEdit}
                      >
                        <span>{editBtnText}</span>
                        <Icon name='edit' size='16' />
                      </button>
                    }
                  </>
                )}

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

              <div className={cn(styles.box, { [styles.active]: visibleShare })}>
                <div className={styles.stage}>Share link to this page</div>
                <div className={styles.share}>
                  <TwitterShareButton
                    className={styles.direction}
                    url={profileUrl}
                  >
                   <span>
                     <Icon name='twitter' size='20' />
                   </span>
                  </TwitterShareButton>
                  <FacebookShareButton
                    className={styles.direction}
                    url={profileUrl}
                  >
                    <span>
                      <Icon name='facebook' size='20' />
                    </span>
                  </FacebookShareButton>
                </div>
              </div>

              <div className={cn(styles.box, { [styles.active]: showMoreMenu })}>
                <div className={styles.menu}>
                  <button
                    className={cn(
                      "button-circle-stroke button-small",
                      styles.button,
                    )}
                    onClick={() => setVisibleModalReport(true)}
                  >
                    <Icon name='report' size='20' />
                  </button>
                  <button
                    className={cn(
                      "button button-small",
                      { [styles.active]: followingID },
                      { "button-pink": followingID },
                      styles.button,
                    )}
                    onClick={toggleFollow}
                  >
                    <span>Follow</span>
                    <span>Unfollow</span>
                  </button>
                </div>
              </div>
            </div>
          </OutsideClickHandler>
        }
      </div>
      <Modal
        title={'Report'}
        visible={visibleModalReport}
        onClose={() => setVisibleModalReport(false)}
      >
        <Report
          type='account'
          typeId={details.id}
          onCancel={() => setVisibleModalReport(false)}
        />
      </Modal>
    </>
  );
};

export default Details;
