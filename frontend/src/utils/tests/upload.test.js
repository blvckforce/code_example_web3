import { checkFileBeforeUpload } from '../upload';

describe('checkFileBeforeUpload', function() {

  const types = ['.mp4', '.gif', '.png', '.jpg', '.jpeg', '.pdf'];
  const maximumSize = 100; /* megabytes */
  let rounds = [];


  describe('Negative cases', function() {
    it('should return an error if file size is bigger then maximum limit', function() {

      const mimeType = 'video/mp4';
      const fileSize = maximumSize * 1000 ** 2 + 1;
      const extension = 'mp4';

      const { success, error } = checkFileBeforeUpload(mimeType, fileSize, extension, types, maximumSize);
      expect(success).toBeFalsy();
      expect(error).not.toBeUndefined();
      expect(typeof error === 'string').toBeTruthy();
      expect(error).toMatch(/Maximum file size/i);
    });

    it(`should return an error if file extension isn't present in allowed types`, function() {

      const mimeType = 'video/mp4';
      const fileSize = maximumSize * 1000 ** 2 - 1;
      const extension = 'mov';

      const { success, error } = checkFileBeforeUpload(mimeType, fileSize, extension, types, maximumSize);
      expect(success).toBeFalsy();
      expect(error).not.toBeUndefined();
      expect(typeof error === 'string').toBeTruthy();
      expect(error?.match(/Supported file types/i)).toBeTruthy();
    });

    it('should return an error if no extension is present or extension is not a string', function() {

      rounds = [{
        mimeType: 'video/mp4',
        fileSize: maximumSize * 1000 ** 2 - 1,
        extension: undefined,
      }, {
        mimeType: 'video/mp4',
        fileSize: maximumSize * 1000 ** 2 - 1,
        extension: 123,
      }];

      rounds.forEach(({ fileSize, mimeType, extension }) => {
        const { success, error } = checkFileBeforeUpload(mimeType, fileSize, extension, types, maximumSize);
        expect(success).toBeFalsy();
        expect(error).not.toBeUndefined();
        expect(error).toMatch(/Extension is required/i);
      });
    });
  });


  describe('Positive cases', function() {

    it('should return success if file size is less then maximum and extensions contains this file extension', function() {
      rounds = [{
        fileSize: 400,
        mimeType: 'video/mp4',
        extension: 'mp4',
      }, {
        fileSize: 20000,
        mimeType: 'image/gif',
        extension: 'gif',
      }, {
        fileSize: 1000,
        mimeType: 'image/jpeg',
        extension: 'jpg',
      }, {
        fileSize: 40,
        mimeType: 'image/jpeg',
        extension: 'jpeg',
      }];


      rounds.forEach(({ fileSize, mimeType, extension }) => {
        const { success, error } = checkFileBeforeUpload(mimeType, fileSize, extension, types, maximumSize);
        expect(success).toBeTruthy();
        expect(error).toBeUndefined();
      });
    });

    it('should return success if file extensions is in the uppercase', function() {
      rounds = [{
        fileSize: 400,
        mimeType: 'video/mp4',
        extension: 'MP4',
      }, {
        fileSize: 20000,
        mimeType: 'image/gif',
        extension: 'GIF',
      }, {
        fileSize: 1000,
        mimeType: 'image/jpeg',
        extension: 'JPG',
      }, {
        fileSize: 40,
        mimeType: 'image/jpeg',
        extension: 'JPEG',
      }];
      rounds.forEach(({ fileSize, mimeType, extension }) => {

        const { success, error } = checkFileBeforeUpload(mimeType, fileSize, extension, types, maximumSize);
        expect(success).toBeTruthy();
        expect(error).toBeUndefined();
      });
    });
  });
});
