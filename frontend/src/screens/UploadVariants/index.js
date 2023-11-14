import React from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import SEO from '../../components/SEO';
import config from "../../config";
import NAVIGATE_ROUTES, { UPLOAD_MODES } from '../../config/routes';
import { useProfile } from "../../contexts/profile.context";
import styles from "./UploadVariants.module.sass";
import Control from "../../components/Control";
import Connect from "../../components/Connect";
import { useGlobalState } from "../../contexts/Global";
import toast from "react-hot-toast";

const breadcrumbs = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Upload Item",
  },
];

const items = [
  {
    url: `${NAVIGATE_ROUTES.UPLOAD_DETAILS}/${UPLOAD_MODES.SINGLE}`,
    buttonText: "Single",
    image: "/images/content/upload-single.svg",
  },
  // {
  //     url: `${NAVIGATE_ROUTES.UPLOAD_DETAILS}/${UPLOAD_MODES.MULTIPLE}`,,
  //     buttonText: "Multiple",
  //     image: "/images/content/upload-multiple.svg"
  // },
];

const Upload = () => {
  const { account } = useGlobalState();
  const { profile } = useProfile();
  const connected = account && profile?.isAuthorized;

  return (
    <>
      <SEO title={'Upload variants'} url={window.location.href} />
      <div className={styles.page}>
        <Control className={styles.control} item={[]} />

        <div className={cn("section-pt80", styles.section)}>
          <div className={cn("container", styles.container)}>
            <div className={styles.top}>
              <h1 className={cn("h3", styles.title)}>Create new item</h1>
              {connected &&
                <div className={styles.info}>
                  Choose <span>“Single”</span> if you want your collectible to be
                  one of a kind or <span>“Multiple”</span> if you want to sell one
                  collectible multiple times
                </div>
              }
            </div>
            <div className={styles.list}>

              {
                !connected &&
                <Connect message='You need to connect your wallet first to create an item' />
              }

              {connected && items?.map((x, index) => (
                <Link to={x.url} className={styles.item} key={index}>
                  <div className={styles.preview}>
                    <img src={x.image} alt='Upload' />
                  </div>
                  <div className={styles.button}>
                    {x.buttonText}
                  </div>
                </Link>
              ))}
              <Link to={config.upload.multiple ? `/${UPLOAD_MODES.MULTIPLE}` : "#"} className={styles.item}
                    onClick={() => !config.upload.multiple && toast.error("Coming soon...")}>
                <div className={styles.preview}>
                  <img src='/images/content/upload-multiple.svg' alt='Upload' />
                </div>
                <div className={styles.button}>
                  Multiple
                </div>
              </Link>
            </div>
            <div className={styles.note}>
              We do not own your private keys and cannot access your funds without
              your confirmation.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upload;
