// import React, { createContext, useState, useEffect, ReactNode } from 'react';
// import { addSocketListener, removeSocketListener, socket } from '../utils/socket';

// export enum WhatsappState {
//   CONFLICT = "CONFLICT",
//   CONNECTED = "CONNECTED",
//   DEPRECATED_VERSION = "DEPRECATED_VERSION",
//   OPENING = "OPENING",
//   PAIRING = "PAIRING",
//   PROXYBLOCK = "PROXYBLOCK",
//   SMB_TOS_BLOCK = "SMB_TOS_BLOCK",
//   TIMEOUT = "TIMEOUT",
//   TOS_BLOCK = "TOS_BLOCK",
//   UNLAUNCHED = "UNLAUNCHED",
//   UNPAIRED = "UNPAIRED",
//   UNPAIRED_IDLE = "UNPAIRED_IDLE",
// }
// // ✅ Define Context Type
// interface WhatsappContextType {
//   clientState: WhatsappState | null;
//   setClientState: (state: WhatsappState) => void;
// }

// // ✅ Create Context with Default Value
// export const WhatsappContext = createContext<WhatsappContextType>({
//   clientState: null,
//   setClientState: () => {},
// });

// export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [clientState, setClientState] = useState<WhatsappState | null>(null);

//   useEffect(() => {
//     console.log('context start')
//     const handleWhatsAppState = (data: { clientState: WhatsappState }) => {
//       console.log('🔄 WhatsApp State:', data.clientState);
//       setClientState(data.clientState);
//     };

//     // ✅ Subscribe to WhatsApp State WebSocket event
//     addSocketListener('WA_ClientState', handleWhatsAppState);

//     socket.emit('whatsappClientState'); // ✅ Request initial state
//     return () => {
//       // ✅ Cleanup listener on unmount
//       removeSocketListener('WA_ClientState', handleWhatsAppState);
//     };
//   }, []);

//   return (
//     <WhatsappContext.Provider value={{ clientState, setClientState }}>
//       {children}
//     </WhatsappContext.Provider>
//   );
// };
