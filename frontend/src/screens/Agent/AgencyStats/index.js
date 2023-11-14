import React, { useState } from "react";
import cn from "classnames";
import SEO from '../../../components/SEO';
import { useProfile } from "../../../contexts/profile.context";
import styles from "./AgencyStats.module.sass";
import DropdownMenu from "../../../components/DropdownMenu";
import Dropdown from "../../../components/Dropdown";
import SearchInput from "../../../components/SearchInput";
import Icon from "../../../components/Icon";
import Modal from "../../../components/Modal";

const AgentStats = () => {
  const [showModal, setShowModal] = useState(false);
  //   const dateOptions = [
  //     { name: "Last 7 days", icon: "/images/content/calendar.svg" },
  //   ];
  const dateOptions = ["Last 7 days", "Last 2 days", "Last 8 days"];

  // FIXME:
  const topAgents = [];
  const { profile } = useProfile();
  const [date, setDate] = useState(dateOptions[0]);
  const searchHandler = () => {
  };

  const agentStatus = (id) => profile?.account?.agents?.filter(
    (agent) => agent.id === id,
  )[0]?.status;


  const hasAgent = (id) =>
    profile?.account?.agents?.map((agent) => agent.id).includes(id);

  const submitHandler = (event) => {
    event.preventDefault();
    setShowModal(true);
  };

  const pendingHandler = (event) => {
    event.preventDefault();
  };

  const leaveHandler = (event) => {
    event.preventDefault();
  };
  return (
    <>
      <SEO title={'Agent stats'} url={window.location.href} />

      <div className={cn("section-pt0", styles.section)}>
        <div className={styles.head}>
          <h1 className={cn("h3", styles.title)}>Agents and agencies</h1>
          <h5 className={cn("h5", styles.title, styles.sub_title)}>
            Top agents and agencies, statistics and data
          </h5>
          <div className={cn("row", styles.row)}>
            <Dropdown
              className={styles.dropdown}
              value={date}
              setValue={setDate}
              options={dateOptions}
            />
            <SearchInput
              placeholder='Search by agents'
              onChange={searchHandler}
              className={cn(styles.search)}
              iconDirection='right'
            />
          </div>
        </div>
        <div className={cn(styles["table-responsive"])}>
          <table>
            <thead>
            <tr>
              <th>Agent</th>
              <th>
                <DropdownMenu
                  toggle={
                    <button
                      className={cn(styles.link, {
                        // [styles.active]: urlActive(x.url),
                      })}
                    >
                      <span>Volume</span>
                      <Icon
                        name='arrow-down'
                        size='16'
                        className={styles.icon}
                      />
                    </button>
                  }
                  // className={styles.dropdownmenu}
                  bodyClassName={styles.dropdown_body} />
              </th>
              <th>Fees</th>
              <th>Members</th>
              <th>Assets</th>
              <th>Action</th>
            </tr>
            </thead>
            <tbody>
            {(topAgents ?? []).map((item, index) => (
              <tr key={index}>
                <td className={styles.item}>
                  <span>{index + 1}</span>
                  <img className={styles.image} src={item.image} alt='agent' />
                  <div className={styles.details}>
                    <h5 className={styles.title}>{item.title}</h5>
                    {/* <span>{item.id}</span> */}
                  </div>
                </td>
                <td>
                                    <span className='currency no-text'>
                                        <span className={styles.price}>{item.price}</span>
                                    </span>
                  <span className={styles.estimate}> ($240,5k)</span>
                </td>
                <td>
                  <span>{item.fee}</span>
                </td>

                <td>{item.members}</td>
                <td>{item.assets}</td>
                <td>
                  {/* <Link>Submit an application</Link> */}
                  <>
                    {!hasAgent(item?.id) && (
                      <button
                        className={cn(styles.btn, styles.submit)}
                        onClick={submitHandler}
                      >
                        Submit an application
                      </button>
                    )}
                    {agentStatus(item?.id) === "pending" && (
                      <button
                        className={cn(styles.btn, styles.pending)}
                        onClick={pendingHandler}
                      >
                        Under consideration
                      </button>
                    )}
                    {agentStatus(item?.id) === "owned" && (
                      <button
                        className={cn(styles.btn, styles.leave)}
                        onClick={leaveHandler}
                      >
                        Leave the agent
                      </button>
                    )}
                  </>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
        <Modal visible={showModal} onClose={() => setShowModal(false)} />
      </div>
    </>
  );
};

export default AgentStats;
