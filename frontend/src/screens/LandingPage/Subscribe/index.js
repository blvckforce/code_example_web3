import React, { useState } from "react";
import cn from "classnames";
import toast from "react-hot-toast";
import API_ROUTES from "../../../config/API_ROUTES";
import styles from "./Subscribe.module.sass";
import gstyles from "../LandingPage.module.sass";
import Form from "../../../components/Form";
import API from "../../../services/API";


const Subscribe = ({ className, children }) => {

    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newsletter = API.init(API_ROUTES.NEWSLETTERS, { notify: false });
        const resp = newsletter.create({ "email": email });

        toast.promise(resp, { loading: "subscribing...", success: "Subscribed !", error: "Already Subscribed!" }, { position: "bottom-right" })

    };

    return (
        <div className={cn("section", styles.section, gstyles.bg_matic, className)}>
            <div className="container">
                <div className={gstyles.jumbotron}>
                    <h3 className={cn("h3", styles.title)}>
                        Never miss a drop
                    </h3>
                    <p className={cn("p", styles.subtitle)}>
                        Subscribe for the latest news, drops & collectibles
                    </p>
                    <div>
                        <Form
                            className={styles.form}
                            actionButton={<button className={cn("button", styles.submit)}>Subscribe</button>}
                            value={email}
                            setValue={setEmail}
                            onSubmit={(event) => handleSubmit(event)}
                            placeholder="Email"
                            type="email"
                            name="email"
                        />
                    </div>
                    <p className={gstyles.light_gray}>You may subscribe for our newsletter to get special offers and occasional surveys delivered to your inbox. Unsubscribe at any time by clicking on the link in the email.</p>
                </div>
                <div className={styles.socials}>
                    {['uniswap', 'zerion', 'pancakeswap', 'certik', 'coinmarketcap'].map((x, index) => (
                        <div key={index}>
                            <img src={`/images/content/landing/listing/${x}.png`} />
                        </div>
                    ))}

                </div>
                {children}
            </div>
        </div>
    )
}

export default Subscribe;
