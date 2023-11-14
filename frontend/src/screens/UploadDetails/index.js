import { get, parseInt, set, chunk, forEach, cloneDeep, find, toNumber, round } from 'lodash-es';
import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import cn from "classnames";
import SEO from '../../components/SEO';
import config from "../../config";
import NAVIGATE_ROUTES, { UPLOAD_MODES } from "../../config/routes";
import { useProfile } from "../../contexts/profile.context";
import usePreventUnmount from '../../hooks/usePreventUnmount';
import { useSettings } from "../../hooks/useSettings";
import { modesList, validateFields } from '../../utils/forms';
import styles from "./UploadDetails.module.sass";
import Modal from "../../components/Modal";
import FolowSteps from "./FolowSteps";
import Control from "../../components/Control";
import Properties from "./Properties";
import Stats from "./Stats";
import { useGlobalState } from "../../contexts/Global";
import toast from "react-hot-toast";
import API from "../../services/API";
import { client } from "./utils";
import useApiData from "./useApiData";
import CreationForm from "./Components/CreationForm";
import { filterNonUserCollections, toUTCTimeInMilliseconds } from "../../utils/helpers";
import { useAuctionMethods } from "../../hooks/useAuctionMethods";
import { useContractsContext } from "../../contexts/contracts.context";
import { getSignature } from "../../utils/wallet";

const defaultValue = {
  id: null,
  address: null,
  image: "/images/content/card-pic-6.jpg",
  name: "Black Golden Tiger",
  price: 0.01,
  quantity: 1,
  bid: 0.01,
};

const formatItem = (item, intervalOptionsList, currencyOptions) => {

  const formItem = cloneDeep(item);
  formItem.currency = find(currencyOptions, ({ id }) => id === formItem?.currency)?.name;

  formItem.start_date = item.start_date;
  formItem.end_date = (intervalOptionsList.find(({
                                                   id,
                                                   key,
                                                 }) => key === formItem?.end_date || id === formItem?.end_date)?.key
    ?? intervalOptionsList[0].key ?? 1);

  return formItem;
};

