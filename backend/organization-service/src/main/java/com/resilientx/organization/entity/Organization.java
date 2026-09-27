package com.resilientx.organization.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "organizations", schema = "organization")
public class Organization {

    @Id
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Organization() {}

    public Organization(String id, String name, String slug, String description, String contactEmail) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.contactEmail = contactEmail;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
