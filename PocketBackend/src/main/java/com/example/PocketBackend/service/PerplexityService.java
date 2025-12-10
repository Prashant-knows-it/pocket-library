package com.example.PocketBackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PerplexityService {

    @Value("${perplexity.api.url}")
    private String apiUrl;

    @Value("${perplexity.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Summarize PDF text using Perplexity API
     * 
     * @param pdfText The extracted text from PDF
     * @return Summary text (max 50 lines)
     */
    public String summarizePdf(String pdfText) {
        String prompt = String.format(
                "Please provide a comprehensive summary of this PDF document in maximum 50 lines. " +
                        "Include the main topics, key points, and important details.\n\nPDF Content:\n%s",
                pdfText);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", "sonar-pro");
        payload.put("messages", List.of(message));
        payload.put("temperature", 0.2);
        payload.put("max_tokens", 2000);

        return callPerplexityApi(payload);
    }

    /**
     * Chat with PDF using Perplexity API
     * 
     * @param pdfText  The extracted text from PDF
     * @param messages Conversation history (list of maps with "role" and "content")
     * @return AI response
     */
    public String chatWithPdf(String pdfText, List<Map<String, String>> messages) {
        // Create system message with PDF context
        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", String.format(
                "You are a helpful assistant that answers questions about the following PDF document. " +
                        "Use the document content to provide accurate and detailed answers.\n\nPDF Content:\n%s",
                pdfText));

        // Combine system message with user conversation
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", "sonar-pro");

        // Add system message first, then user messages
        var allMessages = new java.util.ArrayList<>();
        allMessages.add(systemMessage);
        allMessages.addAll(messages);

        payload.put("messages", allMessages);
        payload.put("temperature", 0.2);
        payload.put("max_tokens", 2000);

        return callPerplexityApi(payload);
    }

    /**
     * Make HTTP request to Perplexity API
     */
    private String callPerplexityApi(Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(apiUrl, request, Map.class);

            if (response != null && response.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }

            return "Error: Unable to get response from AI";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
