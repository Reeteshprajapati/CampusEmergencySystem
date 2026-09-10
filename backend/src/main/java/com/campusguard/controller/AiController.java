package com.campusguard.controller;

import com.campusguard.dto.ApiResponse;
import com.campusguard.security.UserPrincipal;
import com.campusguard.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Assistance", description = "Groq AI Powered Campus Safety & Incident Analysis Endpoints")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/analyze")
    @Operation(summary = "Analyze Incident with Groq AI", description = "Provides automated AI triage, risk analysis, and safety steps for an emergency incident")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyzeIncident(@RequestBody Map<String, String> request) {
        String type = request.getOrDefault("type", "General Emergency");
        String severity = request.getOrDefault("severity", "MEDIUM");
        String description = request.getOrDefault("description", "Campus incident");
        String location = request.getOrDefault("location", "Campus Building");

        Map<String, Object> result = aiService.analyzeIncident(type, severity, description, location);
        return ResponseEntity.ok(ApiResponse.success("AI incident analysis generated", result));
    }

    @PostMapping("/chat")
    @Operation(summary = "Campus Safety AI Chatbot", description = "24/7 AI Safety Assistant for guidance, emergency protocols, and help")
    public ResponseEntity<ApiResponse<Map<String, Object>>> chat(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        String prompt = request.getOrDefault("prompt", "Hello");
        String role = userPrincipal != null && userPrincipal.getAuthorities() != null ?
                userPrincipal.getAuthorities().toString() : "STUDENT";

        Map<String, Object> result = aiService.chat(prompt, role);
        return ResponseEntity.ok(ApiResponse.success("AI chat response generated", result));
    }
}
