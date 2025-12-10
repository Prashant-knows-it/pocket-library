package com.example.PocketBackend.controller;

import com.example.PocketBackend.entity.User;
import com.example.PocketBackend.service.FileService;
import com.example.PocketBackend.service.PerplexityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = "*")
public class PdfController {

    @Autowired
    private FileService fileService;

    @Autowired
    private PerplexityService perplexityService;

    /**
     * Generate summary for a PDF file
     * POST /api/pdf/summarize/{fileId}
     */
    @PostMapping("/summarize/{fileId}")
    public ResponseEntity<Map<String, String>> summarizePdf(
            @PathVariable Long fileId,
            @AuthenticationPrincipal User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            // Get file entity
            var fileEntity = fileService.getFileById(fileId, user);

            String summary;

            // Check if summary already exists in cache
            if (fileEntity.getAiSummary() != null && !fileEntity.getAiSummary().isEmpty()) {
                summary = fileEntity.getAiSummary();
            } else {
                // Extract text from PDF
                String pdfText = fileService.extractTextFromPdf(fileId, user);

                // Get summary from Perplexity
                summary = perplexityService.summarizePdf(pdfText);

                // Save summary to database for future use
                fileService.saveSummary(fileId, user, summary);
            }

            // Return response
            Map<String, String> response = new HashMap<>();
            response.put("summary", summary);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate summary: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Chat with a PDF file
     * POST /api/pdf/chat/{fileId}
     * Body: { "messages": [{"role": "user", "content": "question"}] }
     */
    @PostMapping("/chat/{fileId}")
    public ResponseEntity<Map<String, String>> chatWithPdf(
            @PathVariable Long fileId,
            @RequestBody Map<String, List<Map<String, String>>> requestBody,
            @AuthenticationPrincipal User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            // Extract text from PDF
            String pdfText = fileService.extractTextFromPdf(fileId, user);

            // Get messages from request
            List<Map<String, String>> messages = requestBody.get("messages");

            if (messages == null || messages.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No messages provided");
                return ResponseEntity.badRequest().body(error);
            }

            // Get response from Perplexity
            String aiResponse = perplexityService.chatWithPdf(pdfText, messages);

            // Return response
            Map<String, String> response = new HashMap<>();
            response.put("response", aiResponse);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to chat with PDF: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
