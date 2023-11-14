import cn from "classnames";
import classes from "./styles.module.css";
import { useEffect, useReducer, useState } from "react";


/***
 *
 * @param url string
 * @param type video | image
 * @param alt string - used form image
 * @param className string - className for root wrapper
 * @param controls boolean - show controls on video
 * @param preload none || metadata || auto
 * @returns {JSX.Element}
 * @constructor
 */
const SourceContainer = ({ url, type, alt, className, controls = false, preload = "metadata" }) => {

  const [videoContainer, setVideoContainer] = useState(false);

  const [, forceUpdate] = useReducer(x =>  x + 1, 0);

  const changeContainerToVideo = () => setVideoContainer(true);

  function onErrorUpdate() {
    forceUpdate();
  }

  // return video back to image
  useEffect(() => {
    setVideoContainer(false);
  }, [url]);

  if (type === "video") {
    return (
      <div className={cn(classes.root, className)}>
        <video src={url} className={classes.video} controls={controls} preload={"metadata"}
               onError={onErrorUpdate}
        />
      </div>
    );
  }

  return (
    <div className={cn(classes.root, className)}>
      {
        !videoContainer
          ? <img src={url} className={classes.image} alt={alt} onError={changeContainerToVideo} />
          : <video src={url} className={classes.video} controls={controls} preload={preload}
                   onError={onErrorUpdate}
          />
      }
    </div>
  );
};

export default SourceContainer;
