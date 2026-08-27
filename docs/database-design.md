# Database Design (ERD) Document

## 1. Introduction

This document presents the Entity Relationship Diagram (ERD) and database design for SultiAI. The database follows a relational model optimized for the application's requirements.

---

## 2. Database Overview

### 2.1 Database Systems

| Database | Purpose | Environment |
|----------|---------|-------------|
| **SQLite** | Local development, offline support | Development |
| **Supabase (PostgreSQL)** | Production cloud database | Production |

### 2.2 Design Principles

- **Normalization**: Third Normal Form (3NF) for data integrity
- **Referential Integrity**: Foreign key constraints
- **Indexing**: Optimized for common queries
- **Soft Deletes**: Data preservation with `deleted_at` timestamps

---

## 3. Entity Relationship Diagram (ERD)

### 3.1 Core Entities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CORE ENTITIES                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐              │
│  │       users         │         │  learner_profiles    │              │
│  ├─────────────────────┤         ├─────────────────────┤              │
│  │ PK user_id         │────┐    │ PK profile_id       │              │
│  │    email            │    │    │ FK user_id          │────┐         │
│  │    name             │    ├───│    level             │    │         │
│  │    password_hash    │    │    │    total_xp         │    │         │
│  │    avatar_url       │    │    │    streak           │    │         │
│  │    is_verified      │    │    │    hearts           │    │         │
│  │    is_native_speaker│    │    │    daily_goal       │    │         │
│  │    bio              │    │    │    daily_xp         │    │         │
│  │    created_at       │    │    │    created_at       │    │         │
│  │    updated_at       │    │    └─────────────────────┘    │         │
│  └─────────────────────┘    │                               │         │
│                             │    ┌─────────────────────┐    │         │
│                             │    │   tutor_sessions     │    │         │
│                             │    ├─────────────────────┤    │         │
│                             │    │ PK session_id       │    │         │
│                             └───│ FK user_id          │────┘         │
│                                  │    session_type      │              │
│                                  │    topic             │              │
│                                  │    xp_earned         │              │
│                                  │    started_at        │              │
│                                  │    ended_at          │              │
│                                  └─────────────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Message and Conversation Entities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      MESSAGE & CONVERSATION                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐              │
│  │     messages        │         │ conversation_summaries│             │
│  ├─────────────────────┤         ├─────────────────────┤              │
│  │ PK message_id      │         │ PK id               │              │
│  │ FK session_id      │────┐    │ FK user_id          │────┐         │
│  │    role             │    │    │    summary          │    │         │
│  │    content          │    │    │    topics           │    │         │
│  │    audio_url        │    │    │    vocabulary_learned│   │         │
│  │    pronunciation_score│  │    │    duration         │    │         │
│  │    created_at       │    │    │    timestamp        │    │         │
│  └─────────────────────┘    │    └─────────────────────┘    │         │
│                             │                               │         │
│                             │    ┌─────────────────────┐    │         │
│                             │    │      users          │    │         │
│                             │    └─────────────────────┘    │         │
│                             └───────────────────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Vocabulary and Learning Entities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    VOCABULARY & LEARNING                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐              │
│  │  vocabulary_reviews │         │ pronunciation_attempts│             │
│  ├─────────────────────┤         ├─────────────────────┤              │
│  │ PK id               │         │ PK id               │              │
│  │ FK user_id          │────┐    │ FK user_id          │────┐         │
│  │    word             │    │    │    word             │    │         │
│  │    translation      │    │    │    phonetic_expected│   │         │
│  │    pronunciation    │    │    │    phonetic_heard   │    │         │
│  │    category         │    │    │    accuracy         │    │         │
│  │    difficulty       │    │    │    confidence       │    │         │
│  │    mastery          │    │    │    mistakes         │    │         │
│  │    review_count     │    │    │    lesson_context   │    │         │
│  │    ease_factor      │    │    │    timestamp        │    │         │
│  │    interval         │    │    └─────────────────────┘    │         │
│  │    next_review      │    │                               │         │
│  │    is_favorite      │    │    ┌─────────────────────┐    │         │
│  │    created_at       │    │    │ learning_analytics   │    │         │
│  └─────────────────────┘    │    ├─────────────────────┤    │         │
│                             │    │ PK id               │    │         │
│                             └───│ FK user_id          │────┘         │
│                                  │    total_speaking_seconds│          │
│                                  │    total_words_learned   │          │
│                                  │    avg_pronunciation_accuracy│     │
│                                  │    weekly_xp             │          │
│                                  │    last_calculated       │          │
│                                  └─────────────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Gamification Entities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      GAMIFICATION                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐              │
│  │      xp_logs        │         │    achievements     │              │
│  ├─────────────────────┤         ├─────────────────────┤              │
│  │ PK id               │         │ PK id               │              │
│  │ FK user_id          │────┐    │    title            │    │         │
│  │    amount           │    │    │    description      │    │         │
│  │    source           │    │    │    condition        │    │         │
│  │    description      │    │    │    xp_reward        │    │         │
│  │    timestamp        │    │    │    coin_reward      │    │         │
│  └─────────────────────┘    │    │    icon             │    │         │
│                             │    └─────────────────────┘    │         │
│  ┌─────────────────────┐    │                               │         │
│  │   user_achievements │    │    ┌─────────────────────┐    │         │
│  ├─────────────────────┤    │    │    badges           │    │         │
│  │ PK id               │    │    ├─────────────────────┤    │         │
│  │ FK user_id          │────┘    │ PK id               │    │         │
│  │ FK achievement_id   │────┐    │    title            │    │         │
│  │    unlocked_at      │    │    │    description      │    │         │
│  └─────────────────────┘    │    │    icon             │    │         │
│                             │    │    requirement      │    │         │
│                             │    └─────────────────────┘    │         │
│                             └───────────────────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Community Entities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        COMMUNITY                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐              │
│  │   community_posts   │         │      comments       │              │
│  ├─────────────────────┤         ├─────────────────────┤              │
│  │ PK post_id         │────┐    │ PK comment_id       │              │
│  │ FK user_id         │    │    │ FK post_id          │────┐         │
│  │    content          │    │    │ FK user_id          │    │         │
│  │    category         │    │    │    content          │    │         │
│  │    likes_count      │    │    │    created_at       │    │         │
│  │    bookmarks_count  │    │    └─────────────────────┘    │         │
│  │    is_featured      │    │                               │         │
│  │    created_at       │    │    ┌─────────────────────┐    │         │
│  └─────────────────────┘    │    │      likes          │    │         │
│                             │    ├─────────────────────┤    │         │
│                             │    │ PK id               │    │         │
│                             │    │ FK user_id          │────┘         │
│                             │    │ FK post_id          │────┐         │
│                             │    │    created_at       │    │         │
│                             │    └─────────────────────┘    │         │
│                             │                               │         │
│                             │    ┌─────────────────────┐    │         │
│                             │    │    bookmarks        │    │         │
│                             │    ├─────────────────────┤    │         │
│                             │    │ PK id               │    │         │
│                             │    │ FK user_id          │────┘         │
│                             │    │ FK post_id          │────┐         │
│                             │    │    created_at       │    │         │
│                             │    └─────────────────────┘    │         │
│                             └───────────────────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.6 System Entities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SYSTEM                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐              │
│  │    user_sessions    │         │  notification_prefs  │              │
│  ├─────────────────────┤         ├─────────────────────┤              │
│  │ PK id               │         │ PK id               │              │
│  │ FK user_id          │────┐    │ FK user_id          │────┐         │
│  │    refresh_token    │    │    │    daily_reminder   │    │         │
│  │    device_info      │    │    │    streak_reminder  │    │         │
│  │    ip_address       │    │    │    review_reminder  │    │         │
│  │    expires_at       │    │    │    weekly_report    │    │         │
│  │    created_at       │    │    │    updated_at       │    │         │
│  └─────────────────────┘    │    └─────────────────────┘    │         │
│                             │                               │         │
│  ┌─────────────────────┐    │    ┌─────────────────────┐    │         │
│  │    audit_logs       │    │    │ ai_recommendations  │    │         │
│  ├─────────────────────┤    │    ├─────────────────────┤    │         │
│  │ PK id               │    │    │ PK id               │    │         │
│  │ FK user_id          │────┘    │ FK user_id          │────┘         │
│  │    action           │         │    recommendation_type│              │
│  │    resource_type    │         │    content           │              │
│  │    resource_id      │         │    priority          │              │
│  │    details          │         │    is_applied        │              │
│  │    ip_address       │         │    created_at        │              │
│  │    timestamp        │         └─────────────────────┘              │
│  └─────────────────────┘                                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Complete ERD (Text Format)

