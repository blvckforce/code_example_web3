import React, { useEffect, useState } from "react";
import cn from "classnames";
import config from "../../../config";
import { strMaxLen } from '../../../utils/forms';
import styles from "./Stats.module.sass";
import Icon from "../../../components/Icon";
import TextInput from "../../../components/TextInput";

const Stats = ({ className, stats, onSave }) => {
  const [list, setList] = useState(stats);
  const [note, setNote] = useState("");

  const addMore = () => {
    setList(prevState => [...prevState, { key: "", value: "", total: "" }]);
  };


  const updateValue = (event) => {
    let index = event.target.dataset.index;
    let value = strMaxLen((+event.target.value).toFixed().toString(), config.createItem.maxPropertyValueLength);
    setList(([...state]) => {
      state[index] = { ...state[index], ...{ value: value } };
      return state;
    });
  };
  const updateKey = (event) => {
    let index = event.target.dataset.index;
    let key = strMaxLen(event.target.value, config.createItem.maxPropertyNameLength);
    setList(([...state]) => {
      state[index] = { ...state[index], ...{ key } };
      return state;
    });
  };
  const updateTotal = (event) => {
    let index = event.target.dataset.index;
    let total = strMaxLen((+event.target.value).toFixed().toString(), config.createItem.maxPropertyValueLength);
    setList(([...state]) => {
      state[index] = { ...state[index], ...{ total: total } };
      return state;
    });
  };

  const removeField = (index) => {
    setList(prevState => prevState.filter((_, i) => i !== index));
  };

  const save = () => {
    onSave(list);
    setNote("Saved");
    const timeout = setTimeout(function() {
      setNote("");
      return () => clearTimeout(timeout);
    }, 1000);
  };


  useEffect(() => {
    if (!list.length) {
      addMore();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className={cn(className, styles.stats)}>
      <div className={cn("h4", styles.title)}>Add Stats</div>
      <div className={styles.text}>Stats show up underneath your item, are clickable, and can be filtered in your
        collection's sidebar.
      </div>
      <div className={styles.list}>
        <div className={cn(styles.head, styles.row)}>
          <div />
          <div>Name</div>
          <div>Value</div>
        </div>
        {list.map((x, index) => (
          <div className={styles.row} key={index}>
            <div>
              <button className={styles.close} data-index={index} onClick={() => removeField(index)}>
                <Icon name='close' size='16' />
              </button>
            </div>
            <div>
              <TextInput
                onChange={updateKey}
                value={x.key}
                className={styles.input}
                label=''
                placeholder=''
                type='text'
                name='key'
                data-index={index}
              />
            </div>
            <div className={styles.group}>
              <TextInput
                onChange={updateValue}
                className={styles.input}
                label=''
                step={0}
                placeholder=''
                type='number'
                name='value'
                data-index={index}
                value={x.value} />
              of
              <TextInput
                onChange={updateTotal}
                className={styles.input}
                label=''
                placeholder=''
                step={0}
                type='number'
                name='total'
                data-index={index}
                value={x.total} />
            </div>
          </div>
        ))}

        <button
          className={cn("button button-outline button-small", styles.more)}
          onClick={addMore}
        >Add more
        </button>

      </div>
      {note ?
        <div className={styles.note}>
          <Icon name='tick' size='40' />
        </div>
        :
        <button className={cn("button", styles.button)} onClick={save}>Save</button>
      }

    </div>
  );
};

export default Stats;
