import cn from "classnames";
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { callWithTimeout } from '../../utils/forms';
import styles from "./Cover.module.sass";
import Icon from "../Icon";
import { getFilePath } from "../../utils/helpers";
import { useGlobalState } from "../../contexts/Global";

const defaultImage = "/images/content/cover-image.png";

const Cover = ({ details, saveCoverPhoto, canEdit = false, compact = false }) => {

  const [visible, setVisible] = useState(false);
  const [coverImage, setCoverImage] = useState(defaultImage);
  const [files, setFiles] = useState();
  const { web3 } = useGlobalState();

  const uploadFileRef = useRef(null);

  const updateCoverPhoto = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFiles(event.target.files);

      getFilePath(event.target.files[0], (file_path) => {
        setCoverImage(file_path);
      });
    }
  };

  const onSaveCoverPhoto = async () => {

    setVisible(false);

    if (!files) return;

    if (!details || !details.id)
      return toast.error("Connect wallet to perform this action");

    //get image and upload to server
    const file = files[0];

    const formData = new FormData();
    formData.append("files", file);
    formData.append("field", "background");

    const provider = web3.library;
    if (!provider) {
      toast("Connect wallet to perform this action");
      return;
    }

    const signer = provider.getSigner();
    await saveCoverPhoto(formData, true, signer, "file");
  };

  const onEditClick = () => {
    setVisible(true);
    if (uploadFileRef.current) {
      callWithTimeout(() => {
        uploadFileRef.current.click();
      }, 50);
    }
  };

  useEffect(() => {

    if (details?.background)
      setCoverImage(details.background);

  }, [details]);

  return (
    <div
      className={cn(styles.head, { [styles.active]: visible, [styles.compact]: compact })}
      style={{
        backgroundImage: `url(${coverImage})`,
      }}
    >
      <div className={cn("container", styles.container)}>
        {canEdit && <div className={styles.btns}>
          <button
            className={cn("button-stroke button-small", styles.button)}
            onClick={onEditClick}
          >
            <span>{`${coverImage === defaultImage ? "Add" : "Edit"} cover photo`}</span>
            <Icon name='image' size='16' />
          </button>
        </div>
        }
        <div className={styles.file}>
          <input type='file' onChange={updateCoverPhoto} ref={uploadFileRef} />
          <div className={styles.wrap}>
            <Icon name='upload-file' size='48' />
            <div className={styles.info}>Drag and drop your photo here</div>
            <div className={styles.text}>or click to browse</div>
          </div>
          <button
            className={cn("button-small", styles.button)}
            onClick={onSaveCoverPhoto}
          >
            Save photo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cover;
