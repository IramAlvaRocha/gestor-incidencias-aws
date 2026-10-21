# Diagramas entidad-relación por módulo

Los enlaces entre servicios son lógicos, no claves foráneas. Una línea o{ representa múltiples filas y o| cero o una; FK opcionales se indican con |o. Las tablas externas al módulo aparecen como contexto.

## Identidad local y permisos

```mermaid
erDiagram
    app_user {
        char_36_ id PK
        varchar_160_ display_name
        varchar_254_ email_display
        varchar_32_ status
        int version
    }
    identity_link {
        char_36_ id PK
        char_36_ user_id
        varchar_255_ issuer
        varchar_255_ subject
    }
    employee {
        char_36_ id PK
        char_36_ user_id
        varchar_32_ agency_role
        varchar_32_ status
    }
    client {
        char_36_ id PK
        varchar_160_ name
        varchar_64_ slug
        varchar_32_ status
        int version
    }
    requester_level {
        char_36_ id PK
        char_36_ client_id
        varchar_64_ code
        varchar_160_ name
        varchar_32_ status
    }
    client_contact {
        char_36_ id PK
        char_36_ client_id
        char_36_ user_id
        char_36_ requester_level_id
        varchar_32_ status
    }
    project {
        char_36_ id PK
        char_36_ client_id
        varchar_160_ name
        varchar_64_ project_key
        char_36_ manager_user_id
        varchar_32_ status
        int version
    }
    project_member {
        char_36_ id PK
        char_36_ client_id
        char_36_ project_id
        char_36_ user_id
        varchar_32_ role
        char_36_ requester_level_id
        varchar_32_ status
        datetime_3_ valid_from
        datetime_3_ valid_until
    }
    project_counter {
        char_36_ id PK
        char_36_ project_id
        bigint next_number
    }
    invitation {
        char_36_ id PK
        char_36_ client_id
        char_36_ project_id
        varchar_254_ email_normalized
        varchar_32_ role
        char_64_ token_hash
        datetime_3_ expires_at
        datetime_3_ accepted_at
        datetime_3_ revoked_at
        char_36_ invited_by
    }
    app_user ||--o{ identity_link : "user_id"
    app_user ||--o| employee : "user_id"
    client ||--o{ requester_level : ""
    client ||--o{ client_contact : ""
    app_user ||--o{ client_contact : "user_id"
    requester_level |o--o{ client_contact : "requester_level_id"
    client ||--o{ project : ""
    app_user ||--o{ project : "manager_user_id"
    client ||--o{ project_member : ""
    project ||--o{ project_member : "project_id"
    app_user ||--o{ project_member : "user_id"
    requester_level |o--o{ project_member : "requester_level_id"
    project ||--o| project_counter : "project_id"
    client ||--o{ invitation : ""
    project ||--o{ invitation : "project_id"
    app_user ||--o{ invitation : "invited_by"
```

## Organización y catálogo

```mermaid
erDiagram
    area {
        char_36_ id PK
        varchar_64_ code
        varchar_160_ name
        char_36_ owner_user_id
        varchar_32_ status
    }
    resolver_group {
        char_36_ id PK
        char_36_ area_id
        varchar_64_ code
        varchar_160_ name
        char_36_ lead_user_id
        char_36_ backup_user_id
        varchar_32_ status
    }
    group_member {
        char_36_ id PK
        char_36_ group_id
        char_36_ user_id
        varchar_32_ status
    }
    project_group {
        char_36_ id PK
        char_36_ client_id
        char_36_ project_id
        char_36_ group_id
        varchar_32_ status
    }
    product {
        char_36_ id PK
        varchar_64_ code
        varchar_160_ name
        varchar_160_ vendor
        varchar_32_ status
    }
    client_product {
        char_36_ id PK
        char_36_ client_id
        char_36_ product_id
        varchar_160_ contract_reference
        varchar_32_ status
        datetime_3_ valid_from
        datetime_3_ valid_until
    }
    service_category {
        char_36_ id PK
        varchar_64_ code
        varchar_160_ name
        varchar_32_ status
    }
    service {
        char_36_ id PK
        char_36_ category_id
        varchar_64_ code
        varchar_160_ name
        varchar_32_ status
    }
    subservice {
        char_36_ id PK
        char_36_ service_id
        varchar_64_ code
        varchar_32_ status
    }
    subservice_version {
        char_36_ id PK
        char_36_ subservice_id
        int revision
        varchar_160_ name
        text description
        varchar_32_ request_type
        json form_schema
        char_36_ default_group_id
        boolean requires_ci
        varchar_32_ status
        datetime_3_ published_at
    }
    service_offering {
        char_36_ id PK
        char_36_ client_id
        char_36_ project_id
        char_36_ subservice_version_id
        char_36_ client_product_id
        char_36_ routing_version_id
        char_36_ sla_policy_version_id
        varchar_32_ status
        datetime_3_ valid_from
        datetime_3_ valid_until
    }
    offering_level {
        char_36_ id PK
        char_36_ client_id
        char_36_ offering_id
        char_36_ requester_level_id
    }
    app_user ||--o{ area : "owner_user_id"
    area ||--o{ resolver_group : "area_id"
    app_user ||--o{ resolver_group : "lead_user_id"
    app_user |o--o{ resolver_group : "backup_user_id"
    resolver_group ||--o{ group_member : "group_id"
    app_user ||--o{ group_member : "user_id"
    client ||--o{ project_group : ""
    project ||--o{ project_group : "project_id"
    resolver_group ||--o{ project_group : "group_id"
    client ||--o{ client_product : ""
    product ||--o{ client_product : "product_id"
    service_category ||--o{ service : "category_id"
    service ||--o{ subservice : "service_id"
    subservice ||--o{ subservice_version : "subservice_id"
    resolver_group ||--o{ subservice_version : "default_group_id"
    client ||--o{ service_offering : ""
    project ||--o{ service_offering : "project_id"
    subservice_version ||--o{ service_offering : "subservice_version_id"
    client_product |o--o{ service_offering : "client_product_id"
    routing_version |o--o{ service_offering : "routing_version_id"
    sla_policy_version |o--o{ service_offering : "sla_policy_version_id"
    client ||--o{ offering_level : ""
    service_offering ||--o{ offering_level : "offering_id"
    requester_level ||--o{ offering_level : "requester_level_id"
```

## CMDB

```mermaid
erDiagram
    ci_class {
        char_36_ id PK
        varchar_64_ code
        varchar_160_ name
        varchar_32_ status
    }
    ci_schema_version {
        char_36_ id PK
        char_36_ class_id
        int revision
        json attribute_schema
        varchar_32_ status
        datetime_3_ published_at
    }
    configuration_item {
        char_36_ id PK
        char_36_ client_id
        varchar_64_ ci_key
        varchar_160_ name
        char_36_ schema_version_id
        char_36_ client_product_id
        varchar_32_ environment
        varchar_32_ criticality
        varchar_32_ status
        json attributes
        char_36_ owner_area_id
        char_36_ support_group_id
        char_36_ technical_owner_user_id
        varchar_64_ source_system
        varchar_160_ external_id
        int version
    }
    ci_project {
        char_36_ id PK
        char_36_ client_id
        char_36_ ci_id
        char_36_ project_id
    }
    ci_relation_type {
        char_36_ id PK
        varchar_64_ code
        varchar_160_ name
        boolean allow_cycles
    }
    ci_relation {
        char_36_ id PK
        char_36_ client_id
        char_36_ source_ci_id
        char_36_ target_ci_id
        char_36_ relation_type_id
        varchar_32_ status
        datetime_3_ valid_from
        datetime_3_ valid_until
    }
    ci_service_link {
        char_36_ id PK
        char_36_ client_id
        char_36_ ci_id
        char_36_ service_id
        char_36_ subservice_id
        varchar_32_ status
        datetime_3_ valid_from
        datetime_3_ valid_until
    }
    offering_ci {
        char_36_ id PK
        char_36_ client_id
        char_36_ offering_id
        char_36_ ci_id
        varchar_32_ status
    }
    ci_class ||--o{ ci_schema_version : "class_id"
    client ||--o{ configuration_item : ""
    ci_schema_version ||--o{ configuration_item : "schema_version_id"
    client_product |o--o{ configuration_item : "client_product_id"
    area ||--o{ configuration_item : "owner_area_id"
    resolver_group ||--o{ configuration_item : "support_group_id"
    app_user |o--o{ configuration_item : "technical_owner_user_id"
    client ||--o{ ci_project : ""
    configuration_item ||--o{ ci_project : "ci_id"
    project ||--o{ ci_project : "project_id"
    client ||--o{ ci_relation : ""
    configuration_item ||--o{ ci_relation : "source_ci_id"
    configuration_item ||--o{ ci_relation : "target_ci_id"
    ci_relation_type ||--o{ ci_relation : "relation_type_id"
    client ||--o{ ci_service_link : ""
    configuration_item ||--o{ ci_service_link : "ci_id"
    service ||--o{ ci_service_link : "service_id"
    subservice |o--o{ ci_service_link : "subservice_id"
    client ||--o{ offering_ci : ""
    service_offering ||--o{ offering_ci : "offering_id"
    configuration_item ||--o{ offering_ci : "ci_id"
```

## Calendarios y políticas

```mermaid
erDiagram
    business_calendar {
        char_36_ id PK
        varchar_64_ code
        varchar_160_ name
        varchar_32_ status
    }
    calendar_version {
        char_36_ id PK
        char_36_ calendar_id
        int revision
        varchar_160_ timezone
        varchar_64_ tzdb_version
        varchar_64_ engine_version
        date coverage_start
        date coverage_end
        char_64_ content_hash
        varchar_32_ status
        datetime_3_ published_at
    }
    calendar_week_interval {
        char_36_ id PK
        char_36_ calendar_version_id
        int weekday_iso
        int start_minute
        int end_minute
    }
    calendar_exception {
        char_36_ id PK
        char_36_ calendar_version_id
        date local_date
        varchar_160_ name
        json recurrence_source
    }
    calendar_exception_interval {
        char_36_ id PK
        char_36_ exception_id
        int start_minute
        int end_minute
    }
    calendar_work_interval {
        char_36_ id PK
        char_36_ calendar_version_id
        datetime_3_ start_at
        datetime_3_ end_at
    }
    sla_policy_set {
        char_36_ id PK
        char_36_ client_id
        varchar_160_ name
        varchar_32_ status
    }
    sla_policy_version {
        char_36_ id PK
        char_36_ client_id
        char_36_ policy_set_id
        int revision
        datetime_3_ effective_from
        varchar_64_ engine_version
        char_64_ content_hash
        varchar_32_ status
        datetime_3_ published_at
    }
    sla_rule {
        char_36_ id PK
        char_36_ client_id
        char_36_ policy_version_id
        int rule_order
        varchar_160_ name
        json conditions
        varchar_32_ priority
        boolean is_fallback
    }
    sla_target {
        char_36_ id PK
        char_36_ client_id
        char_36_ rule_id
        varchar_32_ metric
        bigint target_ms
        char_36_ calendar_version_id
        json pause_reasons
        bigint max_pause_ms
        json warning_thresholds
    }
    routing_version {
        char_36_ id PK
        char_36_ client_id
        varchar_160_ name
        int revision
        varchar_32_ status
        datetime_3_ published_at
    }
    routing_rule {
        char_36_ id PK
        char_36_ client_id
        char_36_ routing_version_id
        int rule_order
        json conditions
        char_36_ group_id
        char_36_ assignee_user_id
        char_36_ fallback_group_id
    }
    business_calendar ||--o{ calendar_version : "calendar_id"
    calendar_version ||--o{ calendar_week_interval : "calendar_version_id"
    calendar_version ||--o{ calendar_exception : "calendar_version_id"
    calendar_exception ||--o{ calendar_exception_interval : "exception_id"
    calendar_version ||--o{ calendar_work_interval : "calendar_version_id"
    client ||--o{ sla_policy_set : ""
    client ||--o{ sla_policy_version : ""
    sla_policy_set ||--o{ sla_policy_version : "policy_set_id"
    client ||--o{ sla_rule : ""
    sla_policy_version ||--o{ sla_rule : "policy_version_id"
    client ||--o{ sla_target : ""
    sla_rule ||--o{ sla_target : "rule_id"
    calendar_version ||--o{ sla_target : "calendar_version_id"
    client ||--o{ routing_version : ""
    client ||--o{ routing_rule : ""
    routing_version ||--o{ routing_rule : "routing_version_id"
    resolver_group ||--o{ routing_rule : "group_id"
    app_user |o--o{ routing_rule : "assignee_user_id"
    resolver_group |o--o{ routing_rule : "fallback_group_id"
```

## Tickets y colaboración

```mermaid
erDiagram
    ticket {
        char_36_ id PK
        char_36_ client_id
        char_36_ project_id
        bigint number
        varchar_64_ ticket_key
        varchar_160_ title
        text description
        varchar_32_ type
        varchar_32_ priority
        varchar_32_ status
        varchar_32_ visibility
        char_36_ reporter_user_id
        char_36_ created_by
        char_36_ offering_id
        char_36_ requester_level_id
        varchar_32_ impact
        varchar_32_ urgency
        json classification_snapshot
        char_36_ current_group_id
        char_36_ assignee_user_id
        varchar_32_ sla_mode
        varchar_64_ resolution_code
        text resolution_summary
        text cancellation_reason
        datetime_3_ accepted_at
        datetime_3_ resolved_at
        datetime_3_ closed_at
        datetime_3_ updated_at
        int version
    }
    ticket_ci {
        char_36_ id PK
        char_36_ client_id
        char_36_ ticket_id
        char_36_ ci_id
        boolean is_primary
        json snapshot
    }
    ticket_comment {
        char_36_ id PK
        char_36_ client_id
        char_36_ ticket_id
        char_36_ author_user_id
        varchar_32_ visibility
        text body
        datetime_3_ edited_at
        int version
    }
    attachment {
        char_36_ id PK
        char_36_ client_id
        char_36_ ticket_id
        char_36_ comment_id
        char_36_ uploaded_by
        varchar_512_ object_key
        varchar_160_ file_name
        varchar_160_ content_type
        bigint size_bytes
        char_64_ checksum
        varchar_32_ visibility
        varchar_32_ scan_status
        datetime_3_ verified_at
    }
    ticket_participant {
        char_36_ id PK
        char_36_ client_id
        char_36_ ticket_id
        char_36_ user_id
        varchar_32_ kind
        char_36_ added_by
        varchar_32_ status
    }
    ticket_relation {
        char_36_ id PK
        char_36_ client_id
        char_36_ source_ticket_id
        char_36_ target_ticket_id
        varchar_32_ kind
    }
    tag {
        char_36_ id PK
        char_36_ client_id
        char_36_ project_id
        varchar_30_ name
    }
    ticket_tag {
        char_36_ id PK
        char_36_ client_id
        char_36_ ticket_id
        char_36_ tag_id
    }
    ticket_event {
        char_36_ id PK
        char_36_ client_id
        char_36_ ticket_id
        bigint sequence
        varchar_64_ event_type
        char_36_ actor_user_id
        datetime_3_ occurred_at
        varchar_32_ visibility
        json payload
        varchar_64_ request_id
    }
    ticket_assignment {
        char_36_ id PK
        char_36_ client_id
        char_36_ ticket_id
        char_36_ group_id
        char_36_ assignee_user_id
        datetime_3_ started_at
        datetime_3_ ended_at
        text reason
        char_36_ assigned_by
        char_36_ routing_rule_id
    }
    ticket_transfer {
        char_36_ id PK
        char_36_ client_id
        char_36_ ticket_id
        char_36_ from_assignment_id
        char_36_ to_group_id
        char_36_ requested_by
        text reason
        varchar_32_ status
        char_36_ decided_by
        text decision_reason
        datetime_3_ decided_at
        datetime_3_ review_due_at
        char_36_ result_assignment_id
        int version
    }
    client ||--o{ ticket : ""
    project ||--o{ ticket : "project_id"
    service_offering |o--o{ ticket : "offering_id"
    requester_level |o--o{ ticket : "requester_level_id"
    app_user ||--o{ ticket : "reporter_user_id"
    app_user ||--o{ ticket : "created_by"
    resolver_group |o--o{ ticket : "current_group_id"
    app_user |o--o{ ticket : "assignee_user_id"
    client ||--o{ ticket_ci : ""
    ticket ||--o{ ticket_ci : "ticket_id"
    configuration_item ||--o{ ticket_ci : "ci_id"
    client ||--o{ ticket_comment : ""
    ticket ||--o{ ticket_comment : "ticket_id"
    app_user ||--o{ ticket_comment : "author_user_id"
    client ||--o{ attachment : ""
    ticket ||--o{ attachment : "ticket_id"
    ticket_comment |o--o{ attachment : "comment_id"
    app_user ||--o{ attachment : "uploaded_by"
    client ||--o{ ticket_participant : ""
    ticket ||--o{ ticket_participant : "ticket_id"
    app_user ||--o{ ticket_participant : "user_id"
    app_user ||--o{ ticket_participant : "added_by"
    client ||--o{ ticket_relation : ""
    ticket ||--o{ ticket_relation : "source_ticket_id"
    ticket ||--o{ ticket_relation : "target_ticket_id"
    client ||--o{ tag : ""
    project ||--o{ tag : "project_id"
    client ||--o{ ticket_tag : ""
    ticket ||--o{ ticket_tag : "ticket_id"
    tag ||--o{ ticket_tag : "tag_id"
    client ||--o{ ticket_event : ""
    ticket ||--o{ ticket_event : "ticket_id"
    app_user |o--o{ ticket_event : "actor_user_id"
    client ||--o{ ticket_assignment : ""
    ticket ||--o{ ticket_assignment : "ticket_id"
    resolver_group ||--o{ ticket_assignment : "group_id"
    app_user |o--o{ ticket_assignment : "assignee_user_id"
    app_user ||--o{ ticket_assignment : "assigned_by"
    routing_rule |o--o{ ticket_assignment : "routing_rule_id"
    client ||--o{ ticket_transfer : ""
    ticket ||--o{ ticket_transfer : "ticket_id"
    ticket_assignment ||--o{ ticket_transfer : "from_assignment_id"
    ticket_assignment |o--o{ ticket_transfer : "result_assignment_id"
    resolver_group ||--o{ ticket_transfer : "to_group_id"
    app_user ||--o{ ticket_transfer : "requested_by"
    app_user |o--o{ ticket_transfer : "decided_by"
```

## SLA en ejecución

```mermaid
erDiagram
    ticket_cycle {
        char_36_ id PK
        char_36_ client_id
        char_36_ ticket_id
        int cycle_number
        datetime_3_ started_at
        datetime_3_ ended_at
        varchar_32_ outcome
        text reason
    }
    sla_evaluation {
        char_36_ id PK
        char_36_ client_id
        char_36_ ticket_id
        char_36_ cycle_id
        char_36_ policy_version_id
        char_36_ rule_id
        json input_snapshot
        json result_snapshot
        datetime_3_ evaluated_at
        varchar_64_ engine_version
        text reason
        char_36_ actor_user_id
    }
    ticket_sla_clock {
        char_36_ id PK
        char_36_ client_id
        char_36_ ticket_id
        char_36_ cycle_id
        varchar_32_ metric
        varchar_32_ state
        datetime_3_ started_at
        bigint consumed_ms
        datetime_3_ checkpoint_at
        datetime_3_ due_at
        datetime_3_ last_due_at
        datetime_3_ breached_at
        datetime_3_ completed_at
        int active_revision_number
        int version
    }
    sla_clock_revision {
        char_36_ id PK
        char_36_ client_id
        char_36_ clock_id
        int revision_number
        char_36_ evaluation_id
        char_36_ target_id
        char_36_ calendar_version_id
        bigint target_ms
        bigint consumed_at_change_ms
        datetime_3_ effective_at
        text reason
    }
    sla_pause {
        char_36_ id PK
        char_36_ client_id
        char_36_ clock_id
        datetime_3_ started_at
        datetime_3_ ended_at
        varchar_64_ reason_code
        text reason_text
        char_36_ trigger_comment_id
        char_36_ started_by
        char_36_ ended_by
        datetime_3_ auto_resume_at
        datetime_3_ review_at
        varchar_64_ dedupe_key
    }
    sla_clock_event {
        char_36_ id PK
        char_36_ client_id
        char_36_ clock_id
        bigint sequence
        varchar_64_ event_type
        datetime_3_ occurred_at
        bigint delta_consumed_ms
        json payload
        char_36_ source_event_id
    }
    sla_alert {
        char_36_ id PK
        char_36_ client_id
        char_36_ clock_id
        int revision_number
        varchar_64_ kind
        datetime_3_ scheduled_at
        datetime_3_ delivered_at
        datetime_3_ cancelled_at
    }
    client ||--o{ ticket_cycle : ""
    ticket ||--o{ ticket_cycle : "ticket_id"
    client ||--o{ sla_evaluation : ""
    ticket ||--o{ sla_evaluation : "ticket_id"
    ticket_cycle ||--o{ sla_evaluation : "cycle_id"
    sla_policy_version ||--o{ sla_evaluation : "policy_version_id"
    sla_rule ||--o{ sla_evaluation : "rule_id"
    app_user |o--o{ sla_evaluation : "actor_user_id"
    client ||--o{ ticket_sla_clock : ""
    ticket ||--o{ ticket_sla_clock : "ticket_id"
    ticket_cycle ||--o{ ticket_sla_clock : "cycle_id"
    client ||--o{ sla_clock_revision : ""
    ticket_sla_clock ||--o{ sla_clock_revision : "clock_id"
    sla_evaluation ||--o{ sla_clock_revision : "evaluation_id"
    sla_target ||--o{ sla_clock_revision : "target_id"
    calendar_version ||--o{ sla_clock_revision : "calendar_version_id"
    client ||--o{ sla_pause : ""
    ticket_sla_clock ||--o{ sla_pause : "clock_id"
    ticket_comment |o--o{ sla_pause : "trigger_comment_id"
    app_user ||--o{ sla_pause : "started_by"
    app_user |o--o{ sla_pause : "ended_by"
    client ||--o{ sla_clock_event : ""
    ticket_sla_clock ||--o{ sla_clock_event : "clock_id"
    ticket_event |o--o{ sla_clock_event : "source_event_id"
    client ||--o{ sla_alert : ""
    ticket_sla_clock ||--o{ sla_alert : "clock_id"
```

## Operación

```mermaid
erDiagram
    outbox_event {
        char_36_ id PK
        char_36_ aggregate_id
        varchar_64_ event_type
        json payload
        datetime_3_ available_at
        datetime_3_ published_at
        int attempts
        datetime_3_ locked_until
        varchar_64_ lease_owner
    }
    consumer_receipt {
        char_36_ id PK
        varchar_64_ consumer
        char_36_ event_id
    }
    notification {
        char_36_ id PK
        char_36_ client_id
        char_36_ recipient_user_id
        char_36_ ticket_id
        char_36_ source_event_id
        varchar_64_ kind
        datetime_3_ read_at
    }
    notification_preference {
        char_36_ id PK
        char_36_ user_id
        varchar_32_ channel
        varchar_64_ event_type
        boolean enabled
    }
    notification_delivery {
        char_36_ id PK
        char_36_ client_id
        char_36_ notification_id
        varchar_32_ channel
        int attempt
        varchar_32_ status
        varchar_160_ provider_message_id
        datetime_3_ sent_at
        varchar_64_ last_error_code
    }
    idempotency_record {
        char_36_ id PK
        char_36_ actor_user_id
        varchar_64_ operation
        varchar_64_ request_key
        char_64_ request_hash
        char_36_ resource_id
        varchar_32_ status
        datetime_3_ expires_at
    }
    audit_event {
        char_36_ id PK
        char_36_ client_id
        char_36_ actor_user_id
        varchar_64_ resource_type
        char_36_ resource_id
        varchar_64_ action
        varchar_64_ request_id
        json payload_redacted
        datetime_3_ occurred_at
    }
    export_job {
        char_36_ id PK
        char_36_ client_id
        char_36_ requested_by
        json filters
        varchar_32_ status
        varchar_512_ object_key
        datetime_3_ expires_at
    }
    client ||--o{ notification : ""
    app_user ||--o{ notification : "recipient_user_id"
    ticket |o--o{ notification : "ticket_id"
    app_user ||--o{ notification_preference : "user_id"
    client ||--o{ notification_delivery : ""
    notification ||--o{ notification_delivery : "notification_id"
    app_user ||--o{ idempotency_record : "actor_user_id"
    client |o--o{ audit_event : ""
    app_user |o--o{ audit_event : "actor_user_id"
    client ||--o{ export_job : ""
    app_user ||--o{ export_job : "requested_by"
```

## Servicio de autenticación opcional

```mermaid
erDiagram
    auth_account {
        char_36_ id PK
        varchar_254_ email_normalized
        datetime_3_ email_verified_at
        varchar_32_ status
        int token_version
        datetime_3_ updated_at
    }
    auth_password {
        char_36_ id PK
        char_36_ account_id
        varchar_512_ encoded_hash
        datetime_3_ changed_at
    }
    auth_session {
        char_36_ id PK
        char_36_ account_id
        varchar_64_ client_code
        datetime_3_ absolute_expires_at
        datetime_3_ idle_expires_at
        datetime_3_ revoked_at
        varchar_64_ revoke_reason
        datetime_3_ last_seen_at
        int version
    }
    auth_refresh_token {
        char_36_ id PK
        char_36_ session_id
        int generation
        char_64_ token_hash
        datetime_3_ expires_at
        datetime_3_ used_at
        datetime_3_ revoked_at
    }
    auth_one_time_token {
        char_36_ id PK
        char_36_ account_id
        varchar_64_ purpose
        char_64_ token_hash
        datetime_3_ expires_at
        datetime_3_ consumed_at
    }
    auth_mfa_credential {
        char_36_ id PK
        char_36_ account_id
        varchar_32_ kind
        varchar_255_ credential_identifier
        json public_data
        varchar_512_ encrypted_secret_ref
        datetime_3_ verified_at
        datetime_3_ revoked_at
    }
    auth_recovery_code {
        char_36_ id PK
        char_36_ account_id
        char_64_ code_hash
        datetime_3_ used_at
    }
    auth_signing_key {
        char_36_ id PK
        varchar_64_ kid
        varchar_64_ algorithm
        json public_jwk
        varchar_512_ private_key_ref
        datetime_3_ active_from
        datetime_3_ retire_after
        varchar_32_ status
    }
    auth_security_event {
        char_36_ id PK
        char_36_ account_id
        char_36_ session_id
        varchar_64_ event_type
        datetime_3_ occurred_at
        json details_redacted
    }
    auth_outbox_event {
        char_36_ id PK
        varchar_64_ event_type
        char_36_ aggregate_id
        json payload
        datetime_3_ published_at
        int attempts
    }
    auth_account ||--o| auth_password : "account_id"
    auth_account ||--o{ auth_session : "account_id"
    auth_session ||--o{ auth_refresh_token : "session_id"
    auth_account ||--o{ auth_one_time_token : "account_id"
    auth_account ||--o{ auth_mfa_credential : "account_id"
    auth_account ||--o{ auth_recovery_code : "account_id"
    auth_account |o--o{ auth_security_event : "account_id"
    auth_session |o--o{ auth_security_event : "session_id"
```

