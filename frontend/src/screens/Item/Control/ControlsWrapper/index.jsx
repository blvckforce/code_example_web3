import classes from "./styles.module.scss";
import cn from "classnames";

const ControlsWrapper = ({ children, className = "" }) => {
  return (
    <div className={cn(classes.control, className)}>
      {children}
    </div>
  );
};

export default ControlsWrapper;