```
┌─────────────────────┐       ┌─────────────────────┐
│       users         │       │  learner_profiles    │
├─────────────────────┤       ├─────────────────────┤
│ PK user_id         │───┐   │ PK profile_id       │
│    email            │   │   │ FK user_id          │
│    name             │   ├───│    level             │
│    password_hash    │   │   │    total_xp         │
│    avatar_url       │   │   │    streak           │
│    is_verified      │   │   │    hearts           │
│    is_native_speaker│   │   │    daily_goal       │
│    bio              │   │   │    daily_xp         │
│    created_at       │   │   └─────────────────────┘
│    updated_at       │   │
└─────────────────────┘   │   ┌─────────────────────┐
                          │   │   tutor_sessions     │
                          │   ├─────────────────────┤
                          │   │ PK session_id       │
                          └───│ FK user_id          │
                              │    session_type      │
                              │    topic             │
                              │    xp_earned         │
                              │    started_at        │
                              │    ended_at          │
                              └─────────────────────┘
                                      │
                                      │ 1:N
                                      ▼
                              ┌─────────────────────┐
                              │      messages        │
                              ├─────────────────────┤
                              │ PK message_id       │
                              │ FK session_id       │
                              │    role             │
                              │    content          │
                              │    audio_url        │
                              │    pronunciation_score│
                              │    created_at       │
                              └─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│  vocabulary_reviews │       │ pronunciation_attempts│
├─────────────────────┤       ├─────────────────────┤
│ PK id               │       │ PK id               │
│ FK user_id          │       │ FK user_id          │
│    word             │       │    word             │
│    translation      │       │    phonetic_expected│
│    pronunciation    │       │    phonetic_heard   │
│    category         │       │    accuracy         │
│    difficulty       │       │    confidence       │
│    mastery          │       │    mistakes         │
│    review_count     │       │    lesson_context   │
│    ease_factor      │       │    timestamp        │
│    interval         │       └─────────────────────┘
│    next_review      │
│    is_favorite      │       ┌─────────────────────┐
│    created_at       │       │ learning_analytics   │
└─────────────────────┘       ├─────────────────────┤
                              │ PK id               │
                              │ FK user_id          │
┌─────────────────────┐       │    total_speaking   │
│      xp_logs        │       │    total_words      │
├─────────────────────┤       │    avg_accuracy     │
│ PK id               │       │    weekly_xp        │
│ FK user_id          │       │    last_calculated  │
│    amount           │       └─────────────────────┘
│    source           │
│    description      │       ┌─────────────────────┐
│    timestamp        │       │    achievements     │
└─────────────────────┘       ├─────────────────────┤
                              │ PK id               │
┌─────────────────────┐       │    title            │
│   community_posts   │       │    description      │
├─────────────────────┤       │    condition        │
│ PK post_id         │       │    xp_reward        │
│ FK user_id         │       │    coin_reward      │
│    content          │       │    icon             │
│    category         │       └─────────────────────┘
│    likes_count      │
│    bookmarks_count  │       ┌─────────────────────┐
│    is_featured      │       │   user_achievements │
│    created_at       │       ├─────────────────────┤
└─────────────────────┘       │ PK id               │
                              │ FK user_id          │
┌─────────────────────┐       │ FK achievement_id   │
│      comments       │       │    unlocked_at      │
├─────────────────────┤       └─────────────────────┘
│ PK comment_id       │
│ FK post_id          │       ┌─────────────────────┐
│ FK user_id          │       │      likes          │
│    content          │       ├─────────────────────┤
│    created_at       │       │ PK id               │
└─────────────────────┘       │ FK user_id          │
                              │ FK post_id          │
┌─────────────────────┐       │    created_at       │
│    bookmarks        │       └─────────────────────┘
├─────────────────────┤
│ PK id               │       ┌─────────────────────┐
│ FK user_id          │       │    user_sessions    │
│ FK post_id          │       ├─────────────────────┤
│    created_at       │       │ PK id               │
└─────────────────────┘       │ FK user_id          │
                              │    refresh_token    │
┌─────────────────────┐       │    device_info      │
│  notification_prefs │       │    ip_address       │
├─────────────────────┤       │    expires_at       │
│ PK id               │       │    created_at       │
│ FK user_id          │       └─────────────────────┘
│    daily_reminder   │
│    streak_reminder  │       ┌─────────────────────┐
│    review_reminder  │       │    audit_logs       │
│    weekly_report    │       ├─────────────────────┤
│    updated_at       │       │ PK id               │
└─────────────────────┘       │ FK user_id          │
                              │    action           │
┌─────────────────────┐       │    resource_type    │
│ ai_recommendations  │       │    resource_id      │
├─────────────────────┤       │    details          │
│ PK id               │       │    ip_address       │
│ FK user_id          │       │    timestamp        │
│    recommendation_type│     └─────────────────────┘
│    content           │
│    priority          │
│    is_applied        │
│    created_at        │
└─────────────────────┘
```

