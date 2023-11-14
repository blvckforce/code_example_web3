import React, { useEffect, useState } from "react";
import cn from "classnames";
import { useProfile } from "../../../../contexts/profile.context";
import { useContract } from '../../../../hooks/useContract';
import styles from "./Agency.module.sass";
import toast from "react-hot-toast";
import Icon from "../../../../components/Icon";
import Modal from "../../../../components/Modal";
import { AgentServices } from "../../../../services/API";
import Image from "../../../../components/Image";
import { useGlobalState } from "../../../../contexts/Global";
import OutsideClickHandler from "react-outside-click-handler";
import ContextMenu from "../../../../components/Overlay/ContextMenu";
import MessagePopup from "../../Message";
import Confirmation from "../../../../components/Confirmation";

import CreatedNotification, { NotificationType } from "../../Notification";
import { acceptAgentFee, dropAgentFromTeam, parseAccount, teamSignedRequest } from "../../../../utils/wallet";

const Agency = ({ profileDetails }) => {

  const [showLeaveAgent, setShowLeaveAgent] = useState(false);
  const [showMessageAgent, setShowMessageAgent] = useState(false);
  const [showModalFeeUpdate, setShowModalFeeUpdate] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");

  const [requesting, setRequesting] = useState(false);

  const { web3 } = useGlobalState();
  const { GOVContract } = useContract();
  const { profile } = useProfile();
  const [busy, setBusy] = useState(false);
  const [leaved, setLeaved] = useState(false);
  const [agent, setAgent] = useState({});
  const [feeUpdate, setFeeUpdate] = useState(profileDetails?.team?.fee_update);
  const [fee, setFee] = useState(profileDetails?.team?.fee);

  const STATUS = { reject: "rejected", accept: "accepted" };

  const onLeaveAgentHandler = async () => {

    const provider = web3.library;
    if (!provider) {
      return toast("Connect wallet to perform this action");
    }

    setRequesting(true);
    try {
      if (!profileDetails.artist?.team) throw new Error("Team not found, do not worry, its not your fault.");

      await GOVContract?.acceptAgentFee(agent.address, false);

      const resp = await dropAgentFromTeam(profileDetails.artist.team?.id);

      if (!resp.error) {

        toast.success("Bye !");
        setLeaved(true);
      }

    } catch (error) {

      console.log(error);
      toast.error(error.message);
    } finally {
      setRequesting(false);
    }
  };

  const onMessageAgentHandler = async (data) => {

    data.account = profile.account.id;

    const provider = web3.library;
    if (!provider) {
      return toast("Connect wallet to perform this action");
    }

    setBusy(true);

    const signer = provider.getSigner();
    const resp = await teamSignedRequest(
      profile.account.address,
      "messageAgent",
      "",
      data,
      true,
      signer,
    );
    setBusy(false);

    if (resp && !resp.error && resp.data)
      toast.success("Done");
  };

  const confirmFeeUpdate = (status) => {

    setPendingStatus(status);
    switchShowModalFeeUpdate();
  };

  const updateFee = async () => {

    const provider = web3.library;
    if (!provider) {
      return toast("Connect wallet to perform this action");
    }

    // const signer = provider.getSigner();
    // const resp = await teamSignedRequest(
    //   profile.account.address,
    //   "update-fee",
    //   profileDetails?.team?.id,
    //   { status: pendingStatus },
    //   true,
    //   signer,
    // );

    const resp = await acceptAgentFee({
      email: profile.email,
      fee: profileDetails?.team?.fee_update,
      invitationId: 0,
    });

    if (resp && !resp.error && resp.data) {

      //update on blockchain
      try {

        if (STATUS.accept === pendingStatus)
          await GOVContract.acceptAgentFee(agent.address);

      } catch (e) {

        toast.error(e.message);
        return;
      }

      setFeeUpdate(null);
      setFee(resp?.data?.fee);
    }
  };

  useEffect(() => {

    const getAgentDetails = async () => {

      const { data: agent } = await AgentServices.getAgentAccount(profileDetails.artist.team.agent.id);

      if (agent && !agent.error)
        setAgent(parseAccount(agent.account) || {});
    };

    if (profileDetails?.id)
      setFeeUpdate(profileDetails?.artist?.team?.fee_update);

    if (profileDetails?.artist?.team?.agent?.accountId) {
      getAgentDetails().catch();
      setFee(profileDetails.artist.team.fee);
    } else
      setAgent({});
  }, [profileDetails, profile]);

  const switchShowModalFeeUpdate = () => setShowModalFeeUpdate(prevState => !prevState);
  const switchShowLeaveAgent = () => setShowLeaveAgent(prevState => !prevState);
  return (
    <>
      {(agent?.id && !leaved && profileDetails?.artist) && (
        <div className={cn("row", styles.agent_tab)}>
          <div className={styles.agent_tab_details}>
            <span>Agent:</span>
            <Image src={agent?.avatar} alt={'agent avatar'} />
            <span className={styles.name}>{agent?.name}</span>
          </div>
          <div>
            <span>Fees:</span>
            <span className={styles.name}>{fee ?? 0}%</span>
          </div>

          {
            <div>
              <button
                className={cn("button-no-outline")}
                onClick={switchShowLeaveAgent}
                disabled={requesting}
              >
                <Icon name='close' size='16' />
              </button>

            </div>
            // <button
            //   className={cn("button-no-outline", styles.button)}
            //   onClick={switchShowAgentMenu}
            // >
            //   <Icon name='more' size='20' />
            // </button>
          }

        </div>
      )}

      {feeUpdate && (
        <CreatedNotification
          type={NotificationType.fee_update}
          text={`You have a pending fee update to address. Fee has been updated by agent from ${profileDetails?.team?.fee}% to ${profileDetails?.team?.fee_update}%.`}
          onNegativeClick={() => confirmFeeUpdate(STATUS.reject)}
          onSuccessClick={() => confirmFeeUpdate(STATUS.accept)}
        />
      )}
      <Modal
        visible={showMessageAgent}
        onClose={() => setShowMessageAgent(false)}
      >
        {
          <MessagePopup
            data={{ email: agent?.email }}
            onSubmit={onMessageAgentHandler}
            busy={busy}
          />
        }
      </Modal>
      <Modal visible={showLeaveAgent} onClose={switchShowLeaveAgent}>
        {
          <Confirmation
            body='Are you sure you want to leave this Agent?'
            onConfirm={() => {
              switchShowLeaveAgent();
              onLeaveAgentHandler().catch();
            }}
            onCancel={switchShowLeaveAgent}
          />
        }
      </Modal>
      <Modal visible={showModalFeeUpdate} onClose={switchShowModalFeeUpdate}>
        {
          <Confirmation
            body={`Are you sure you want to ${pendingStatus} the fee update to ${profileDetails?.team?.fee_update}% from ${profileDetails?.team?.fee}% ? `}
            onConfirm={() => {
              switchShowModalFeeUpdate();
              updateFee().catch();
            }}
            onCancel={switchShowModalFeeUpdate}
          />
        }
      </Modal>
    </>
  );
};

// temporarily disabled
// eslint-disable-next-line no-unused-vars
const AgentMenu = ({ showAgentMenu, setShowAgentMenu, setShowLeaveAgent, setShowMessageAgent }) => {
  return (

    <ContextMenu
      className={styles.context_menu}
      visibleMenu={showAgentMenu}
    >
      <OutsideClickHandler
        onOutsideClick={() => setShowAgentMenu(false)}
        disabled={!showAgentMenu}
      >
        {[
          { key: "leave", label: "Leave this agent", icon: "shield_fail" },
          { key: "message", label: "Text message", icon: "message" },
        ].map((item) => (

          <div className={cn("row")} key={item.key}>
            <button
              className={cn("button-no-outline", "button-hover", styles.btn)}
              onClick={() =>
                item?.key === "leave"
                  ? setShowLeaveAgent(true)
                  : setShowMessageAgent(true)
              }
            >
              <Icon name={item.icon} size={28} className={item.key} />
              <span className={styles.label}>{item.label}</span>
            </button>
          </div>
        ))}
      </OutsideClickHandler>
    </ContextMenu>
  );
};

export default Agency;
