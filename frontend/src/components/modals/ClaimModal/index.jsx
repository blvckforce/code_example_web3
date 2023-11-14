import cn from "classnames";
import { BigNumber } from "ethers";
import { useCallback, useMemo, useState } from "react";
import { useGlobalState } from '../../../contexts/Global';
import { useContract } from '../../../hooks/useContract';
import Loader from '../../Loader';
import Price from '../../Price';
import classes from "./styles.module.scss";
import Modal from "../Modal";
import { formatEther } from "@ethersproject/units";


const TITLE = "Claim fees"; /*FIXME*/

const ClaimModal = ({ roundsToClaim, visible, onClose, title }) => {

  const { account } = useGlobalState();
  const { GOVContract } = useContract();

  const [activeClaimIndex, setActiveClaimIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const clearAndClose = useCallback(() => {
    setLoading(false);
    setActiveClaimIndex(0);
    onClose();
  }, [onClose]);


  const activeClaimData = useMemo(() => roundsToClaim[activeClaimIndex] ?? {},
    [roundsToClaim, activeClaimIndex,
    ]);

  const toNextClaim = useCallback(() => {
    if (roundsToClaim.length > activeClaimIndex + 1) {
      // If there are still rounds to claim, move onto the next claim
      setActiveClaimIndex((prevState) => prevState + 1);
    } else {
      clearAndClose();
    }
  }, [roundsToClaim.length, activeClaimIndex, clearAndClose]);


  const handleClaim = useCallback(async () => {
    if (GOVContract && account) {
      try {
        setLoading(true);

        const claiming = await GOVContract.claim(activeClaimData.address, activeClaimData.balance);
        await claiming.wait();

        toNextClaim();
      } catch (e) {
        console.log("Claim handleClaim", e);
      } finally {
        setLoading(false);
      }
    }
  }, [GOVContract, account, activeClaimData.address, activeClaimData.balance, toNextClaim]);

  const price = +formatEther(BigNumber.from(activeClaimData?.balance ?? 0));
  const hasNextStep = roundsToClaim.length > activeClaimIndex + 1;

  return (
    <Modal title={title || TITLE} visible={visible} onClose={onClose}>

      <div className={classes.root}>

        <h3>{`STEP: ${activeClaimIndex + 1}/${roundsToClaim.length}`}</h3>
        <p className={classes.result}>
          <span>{price} {activeClaimData.name}</span>
          <Price price={price} currency={activeClaimData.name} convertTo={"usd"} showSymbol showCurrency={false}
                 convertToSymbol={"$"} />
        </p>
      </div>

      <div className={classes.buttonsBlock}>

        <button className={cn("button-stroke", classes.button)} onClick={toNextClaim}
                disabled={loading}>
          {hasNextStep ? "Skip" : "Close"}
        </button>

        <button className={cn("button", classes.button)} onClick={handleClaim}
                disabled={loading}
        >{loading ? <Loader /> : "Claim"}</button>

      </div>

    </Modal>
  );
};

export default ClaimModal;
