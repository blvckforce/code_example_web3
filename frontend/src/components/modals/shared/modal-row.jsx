import cn from 'classnames';
import classes from './styles.module.scss';

const ModalRow =  ({ children, className }) => (<div className={cn(classes.row, className)}>{children}</div>);

export default ModalRow;
