import cn from "classnames";
import networkList from "../../config/networkList";
import classes from "./styles.module.css";
import { addNewChain } from "../../utils/addNewChain";
import Modal from "../Modal";


const UnsupportedChainModal = ({ visible, currentId, closeModal }) => {

  const changeNetwork = () => addNewChain(networkList[currentId]?.id);

  return (
    <Modal visible={visible}
           title={"Unsupported network"}
           onClose={closeModal}>

      <div className={classes.root}>
        <h3>Please choose one from the list below</h3>

        <div className={classes.buttons}>
          <button className={cn("button", classes.btn)}
                  onClick={changeNetwork}>
            Change to {networkList[currentId].name}
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default UnsupportedChainModal;
