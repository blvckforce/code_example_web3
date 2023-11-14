import cn from 'classnames';
import classes from './styles.module.scss';
import styles from '../../Item.module.sass';
import Users from '../../Users';
import User from '../../Users/user';
import Bids from './Bids';

export const tabs = ["Info", "Owners", "History", "Bids"];

const ItemTabs = ({ active = tabs[0], nftItems, owners = [], isOwner, itemId }) => {

  switch (active) {
    case tabs[0]:
      return (
        <Root className={styles.nftItems}>
          {
            nftItems.map((item, index) => (
              <User key={index} className={styles.nftItem} item={item} />
            ))
          }
        </Root>
      );

    case tabs[1]:
      return (
        <Root>
          <Users className={styles.users} items={owners} />
        </Root>
      );

    case tabs[2]:
      return null;

    case tabs[3]:
      return (
        <Root>
          <Bids isOwner={isOwner} itemId={itemId} />
        </Root>
      );

    default:
      return null;
  }
};

const Root = ({ className, ...rest }) => (
  <div className={cn(classes.root, className)} {...rest} />
);


export default ItemTabs;
