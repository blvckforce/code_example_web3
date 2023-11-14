import cn from "classnames";
import { useCallback, useMemo, useState } from "react";
import OutsideClickHandler from "react-outside-click-handler/esm/OutsideClickHandler";
import { useGlobalState } from "../../contexts/Global";
import DotButton from "../DotButton";
import GenerateBrokerLinkModal from "../modals/GenerateBrokerLink";
import classes from "./styles.module.scss";

const ACTIONS = {
  BROKER_LINK: "BROKER_LINK",
};

const CONDITIONS = {
  LOGGED_IN: 'LOGGED_IN',
  OWNER: 'OWNER',
};


const items = [
  {
    conditions: {
      [CONDITIONS.LOGGED_IN]: true,
      [CONDITIONS.OWNER]: false,
    },
    icon: "/images/svg/chain.svg",
    title: "Generate broker link",
    type: ACTIONS.BROKER_LINK,
  },
];


const ItemMenu = ({ className = "", item }) => {

  const { account } = useGlobalState();

  const [visible, setVisible] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);

  const callAction = useCallback((act) => {

    switch (act) {
      case (ACTIONS.BROKER_LINK):
        return () => setGenerateModalVisible(prevState => !prevState);

      default:
        return () => undefined;
    }

  }, []);

  const menuItems = useMemo(() => {
    const loggedIn = !!account;
    const owner = !!item && loggedIn && account === item.account?.address;

    return items.filter(({ conditions }) => {
      return conditions[CONDITIONS.OWNER] === owner
        && conditions[CONDITIONS.LOGGED_IN] === loggedIn;
    });

  }, [account, item]);


  if (!menuItems.length) return null;

  const switchVisible = () => setVisible(prevState => !prevState);

  return (
    <>
      <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
        <div className={cn(classes.root, className)}>
          <DotButton title={"Item menu"} onClick={switchVisible} />
          {
            visible && (
              <div className={classes.body}>

                <div className={classes.menu}>
                  {
                    menuItems.map(({ title, icon, type }, index) => (
                      <button className={cn("button-no-outline", classes.menuItem)} key={index}
                              onClick={callAction(type)}
                      ><img src={icon} alt={title} aria-hidden />
                        <span>{title}</span>
                      </button>
                    ))
                  }
                </div>
              </div>
            )
          }
        </div>
      </OutsideClickHandler>


      <GenerateBrokerLinkModal visible={generateModalVisible}
                               onClose={callAction(ACTIONS.BROKER_LINK)}
                               nftId={item.id}
      />
    </>
  );
};

export default ItemMenu;
