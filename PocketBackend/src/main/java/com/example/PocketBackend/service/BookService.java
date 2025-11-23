package com.example.PocketBackend.service;

import com.example.PocketBackend.entity.Books;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class BookService {

    private static final String API_URL = "https://api.perplexity.ai/chat/completions";
    private static final Pattern JSON_PATTERN = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```");

    @Value("${perplexity.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Books> fetchBooks() {
        try {
            String response = sendRequest();
            JsonNode rootNode = objectMapper.readTree(response);
            String content = rootNode.path("choices").get(0).path("message").path("content").asText();
            
            String cleanedContent = extractJsonFromMarkdown(content);
            return objectMapper.readValue(cleanedContent, new TypeReference<List<Books>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private String sendRequest() throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String body = "{\"model\":\"sonar-pro\",\"messages\":[{\"role\":\"user\",\"content\":\"JSON array of 16 unique but best books: bookTitle, authorName, description, genre, numberOfPages\"}]}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
    }

    private String extractJsonFromMarkdown(String content) {
        Matcher matcher = JSON_PATTERN.matcher(content);
        return matcher.find() ? matcher.group(1).trim() : content.trim();
    }
}