---

## 5. Database Schema Summary

### 5.1 Table Count

| Category | Tables | Purpose |
|----------|--------|---------|
| **Core** | 3 | users, learner_profiles, tutor_sessions |
| **Messages** | 2 | messages, conversation_summaries |
| **Vocabulary** | 3 | vocabulary_reviews, pronunciation_attempts, learning_analytics |
| **Gamification** | 3 | xp_logs, achievements, user_achievements |
| **Community** | 4 | community_posts, comments, likes, bookmarks |
| **System** | 4 | user_sessions, notification_preferences, ai_recommendations, audit_logs |
| **Total** | **19** | |

### 5.2 Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| users → learner_profiles | 1:1 | Each user has one profile |
| users → tutor_sessions | 1:N | Users can have many sessions |
| tutor_sessions → messages | 1:N | Sessions contain many messages |
| users → vocabulary_reviews | 1:N | Users have many vocabulary items |
| users → pronunciation_attempts | 1:N | Users have many pronunciation records |
| users → community_posts | 1:N | Users can create many posts |
| community_posts → comments | 1:N | Posts can have many comments |
| users → likes | 1:N | Users can like many posts |
| users → bookmarks | 1:N | Users can bookmark many posts |
| achievements → user_achievements | 1:N | Achievements can be unlocked by many users |

