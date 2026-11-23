package com.amankay.backend.modules.tables;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.RGBLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeReader;
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

class TemporaryQrTest {
    @Test
    void renderedCodeCanBeScannedBackToTheTemporarySessionUrl() throws Exception {
        String url = "http://localhost:3000/mesa/AMK-test#t=session-token-for-test";
        String svg = new TemporaryQr().svg(url);
        assertFalse(svg.contains(url));
        Matcher dimensions = Pattern.compile("viewBox=\\\"0 0 (\\d+) (\\d+)\\\"").matcher(svg);
        if (!dimensions.find()) throw new AssertionError("El SVG no tiene dimensiones.");
        int width = Integer.parseInt(dimensions.group(1));
        int height = Integer.parseInt(dimensions.group(2));
        int[] pixels = new int[width * height];
        Arrays.fill(pixels, 0xFFFFFFFF);
        Matcher modules = Pattern.compile("M(\\d+) (\\d+)h1v1h-1z").matcher(svg);
        while (modules.find()) pixels[Integer.parseInt(modules.group(2)) * width + Integer.parseInt(modules.group(1))] = 0xFF000000;
        BinaryBitmap image = new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(width, height, pixels)));
        assertEquals(url, new QRCodeReader().decode(image).getText());
    }
}
