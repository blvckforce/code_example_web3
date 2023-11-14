import React, { useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import styles from "./Overlay.module.sass";
import Image from "../Image";

const MobileOverlay = ({
  className,
  fullScreenContent,
  fabContent,
  hideFullScreen = false,
  hideFab = false,
  onFullCloseClick,
  onFabClick,
}) => {
  const [showMobFilter, setShowMobFilter] = useState(false);

  const fabClickHandler = (evt, show) => {
    evt.preventDefault();
    if (onFabClick) {
      onFabClick(evt);
      return;
    }
    setShowMobFilter(show);
  };
  const closeFullScreenHandler = (evt, visible) => {
    evt.preventDefault();
    if (onFullCloseClick) {
      onFullCloseClick(evt);
      return;
    }
    setShowMobFilter(visible);
  };
  return (
    <div className={className}>
      {hideFullScreen ? null : (
        <div
          className={cn(
            styles.filter_container,
            styles.box,
            styles.filter_overlay,
            {
              [styles.filters_h]: !showMobFilter,
            }
          )}
        >
          <div
            className={cn(styles.head, styles.c_row, {
              [styles.fab_h]: !showMobFilter,
            })}
          >
            <Link className={styles.logo} to="/">
              <Image
                className={styles.pic}
                src="/images/logo-dark.svg"
                srcDark="/images/logo-light.svg"
                alt=""
              />
            </Link>
            <button
              className={cn(styles.toggle)}
              onClick={(evt) => closeFullScreenHandler(evt, false)}
            >
              <Image src="/images/icon_close.svg" />
            </button>
          </div>
          {fullScreenContent}
        </div>
      )}
      {hideFab ? null : (
        <div
          className={cn(styles.box, styles.fab, {
            [styles.fab_h]: showMobFilter,
          })}
        >
          <button
            className={cn("button_stroke", styles.button)}
            onClick={(evt) => fabClickHandler(evt, true)}
          >
            {fabContent}
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileOverlay;
