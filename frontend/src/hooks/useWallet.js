import { useState } from 'react';

export function useWallet() {
    const getWallet = () => {
        const walletName = sessionStorage.getItem('wallet');
        return walletName || process.env.REACT_APP_DEFAULT_CONNECTOR_NAME;
    };

    const [wallet, setWallet] = useState(getWallet());

    const saveWallet = wallet => {
        sessionStorage.setItem('wallet', wallet);
        setWallet(wallet);
    };

    return {
        setWallet: saveWallet,
        wallet
    }
}

export default useWallet