---

## 6. Indexing Strategy

### 6.1 Primary Indexes

- All primary keys are automatically indexed
- Foreign keys are indexed for join performance

### 6.2 Secondary Indexes

| Table | Column(s) | Purpose |
|-------|-----------|---------|
| `vocabulary_reviews` | `user_id, next_review` | Spaced repetition queries |
| `pronunciation_attempts` | `user_id, timestamp` | Analytics queries |
| `xp_logs` | `user_id, timestamp` | XP history queries |
| `community_posts` | `user_id, created_at` | User posts queries |
| `audit_logs` | `user_id, action` | Audit trail queries |

---

## 7. Data Integrity

### 7.1 Constraints

- **Primary Keys**: Unique identifier for each record
- **Foreign Keys**: Referential integrity between tables
- **Unique Constraints**: Email uniqueness in users table
- **Not Null**: Required fields enforced
- **Check Constraints**: Valid ranges for numeric fields

### 7.2 Cascading Rules

- **ON DELETE CASCADE**: Deleting a user removes all related records
- **ON UPDATE CASCADE**: Updating user ID propagates to related tables

---

## 8. Backup and Recovery

### 8.1 Backup Strategy

| Database | Method | Frequency |
|----------|--------|-----------|
| **SQLite** | File copy | Daily |
| **Supabase** | Automated backups | Daily + Point-in-time |

### 8.2 Recovery Procedures

1. **SQLite**: Restore from file backup
2. **Supabase**: Use point-in-time recovery
3. **Data Import**: SQL scripts for schema restoration

---

## 9. Conclusion

The SultiAI database design provides:

1. **Complete Data Model**: All application requirements covered
2. **Referential Integrity**: Foreign key constraints ensure consistency
3. **Performance Optimization**: Strategic indexing for common queries
4. **Scalability**: Design supports future feature additions
5. **Data Preservation**: Soft deletes and audit logging

The ERD accurately represents the implemented database schema and supports all application features.

---

*Document Version: 1.0*
*Last Updated: August 2026*
*Author: SultiAI Development Team*
