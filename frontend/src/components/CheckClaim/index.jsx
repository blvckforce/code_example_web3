import { BigNumber } from "ethers";
import { useCallback, useState } from "react";
import config from "../../config";
import { useClaimModal } from "../../contexts/claimModal.context";
import { useGlobalState } from "../../contexts/Global";
import { useContract } from "../../hooks/useContract";
import Loader from "../Loader";
import classes from "./styles.module.scss";
import cn from "classnames";
import { formatEther } from "@ethersproject/units";


const checkText = "Check rewards";
const claimText = "Claim rewards";
const nothingToClaim = "Nothing to claim";

const currencies = Object.values(config.currencyList);

const CheckAndClaim = () => {

  const { account } = useGlobalState();
  const { GOVContract } = useContract();

  const { setRoundsToClaim } = useClaimModal();

  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasToClaim, setHasToClaim] = useState(false);


  const checkRewards = useCallback(async () => {

    if (GOVContract && account) {
      try {
        setLoading(true);


        const checkedCurrencies = (await Promise.all(
          currencies.map(async ({ address, name }) => ({
            balance: await GOVContract.balanceOf(account, address),
            name,
            address,
          })),
        ).catch() ?? [])
          .filter(({ balance }) => +formatEther(BigNumber.from(balance)) > 0);
        setRoundsToClaim(checkedCurrencies);
        setHasToClaim(!!checkedCurrencies.length);

        setChecked(true);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }

  }, [account, GOVContract]);


  return (
    <div>

      <ClaimButton onClick={!checked ? checkRewards : undefined} disabled={loading}>
        <span>
        {!checked ? checkText : hasToClaim ? claimText : nothingToClaim}
        </span>
        {
          loading && <Loader className={classes.loader} />
        }
      </ClaimButton>

    </div>
  );
};

export default CheckAndClaim;

/***
 *
 * @param children : React.Children
 * @param props : React.ButtonHTMLAttributes
 * @return {JSX.Element}
 * @constructor
 */
const ClaimButton = ({ children, ...props }) => {
  return (
    <button className={cn("button", classes.button)} {...props}>
      {children}
    </button>
  );
};

