import { debounce } from 'lodash-es';
import SearchInput from '../../../components/SearchInput';
import { COLLECTION_PARAMS } from '../../../config/API_ROUTES';
import useFiltersClick from '../../../hooks/useFiltersClick';
import classes from './../Filterable.module.sass';
import cn from 'classnames';
import qs from 'qs';
import { useCallback, useMemo, useState } from 'react';
import Accordion from "../../../components/Accordion";
import Checkbox from '../../../components/Checkbox';
import { NAVIGATE_PARAMS } from '../../../config/routes';
import useCollectionProperties from '../../../hooks/useCollectionProperties';
import styles from '../Filterable.module.sass';

const PARENT_CATEGORY = COLLECTION_PARAMS.PROPERTY;

const Properties = ({ params = {}, switchSelections, selections, collectionId, ...rest }) => {
  const { [NAVIGATE_PARAMS.COLLECTION_ID]: collectionID } = params;

  const { properties } = useCollectionProperties(collectionId ?? collectionID );

  window.qs = qs;

  const onClick = useFiltersClick(switchSelections);

  const onItemClick = useCallback((id, value) => {

    return onClick(PARENT_CATEGORY, id, value)();
  }, [onClick]);

  if (!properties) return null;

  return (
    <>
      {
        Object.entries(properties).map(([name, value]) => {

          return (
            <LocalAccordion key={name} name={name} properties={value}
                            onItemClick={onItemClick}
                            selectedItems={selections?.[PARENT_CATEGORY] ?? {}} {...rest} />
          );
        })
      }
    </>
  );
};

/***
 *
 * @param {string} name
 * @param {{value: string, count: string|number}[]} properties
 * @param {{[string]:boolean}}accordion
 * @param {(string) => void} showFilter
 * @param {(property: *, value: *) => void} onItemClick
 * @param {{[string]: string|number}} selectedItems
 * @return {JSX.Element}
 * @constructor
 */
export const LocalAccordion = ({
                                 name, properties, accordion, showFilter,
                                 onItemClick, selectedItems,
                               }) => {

  const setVisible = () => showFilter(name);

  const [inputText, setInputText] = useState('');

  let sortedProperties = useMemo(
    () => properties.filter(({ value } = {}) => value?.toLowerCase()?.includes(inputText.toLowerCase())) ?? [],
    [inputText, properties]);

  const onTextChange = useCallback((e) => setInputText(e.target.value), []);

  const debouncedOnChange = debounce(onTextChange, 200);

  const onItemClickHandler = useCallback((e) => {
    onItemClick(e.target.name, { label: e.target.name, parent: name });
  }, [name, onItemClick]);

  if (!(Array.isArray(properties) && properties.length)) return null;

  return (
    <Accordion
      className={cn(styles.accordion, styles.dropdown, styles.price)}
      title={<AccordionTitle name={name} quantity={properties.length} />}
      visible={!!accordion[name]}
      setVisible={setVisible}
    >
      <SearchInput
        className={styles.search}
        placeholder={'Filter'}
        aria-label={'Properties filter'}
        name={'Properties filter'}
        onSubmit={e => e.preventDefault()}
        autoComplete='off'
        onChange={debouncedOnChange}
      />

      <form aria-label={`${name} properties`} className={classes.checkboxGroup}>
        {
          sortedProperties.map(({ value, count }) => {

            return (
              <Checkbox key={value}
                        checked={selectedItems[value] !== undefined}
                        name={value}
                        content={<CheckboxName name={value} qty={count} />}
                        className={classes.checkbox}
                        fullWidth
                        onChange={onItemClickHandler} />
            );
          })
        }
        {
          !sortedProperties.length && (
            <p>Nothing to show</p>
          )
        }
      </form>
    </Accordion>
  );
};

const CheckboxName = ({ name, qty }) => (
  <span className={classes.checkboxName}><span>{name}</span><span aria-label={'items quantity'}>{qty}</span></span>);


const AccordionTitle = ({ name, quantity }) => (
  <div className={classes.accordionName}>
    <img src='/images/svg/list.svg' alt='list' aria-hidden />
    <p className={classes.title}><span>{name}</span><span aria-label={'properties list length'}>{quantity}</span></p>
  </div>
);

export default Properties;
