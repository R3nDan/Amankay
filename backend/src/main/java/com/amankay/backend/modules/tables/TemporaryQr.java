package com.amankay.backend.modules.tables;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import java.util.Map;
import org.springframework.stereotype.Component;

/** Renders the one-time session URL as a compact SVG; the permanent table code alone grants no access. */
@Component
public class TemporaryQr {
    public String svg(String url) {
        try {
            BitMatrix bits = new QRCodeWriter().encode(url, BarcodeFormat.QR_CODE, 256, 256,
                    Map.of(EncodeHintType.MARGIN, 2));
            StringBuilder path = new StringBuilder();
            for (int y = 0; y < bits.getHeight(); y++) {
                for (int x = 0; x < bits.getWidth(); x++) {
                    if (bits.get(x, y)) path.append('M').append(x).append(' ').append(y).append("h1v1h-1z");
                }
            }
            return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 " + bits.getWidth() + " " + bits.getHeight()
                    + "\" role=\"img\" aria-label=\"Código QR temporal de acceso a la mesa\"><rect width=\"100%\" height=\"100%\" fill=\"#fffaf2\"/><path fill=\"#6b3f2a\" d=\""
                    + path + "\"/></svg>";
        } catch (WriterException exception) {
            throw new IllegalStateException("No se pudo generar el QR temporal.", exception);
        }
    }
}
