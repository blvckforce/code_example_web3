import React, { useEffect, useState } from "react";
import cn from "classnames";
import API_ROUTES from "../../config/API_ROUTES";
import { useProfile } from "../../contexts/profile.context";
import SourceContainer from "../SourceContainer";
import CardBody from './card-body';
import CardMenu from './card-menu';
import styles from "./Card.module.sass";
import Modal from "../Modal";
import Connect from "../Connect";
import API from "../../services/API";
import Report from "../Report";

const Card = ({ className, item, mode, isPreview = false, activeNavTab, withMenu = false }) => {

  const { profile, setProfile } = useProfile();

  const [visibleModalBid, setVisibleModalBid] = useState(false);
  const [visible, setVisible] = useState(false);

  const [visibleMenu, setVisibleMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [visibleModalReport, setVisibleModalReport] = useState(false);

  const itemLikes = parseInt(item?.total_likes || 0);
  const [totalLikes, setTotalLikes] = useState(isNaN(itemLikes) ? 0 : itemLikes);

  // FIXME: move to upper level
  const onShareClick = () => {

    if (isPreview) return;

    setShowShareMenu(prevState => !prevState);
    setVisibleMenu(false);
  };

  // FIXME: move to upper level
  const onReportClick = () => {

    if (isPreview) return;

    setVisibleModalReport(true);
  };

  // FIXME: move to upper level or separate from file
  const heart = async () => {
    if (isPreview) return;

    if (!profile.isAuthorized)
      return;

    const liking = !visible;
    setVisible(!visible);

    //make request
    const api = API.init(API_ROUTES.LIKES);
    const data = { account: profile.account.id, nft: item.id };
    let resp;

    if (liking) resp = await api.create(data);
    else resp = await api.update(0, data);

    if (!resp || resp.error) {
      setVisible(!!liking);
      return;
    }

    if (resp.data.account) {

      let data = resp.data;
      let account = profile.account;

      //update profile state for likes
      if (liking) {

        account.likes.push({
          id: data.id,
          nft: data.nft.id,
          account: data.account.id,
        });

        setTotalLikes(totalLikes + 1);
      } else {

        account.likes = account.likes.filter((like) => like.nft !== data.nft.id);
        setTotalLikes(totalLikes - 1);
      }

      setProfile({ ...profile, ...{ account: account } });
    }
  };

  useEffect(() => {
    if (profile?.isAuthorized) {
      if (profile.liked(item.id))
        setVisible(true);
    }
  }, [item.id, profile]);

  if (!item) {
    return;
  }

  const brokerLinkActive = !!profile && !!item.id &&
    profile?.account?.address !== item.account?.address
    && item.brokerFee > 0;

  const switchVisibleModalReport = () => setVisibleModalReport(prevState => !prevState)

  return (
    <>
      <div className={cn(styles.card, className)}>
        {
          withMenu &&
          <CardMenu visibleMenu={visibleMenu} item={item}
                    onReportClick={onReportClick} onShareClick={onShareClick}
                    setShowShareMenu={setShowShareMenu} showShareMenu={showShareMenu}
                    setVisibleMenu={setVisibleMenu}
                    brokerLinkActive={brokerLinkActive}
          />
        }
        <div className={styles.preview}>
          <SourceContainer url={item.image} alt={item.name} />
        </div>
        <CardBody item={item} mode={mode} activeNavTab={activeNavTab} isPreview={isPreview} />
      </div>
      <Modal
        visible={visibleModalBid}
        onClose={() => setVisibleModalBid(false)}
      >

        <Connect />
        {/*<Bid />*/}
      </Modal>
      <Modal
        title={'Report'}
        visible={visibleModalReport}
        onClose={switchVisibleModalReport}
      >
        <Report
          type='nft'
          typeId={item.id}
          onCancel={switchVisibleModalReport}
        />
      </Modal>
    </>
  );
};


export default Card;
