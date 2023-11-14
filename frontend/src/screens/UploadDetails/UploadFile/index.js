import { round } from 'lodash-es';
import React, { useEffect, useState } from "react";
import cn from "classnames";
import SourceContainer from "../../../components/SourceContainer";
import config from "../../../config";
import { checkFileBeforeUpload } from "../../../utils/upload";
import { client, getFileExtension } from "../utils";
import styles from "./UploadFile.module.sass";
import Icon from "../../../components/Icon";
import ProgressBar from "../../../components/ProgressBar";
import toast from "react-hot-toast";


const UploadFile = ({ image, setImage }) => {

  const [fileUrl, setFileUrl] = useState(null);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [containerType, setContainerType] = useState();

  const updatePreviewPhoto = (event) => {
    const { types, maximumSize } = config.upload;

    if (event.target.files && event.target.files[0]) {
      const { type, size, name } = event.target.files[0] ?? {};

      if (!name) {
        toast.error(`Can't get the file name`);
        return;
      }
      const ext = getFileExtension(name);
      const { error, success } = checkFileBeforeUpload(type, size, ext, types, maximumSize);

      if (!success) {
        if (error) toast.error(error);
        return;
      }

      setContainerType(type.split("/")?.[0]);

      let image = URL.createObjectURL(event.target.files[0]);
      setImage(image);
      loadFileIPFS(event.target.files[0]).catch(console.error);
      setPreviewUrl(image);
    }
  };
  const loadFileIPFS = async (file) => {

    try {
      setFileUploading(true);

      const added = await client.add(file,
        {
          progress: (prog) => {
            setFileUploadProgress(round((prog / file.size) * 100, 0));
          },
        },
      );
      const url = `${process.env.REACT_APP_IPF_BASE_URL}/${added.path}`;

      setFileUploading(false);
      setFileUrl(url);

    } catch (e) {
      toast.error("Error uploading file: " + e.message);

      setFileUrl("");
      setFileUploading(false);
    }
  };

  const removeImage = () => {
    setFileUrl("");
    setImage(null);
    setPreviewUrl(null);
  };

  useEffect(() => {
    setImage(fileUrl);
  }, [fileUrl]);


  return (
    <>
      {image ?
        <div className={cn(styles.file_preview)}>
          <SourceContainer url={previewUrl ?? image} alt={"preview"} type={containerType} preload={"auto"} />
          <button type='button' onClick={removeImage} className={styles.icon}>
            <Icon name='close' size='24' />
          </button>
        </div>
        :
        <div className={styles.file}>
          <input className={styles.load} type='file' onChange={updatePreviewPhoto} accept='image/*,video/*' />

          <div className={styles.info}>
            <div className={styles.icon}>
              <Icon name='upload-file' size='24' />
            </div>
            <div className={styles.format}>
              {`${config.upload.formats?.join(", ").toUpperCase()}. Max ${config.upload.maximumSize}MB.`}
            </div>
          </div>
        </div>
      }
      {fileUploading && <ProgressBar completed={fileUploadProgress} />}
    </>
  );

};

export default UploadFile;
