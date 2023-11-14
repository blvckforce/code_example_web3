const TwitterErrors = ({ errors, styles }) => (
  errors.twitter?.type === "pattern" ? (
    <span>Please enter a valid tweet url</span>
  ) : errors.twitter?.type === "required" ? (
    <span>Twitter post url field is required</span>
  ) : (
    (errors.twitter?.type === "notExist" ||
      errors.twitter?.type === "exist") && (
      <span
        className={
          errors.twitter?.type === "exist"
            ? styles.label
            : styles.error
        }
      >{errors.twitter?.message}</span>
    )
  )
);


export default TwitterErrors;
