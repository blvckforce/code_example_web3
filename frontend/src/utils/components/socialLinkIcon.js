import Icon from '../../components/Icon';
import Image from '../../components/Image';
import twitter from '../images/socials/twitter.png'
import instagram from '../images/socials/instagram.svg'
import facebook from '../images/socials/facebook.svg'

export const socialLinkIcon = (name = '') => {

  if (name?.includes('twitter')) {
    return <Image src={twitter}/>
  }
  if (name?.includes('instagram')) {
    return <Image src={instagram}/>
  }
  if (name?.includes('facebook')) {
    return <Image src={facebook}/>
  }
  if (name?.includes('fb')) {
    return <Image src={facebook}/>
  }
  // if (name?.includes('vk')){
  //
  // }
  // if (name?.includes('youtube')){
  //
  // }
  // if (name?.includes('tiktok')) {
  //
  // }
  // if (name?.includes('pinterest')){
  //
  // }
  return <Icon name={'globe'}/>
};
