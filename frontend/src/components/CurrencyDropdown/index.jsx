import Dropdown from '../Dropdown2';

const CurrencyDropdown = ({
                            label = 'Currency', name = 'currency', value,
                            currencyOptions, saving, setValue, errors, defaultValueIndex,
                          }) => (
  <Dropdown
    label={label}
    value={value}
    options={currencyOptions}
    defaultValueIndex={defaultValueIndex}
    disabled={saving}
    setValue={(value) => setValue(name, value)}
    error={errors}
  />
);
export default CurrencyDropdown;
