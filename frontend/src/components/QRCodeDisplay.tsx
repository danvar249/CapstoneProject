import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface QRCodeDisplayProps {
    clientState: string;
    qrCode: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCode, clientState }) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            {qrCode === "" ? (
                <CircularProgress />
            ) : (
                <>
                    <Typography variant="h5" gutterBottom>
                        Scan QR Code to Connect
                    </Typography>
                    <img src={qrCode} alt="WhatsApp QR Code" style={{ width: "300px", height: "300px" }} />
                    <Typography variant="body1" color="textSecondary" sx={{ marginTop: 2 }}>
                        Open WhatsApp on your phone, go to Settings &gt; Linked Devices, and scan the QR code.
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default QRCodeDisplay;
