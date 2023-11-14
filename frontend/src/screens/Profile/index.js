import { toNumber } from 'lodash-es';
import React, { useEffect, useState } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import SEO from '../../components/SEO';
import config from "../../config";
import NAVIGATE_ROUTES, { NAVIGATE_PARAMS } from "../../config/routes";
import { useProfile } from "../../contexts/profile.context";
import { useContract } from "../../hooks/useContract";
import styles from "./Profile.module.sass";

import { useGlobalState } from "../../contexts/Global";
import { getUserByID, updateUserProfile } from "../../utils/wallet";
import Notice from "../../components/Notice";
import { useParams } from "react-router";
import ProfileBody from "./ProfileBody";

import Modal from "../../components/Modal";
import NewArtist from "./Agent/NewArtist";
import { AgentServices } from "../../services/API";
import Icon from "../../components/Icon";
import Cover from "../../components/Cover";
import Details from "../../components/Details";
import Agency from "./User/Agency";

const Profile = ({ tab }) => {
  const { account } = useGlobalState();
  const { profile, setProfile } = useProfile();
  const { profileID } = useParams();
  const { GOVContract } = useContract();

  const [profileDetails, setProfileDetails] = useState({});

  const isMyProfile = profileDetails?.id === profile?.account?.id;
  const canEdit = profile?.isAuthorized && profileDetails?.id === profile?.account?.id;


  const saveCoverPhoto = async (formData, sign, signer, content) => {
    const profileUpdate = await updateUserProfile(
      profileDetails.address,
      formData,
      sign,
      signer,
      content,
    );

    if (profileUpdate && profileUpdate.account) {
      setProfile({ ...profile, ...profileUpdate });
    }
  };

  useEffect(() => {

    const getUserDetails = async () => {

      let userDetails = {};
      let fetched = false;

      if (!profileID)
        userDetails = profile.account;

      if (profileID) {

        if (profile?.isAuthorized && profile.account?.id === profileID)
          userDetails = profile.account;

        else {

          userDetails = await getUserByID(profileID);
          fetched = true;
        }
      }

      if (fetched && (!userDetails || !Object.keys(userDetails).length))
        userDetails = null;

      setProfileDetails(userDetails);
    };

    getUserDetails().catch(console.error);

  }, [profileID, profile]);


  if (!profileDetails)
    return <>
      <SEO title={'Profile'} url={window.location.href} />
      <Notice message={"Profile Not Found"}
              action={<Link to={NAVIGATE_ROUTES.HOME} className='button button-outline'>Go Back</Link>} />
    </>;

  return (
    <>
      <SEO title={'Profile'} url={window.location.href} />
      <div className={cn("container", styles.container, styles.profile)}>
        <Cover details={profileDetails} canEdit={canEdit} saveCoverPhoto={saveCoverPhoto} />
        <Details
          className={styles.user}
          canEdit={canEdit}
          details={profileDetails}
          editBtnText={"Edit profile"}
          editLink={`${NAVIGATE_ROUTES.ACCOUNT_SETTINGS}/${NAVIGATE_PARAMS.PROFILE_TAB}`}
          canApproved={true}
        >
          <Agency profileDetails={profileDetails} />
        </Details>
        <ProfileBody
          className={styles.body}
          profileDetails={profileDetails}
          defaultTab={tab}
          toolbars={
            profileDetails.agent && isMyProfile &&
            <Toolbars account={account}
                      GOVContract={GOVContract}
                      isMyProfile={isMyProfile}
                      profile={profile}
                      profileDetails={profileDetails} />
          }
          isMyProfile={isMyProfile}
        />
      </div>
    </>
  );
};


const Toolbars = ({ profile, profileDetails, GOVContract, account }) => {

  const [showArtistPopup, setShowArtistPopup] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);


  const switchInviteArtistModal = () => setShowArtistPopup(prevState => !prevState);


  const inviteArtistHandler = () => {
    if (profile?.account?.agent) {
      switchInviteArtistModal();
    } else {
      toast("You should be verified artist to invite Artists");
    }
  };

  const inviteArtist = async (data) => {
    if (!data.email) {
      return toast.error("Email address is required");
    }

    if (!profileDetails?.id) {
      return toast.error("Login is required for this action");
    }

    if (!profileDetails.agent) {
      return toast.error("Only an agent can perform this action");
    }

    setSendingInvite(true);

    let invitationId = 0;

    if (toNumber(data.fee) !== config.defaultAgentFee) {
      const transaction = await GOVContract.createAgentInvitation(parseInt(`${data.fee * 10}`, 10));

      const transactionResponse = await transaction.wait();

      invitationId = transactionResponse?.events?.[0]?.args?.invitationId?.toNumber();
    }

    let params = {
      ...data,
      invitationId,
    };

    const resp = await AgentServices.invite(params);

    setSendingInvite(false);

    if (resp.data) {

      toast.success("Invite sent!");
      switchInviteArtistModal();
    }
  };

  return (
    <>
      <div>
        <button
          className={cn("button", styles.button)}
          onClick={inviteArtistHandler}
        >
          <Icon name='user-plus' />
          <span className={styles.label}>Add a new artist</span>
        </button>
      </div>
      <Modal
        visible={showArtistPopup}
        onClose={switchInviteArtistModal}
      >
        <NewArtist
          onAdded={inviteArtist}
          busy={sendingInvite}
          fee={config.defaultAgentFee}
        />
      </Modal>
    </>
  );
};


export default Profile;
