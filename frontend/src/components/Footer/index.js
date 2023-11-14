import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import API_ROUTES from "../../config/API_ROUTES";
import styles from "./Footer.module.sass";
import Group from "./Group";
import Image from "../Image";
import Icon from "../Icon";
import Form from "../Form";
import API from "../../services/API";
import toast from "react-hot-toast";

const socials = [
    { title: "Twitter", icon: "twitter", link: "https://twitter.com/swappfi" },
    { title: "Telegram", icon: "telegram", link: "https://t.me/SwappToken" },
    { title: "Facebook", icon: "/images/socials/facebook.svg", link: "https://facebook.com/swappfi" },
    { title: "Discord", icon: "discord", link: "#" },
    { title: "Instagram", icon: "instagram", link: "https://instagram.com/swappfi" },
]

const Footers = () => {

    const items = useMemo(() =>  [
            {
                title: "Swapp NFT",
                menu: [
                    {
                        title: "How it works",
                        url: "/faq",
                    },
                    {
                        title: "Support",
                        url: "https://forum.swapp.ee",
                    },
                    {
                        title: "Become an agent",
                        url: "/agent/register",
                    }
                ],
            },
            {
                title: "Community",
                menu: [
                    {
                        title: "Swapp Token",
                        url: "https://swapp.ee",
                    },
                    {
                        title: "Documentation",
                        url: "https://swapp-protocol.gitbook.io/swapp-nft/",
                    },
                ],
            },
        ]

        // if (!profile?.account?.agent) {
        //     list[0].menu.push({
        //         title: "Become an agent",
        //         url: "/agent/register",
        //     },)
        // }

    , [])

    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newsletter = API.init(API_ROUTES.NEWSLETTERS, { notify: false });
        const resp = newsletter.create({ "email": email });

        toast.promise(resp, {
            loading: "subscribing...",
            success: "Subscribed !",
            error: "Already Subscribed!"
        }, { position: "bottom-right" })

    };

    return (
        <footer className={styles.footer}>
            <div className={cn("container", styles.container)}>
                <div className={styles.row}>
                    <div className={styles.col}>
                        <Link className={styles.logo} to="/">
                            <Image
                                className={styles.pic}
                                src="/images/logo-dark.svg"
                                srcDark="/images/logo-light.svg"
                                alt="Fitness Pro"
                            />
                        </Link>
                        <div className={styles.info}>The New Creative Economy.</div>
                        {/*<div className={styles.version}>*/}
                        {/*    <div className={styles.details}>Dark theme</div>*/}
                        {/*    <Theme className="theme-big" />*/}
                        {/*</div>*/}
                    </div>
                    <div className={styles.col}>
                        {items?.map((x, index) => (
                            <Group className={styles.group} item={x} key={index} />
                        ))}
                    </div>
                    <div className={styles.col}>
                        <div className={styles.category}>Join Newsletter</div>
                        <div className={styles.text}>
                            Get the latest Swapp NFT updates
                        </div>
                        <Form
                            className={styles.form}
                            value={email}
                            setValue={setEmail}
                            onSubmit={(event) => handleSubmit(event)}
                            placeholder="Enter your email"
                            type="email"
                            name="email"
                        />
                    </div>
                </div>
                <div className={styles.foot}>
                    <div className={styles.copyright}>
                        Copyright © 2021 SWAPP LLC. All rights reserved
                    </div>
                    <div className={styles.social}>
                        {socials.map((x, index) => (
                            <a href={x.link} target="_blank" key={index}>
                                {
                                    x.icon.startsWith('/') ?
                                        <Image className={styles.social}
                                            src={x.icon}
                                            srcDark={x.icon}
                                            alt={x.title} />
                                        :
                                        <Icon className={styles.social}
                                            name={x.icon} size="24" />
                                }
                            </a>
                        ))}
                    </div>
                    <div className={styles.note}>
                        We use cookies for better service. <a href="/#">Accept</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footers;
