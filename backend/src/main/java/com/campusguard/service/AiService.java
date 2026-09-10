package com.campusguard.service;

import java.util.Map;

public interface AiService {
    Map<String, Object> analyzeIncident(String incidentType, String severity, String description, String location);
    Map<String, Object> chat(String prompt, String userRole);
}
