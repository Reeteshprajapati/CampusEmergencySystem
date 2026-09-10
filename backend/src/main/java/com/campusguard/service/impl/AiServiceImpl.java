package com.campusguard.service.impl;

import com.campusguard.service.AiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiServiceImpl implements AiService {

    private static final Logger log = LoggerFactory.getLogger(AiServiceImpl.class);
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Value("${app.ai.groq-key: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}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public AiServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public Map<String, Object> analyzeIncident(String incidentType, String severity, String description, String location) {
        String systemPrompt = "You are CampusGuard AI, an expert emergency incident triage and campus safety AI analyst. " +
                "Analyze the reported incident and provide structured JSON response with keys: 'summary', 'riskAssessment', 'recommendedActions', 'immediateSafetyTip'. Keep tone concise, authoritative, and helpful.";

        String userPrompt = String.format("Analyze Incident:\n- Type: %s\n- Severity: %s\n- Location: %s\n- Description: %s",
                incidentType, severity, location, description);

        String aiResponse = callGroqApi(systemPrompt, userPrompt);
        Map<String, Object> result = new HashMap<>();
        result.put("analysis", aiResponse);
        result.put("status", "SUCCESS");
        return result;
    }

    @Override
    public Map<String, Object> chat(String prompt, String userRole) {
        String systemPrompt = String.format("You are CampusGuard AI Assistant, an intelligent 24/7 campus safety chatbot. " +
                "You assist users (User Role: %s). Provide helpful, clear, and reassuring guidance on campus emergency response protocols, safety tips, reporting hazards, and contacting campus security.", userRole);

        String aiResponse = callGroqApi(systemPrompt, prompt);
        Map<String, Object> result = new HashMap<>();
        result.put("reply", aiResponse);
        result.put("status", "SUCCESS");
        return result;
    }

    private String callGroqApi(String systemPrompt, String userPrompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey.trim());

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> sysMsg = new HashMap<>();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);
            messages.add(sysMsg);

            Map<String, String> usrMsg = new HashMap<>();
            usrMsg.put("role", "user");
            usrMsg.put("content", userPrompt);
            messages.add(usrMsg);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile");
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 800);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(GROQ_API_URL, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map responseBody = response.getBody();
                List choices = (List) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map firstChoice = (Map) choices.get(0);
                    Map message = (Map) firstChoice.get("message");
                    if (message != null && message.get("content") != null) {
                        return message.get("content").toString();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Groq AI API call failed: {}", e.getMessage(), e);
            // Fallback gracefully if model fails or key network issue occurs
            return "CampusGuard AI Safety Note: System received your query. In case of immediate physical emergency, call Campus Security Hotline immediately at 911 / Campus Emergency Services.";
        }

        return "CampusGuard AI Assistant is ready to help you stay safe on campus.";
    }
}
