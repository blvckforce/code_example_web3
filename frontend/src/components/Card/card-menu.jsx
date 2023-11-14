import cn from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import { FacebookShareButton, TwitterShareButton } from 'react-share';
import NAVIGATE_ROUTES from '../../config/routes';
import useModalVisibility from '../../hooks/useModalVisibility';
import Icon from '../Icon';
import GenerateBrokerLinkModal from '../modals/GenerateBrokerLink';
import ContextMenu from '../Overlay/ContextMenu';
import styles from './Card.module.sass';

const ACTIONS = {
  BROKER_LINK: "BROKER_LINK",
};


const menuItems = [
  { label: "Report", icon: "shield_fail" },
  { label: "Share", icon: "share1" },
];

const brokerLink = {
  icon: "/images/svg/chain.svg",
  title: "Generate broker link",
  type: ACTIONS.BROKER_LINK,
};


const CardMenu = ({
                    visibleMenu, setVisibleMenu, onReportClick,
                    onShareClick, setShowShareMenu, item, showShareMenu,
                    brokerLinkActive,
                  }) => {

  const { visible, close, switchVisible } = useModalVisibility();


  return (
    <>
      <div className={cn("row", styles.header)}>
        <button
          className={"button-no-outline"}
          onClick={() => setVisibleMenu(true)}
        >
          <Icon name='more' size='20' />
        </button>

        <ContextMenu className={styles.menu} visibleMenu={visibleMenu}>
          <OutsideClickHandler
            onOutsideClick={() => setVisibleMenu(false)}
          >
            <>
              {
                menuItems.map((item) => (
                  <div className={cn("row")} key={item.label}>
                    <button
                      className={cn("button-no-outline", "button-hover")}
                      onClick={
                        item?.label === "Report"
                          ? onReportClick
                          : onShareClick
                      }
                    >
                      <Icon name={item.icon} size={28} forceSprite={true} />
                      <span>{item.label}</span>
                    </button>
                  </div>
                ))}
              {
                brokerLinkActive && (
                  <div className={cn("row")}>
                    <button
                      className={cn("button-no-outline", "button-hover")}
                      onClick={switchVisible}
                    ><img src={brokerLink.icon} alt={brokerLink.title} aria-hidden className={styles.buttonImage} />
                      <span>{brokerLink.title}</span>
                    </button>
                  </div>
                )
              }

            </>
          </OutsideClickHandler>
        </ContextMenu>

        {showShareMenu && <ContextMenu>
          <OutsideClickHandler
            key={item.label}
            onOutsideClick={() => setShowShareMenu(false)}
          >
            <div className={"row"}>
              <TwitterShareButton
                className={styles.direction}
                url={`${window.location.protocol + '//'}${window.location.host}${NAVIGATE_ROUTES.ITEM_PAGE}/${item.id}`}
              >
                                    <span>
                                        <Icon name='twitter' className={styles.icon} size='20' />
                                    </span>
              </TwitterShareButton>
              <FacebookShareButton
                className={styles.direction}
                url={`${window.location.host}${NAVIGATE_ROUTES.ITEM_PAGE}/${item.id}`}
              >
                                    <span>
                                        <Icon name='facebook' className={styles.icon} size='20' />
                                    </span>
              </FacebookShareButton>
            </div>
          </OutsideClickHandler>
        </ContextMenu>}

        {/*<div className={cn("row", styles.heart)}>*/}
        {/*    <button*/}
        {/*        className={cn("button-no-outline", styles.favorite, {*/}
        {/*            [styles.active]: visible,*/}
        {/*        })}*/}
        {/*        onClick={heart}*/}
        {/*    >*/}
        {/*        <Icon name="heart" size="20" />*/}
        {/*    </button>*/}
        {/*    <div className={styles.label}>{totalLikes}</div>*/}
        {/*</div>*/}
      </div>
      {
        brokerLinkActive &&
        <GenerateBrokerLinkModal visible={visible}
                                 onClose={close}
                                 nftId={item.id}
        />
      }
    </>
  );
};

export default CardMenu;
