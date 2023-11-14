import classes from "./styles.module.scss";

const WithInputHeightWrapper = ({ children, className, withErrors = false, error = "" }) => {
  return (
    <div className={className}>
      <div className={classes.likeInput}>
        {children}
      </div>
      {
        withErrors &&
        <div className={classes.fakeError}>{error}</div>
      }
    </div>
  );
};

export default WithInputHeightWrapper;
