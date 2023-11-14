import { isEmpty, isNull } from 'lodash-es';
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import cn from "classnames";
import SEO from '../../components/SEO';
import NAVIGATE_ROUTES from "../../config/routes";
import { useProfile } from "../../contexts/profile.context";
import { useContract } from "../../hooks/useContract";
import styles from "./Invitation.module.sass";
import TextInput from "../../components/TextInput";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import { AgentServices } from "../../services/API";
import Modal from "../../components/Modal";
import ConnectWallet from "../../components/ConnectWallet";
import { useGlobalState } from "../../contexts/Global";
import toast from "react-hot-toast";
import { parseAccount } from "../../utils/wallet";
import Notice from "../../components/Notice";


const Invitation = () => {
  const { web3 } = useGlobalState();
  const { GOVContract } = useContract();
  const { profile, setProfile, logout } = useProfile();

  const [visibleModalConnectWallet, setVisibleModalConnectWallet] = useState(false);
  const [visibleModalAccept, setVisibleModalAccept] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [invite, setInvite] = useState({});
  const [agentFee, setAgentFee] = useState();
  const [busy, setBusy] = useState(false);

  const { token } = useParams();
  const history = useHistory();

  const handleWallet = async () => setVisibleModalConnectWallet(true);

  const accept = () => {
    setVisibleModalAccept(false);
    return updateInvite(true);
  };
  const acceptModal = () => setVisibleModalAccept(true);

  const deny = () => updateInvite(false);

  const updateInvite = async (isAccepted = false) => {

    let PATH_TO_REDIRECT = null;

    try {
      const data = { code: token };

      if (!profile?.isAuthorized) {
        return toast.error("Login is required to perform this action.");
      }

      const provider = web3.library;

      if (!provider) {
        toast("Connect wallet to perform this action");
        return;
      }

      setBusy(true);

      const { data: invite } = await AgentServices.getInviteByToken(token);

      if (isEmpty(invite)) {
        return toast.error("Invite code is invalid");
      }

      if (!isNull(invite.status)) {
        return toast.error("Invite has already been accepted or rejected");
      }

      if (isAccepted === false) {
        const { error } = await AgentServices.denyAgent(data);
        if (error) {
          toast.error(JSON.stringify(error));
        } else {
          PATH_TO_REDIRECT = NAVIGATE_ROUTES.PROFILE;
        }
      } else {

        const params = [
          // address agent
          invite.agentAddress,
          // uint256 invitationId,
          invite.invitationId,
          // bool acceptFee
          true,
        ];

        const transaction = await GOVContract.registerAsAgentArtist(...params);
        await transaction.wait();

        const resp = await AgentServices.acceptAgent(data);
        if (resp.error) {
          toast.error(JSON.stringify(resp.error));
        } else {
          setProfile(prev => ({ ...prev, ...{ account: parseAccount(resp.data) } }));
          PATH_TO_REDIRECT = NAVIGATE_ROUTES.PROFILE;
        }
      }
    } catch (e) {
      if (e?.code === 4001) {
        return toast.error("You have denied the transaction");
      }
      toast.error("Smt went wrong");
      console.error("invite", e.message, e);
      PATH_TO_REDIRECT = null;
    } finally {
      setBusy(false);
      if (PATH_TO_REDIRECT) history.push(PATH_TO_REDIRECT);
    }
  };

  useEffect(() => {

    //verify the registration token validity
    const verifyToken = async () => {

      const { data } = await AgentServices.getInvite(token);

      if (!data)
        return setTokenError("Invalid invite token");

      if (data.error)
        return setTokenError(data.message);

      if (data.account)
        data.account = parseAccount(data.account);

      setInvite(data);
      setAgentFee(data.fee || data?.account?.agent?.default_fee || 0);
    };
    if (token)
      verifyToken().catch();

  }, [token]);

  if (tokenError)
    return <Notice action={<Link to='/' className={cn("button button-outline")}>Go Home</Link>}
                   message={tokenError} className={styles.notice} />;


  const switchVisibleModalConnectWallet = () => setVisibleModalConnectWallet(prevState => !prevState);

  return (
    <>
      <SEO title={'Invitation'} url={window.location.href} />
      <div className={cn("container", styles.section)}>

        {
          invite.status ?
            <>
              <div className={styles.container}>
                <div className={cn("row")}>
                  <h4 className={cn("h4", styles.title)}>Invite has already been accepted or rejected!</h4>
                </div>
              </div>
            </>
            :
            <>
              <div className={styles.head}>
                <h1 className={cn("h2", styles.title)}>Work With an Agent </h1>
                <h6 className={cn("h5", styles.title, styles.sub_title)}>
                  Work with an agent directly on the platform so they can help you produce and market your creations.
                </h6>
              </div>

              {/* First Section */}
              <div className={styles.container}>
                <div className={cn("row")}>
                  <div>
                    <h4 className={cn("h4", styles.title)}>Wallet Connection</h4>
                    <h6 className={cn("h5", styles.title, styles.subtitle)}>
                      Firstly, you should connect your Crypto Wallet to our platform
                    </h6>
                  </div>
                  <h6 className={cn("h6", styles.title)}>STEP 1 / 2</h6>
                </div>

                <div className={cn("row", styles.row, styles.wallet)}>
                  <TextInput
                    className={styles.field}
                    disabled={true}
                    label='Wallet'
                    name='wallet'
                    type='text'
                    value={profile.isAuthorized ? profile?.account?.address : ""}
                    placeholder='Here will be your wallet number'
                  />

                  {profile.isAuthorized ?
                    <button
                      className={cn("button", "button-small button-pink", styles.button)}
                      type='button'
                      onClick={logout}
                    >
                      Disconnect
                    </button>

                    :
                    <button
                      className={cn("button", "button-small", styles.button)}
                      type='button'
                      onClick={handleWallet}
                    >
                      Connect wallet
                    </button>
                  }
                </div>

                <div className={styles.readmore}>
                  <h5>
                    Don’t know how to create wallet?!
                    <br /> <a className={styles.more} href='#'>Read more</a> about it!
                  </h5>
                </div>
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
                    Agents Fees - {agentFee}%
                  </div>
                  <div className={styles.actions}>
                    {busy ? <Loader className={styles.c_item} /> :
                      <>
                        <StatusButton disabled={busy} className={cn("button-pink", styles.gap)}
                                      clickAction={deny} text='Deny' />

                        <StatusButton disabled={busy} clickAction={acceptModal} text='Accept' />
                      </>
                    }
                  </div>
                </div>
              }

              <Modal
                title={'Connect Wallet'}
                visible={visibleModalConnectWallet}
                outerClassName={styles.wallet_modal}
                containerClassName={styles.wallet_modal_container}
                onClose={switchVisibleModalConnectWallet}
              >
                <ConnectWallet onConnected={switchVisibleModalConnectWallet} />
              </Modal>
              <Modal
                visible={visibleModalAccept}
                onClose={() => setVisibleModalAccept(false)}
              >
                {busy ? <Loader className={styles.c_item} /> :
                  <>
                    <div className={styles.container}>
                      <div className={styles.body}>
                        <div>
                          If you confirm this invite, then the current agreement with the agent will be canceled. If you
                          are sure, then confirm this action, or close this window.
                        </div>
                        <br />
                        <div className={styles.menu}>
                          <StatusButton disabled={busy} clickAction={accept} text='Accept' />
                        </div>
                      </div>
                    </div>
                  </>
                }
              </Modal>
            </>
        }

      </div>
    </>
  );
};

const StatusButton = ({ disabled, className, clickAction, text }) => (

  <button disabled={disabled} className={cn("button button-small", className)} onClick={clickAction}>
    {text}
  </button>
);

export default Invitation;
