import cn from 'classnames';
import classes from './styles.module.scss';

/***
 *
 * @param { React.ReactNode } children
 * @param { 'success' | 'warning' | 'error' } status
 * @return {JSX.Element}
 * @constructor
 */
const StatusTag = ({ children, status = 'success' }) => {
  return (
    <span className={cn(classes.root, classes[status])}>
      {children}
    </span>
  );
};

export default StatusTag;
