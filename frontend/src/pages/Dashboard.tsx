import React, { useEffect, useState, useContext } from "react";
import ChatWindow from "../components/ChatWindow";
import { WhatsAppContext } from "../WhatsAppContext";

const Dashboard: React.FC = () => {
  const [clientState, setClientState] = useState<string>("");
  const context = useContext(WhatsAppContext)

  useEffect(() => {
    if (context?.state) {
      console.log("Dashboard ", context.state);
      setClientState(context.state)
    }
  }, [context?.state]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: clientState === "CONNECTED" ? '#f5f5f5' : '#f7f7f7',
        height: '80vh',
        width: '70vw',
      }}
    >
      <ChatWindow />

    </div>
  );
}
export default Dashboard;

