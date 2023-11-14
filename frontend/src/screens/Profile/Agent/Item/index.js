import React, { useState } from "react";
import cn from "classnames";
import config from '../../../../config';
import { useProfile } from "../../../../contexts/profile.context";
import { useContract } from '../../../../hooks/useContract';
import styles from "./Item.module.sass";
import ContextMenu from "../../../../components/Overlay/ContextMenu";
import OutsideClickHandler from "react-outside-click-handler";
import MessagePopup from "../../Message";
import Modal from "../../../../components/Modal";
import { dropArtistFromTeam, parseAccount, teamSignedRequest } from "../../../../utils/wallet";
import toast from "react-hot-toast";
import { useGlobalState } from "../../../../contexts/Global";
import Confirmation from "../../../../components/Confirmation";
import Icon from "@mui/material/Icon";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

const AgentProfileItem = ({ team, onIconsClick }) => {
  const agentFee = team.fee || 0;
  const [rangeValue, setRangeValue] = useState(agentFee);
  const [visibleDelete, setVisibleDelete] = useState(false);
  const [visibleRange, setVisibleRange] = useState(false);
  const [confirmModal, setConfirmModal] = useState({});
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const { web3 } = useGlobalState();
  const { GOVContract } = useContract();
  const { profile } = useProfile();

  const onRangeChange = (event) => {

    setRangeValue(event.target.value);
  };

  const artist = { ...team.artist, ...{ account: parseAccount(team.artist?.account) } };

  const actions = [
    EmailOutlinedIcon,
    SettingsOutlinedIcon,
    DeleteOutlinedIcon,
  ];

  const switchShowMessagePopup = () => setShowMessagePopup(prevState => !prevState);
  const closeConfirmModal = () => setConfirmModal({ show: false });


  const iconClicked = (event, index) => {
    if (index === 0) switchShowMessagePopup();

    if (index === 1) setVisibleRange(true);

    if (index === 2) setVisibleDelete(true);

    if (onIconsClick) onIconsClick(event, index);
  };

  const deleteArtist = async () => {
    const provider = web3.library;
    if (!provider) {
      return toast("Connect wallet to perform this action");
    }
    const resp = await dropArtistFromTeam(
      team.id,
    );
    if (resp.status === 200 && !resp.error) {

      setDeleted(true);
    }
  };

  const messageArtist = async (data) => {
    data.account = profile.account.id;
    data.artist = artist.id;

    const provider = web3.library;
    if (!provider) {
      return toast("Connect wallet to perform this action");
    }

    const signer = provider.getSigner();

    setBusy(true);

    const resp = await teamSignedRequest(
      profile.account.address,
      "message",
      "",
      data,
      true,
      signer,
    );
    setBusy(false);

    if (resp && resp.data && !resp.error)
      toast.success("Done");
  };

  const updateArtistFee = async () => {

    let data = { fee: rangeValue };

    const provider = web3.library;
    if (!provider) {
      return toast("Connect wallet to perform this action");
    }

    if (!artist?.account?.address)
      return toast("Error getting artist address");

    // noinspection JSValidateTypes
    const signer = provider.getSigner();

    setBusy(true);

    const resp = await teamSignedRequest(
      profile.account.address,
      "change-fee",
      team.id,
      data,
      true,
      signer,
    );
    setBusy(false);

    if (!resp)
      return toast.error("Error changing fee");

    if (resp.error) {

      setRangeValue(agentFee);
      return;
    }

    if (resp.data) {

      const newFee = resp.data.fee_update;

      //set fee on blockchain
      try {
        setBusy(true);

        // noinspection JSUnresolvedFunction
        await GOVContract.setAgentFee(artist.account.address, newFee.toString());

      } catch (e) {
        toast.error(e.message);
        return;
      } finally {
        setBusy(false);
      }

      toast.success("Update pending artist approval");
      setRangeValue(newFee);
    }
  };

  const rangeFloat = () => {

    let f = (parseFloat(`${rangeValue / MAX}`) * 100);
    console.log(f);
    f = f >= 80 ? f - 15 : f;
    return f + "%";
  };

  const saveNewAgentFee = () => {

    setVisibleRange(false);
    if (agentFee !== rangeValue)
      setConfirmModal({ show: true, option: "range" });
  };

  const deleteButtonHandler = () => {

    setVisibleDelete(false);
    setConfirmModal({ show: true, option: "delete" });
  };

  const confirmSuccessHandler = () => {

    closeConfirmModal();

    if (confirmModal.option === "delete")
      deleteArtist().catch();

    if (confirmModal.option === "range")
      updateArtistFee().catch();
  };

  const confirmCancelHandler = () => {

    closeConfirmModal();

    if (confirmModal.option === "range")
      setRangeValue(agentFee);
  };

  if (deleted || !artist) return null;

  const MIN = config.minAgentFee;
  const MAX = config.maxAgentFee;

  return (
    <>
      <div className={styles.item}>
        <div className={styles.body}>
          <div className={styles.avatar}>
            <img
              src={artist?.account?.avatar || "/images/content/avatar.png"}
              alt='Avatar'
            />
          </div>
          {/*<div className={styles.name}>{artist.first_name + ' ' + artist.last_name}</div>*/}
          <div className={styles.name}>{artist.account?.name || "\"No Name Yet\""}</div>
          <div className={cn("row")}>
            <div className={styles.price}>Sales amount:</div>
            <div
              className={cn("currency", "n2", "small", styles.price)}
              dangerouslySetInnerHTML={{ __html: artist.price }}
            />
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.control}>
            {actions.map((Icon, index) => (
              <button
                className={cn("button-stroke", styles.icon)}
                onClick={(evt) => iconClicked(evt, index)}
                key={index}
              >
                <Icon />
              </button>
            ))}

            {visibleRange && (
              <ContextMenu className={cn(styles.box, styles.range)}>
                <OutsideClickHandler onOutsideClick={() => setVisibleRange(false)}>
                  <div className={cn(styles.menu)}>
                    <h2 className={cn(styles.label, styles.slide)}>
                      Amount fee
                    </h2>
                    <div className={styles.slideContainer}>
                      <span className={styles.current_value} style={{ marginLeft: rangeFloat() }}>
                        {rangeValue}%
                      </span>
                      <input
                        type='range'
                        min={MIN}
                        max={MAX}
                        value={rangeValue}
                        step={MIN}
                        className={styles.slider}
                        onChange={onRangeChange}
                      />
                      <div className={styles.limit}>
                        <span className={styles.rangeValues}>{MIN}%</span>
                        <span className={styles.rangeValues}>{MAX}%</span>
                      </div>
                    </div>
                    <button className='button' onClick={saveNewAgentFee}>Save</button>
                  </div>
                </OutsideClickHandler>
              </ContextMenu>
            )}

            {visibleDelete && (
              <ContextMenu className={styles.box}>
                <OutsideClickHandler
                  onOutsideClick={() => setVisibleDelete(false)}
                >
                  <div className={styles.menu}>
                                            <span className={styles.label}>
                                                Do you really want to remove an artist from the team?
                                            </span>
                    <button
                      className={cn("button button-small", styles.button)}
                      onClick={deleteButtonHandler}
                    >
                      <Icon
                        className={styles.delete}
                        name='delete'
                        size={24}
                      />
                      <span>Delete</span>
                    </button>
                  </div>
                </OutsideClickHandler>
              </ContextMenu>
            )}
          </div>
        </div>

        <Modal
          visible={showMessagePopup}
          onClose={switchShowMessagePopup}
        >
          {
            <MessagePopup
              data={{ email: artist.email }}
              onSubmit={messageArtist}
              busy={busy}
            />
          }
        </Modal>

        <Modal
          visible={confirmModal.show}
          onClose={closeConfirmModal}
        >
          {
            <Confirmation
              onConfirm={confirmSuccessHandler}
              onCancel={confirmCancelHandler}
              body={
                <h5>
                  {confirmModal.option === "delete"
                    ? "Are you sure you want to delete this item?"
                    : `Are you sure you want to update artist fee from ${team.fee == null ? 0 : team.fee}% to ${rangeValue}%? `}
                </h5>
              }
            />
          }
        </Modal>
      </div>
    </>
  );
};

export default AgentProfileItem;
