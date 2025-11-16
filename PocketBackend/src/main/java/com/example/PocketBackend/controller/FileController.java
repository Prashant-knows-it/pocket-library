package com.example.PocketBackend.controller;

import com.example.PocketBackend.entity.FileEntity;
import com.example.PocketBackend.entity.User;
import com.example.PocketBackend.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    @Autowired
    private FileService fileService;

    // Upload any file (PDF, EPUB, etc.)
    @PostMapping("/upload")
    public ResponseEntity<FileEntity> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            FileEntity fileEntity = fileService.uploadFile(file, user);
            return ResponseEntity.ok(fileEntity);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get all files for the authenticated user
    @GetMapping
    public ResponseEntity<List<FileEntity>> getAllFiles(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            List<FileEntity> files = fileService.getAllFiles(user);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get file by ID (only if it belongs to the authenticated user)
    @GetMapping("/{id}")
    public ResponseEntity<FileEntity> getFileById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            FileEntity file = fileService.getFileById(id, user);
            return ResponseEntity.ok(file);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    // Delete file by ID (only if it belongs to the authenticated user)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFile(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            fileService.deleteFile(id, user);
            return ResponseEntity.ok("File deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error deleting file");
        }
    }

    // Download file to device (only if it belongs to the authenticated user)
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            FileEntity file = fileService.getFileById(id, user);
            Resource resource = fileService.getFileResource(id, user);

            // Ensure filename is properly formatted for Content-Disposition header
            String fileName = file.getFileName();
            if (fileName == null || fileName.trim().isEmpty()) {
                fileName = "download";
            }
            
            // Clean up filename - remove any extra underscores or spaces
            fileName = fileName.trim().replaceAll("\\s+", " ");
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(file.getFileType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // View PDF inline in browser (only PDF type, only if it belongs to the authenticated user)
    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewFile(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            FileEntity file = fileService.getFileById(id, user);

            if (file.getFileType() == null || !file.getFileType().contains("pdf")) {
                return ResponseEntity.badRequest().body(null); // Viewing only allowed for PDFs
            }

            Resource resource = fileService.getFileResource(id, user);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + file.getFileName() + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
