import React, { useState } from "react";
import { useProfile } from "../../../contexts/profile.context";
import styles from "./Cards.module.sass";
import Icon from "../../../components/Icon";
import TextInput from "../../../components/TextInput";
import API from "../../../services/API";

const Cards = ({ className, value, items, setValue, setCollection }) => {

    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState("")
    const [color, setColor] = useState("")
    const [notice, setNotice] = useState("");
    const { profile } = useProfile()

    const createNew = async () => {
        //make api request and add to collection
        const data = { name: name, color: color || "#9757D7", account: profile?.account.id }

        setNotice("Creating ...")

        const resp = await API.addCollection(data)

        if (resp.error) {
            setNotice(resp.message)
            return;
        }

        let i = items?.slice(1)
        i.unshift(data);
        i.unshift(items[0])
        items?.splice(0)
        i.map((x, index) => {
            items?.push(x)
        })

        setNotice("Created");

        setTimeout(function () {
            setNotice("");
            setShowCreate(false)
        }, 1000)
    }

    const updateCollection = (event) => {
        setValue(event.target.dataset.value);
    }

    return (
        <div className={(className, styles.cards)}>
            {items?.map((x, index) => (
                x.create ?
                    showCreate ?
                        <div className={styles.form} key={index}>
                            <TextInput label="" name="name" type="text" defaultValue={name} onChange={(event) => setName(event.target.value)} placeholder="Name of the collection" />
                            <TextInput label="" name="color" type="color" defaultValue={color} onChange={(event) => setColor(event.target.value)} placeholder="Color" />
                            {
                                notice &&
                                <div className={styles.note}>
                                    {notice}
                                </div>
                            }
                            <div className={styles.actions}>
                                <button type="button" className={styles.close} onClick={() => setShowCreate(false)}>
                                    <Icon name="close" size="14" />
                                </button>
                                <button type="button" onClick={createNew}>
                                    <Icon name="plus" size="24" />
                                </button>
                            </div>
                        </div>
                        :
                        <button type="button" className={styles.card} key={index} onClick={() => setShowCreate(true)}>
                            <div className={styles.plus} style={{ backgroundColor: x.color }}>
                                <Icon name="plus" size="24" className={styles.create} />
                            </div>
                            <div className={styles.subtitle}>{x.name}</div>
                        </button>

                    :
                    <label className={styles.card} key={index}>
                        <input name="collection" type="radio" data-value={x.id} defaultChecked={value == x.id} onChange={updateCollection} />
                        <div className={styles.plus} style={{ backgroundColor: x.color }}>
                            <Icon name="plus" size="24" />
                            <Icon name="check" size="24" className={styles.checked} />
                        </div>
                        <div className={styles.subtitle}>{x.name}</div>
                    </label>
            ))}
        </div>
    );
};

export default Cards;
