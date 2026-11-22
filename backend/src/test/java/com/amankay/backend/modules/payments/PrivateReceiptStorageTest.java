package com.amankay.backend.modules.payments;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.amankay.backend.modules.common.DomainException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

class PrivateReceiptStorageTest {

    @TempDir
    Path temporaryDirectory;

    @Test
    void storesAndReadsPdfOutsidePublicResources() throws Exception {
        PrivateReceiptStorage storage = new PrivateReceiptStorage(temporaryDirectory.toString());
        byte[] pdf = "%PDF-1.7\nAmankay test receipt".getBytes();
        var upload = new MockMultipartFile("file", "receipt.pdf", "application/pdf", pdf);

        String key = storage.store(upload);
        var download = storage.load(key);

        assertEquals("application/pdf", download.contentType());
        assertArrayEquals(pdf, download.bytes());
        try (var files = Files.list(temporaryDirectory)) {
            assertEquals(1, files.count());
        }
    }

    @Test
    void rejectsContentWithoutAnAllowedFileSignature() {
        PrivateReceiptStorage storage = new PrivateReceiptStorage(temporaryDirectory.toString());
        var upload = new MockMultipartFile("file", "receipt.pdf", "application/pdf", "not a pdf".getBytes());

        assertThrows(DomainException.class, () -> storage.store(upload));
    }

    @Test
    void reportsMissingPrivateDirectoryAsUnavailable() {
        PrivateReceiptStorage storage = new PrivateReceiptStorage("");
        var upload = new MockMultipartFile("file", "receipt.pdf", "application/pdf", "%PDF-1.7".getBytes());

        assertThrows(DomainException.class, () -> storage.store(upload));
    }
}
