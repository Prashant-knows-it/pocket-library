package com.example.PocketBackend.service;

import com.example.PocketBackend.entity.FileEntity;
import com.example.PocketBackend.entity.User;
import com.example.PocketBackend.repository.FileRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class FileService {

    @Autowired
    private FileRepository fileRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path uploadPath;

    // Upload file and extract metadata dynamically
    public FileEntity uploadFile(MultipartFile file, User user) throws IOException {
        if (uploadPath == null) {
            uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
        }

        // Save file to disk
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create entity
        FileEntity fileEntity = new FileEntity();
        fileEntity.setFileName(file.getOriginalFilename());
        fileEntity.setFileType(file.getContentType());
        fileEntity.setFilePath(fileName);
        fileEntity.setFileSize(file.getSize());
        fileEntity.setUser(user);

        // Extract metadata based on file type
        extractMetadata(filePath, fileEntity);

        return fileRepository.save(fileEntity);
    }

    // Extract metadata dynamically based on file type
    private void extractMetadata(Path filePath, FileEntity fileEntity) {
        String fileType = fileEntity.getFileType();

        // PDF Metadata Extraction
        if (fileType != null && fileType.contains("pdf")) {
            extractPdfMetadata(filePath, fileEntity);
        }
        // EPUB Metadata Extraction placeholder for future
        else if (fileType != null && fileType.contains("epub")) {
            extractEpubMetadata(filePath, fileEntity);
        }
        // Default fallback to file name
        else {
            fileEntity.setTitle(fileEntity.getFileName());
        }
    }

    // PDF metadata extraction using PDFBox
    private void extractPdfMetadata(Path pdfPath, FileEntity fileEntity) {
        try (PDDocument document = PDDocument.load(pdfPath.toFile())) {

            // Set page count
            fileEntity.setPages(document.getNumberOfPages());

            // Get document info
            PDDocumentInformation info = document.getDocumentInformation();
            if (info != null) {
                String title = info.getTitle();
                String author = info.getAuthor();

                if (title != null && !title.trim().isEmpty()) {
                    fileEntity.setTitle(title.trim());
                } else {
                    fileEntity.setTitle(fileEntity.getFileName().replaceAll("\\.pdf$", ""));
                }

                if (author != null && !author.trim().isEmpty()) {
                    fileEntity.setAuthor(author.trim());
                }
            }
        } catch (Exception e) {
            // Fallback
            fileEntity.setTitle(fileEntity.getFileName().replaceAll("\\.pdf$", ""));
        }
    }

    // EPUB metadata extraction placeholder
    private void extractEpubMetadata(Path epubPath, FileEntity fileEntity) {
        // TODO: Implement EPUB metadata extraction later
        fileEntity.setTitle(fileEntity.getFileName().replaceAll("\\.epub$", ""));
    }

    // Get all files for a specific user
    public List<FileEntity> getAllFiles(User user) {
        return fileRepository.findByUser(user);
    }

    // Get file by ID and verify it belongs to the user
    public FileEntity getFileById(Long id, User user) {
        FileEntity fileEntity = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + id));

        // Verify the file belongs to the user
        if (!fileEntity.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: File does not belong to user");
        }

        return fileEntity;
    }

    // Delete file and remove from storage
    public void deleteFile(Long id, User user) throws IOException {
        FileEntity fileEntity = getFileById(id, user);

        if (uploadPath == null) {
            uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        }

        Path filePath = uploadPath.resolve(fileEntity.getFilePath());
        Files.deleteIfExists(filePath);

        fileRepository.deleteById(id);
    }

    // Load file as resource for download or viewing
    public Resource getFileResource(Long id, User user) throws IOException {
        FileEntity fileEntity = getFileById(id, user);

        if (uploadPath == null) {
            uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        }

        Path filePath = uploadPath.resolve(fileEntity.getFilePath()).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists()) {
            return resource;
        } else {
            throw new RuntimeException("File not found");
        }
    }

    // Extract text from PDF file for AI processing
    public String extractTextFromPdf(Long id, User user) throws IOException {
        FileEntity fileEntity = getFileById(id, user);

        if (uploadPath == null) {
            uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        }

        Path filePath = uploadPath.resolve(fileEntity.getFilePath()).normalize();

        try (PDDocument document = PDDocument.load(filePath.toFile())) {
            org.apache.pdfbox.text.PDFTextStripper stripper = new org.apache.pdfbox.text.PDFTextStripper();
            StringBuilder text = new StringBuilder();

            for (int i = 1; i <= document.getNumberOfPages(); i++) {
                stripper.setStartPage(i);
                stripper.setEndPage(i);
                text.append("\n--- Page ").append(i).append(" ---\n");
                text.append(stripper.getText(document));
            }

            return text.toString();
        } catch (Exception e) {
            throw new IOException("Failed to extract text from PDF: " + e.getMessage(), e);
        }
    }
}
