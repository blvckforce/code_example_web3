import { Helmet } from 'react-helmet-async';
import { strMaxLen } from '../../utils/forms';

/***
 *
 * @param children : React.ReactChildren
 * @param title : string - page title
 * @param description : string - page description
 * @param image : string - image for open graph protocol
 * @param url : string - page url
 * @param siteName : string? - default site name
 * @param type : string|'video' - content type
 * @param videoContent : string? - video content for type='video'
 * @param {Array.<MetaProps>} meta - other metadata
 * @return {JSX.Element}
 * @constructor
 */
const SEO = ({
               children, title, description, url = window?.location?.href,
               image, siteName = 'SWAPP - NFT Marketplace', type = 'website',
               videoContent, meta,
             }) => {

  // trimming too long descriptions
  description = strMaxLen(description, 200);
  title = title ? `${title} | ${siteName}` : siteName;

  return (
    <Helmet title={title} meta={meta} encodeSpecialCharacters>
      <meta content={description} name='description' />
      {/* og */}
      <meta property='og:title' content={title} />
      <meta property='og:type' content={type} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image} />
      <meta property='og:url' content={url} />
      <meta property='og:site_name' content={siteName} />
      {
        type === 'video' && videoContent &&
        <meta property='og:video' content={videoContent} />
      }
      {/* TWITTER */}
      <meta property='twitter:title' content={title} />
      <meta property='twitter:description' content={description} />
      <meta property='twitter:image' content={image} />
      {children}
      <noscript>
        {`
            <style>
              #color-toggle {
                visibility: hidden;
              }
            </style>
          `}
      </noscript>
    </Helmet>
  );
};

export default SEO;
