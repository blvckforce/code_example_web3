import classes from "./styles.module.scss";
import cn from "classnames";


const DotButton = ({ className = "", onClick = () => undefined, title = '' }) => {
  return (
    <>
      <button className={cn("button-circle-stroke", classes.btn, className)}
              title={title}
              onClick={onClick}
      >
        <span className={classes.dot} />
        <span className={classes.dot} />
        <span className={classes.dot} />
      </button>
    </>
  );
};

export default DotButton;
