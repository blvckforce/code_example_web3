import { forEach, isEmpty } from 'lodash-es';
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

export const socketInstance = io(
  process.env.REACT_APP_SOCKET_URL,
  {
    path: process.env.REACT_APP_SOCKET_PATH,
    transports: ["websocket"],
  },
);

const Context = createContext({
  setHandler: (name = "", callback = () => null) => null,
});

const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState();
  const [handlers, setHandlers] = useState({});

  useEffect(() => {
      socketInstance.on("connect", () => {
        setSocket(socketInstance);
      });
    }, [],
  );

  useEffect(() => {
    if (!isEmpty(socket) && !isEmpty(handlers)) {
      forEach(
        handlers,
        (callback, name) => {
          socket.off(name);
          socket.on(name, callback);
        },
      );
    }
  }, [socket, handlers]);

  const setHandler = useCallback((name, callback) => {
    setHandlers((prevState) => ({ ...prevState, [name]: callback }));
  }, []);

  return (
    <Context.Provider
      value={{
        setHandler,
      }}
    >
      {children}
    </Context.Provider>
  );
};

const useSocketContext = () => useContext(Context);

export { SocketContextProvider, useSocketContext };
