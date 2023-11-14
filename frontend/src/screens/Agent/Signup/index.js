import cn from "classnames";
import SEO from '../../../components/SEO';
import styles from "./Signup.module.sass";
import SignUpForm from "./SignUpForm";
import Image from "../../../components/Image";

const title = "Agent account registration";

const SignUp = () => {
  return (
    <>
      <SEO title={title} url={window.location.href}/>
      <div className={styles.row}>
        <div className={styles.logo}>
          <Image
            src='/images/logo-dark.svg'
            srcDark='/images/logo-light.svg'
            alt='Logo'
          />
        </div>
        <div className={styles.left}>
          <Image
            className={styles.img}
            src='/images/content/left_background.png'
          />
        </div>
        <div className={cn(styles.right)}>
          <div className={styles.body}>
            <SignUpForm title={title} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
