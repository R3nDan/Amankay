package com.amankay.backend.modules.payments;

import com.amankay.backend.modules.common.DomainException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/** Stores transfer receipts outside the public web root using opaque server-generated names. */
@Component
public class PrivateReceiptStorage {
    private static final int MAX_BYTES = 5 * 1024 * 1024;
    private final String configuredDirectory;

    public PrivateReceiptStorage(@Value("${amankay.private-files-dir:}") String configuredDirectory) {
        this.configuredDirectory = configuredDirectory;
    }

    public String store(MultipartFile upload) throws IOException {
        if (configuredDirectory == null || configuredDirectory.isBlank()) {
            throw new DomainException(HttpStatus.SERVICE_UNAVAILABLE, "El almacenamiento privado de comprobantes no está configurado.");
        }
        if (upload == null || upload.isEmpty() || upload.getSize() > MAX_BYTES) {
            throw new DomainException(HttpStatus.BAD_REQUEST, "El comprobante debe pesar entre 1 byte y 5 MB.");
        }
        byte[] content = upload.getBytes();
        String extension = detectExtension(content);
        Path directory = Path.of(configuredDirectory).toAbsolutePath().normalize();
        Files.createDirectories(directory);
        Path realDirectory = directory.toRealPath();
        String key = UUID.randomUUID() + extension;
        Path destination = realDirectory.resolve(key).normalize();
        if (!destination.getParent().equals(realDirectory)) {
            throw new IOException("La ruta de almacenamiento no es válida.");
        }
        Files.write(destination, content, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
        return key;
    }

    public Download load(String key) throws IOException {
        Path file = resolve(key);
        if (!Files.isRegularFile(file)) throw new DomainException(HttpStatus.NOT_FOUND, "No se encontró el comprobante.");
        return new Download(Files.readAllBytes(file), contentType(key), key);
    }

    public void delete(String key) throws IOException {
        if (key != null && !key.isBlank()) Files.deleteIfExists(resolve(key));
    }

    private Path resolve(String key) throws IOException {
        if (configuredDirectory == null || configuredDirectory.isBlank()) {
            throw new DomainException(HttpStatus.SERVICE_UNAVAILABLE, "El almacenamiento privado de comprobantes no está configurado.");
        }
        if (key == null || !key.matches("[0-9a-fA-F-]{36}\\.(png|jpg|pdf)")) {
            throw new DomainException(HttpStatus.NOT_FOUND, "No se encontró el comprobante.");
        }
        Path directory = Path.of(configuredDirectory).toAbsolutePath().normalize();
        Path realDirectory = directory.toRealPath();
        Path file = realDirectory.resolve(key).normalize();
        if (!file.getParent().equals(realDirectory)) throw new DomainException(HttpStatus.NOT_FOUND, "No se encontró el comprobante.");
        return file;
    }

    private String detectExtension(byte[] content) {
        if (content.length >= 8
                && content[0] == (byte) 0x89 && content[1] == 0x50 && content[2] == 0x4e && content[3] == 0x47
                && content[4] == 0x0d && content[5] == 0x0a && content[6] == 0x1a && content[7] == 0x0a) return ".png";
        if (content.length >= 3 && content[0] == (byte) 0xff && content[1] == (byte) 0xd8 && content[2] == (byte) 0xff) return ".jpg";
        if (content.length >= 5 && content[0] == '%' && content[1] == 'P' && content[2] == 'D' && content[3] == 'F' && content[4] == '-') return ".pdf";
        throw new DomainException(HttpStatus.BAD_REQUEST, "Usa un comprobante PNG, JPEG o PDF válido.");
    }

    private String contentType(String key) {
        if (key.endsWith(".png")) return "image/png";
        if (key.endsWith(".jpg")) return "image/jpeg";
        return "application/pdf";
    }

    public record Download(byte[] bytes, String contentType, String fileName) {}
}
