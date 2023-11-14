import cn from "classnames";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import TextInput from "../../TextInput";
import ModalRow from '../shared/modal-row';
import classes from "./styles.module.scss";
import Modal from "../../Modal";
import { copyToClipboard } from "../../../utils/helpers";
import toast from "react-hot-toast";
import { generateReferralLinkNFT } from "../../../utils/requests";
import Loader from "../../Loader";
import styles from "../../../screens/Profile/ProfileBody/ProfileBody.module.sass";
import config from "../../../config";
import NAVIGATE_ROUTES from "../../../config/routes";

const GenerateBrokerLinkModal = ({ visible, onClose = () => undefined, nftId = 0 }) => {


  const [copied, setCopied] = useState(false);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const cancelToken = useRef(null);

  const copyLink = async () => {
    await copyToClipboard(value);
    setCopied(true);
  };

  const closeModal = () => {
    setCopied(false);
    onClose();
  };
  useEffect(() => {
    (async () => {
      try {
        if (visible && nftId) {
          setLoading(true);

          const currentToken = cancelToken.current;
          if (currentToken) currentToken.cancel();

          cancelToken.current = axios.CancelToken.source();

          const { data } = await generateReferralLinkNFT(nftId, cancelToken.current.token);
          if (data?.ref) {
            setValue(`${config.host}${NAVIGATE_ROUTES.ITEM_PAGE}/${nftId}?ref=${data?.ref}`);
          } else {
            throw new Error('Server did not return referral link');
          }
        }
      } catch (error) {
        toast.error('Refresh the page and try again');
      } finally {
        cancelToken.current = null;
        setLoading(false);
      }
    })();
  }, [visible, nftId]);

  return (
    <Modal visible={visible} onClose={closeModal} title={"Generate broker link"} outerClassName={classes.outer}>

      <div className={classes.body}>
        <ModalRow>
          <p>Earn up to 10% residual bonus on all referred stakes for as long as they are active. Referred users must
            use
            your link when navigating to the site. Once they stake, that is the action that forever registers that
            wallet
            under yours. For complete details, view this section of the white paper.</p>
        </ModalRow>

        {
          loading === true
          ? (
            <Loader className={styles.loader} />
          )
          : (
            <>
              <ModalRow>
                <TextInput label={"Receiver address"} value={value} readOnly />
              </ModalRow>

              <ModalRow className={classes.center}>
                <button className={cn("button", classes.btn, copied && classes.copy)}
                        onClick={!copied ? copyLink : closeModal}>
                  {
                    copied
                      ? (
                        <>
                          <img src='/images/svg/Tick Square.svg' alt='tick' aria-hidden />
                          <span>Copied</span>
                        </>
                      )
                      : "Copy broker link"
                  }
                </button>
              </ModalRow>
            </>
        )}
      </div>
    </Modal>
  );
};

export default GenerateBrokerLinkModal;
