import { get, set, chunk, forEach, cloneDeep, find, toNumber, chain, round } from 'lodash-es';
import React, { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import NAVIGATE_ROUTES, { UPLOAD_MODES } from '../../../config/routes';
import { useGlobalState } from "../../../contexts/Global";
import toast from "react-hot-toast";
import { useHistory, useParams } from 'react-router';
import { ethers } from "ethers";
import { useProfile } from "../../../contexts/profile.context";
import { useContract } from "../../../hooks/useContract";
import { useSettings } from "../../../hooks/useSettings";
import API from "../../../services/API";
import { callWithTimeout, modesList, validateFields } from '../../../utils/forms';
import { client } from "../../UploadDetails/utils";
import useApiData from "../../UploadDetails/useApiData";
import { toUTCTimeInMilliseconds } from "../../../utils/helpers";
import { contractAddress } from "../../../config/contracts";
import { getSignature } from "../../../utils/wallet";

const steps = ["Create new item", "Mint", "Approve", "Put on sale"];
const conditions = {
    "": 0,
    "approve": 1,
    "purchasing !": 2,
    "selling": 3
}

export default function HorizontalNonLinearStepper( { currentItem } ) {
    const [activeStep, setActiveStep] =useState(1);
    const { modeParam = modesList[0], nfTtokenID } = useParams();
    const { currencyOptions = []} = useSettings()

    const history = useHistory();

    const {profile} = useProfile()
    const { categoriesList, chainsList, intervalOptionsList } = useApiData();
    // FIXME next lines
    const { GOVContract, marketSolidContract, NFT1155PContract} = useContract()
    const { account, web3, nftContract, marketContract, auctionContract, collectionContract } = useGlobalState();

    const [nftStatus, setNFTstatus] = useState( conditions[currentItem.categoryText] )
    const [tokenId, setTokenId] = useState(null)
    const [pristine, setPristine] = useState(true)
    const [item, setItem] = useState(currentItem);
    const [collections, setCollections] = useState();
    const [properties, setProperties] = useState([]);
    const [stats, setStats] = useState([]);
    const [saving, setSaving] = useState(false)
    const [isSingleMode, setIsSingleMode] = useState(modeParam === modesList[0])

    useEffect(() => {
        console.log("currentItem",currentItem)
        if (nfTtokenID) {
            API.getNFTs('?id=' + nfTtokenID).then((resp) => {
                if (resp.data && resp.data.length) {
                    let data = resp.data[0];

                    if (data) {
                        updateItemAPI(data);
                    }
                }
            })
        }

        if (!modeParam || !modesList.includes(modeParam)) {
            updateItem('mode', modesList[0]);
        }
    }, [])

    useEffect(() => {
        if (!!item.mode) {
            setIsSingleMode(item.mode === modesList[0])
        }
    }, [item.mode])

    useEffect(() => {
        const mode = isSingleMode ? modesList[0] : modesList[1];
        const qty = isSingleMode ? 1 : 2;
        setItem({
            ...item,
            mode,
            quantity: qty,
        })
    }, [isSingleMode])

    useEffect(() => {
        if (profile.account.id) {
            setItem((x) => ({...x, "account": profile.account.id}))

            API.getMyCollections( {notify: true}).then((resp) => {

                if (!resp.error) {

                    let data = resp.data;

                    data.unshift({
                        title: "Create collection",
                        color: "#FFFFFF",
                        create: true
                    });
                    setCollections(data)
                }
            })
        }
        // console.log('profile', profile)
        // if (!profile.isAuthorized) {
        //
        //     history.push('/upload-variants')
        // }
    }, [profile])

    useEffect(() => {
        if (nftStatus === 4) {
            callWithTimeout(() => {
                history.push(NAVIGATE_ROUTES.HOME)
            }, 2000);
        }

        if( nftStatus < 1){
            setActiveStep(1)
        }
        else if(nftStatus === 1){
            setActiveStep(2)
        }
        else if( nftStatus === 2){
            setActiveStep(3)
        }
        else if(nftStatus >= 3){
            setActiveStep(4)
        }
    }, [nftStatus])

    useEffect(() => {
        updateItem(
            'category', categoriesList?.[0]?.id,
            'chain', chainsList?.[0]?.id,
            'end_date', intervalOptionsList?.[0]?.id
        );
    }, [categoriesList, chainsList, intervalOptionsList])

    /**
     *
     * @param rest accepts array of key, value
     * @example updateItem('qty', 1)
     * @example updateItem('qty', 1, 'type', 'single)
     */
    const updateItem = (...rest) => {
        const values = chunk(rest, 2)
        const dataToUpdate = {};

        forEach((values), ([key, value]) => {
            set(dataToUpdate, key, value)
        })

        setItem((item) => ({...item, ...dataToUpdate}));

        if (pristine) {
            setPristine(false)
        }
    }

    const updateProperties = (list) => {
        list = list ?? [];
        let data = list.slice();
        updateItem("properties", data)
        setProperties(data);
    }

    const updateStats = (list) => {

        list = list ?? [];
        let data = list.slice();
        updateItem("stats", data)
        setStats(list.slice());
    }

    const updateItemAPI = (data) => {
        const item = cloneDeep(data);
        if (!item) {
            return;
        }

        set(item, 'colection', data.colection?.id)
        set(item, 'account', data.account?.id)
        set(item, 'category', data.category?.id)
        set(item, 'mode', modeParam)
        set(item, 'chain', data.chain?.id)
        set(item, 'end_date', find(intervalOptionsList, ['key', data.end_date])?.id || 0)
        set(item, 'start_date', toNumber(data.start_date))
        set(item, 'currency', find(currencyOptions, ['name', data.currency])?.id || 0);

        if (data.token_id) {
            setTokenId(data.token_id)
        }

        updateProperties(data.properties)
        updateStats(data.stats)
        setItem(item);
    }

    const saveItem = async (overrideItem = {}) => {
        const formItem = cloneDeep(item);

        formItem.currency = find(currencyOptions, ({id}) => id === formItem?.currency)?.name;
        formItem.end_date = chain(intervalOptionsList)
        .find(({id}) => id === formItem?.end_date)
        .get('key')
        .toNumber()
        .value();

        if (saving) {
            return;
        }

        const isFormValid = validateFields(formItem);

        if (isFormValid === false) {
            return
        }

        setSaving(true);

        let resp;
        let data = {...formItem, ...overrideItem}

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
                    'x-signature': signature
                }
            };
            resp = await API.updateNFT(data);
        } else {
            resp = await API.addNFT(data);
        }

        setSaving(false);

        if (!resp.error && resp.data) {
            updateItemAPI(resp.data)
            setPristine(true);
        }

        return resp;
    }

    const toggleMode = () => {
        if (item.token_id) {

            toast.error("NFT already on sale")
            return
        }

        let mode = item.mode === modesList[0] ? modesList[1] : modesList[0];
        updateItem("mode", mode);
        history.push('/upload-details/' + mode)
    }

    const mintItem = async () => {
        if (!item.id || !item.account || !item.name || !item.description || !item.image) {
            toast.error("Item appear to be malformed.")
            return
        }
        setNFTstatus(-1)

        const data = JSON.stringify({
            name: item.name, description: item.description, image: item.image
        })

        try {
            const added = await client.add(data)
            const url = `${process.env.REACT_APP_IPF_BASE_URL}/${added.path}`
            await createNFT(url)

        } catch (e) {
            console.log(e)
            setNFTstatus(0)
            toast.error(e.message)
        }
    }

    const createNFT = async (url) => {
        try {
            setNFTstatus(1)
            updateItem("categoryText", "approve");
            let createTokenMethod = null
            let params = null;
            let getTokenIdAdapter = null;

            if (item.mode === UPLOAD_MODES.SINGLE) {
                createTokenMethod = nftContract.createToken
                params = [
                    url,
                ]
                getTokenIdAdapter = (data) => toNumber(get(data, ['events', 0, 'args', 2]));
            } else {
                createTokenMethod = collectionContract.create;
                params = [
                    // uint256 _initialSupply
                    item.quantity,
                    // string memory _tokenUri
                    url,
                    // bytes memory _data
                    0,
                ];
                getTokenIdAdapter = (data) => toNumber(get(data, ['events', 0, 'args', 1]));
            }

            const tx = await createTokenMethod(...params);
            const data = await tx.wait();
            console.log('data', data)
            const tokenId = getTokenIdAdapter(data)
            console.log('tokenId', tokenId)
            setTokenId(tokenId)

            updateItem("token_id", tokenId);
            updateItem("url", url);
            await saveItem({ token_id: tokenId, url: url });

            setNFTstatus(2);
        } catch (error) {

            console.log(error);
            setNFTstatus(0);
            toast.error(error.message);
        }
    };

    const createSale = useCallback(async () => {
        try {
            if (!tokenId) {
                toast.error("Minting is required before creating sales")
                return
            }

            setNFTstatus(3);

            let approveMethod = null;
            let approveParams = null;

            if (item.mode === UPLOAD_MODES.SINGLE) {
                approveMethod = nftContract.approve;
                approveParams = [
                    marketContract.address,
                    tokenId,
                ]
            } else {
                approveMethod = collectionContract.setApprovalForAll;
                approveParams = [
                    // address operator
                    marketContract.address,
                    // bool approved
                    true,
                ]
            }

            const tx = await approveMethod(...approveParams)
            await tx.wait();

            const price = ethers.utils.parseUnits(item.price.toString(), 'ether')
            const currency = find(currencyOptions, ({ id }) => id === item.currency)?.address;
            const brokerFee = parseInt(+item?.brokerFee * 10, 10);

            const params = [
                // uint256 tokenId,
                tokenId,
                // uint256 unitPrice,
                price,
                // uint256 amount,
                item.quantity,
                // address nft,
                contractAddress.NFT1155P,
                // uint8 nftType,
                item.mode === UPLOAD_MODES.SINGLE ? 0 : 1,
                // address currency,
                currency,
                // uint256 brokerFee
                brokerFee,
            ];

            let startSalesTransaction = await marketContract.startSales(...params);
            await startSalesTransaction.wait();

            setNFTstatus(4);
            updateItem("categoryText", "selling");
        } catch (error) {
            console.log(error);
            setNFTstatus(0);
            toast.error(error.message);
        }
    }, [item, tokenId])


    const createAuction = useCallback(async () => {
            try {
                if (!tokenId) {
                    return toast.error("Minting is required before creating sales")
                }

                setNFTstatus(3);

                const brokerFee = parseInt(+item?.brokerFee * 10, 10);
                const price = ethers.utils.parseUnits(item.bid.toString(), 'ether')
                const step = ethers.utils.parseUnits(`${item.bid * 0.01}`, 'ether')
                const startTime = round(toUTCTimeInMilliseconds(item.start_date) / 1000, 0);

                const currency = find(currencyOptions, ({ id }) => id === item.currency)?.address;
                const durationTime = chain(intervalOptionsList)
                    .find(({ id }) => id === item?.end_date)
                    .get('key')
                    .toNumber()
                    .value();

                // allow contract to move nft
                const approveTransaction = await nftContract.approve(auctionContract.address, tokenId);
                await approveTransaction.wait();

                const params = [
                    // uint256 tokenId,
                    tokenId,
                    // uint256 amount,
                    item.quantity,
                    // uint256[] memory pars, // 0 = min price, 1 = min price step, 2 = start time, 3 = duration time
                    [
                        // 0 = min price,
                        price,
                        // 1 = min price step,
                        step,
                        // 2 = start time,
                        startTime,
                        // 3 = duration time
                        durationTime,
                    ],
                    // address nft,
                    contractAddress.NFT1155P,
                    // uint8 nftType,
                    item.mode === UPLOAD_MODES.SINGLE ? 0 : 1,
                    // address currency,
                    currency,
                    // uint256 brokerFee
                    brokerFee,
                ]

                const startAuctionTransaction = await auctionContract.startAuction(...params);
                const auctionData = await startAuctionTransaction.wait();

                const saleId = auctionData?.events?.[3]?.topics?.[1];

                const fee = parseInt(+item?.brokerFee * 10, 10);

                let brokerFeeTransaction = await auctionContract.setBrokerFee(saleId, fee);
                await brokerFeeTransaction.wait();

                setNFTstatus(4);
                updateItem("categoryText", "selling");
            } catch (error) {
                setNFTstatus(2)
                console.log(error);
                console.log(error.message);
                toast.error(error.message);
            }
    }, [tokenId, item.bid, item.start_date, item.currency, item.end_date, item.brokerFee, item.mode]);

    // useEffect(() => {
    //     if (activeStep === 2 && ap === true) {
    //         mintItem()
    //         handleComplete(2);
    //     }
    // }, [activeStep]);

    // const totalSteps = () => {
    //     return steps.length;
    // };

    // const completedSteps = () => {
    //     return Object.keys(completed).length;
    // };

    // const isLastStep = () => {
    //     return activeStep === totalSteps() - 1;
    // };

    // const allStepsCompleted = () => {
    //     return completedSteps() === totalSteps();
    // };

    // const handleNext = () => {
    //     setActiveStep((activeStep) => activeStep + 1);
    // };

    // const handleStep = (step) => () => {
    //     setActiveStep(step);
    // };

    // const handleComplete = (id) => {
    //     const step = id ? id : activeStep;

    //     setCompleted((state) => ({ ...state, [step]: true }));

    //     if (!isLastStep()) {
    //         handleNext();
    //     }
    // };

    const handleStep = () => {
        if( activeStep === 1 ){
            mintItem();
        }
        else if( activeStep === 3 && item.type === "fixed"){
            createSale()
        }
        else if( activeStep === 3 && item.type === "bid" ){
            createAuction()
        }
    }

    // console.log("completed", completed);
    // console.log("completed", completedSteps());

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper nonLinear activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label} completed={ index < activeStep}>
            <StepButton color="inherit" onClick={ () => {} }>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === 4 ? (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>
              All steps completed - your nft on sale
            </Typography>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Box sx={{ flex: "1 1 auto" }} />

              <Button onClick={() => {handleStep()}}>
                {steps[activeStep]}
              </Button>
            </Box>
          </React.Fragment>
        )}
      </div>
    </Box>
  );
}
