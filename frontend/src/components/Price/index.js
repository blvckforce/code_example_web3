import config from "../../config";
import { useCurrency } from "../../contexts/currency.context";

const Price = ({
                 price,
                 currency = "",
                 convertTo = "",
                 convertToSymbol,
                 className,
                 showSymbol = false,
                 showCurrency = true,
                 decimals = 2,
               }) => {


  const { exchange, currencyFetching } = useCurrency();

  const newPrice = (price * ((exchange[currency.toLowerCase()] ?? exchange[config.baseCurrency.toLowerCase()])
    ?.[convertTo?.toLowerCase() ?? "usd"] ?? 0))
    .toFixed(4);

  let displayPrice;

  if (!Number.isNaN(newPrice)) {
    displayPrice = parseFloat(newPrice.toString());
  }

  return (
    currencyFetching
      ? <></>
      : <span className={className}>
      {
        displayPrice !== undefined && (
          <span>
            {showSymbol && convertToSymbol} {displayPrice.toFixed(decimals)} {showCurrency && convertTo}
          </span>
        )
      }
        </span>
  );
};

export default Price;
