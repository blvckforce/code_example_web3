import { useState } from "react";
import Modal from "../Modal";
import cn from "classnames";

const Convertor = ({ className }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className={cn("button-stroke", className)}
                onClick={() => setIsOpen(true)}
                style={{ width: '100%' }}
            >
                Convert
            </button>
            <Modal
                title="Uniswap Convertor"
                onClose={() => setIsOpen(false)}
                visible={isOpen}
            >
                <iframe
                    src="https://app.uniswap.org/#/swap?"
                    height="660px"
                    width="100%"
                    style={{
                        border: 0,
                        margin: '0 auto',
                        marginBottom: '.5rem',
                        display: 'block',
                        borderRadius: 10,
                        maxWidth: 960,
                        minWidth: 300,
                    }}
                />
            </Modal>
        </>
    )
}

export default Convertor;
