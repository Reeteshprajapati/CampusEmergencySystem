package com.campusguard.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {
    private long totalIncidents;
    private long activeIncidents;
    private long criticalIncidents;
    private long resolvedToday;

    private List<Map<String, Object>> categoryDistribution;
    private List<Map<String, Object>> severityDistribution;
    private List<Map<String, Object>> locationDistribution;
    private List<Map<String, Object>> officerPerformance;

    public DashboardStatsResponse() {}

    public DashboardStatsResponse(long totalIncidents, long activeIncidents, long criticalIncidents, long resolvedToday, List<Map<String, Object>> categoryDistribution, List<Map<String, Object>> severityDistribution, List<Map<String, Object>> locationDistribution, List<Map<String, Object>> officerPerformance) {
        this.totalIncidents = totalIncidents;
        this.activeIncidents = activeIncidents;
        this.criticalIncidents = criticalIncidents;
        this.resolvedToday = resolvedToday;
        this.categoryDistribution = categoryDistribution;
        this.severityDistribution = severityDistribution;
        this.locationDistribution = locationDistribution;
        this.officerPerformance = officerPerformance;
    }

    public long getTotalIncidents() { return totalIncidents; }
    public void setTotalIncidents(long totalIncidents) { this.totalIncidents = totalIncidents; }
    public long getActiveIncidents() { return activeIncidents; }
    public void setActiveIncidents(long activeIncidents) { this.activeIncidents = activeIncidents; }
    public long getCriticalIncidents() { return criticalIncidents; }
    public void setCriticalIncidents(long criticalIncidents) { this.criticalIncidents = criticalIncidents; }
    public long getResolvedToday() { return resolvedToday; }
    public void setResolvedToday(long resolvedToday) { this.resolvedToday = resolvedToday; }
    public List<Map<String, Object>> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(List<Map<String, Object>> categoryDistribution) { this.categoryDistribution = categoryDistribution; }
    public List<Map<String, Object>> getSeverityDistribution() { return severityDistribution; }
    public void setSeverityDistribution(List<Map<String, Object>> severityDistribution) { this.severityDistribution = severityDistribution; }
    public List<Map<String, Object>> getLocationDistribution() { return locationDistribution; }
    public void setLocationDistribution(List<Map<String, Object>> locationDistribution) { this.locationDistribution = locationDistribution; }
    public List<Map<String, Object>> getOfficerPerformance() { return officerPerformance; }
    public void setOfficerPerformance(List<Map<String, Object>> officerPerformance) { this.officerPerformance = officerPerformance; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private long totalIncidents;
        private long activeIncidents;
        private long criticalIncidents;
        private long resolvedToday;
        private List<Map<String, Object>> categoryDistribution;
        private List<Map<String, Object>> severityDistribution;
        private List<Map<String, Object>> locationDistribution;
        private List<Map<String, Object>> officerPerformance;

        public Builder totalIncidents(long totalIncidents) { this.totalIncidents = totalIncidents; return this; }
        public Builder activeIncidents(long activeIncidents) { this.activeIncidents = activeIncidents; return this; }
        public Builder criticalIncidents(long criticalIncidents) { this.criticalIncidents = criticalIncidents; return this; }
        public Builder resolvedToday(long resolvedToday) { this.resolvedToday = resolvedToday; return this; }
        public Builder categoryDistribution(List<Map<String, Object>> categoryDistribution) { this.categoryDistribution = categoryDistribution; return this; }
        public Builder severityDistribution(List<Map<String, Object>> severityDistribution) { this.severityDistribution = severityDistribution; return this; }
        public Builder locationDistribution(List<Map<String, Object>> locationDistribution) { this.locationDistribution = locationDistribution; return this; }
        public Builder officerPerformance(List<Map<String, Object>> officerPerformance) { this.officerPerformance = officerPerformance; return this; }
        public DashboardStatsResponse build() { return new DashboardStatsResponse(totalIncidents, activeIncidents, criticalIncidents, resolvedToday, categoryDistribution, severityDistribution, locationDistribution, officerPerformance); }
    }
}
