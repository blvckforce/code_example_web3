import { useEffect, useState } from "react";
import styles from "./TagInput.module.sass"


const TagInput = ({ setValue, className, label, placeholder, activators = ['Enter', ','] }) => {

    const [tags, setTags] = useState([])
    const [tagInput, setTagInput] = useState()

    const removeTag = (i) => {
        const newTags = [...tags];
        newTags.splice(i, 1);
        setTags(newTags);
    }

    const inputKeyDown = (e) => {

        const val = e.target.value;

        if ((activators.includes(e.key) || ['blur'].includes(e.type) ) && val) {

            e.preventDefault();

            if (tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
                return;
            }

            setTags([...tags, val]);

            tagInput.value = null;

        } else if (e.key === 'Backspace' && !val) {

            removeTag(tags.length - 1);
        }
    }

    useEffect(() => {

        if (setValue)
            setValue(tags)
    }, [tags])

    return (
        <div className={className}>
            {label && <div className={styles.label}>{label}</div>}
            <div className={styles["input-tag"]}>
                <ul className={styles["input-tag__tags"]}>
                    {tags.map((tag, i) => (
                        <li key={tag}>
                            {tag}
                            <button type="button" onClick={() => { removeTag(i); }}>+</button>
                        </li>
                    ))}
                    <li className={styles["input-tag__tags__input"]}>
                        <input type="text" onBlur={inputKeyDown} onKeyDown={inputKeyDown} ref={c => { setTagInput(c) }} placeholder={placeholder}/>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default TagInput;