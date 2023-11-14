import cn from "classnames";
import { useProfile } from "../../../contexts/profile.context";
import styles from "./CollectionPage.module.sass";
import ProfileBody from "../../Profile/ProfileBody";
import Cover from "../../Profile/Cover";
import User from "../../Profile/User";

const CollectionPage = () => {

  // FIXME: nothing is here
  const bids = [];

  const { profile } = useProfile();

  const profileDetails = profile?.account;
  const profileData = {
    Items: bids,
    Activity: null,
  };

  return (
    <div className={cn("container", styles.container, styles.profile)}>
      <Cover profileDetails={profileDetails} />
      <User
        className={styles.user}
        profileDetails={profileDetails}
        type='collection'
      />

      <ProfileBody
        data={profileData}
        type='user'
        profile={profile}
        loading={false}
      />
    </div>
  );
};

export default CollectionPage;
