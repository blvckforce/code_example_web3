import React, { useEffect, useState } from "react";
import cn from "classnames";
import config from "../../../config";
import { strMaxLen } from '../../../utils/forms';
import styles from "./Properties.module.sass";
import Icon from "../../../components/Icon";
import TextInput from "../../../components/TextInput";

const Properties = ({ className, properties, onSave }) => {
  const [list, setList] = useState(properties);
  const [note, setNote] = useState("");

  const addMore = () => {
    setList(prevState => [...prevState, { key: "", value: "" }]);
  };

  const updateValue = (event) => {
    let index = event.target.dataset.index;
    setList(([...state]) => {
      state[index] = {
        ...state[index],
        ...{ value: strMaxLen(event.target.value, config.createItem.maxPropertyNameLength) },
      };
      return state;
    });
  };
  const updateKey = (event) => {

    let index = event.target.dataset.index;
    setList(([...state]) => {
      state[index] = { ...state[index], ...{ key: strMaxLen(event.target.value, config.createItem.maxPropertyNameLength) } };
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

  // show empty fields on entering
  useEffect(() => {
    if (!list.length) {
      addMore();
    }
    // eslint-disable-next-line
  }, []);


  return (
    <div className={cn(className, styles.properties)}>
      <div className={cn("h4", styles.title)}>Add Properties</div>
      <div className={styles.text}>Properties show up underneath your item, are clickable, and can be filtered in your
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
                className={styles.input}
                label=''
                placeholder=''
                type='text'
                name='key'
                data-index={index}
                value={x.key} />
            </div>
            <div>
              <TextInput
                onChange={updateValue}
                className={styles.input}
                label=''
                placeholder=''
                type='text'
                name='value'
                data-index={index}
                value={x.value} />
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

export default Properties;