const Upload = () => {

  const { disablePreventUnmount, enablePreventUnmount } = usePreventUnmount();

  const { putOnSale } = useAuctionMethods();
  const { modeParam = modesList[0], nfTtokenID } = useParams();
  const history = useHistory();
  const { currencyOptions = [] } = useSettings();
  const { account, web3 } = useGlobalState();
  const { profile } = useProfile();
  const { NFT1155PContract } = useContractsContext();

  const { categoriesList, chainsList, intervalOptionsList, collectionsList } = useApiData(profile?.account?.id);
  const [nftStatus, setNFTstatus] = useState(0);
  const [tokenId, setTokenId] = useState(null);

  const [pristine, setPristine] = useState(true);

  const [item, setItem] = useState({
    account: profile.account.id, sensitive: false, currency: currencyOptions[1]?.id, type: "fixed",
  });

  const [visibleModal, setVisibleModal] = useState(false);
  const [visiblePropertyModal, setVisiblePropertyModal] = useState(false);
  const [visibleStatModal, setVisibleStatModal] = useState(false);
  const [visiblePreview, setVisiblePreview] = useState(false);

  const [errors, setErrors] = useState({});

  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isSingleMode, setIsSingleMode] = useState(modeParam === modesList[0]);

  useEffect(() => {
    if (nfTtokenID) {
      API.getNFTDetails(nfTtokenID).then((resp) => {
        if (resp.data && resp.data) {
          updateItemAPI(resp.data);
        }
      });
    }

    if (!modeParam || !modesList.includes(modeParam)) {
      updateItem("mode", modesList[0]);
    }
  }, [nfTtokenID]);

  useEffect(() => {
    if (!!item.mode) {
      setIsSingleMode(item.mode === modesList[0]);
    }
  }, [item.mode]);

  // redirect to single if multiple is disabled
  useEffect(() => {
    if (!isSingleMode && !config.upload.multiple) history.push(`${NAVIGATE_ROUTES.UPLOAD_DETAILS}/${UPLOAD_MODES.SINGLE}`);
  }, [history, isSingleMode]);

  useEffect(() => {
    const mode = isSingleMode ? modesList[0] : modesList[1];
    const qty = isSingleMode ? 1 : 2;

    setItem(prevState => ({
      ...prevState, mode, quantity: qty,
    }));
  }, [isSingleMode]);

  useEffect(() => {
    if (profile.account.id) {
      setItem((prev) => ({ ...prev, "account": profile.account.id }));
    }
  }, [profile]);

  useEffect(() => {
    let timeOut = 0;
    if (nftStatus === 4) {
      timeOut = setTimeout(() => {
        history.push(item.id ? `${NAVIGATE_ROUTES.ITEM_PAGE}/${item.id}` : NAVIGATE_ROUTES.EXPLORE);
      }, 2000);
    }
    return () => clearTimeout(timeOut);
  }, [history, nftStatus, item.id]);

  useEffect(() => {
    updateItem("category",
      categoriesList?.[0]?.id, "chain", chainsList?.[0]?.id,
      "end_date", intervalOptionsList?.[0]?.id,
      "colection", filterNonUserCollections(collectionsList, account)[0]?.id);
  }, [categoriesList, chainsList, intervalOptionsList, collectionsList, account]);

  /**
   *
   * @param rest accepts array of key, value
   * @example updateItem('qty', 1)
   * @example updateItem('qty', 1, 'type', 'single)
   */
  const updateItem = (...rest) => {
    setErrors(({ [rest[0]]: $, ...other }) => other);

    const values = chunk(rest, 2);
    const dataToUpdate = {};
    forEach((values), ([key, value]) => {
      set(dataToUpdate, key, value);
    });

    setItem((prevItem) => ({ ...prevItem, ...dataToUpdate }));

    if (pristine) {
      setPristine(false);
    }
  };

  const updateProperties = (list) => {
    let data = (list ?? []).slice();
    updateItem("properties", data);
    setProperties(data);
  };

  const updateStats = (list) => {
    list = list ?? [];
    let data = list.slice();
    updateItem("stats", data);
    setStats(list.slice());
  };

  const updateItemAPI = (data) => {
    const item = cloneDeep(data);
    if (!item) {
      return;
    }

    set(item, "colection", data.colection?.id);
    set(item, "account", data.account?.id);
    set(item, "category", data.category?.id);
    set(item, "mode", modeParam);
    set(item, "chain", data.chain?.id);
    set(item, "end_date", intervalOptionsList.find(({ key }) => +key === +data.end_date)?.key || 0);
    set(item, "start_date", toNumber(data.start_date));
    set(item, "currency", find(currencyOptions, ["name", data.currency])?.name || 1);

    if (data.token_id) {
      setTokenId(data.token_id);
    }

    updateProperties(data.properties);
    updateStats(data.stats);
    setItem(item);
  };

  const saveItem = async (overrideItem = {}) => {
    const formItem = formatItem(item, intervalOptionsList, currencyOptions);

    if (saving) {
      return;
    }

    const { isFormValid, errors: formErrors } = validateFields(formItem);

    if (isFormValid === false) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);

    let resp;

    const { end_date, ...tail } = formItem;
    let data = { ...(formItem.type === "bid" ? formItem : tail), ...overrideItem };

    if (data.id) {
      const provider = web3.library;
      if (!provider) {
        toast("Connect wallet to perform this action");
        return;
      }
      const signer = provider.getSigner();
      const signature = await getSignature(true, signer, account);
      if (!signature) return;
      const config = {
        headers: {
          'x-signature': signature,
        },
      };
      resp = await API.updateNFT(data, config);
    } else {
      resp = await API.addNFT(data);
    }

    setSaving(false);

    if (!resp.error && resp.data) {
      updateItemAPI(resp.data);
      setPristine(true);
    }

    return resp;
  };

  const toggleMode = () => {
    if (item.token_id) {

      toast.error("NFT already on sale");
      return;
    }

    let mode = item.mode === modesList[0] ? modesList[1] : modesList[0];
    if (config.upload.multiple) {
      updateItem("mode", mode);
      history.push(`${NAVIGATE_ROUTES.UPLOAD_DETAILS}/${mode}`);
    } else {
      toast.error("Coming soon...");
    }
  };

  const mintItem = async () => {
    if (!item.id || !item.account || !item.name || !item.description || !item.image) {
      toast.error("Item appear to be malformed.");
      return;
    }

    setNFTstatus(-1);

    enablePreventUnmount();

    const properties = item.properties ? item.properties.map(p => ({
      trait_type: p.key,
      value: p.value,
    })) : [];

    const stats = item.stats ? item.stats.map(p => ({
      display_type: "number",
      trait_type: p.key,
      value: p.value,
    })) : [];

    const data = JSON.stringify({
      name: item.name, description: item.description, image: item.image, attributes: [...properties, ...stats],
    });

    try {
      const added = await client.add(data);
      const url = `${process.env.REACT_APP_IPF_BASE_URL}/${added.path}`;
      await createNFT(url);

    } catch (e) {
      console.log(e);
      setNFTstatus(0);
      toast.error(e.message);
    } finally {
      disablePreventUnmount();
    }
  };

  const createNFT = async (url) => {
    try {
      enablePreventUnmount();
      const royalty = parseInt(item?.royalty * 10, 0);

      setNFTstatus(1);

      let createTokenMethod = null;
      let params = null;
      let getTokenIdAdapter = null;


      if (item.type === "bid") {
        const startTime = round(toUTCTimeInMilliseconds(item.start_date), 0);

        createTokenMethod = item.isPrivateContent === true ? NFT1155PContract.createPrivate : NFT1155PContract.create;

        params = item.isPrivateContent === true ? [// uint256 _initialSupply,
          1, // string memory _tokenUri,
          url, // uint256 _royalty,
          royalty, // uint256 openAt,
          startTime, // bytes memory _data
          0] : [// uint256 _initialSupply,
          1, // string memory _tokenUri,
          url, // uint256 _royalty,
          royalty, // bytes memory _data
          0];

        getTokenIdAdapter = (data) => toNumber(get(data, ["events", 0, "args", 1]));
      } else if (item.mode === UPLOAD_MODES.SINGLE) {
        createTokenMethod = NFT1155PContract.create;
        params = [// uint256 _initialSupply
          1, // string memory _tokenUri
          url, // uint256 _royalty,
          royalty, // bytes memory _data
          0];
        getTokenIdAdapter = (data) => toNumber(get(data, ["events", 0, "args", 1]));
      } else {
        createTokenMethod = NFT1155PContract.create;
        params = [// uint256 _initialSupply
          item.quantity, // string memory _tokenUri
          url, // uint256 _royalty,
          royalty, // bytes memory _data
          0];
        getTokenIdAdapter = (data) => toNumber(get(data, ["events", 0, "args", 1]));
      }


      const tx = await createTokenMethod(...params);
      const data = await tx.wait();

      const tokenId = getTokenIdAdapter(data);

      setTokenId(tokenId);

      updateItem("token_id", tokenId);
      updateItem("url", url);
      await saveItem({ token_id: tokenId, url: url, is_minted: true });

      setNFTstatus(2);
    } catch (error) {

      console.log(error);
      setNFTstatus(0);
      toast.error(error.message);
    } finally {
      disablePreventUnmount();
    }
  };

  const createSale = useCallback(async () => {
    try {
      enablePreventUnmount();
      if (!tokenId) {
        toast.error("Minting is required before creating sales");
        return;
      }

      setNFTstatus(3);
      const formItem = formatItem(item, intervalOptionsList, currencyOptions);

      await putOnSale(formItem, tokenId);
      setNFTstatus(4);
    } catch (error) {
      console.log(error);
      setNFTstatus(0);
      toast.error(error.message);
    } finally {
      disablePreventUnmount();
    }
  }, [enablePreventUnmount, disablePreventUnmount, tokenId, item, intervalOptionsList, currencyOptions, putOnSale]);

  const createAuction = async () => {
    try {
      if (!tokenId) {
        return toast.error("Minting is required before creating sales");
      }

      setNFTstatus(3);

      await putOnSale(item, tokenId);
      setNFTstatus(4);
    } catch (error) {
      setNFTstatus(2);
      console.log(error);
      console.log(error.message);
      toast.error(error.message);
    } finally {
      disablePreventUnmount();
    }
  };

  async function startCreating() {
    if (!pristine) {
      let resp = await saveItem();

      if (!resp || resp.error) {
        return;
      } else if (!item.id) {
        updateItem("id", resp.data.id);
      }

      toast.success("Saved");
    }

    if (item.token_id) {
      setTokenId(item.token_id);
    }

    setNFTstatus(item.token_id ? 4 : item.url ? 2 : 0);
    setVisibleModal(true);
  }

  return (
    <>
      <SEO title={`NFT's details`} url={window.location.href} />

      <div className={cn("section pt-0", styles.section)}>
        <Control className={styles.control} item={[]}
                 backLink={"/upload-variants"}
                 backLinkTitle='Manage collectible type'
        />
        <CreationForm
          errors={errors}
          toggleMode={toggleMode}
          item={item}
          modeParam={modeParam}
          defaultValue={defaultValue}
          isSingleMode={isSingleMode}
          updateItem={updateItem}
          saving={saving}
          setVisiblePropertyModal={setVisiblePropertyModal}
          setVisibleStatModal={setVisibleStatModal}
          stats={stats}
          properties={properties}
          setVisiblePreview={setVisiblePreview}
          startCreating={startCreating}
          categoriesList={categoriesList}
          chainsList={chainsList}
          intervalOptionsList={intervalOptionsList}
          visiblePreview={visiblePreview}
          collectionsList={collectionsList}
        />
      </div>
      <Modal visible={visiblePropertyModal} onClose={() => setVisiblePropertyModal(false)}>
        <Properties className={styles.steps} properties={properties} onSave={updateProperties} />
      </Modal>
      <Modal visible={visibleStatModal} onClose={() => setVisibleStatModal(false)}>
        <Stats className={styles.steps} stats={stats} onSave={updateStats} />
      </Modal>
      <Modal disableOutsideClick={true} visible={visibleModal} onClose={() => setVisibleModal(false)}
             title={'Follow steps'}
      >
        <FolowSteps
          className={styles.steps}
          nftStatus={nftStatus}
          nftType={item.type}
          mintItem={() => mintItem()}
          createAuction={createAuction}
          createSale={createSale}
          onClose={() => setVisibleModal(false)}
        />
      </Modal>
    </>);
};

export default Upload;
