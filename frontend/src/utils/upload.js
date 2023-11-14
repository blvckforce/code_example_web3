/***
 *
 * @param mimeType : string file type e.g. "image/jpeg"
 * @param fileSize : number in bytes
 * @param extension : string e.g. ".gif,.jpg,.png,.mp4"
 * @param types : [string] - supported types or extensions
 * @param maximumSize : number - number max file size in MB
 * @returns {{success: boolean, error: string || undefined}}
 */
export const checkFileBeforeUpload = (mimeType, fileSize, extension, types, maximumSize) => {

  let error;
  let success = false;

  // eslint-disable-next-line
  const [/* formatType */, contentType] = mimeType.split("/");
  const maximumSizeInBytes = maximumSize * 1000 * 1000;

  if (extension !== undefined && typeof extension === 'string') {
    if (fileSize > maximumSizeInBytes) {
      error = `Maximum file size is ${maximumSize}MB`;
    } else {

      // temporarily disabled mime-type check
      if (/*types.includes(`.${contentType}`) ||*/ types.includes(`.${extension.toLowerCase()}`)) {
        success = true;
      } else {
        error = `Supported file types: ${types.join(", ").toUpperCase()}`;
      }
    }
  } else {
    error = 'Extension is required and it should be a string'
  }

  return {
    error, success,
  };
};
