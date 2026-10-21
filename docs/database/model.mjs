/**
 * Modelo objetivo, no migración del sistema existente.
 * Fuente única de SQL, DBML, diccionario y diagramas. Sin dependencias npm.
 * node docs/database/generate.mjs
 */
export const tables = [];
export const modules = {
  access: 'Identidad local y permisos',
  catalog: 'Organización y catálogo',
  cmdb: 'CMDB',
  policy: 'Calendarios y políticas',
  ticket: 'Tickets y colaboración',
  clock: 'SLA en ejecución',
  ops: 'Operación',
  identity: 'Servicio de autenticación opcional',
};
const types = { id:'char(36)', str:'varchar(160)', code:'varchar(64)', status:'varchar(32)',
  dt:'datetime(3)', text:'text', json:'json', ms:'bigint', num:'int', bool:'boolean', date:'date', hash:'char(64)' };
export function table(name, module, description, fields, options={}) {
  const cols = [['id','id',false,'Identificador UUID generado por aplicación'], ...fields]
    .map(([name,type,nullable=false,note=''])=>({name,type:types[type]||type,nullable,note}));
  cols.push({name:'created_at',type:types.dt,nullable:false,note:'Instante UTC'});
  const item = {name,module,description,columns:cols,unique:options.unique||[],indexes:options.indexes||[],
    checks:options.checks||[],refs:[],db:module==='identity'?'identity':'arena'};
  tables.push(item); return item;
}
const f=(name,type='id',nullable=false,note='')=>[name,type,nullable,note];
const user=(name='user_id',nullable=false)=>f(name,'id',nullable);
const state=f('status','status',false,'Enum de dominio validado en servidor');
const version=f('version','num',false,'Control optimista, incremento atómico');
const client=f('client_id');
const project=f('project_id');
const validity=[f('valid_from','dt'),f('valid_until','dt',true,'Límite exclusivo')];
const activeWindow=["valid_until IS NULL OR valid_until > valid_from"];
export function ref(from,columns,to,target=['id']) {
  const t=tables.find(t=>t.name===from); t.refs.push({columns:Array.isArray(columns)?columns:[columns],to,target});
}
function scoped(name,module,description,fields,options={}) {
  const t=table(name,module,description,[client,...fields],{...options,unique:[['client_id','id'],...(options.unique||[])]});
  ref(name,'client_id','client');return t;
}
const tenantRef=(from,col,to)=>ref(from,['client_id',col],to,['client_id','id']);

// Identidad de negocio: sin contraseñas ni tokens.
table('app_user','access','Perfil local estable; conserva los UUID de User.',[
 f('display_name','str'),f('email_display','varchar(254)'),state,version
]);
table('identity_link','access','Vincula cuenta local a un emisor; no unir por email.',[
 user(),f('issuer','varchar(255)'),f('subject','varchar(255)')
],{unique:[['issuer','subject']]});ref('identity_link','user_id','app_user');
table('employee','access','Empleado de la agencia y rol administrativo global.',[
 user(),f('agency_role','status'),state
],{unique:[['user_id']]});ref('employee','user_id','app_user');
table('client','access','Frontera comercial de una instalación con una agencia.',[
 f('name','str'),f('slug','code'),state,version
],{unique:[['slug']]});
scoped('requester_level','access','Nivel de servicio, separado del permiso.',[
 f('code','code'),f('name','str'),state
],{unique:[['client_id','code']]});
scoped('client_contact','access','Relación vigente entre usuario y cliente.',[
 user(),f('requester_level_id','id',true),state
],{unique:[['client_id','user_id']]});
ref('client_contact','user_id','app_user');tenantRef('client_contact','requester_level_id','requester_level');
scoped('project','access','Proyecto privado; no trasladar entre clientes.',[
 f('name','str'),f('project_key','code'),user('manager_user_id'),state,version
],{unique:[['project_key']]});ref('project','manager_user_id','app_user');
scoped('project_member','access','Rol y nivel efectivo opcional por proyecto.',[
 project,user(),f('role','status'),f('requester_level_id','id',true),state,...validity
],{unique:[['project_id','user_id']],checks:activeWindow});
tenantRef('project_member','project_id','project');ref('project_member','user_id','app_user');
tenantRef('project_member','requester_level_id','requester_level');
table('project_counter','access','Contador transaccional; nunca COUNT + 1.',[
 project,f('next_number','ms')
],{unique:[['project_id']],checks:['next_number > 0']});ref('project_counter','project_id','project');
scoped('invitation','access','Invitación de un uso; solo hash del token.',[
 project,f('email_normalized','varchar(254)'),f('role','status'),f('token_hash','hash'),
 f('expires_at','dt'),f('accepted_at','dt',true),f('revoked_at','dt',true),user('invited_by')
],{unique:[['token_hash']]});tenantRef('invitation','project_id','project');ref('invitation','invited_by','app_user');

// Organización interna global; acceso al proyecto sigue siendo explícito.
table('area','catalog','Área interna de atención.',[f('code','code'),f('name','str'),user('owner_user_id'),state],{unique:[['code']]});
ref('area','owner_user_id','app_user');
table('resolver_group','catalog','Cola con propietario y respaldo.',[
 f('area_id'),f('code','code'),f('name','str'),user('lead_user_id'),user('backup_user_id',true),state
],{unique:[['code']]});ref('resolver_group','area_id','area');ref('resolver_group','lead_user_id','app_user');ref('resolver_group','backup_user_id','app_user');
table('group_member','catalog','Miembro de grupo; no concede acceso a proyectos.',[
 f('group_id'),user(),state
],{unique:[['group_id','user_id']]});ref('group_member','group_id','resolver_group');ref('group_member','user_id','app_user');
scoped('project_group','catalog','Grupos habilitados para recibir trabajo del proyecto.',[
 project,f('group_id'),state
],{unique:[['project_id','group_id']]});tenantRef('project_group','project_id','project');ref('project_group','group_id','resolver_group');
table('product','catalog','Definición del producto, no su instancia.',[f('code','code'),f('name','str'),f('vendor','str',true),state],{unique:[['code']]});
scoped('client_product','catalog','Producto contratado por cliente con vigencia.',[
 f('product_id'),f('contract_reference','str',true),state,...validity
],{checks:activeWindow});ref('client_product','product_id','product');
table('service_category','catalog','Agrupación del catálogo de la agencia.',[f('code','code'),f('name','str'),state],{unique:[['code']]});
table('service','catalog','Servicio estable compartido como plantilla.',[f('category_id'),f('code','code'),f('name','str'),state],{unique:[['code']]});
ref('service','category_id','service_category');
table('subservice','catalog','Identidad estable del subservicio.',[f('service_id'),f('code','code'),state],{unique:[['service_id','code']]});ref('subservice','service_id','service');
table('subservice_version','catalog','Versión publicada inmutable del formulario y defaults.',[
 f('subservice_id'),f('revision','num'),f('name','str'),f('description','text'),f('request_type','status'),
 f('form_schema','json',false,'JSON Schema validado; no ejecutar código'),f('default_group_id'),
 f('requires_ci','bool'),state,f('published_at','dt',true)
],{unique:[['subservice_id','revision']],checks:['revision > 0']});
ref('subservice_version','subservice_id','subservice');ref('subservice_version','default_group_id','resolver_group');
scoped('service_offering','catalog','Oferta y cobertura por proyecto; publicar nueva fila al cambiar contrato.',[
 project,f('subservice_version_id'),f('client_product_id','id',true),
 f('routing_version_id','id',true),f('sla_policy_version_id','id',true),state,...validity
],{checks:activeWindow});
tenantRef('service_offering','project_id','project');ref('service_offering','subservice_version_id','subservice_version');
tenantRef('service_offering','client_product_id','client_product');
scoped('offering_level','catalog','Niveles permitidos para esta oferta; filas explícitas, vacío deniega.',[
 f('offering_id'),f('requester_level_id')
],{unique:[['offering_id','requester_level_id']]});
tenantRef('offering_level','offering_id','service_offering');tenantRef('offering_level','requester_level_id','requester_level');

// CMDB; JSON solo en atributos dinámicos, relaciones estructurales con FK.
table('ci_class','cmdb','Aplicación, base de datos, servidor, integración.',[f('code','code'),f('name','str'),state],{unique:[['code']]});
table('ci_schema_version','cmdb','Esquema tipado y clasificación de atributos.',[
 f('class_id'),f('revision','num'),f('attribute_schema','json'),state,f('published_at','dt',true)
],{unique:[['class_id','revision']]});ref('ci_schema_version','class_id','ci_class');
scoped('configuration_item','cmdb','Instancia concreta propiedad de un cliente.',[
 f('ci_key','code'),f('name','str'),f('schema_version_id'),f('client_product_id','id',true),
 f('environment','status'),f('criticality','status'),state,f('attributes','json'),
 f('owner_area_id'),f('support_group_id'),user('technical_owner_user_id',true),
 f('source_system','code'),f('external_id','str'),version
],{unique:[['client_id','ci_key'],['client_id','source_system','external_id']]});
ref('configuration_item','schema_version_id','ci_schema_version');tenantRef('configuration_item','client_product_id','client_product');
ref('configuration_item','owner_area_id','area');ref('configuration_item','support_group_id','resolver_group');ref('configuration_item','technical_owner_user_id','app_user');
scoped('ci_project','cmdb','CI visible en un proyecto autorizado.',[f('ci_id'),project],{unique:[['ci_id','project_id']]});
tenantRef('ci_project','ci_id','configuration_item');tenantRef('ci_project','project_id','project');
table('ci_relation_type','cmdb','Dirección y política de ciclos de una dependencia.',[f('code','code'),f('name','str'),f('allow_cycles','bool')],{unique:[['code']]});
scoped('ci_relation','cmdb','Arista dirigida; prohibir duplicados y autorrelaciones.',[
 f('source_ci_id'),f('target_ci_id'),f('relation_type_id'),state,...validity
],{unique:[['source_ci_id','target_ci_id','relation_type_id']],checks:['source_ci_id <> target_ci_id',...activeWindow]});
tenantRef('ci_relation','source_ci_id','configuration_item');tenantRef('ci_relation','target_ci_id','configuration_item');ref('ci_relation','relation_type_id','ci_relation_type');
scoped('ci_service_link','cmdb','CI vinculado a servicio o subservicio; validar coherencia entre ambos.',[
 f('ci_id'),f('service_id'),f('subservice_id','id',true),state,...validity
],{checks:activeWindow});
tenantRef('ci_service_link','ci_id','configuration_item');ref('ci_service_link','service_id','service');ref('ci_service_link','subservice_id','subservice');
scoped('offering_ci','cmdb','Intersección autorizada oferta-proyecto-CI.',[
 f('offering_id'),f('ci_id'),state
],{unique:[['offering_id','ci_id']]});
tenantRef('offering_ci','offering_id','service_offering');tenantRef('offering_ci','ci_id','configuration_item');

// Calendarios publicados; fechas civiles separadas de instantes UTC.
table('business_calendar','policy','Identidad del calendario; compartible, sin datos del cliente.',[f('code','code'),f('name','str'),state],{unique:[['code']]});
table('calendar_version','policy','Reglas congeladas y cobertura de cálculo.',[
 f('calendar_id'),f('revision','num'),f('timezone','str'),f('tzdb_version','code'),f('engine_version','code'),
 f('coverage_start','date'),f('coverage_end','date'),f('content_hash','hash'),state,f('published_at','dt',true)
],{unique:[['calendar_id','revision']],checks:['coverage_end > coverage_start']});ref('calendar_version','calendar_id','business_calendar');
table('calendar_week_interval','policy','Intervalos locales [inicio, fin); turnos nocturnos se dividen.',[
 f('calendar_version_id'),f('weekday_iso','num'),f('start_minute','num'),f('end_minute','num')
],{checks:['weekday_iso BETWEEN 1 AND 7','start_minute >= 0 AND end_minute <= 1440 AND end_minute > start_minute']});ref('calendar_week_interval','calendar_version_id','calendar_version');
table('calendar_exception','policy','Reemplaza toda la jornada de esa fecha civil; sin intervalos significa cerrado.',[
 f('calendar_version_id'),f('local_date','date'),f('name','str'),f('recurrence_source','json',true,'Regla expandida al publicar')
],{unique:[['calendar_version_id','local_date']]});ref('calendar_exception','calendar_version_id','calendar_version');
table('calendar_exception_interval','policy','Ventanas de apertura de la excepción.',[
 f('exception_id'),f('start_minute','num'),f('end_minute','num')
],{checks:['start_minute >= 0 AND end_minute <= 1440 AND end_minute > start_minute']});ref('calendar_exception_interval','exception_id','calendar_exception');
table('calendar_work_interval','policy','Ventanas UTC compiladas; reproducibilidad frente a cambios de tzdb.',[
 f('calendar_version_id'),f('start_at','dt'),f('end_at','dt')
],{unique:[['calendar_version_id','start_at']],indexes:[['calendar_version_id','end_at']],checks:['end_at > start_at']});ref('calendar_work_interval','calendar_version_id','calendar_version');
scoped('sla_policy_set','policy','Conjunto contractual de reglas por cliente.',[f('name','str'),state]);
scoped('sla_policy_version','policy','Publicación atómica de reglas ordenadas y fallback.',[
 f('policy_set_id'),f('revision','num'),f('effective_from','dt'),f('engine_version','code'),
 f('content_hash','hash'),state,f('published_at','dt',true)
],{unique:[['policy_set_id','revision']]});tenantRef('sla_policy_version','policy_set_id','sla_policy_set');
scoped('sla_rule','policy','Primera regla coincidente por orden único; condiciones AND tipadas.',[
 f('policy_version_id'),f('rule_order','num'),f('name','str'),f('conditions','json'),
 f('priority','status'),f('is_fallback','bool')
],{unique:[['policy_version_id','rule_order']],checks:['rule_order >= 0']});tenantRef('sla_rule','policy_version_id','sla_policy_version');
scoped('sla_target','policy','Objetivo independiente por métrica; duraciones enteras.',[
 f('rule_id'),f('metric','status'),f('target_ms','ms'),f('calendar_version_id'),
 f('pause_reasons','json'),f('max_pause_ms','ms',true),f('warning_thresholds','json')
],{unique:[['rule_id','metric']],checks:['target_ms > 0','max_pause_ms IS NULL OR max_pause_ms > 0',"metric IN ('FIRST_RESPONSE','RESOLUTION')"]});
tenantRef('sla_target','rule_id','sla_rule');ref('sla_target','calendar_version_id','calendar_version');
scoped('routing_version','policy','Reglas publicadas de distribución interna.',[
 f('name','str'),f('revision','num'),state,f('published_at','dt',true)
]);
scoped('routing_rule','policy','Asignación a grupo; persona opcional, sin alterar SLA.',[
 f('routing_version_id'),f('rule_order','num'),f('conditions','json'),f('group_id'),
 user('assignee_user_id',true),f('fallback_group_id','id',true)
],{unique:[['routing_version_id','rule_order']]});
tenantRef('routing_rule','routing_version_id','routing_version');ref('routing_rule','group_id','resolver_group');ref('routing_rule','assignee_user_id','app_user');ref('routing_rule','fallback_group_id','resolver_group');
tenantRef('service_offering','routing_version_id','routing_version');tenantRef('service_offering','sla_policy_version_id','sla_policy_version');

// Ticket mantiene relaciones estables y una proyección para consultas rápidas.
scoped('ticket','ticket','Solicitud; columnas opcionales permiten incorporación gradual y tickets legacy.',[
 project,f('number','ms'),f('ticket_key','code'),f('title','str'),f('description','text'),
 f('type','status'),f('priority','status'),state,f('visibility','status'),user('reporter_user_id'),user('created_by'),
 f('offering_id','id',true),f('requester_level_id','id',true),f('impact','status',true),f('urgency','status',true),
 f('classification_snapshot','json',true),f('current_group_id','id',true),user('assignee_user_id',true),
 f('sla_mode','status',false,'ACTIVE, NONE o LEGACY_UNMEASURED; ausencia explícita, nunca SLA cero'),
 f('resolution_code','code',true),f('resolution_summary','text',true),f('cancellation_reason','text',true),
 f('accepted_at','dt'),f('resolved_at','dt',true),f('closed_at','dt',true),f('updated_at','dt'),version
],{unique:[['project_id','number'],['ticket_key']],indexes:[['client_id','project_id','status','updated_at'],['assignee_user_id','status']],checks:['number > 0',"visibility IN ('CLIENT','INTERNAL')"]});
tenantRef('ticket','project_id','project');tenantRef('ticket','offering_id','service_offering');
tenantRef('ticket','requester_level_id','requester_level');ref('ticket','reporter_user_id','app_user');ref('ticket','created_by','app_user');
ref('ticket','current_group_id','resolver_group');ref('ticket','assignee_user_id','app_user');
const ticketScope=(name,module,desc,fields,options={})=>{
 const t=scoped(name,module,desc,[f('ticket_id'),...fields],options);tenantRef(name,'ticket_id','ticket');return t;
};
ticketScope('ticket_ci','ticket','CI afectado, principal o secundario; nunca duplicado.',[
 f('ci_id'),f('is_primary','bool'),f('snapshot','json')
],{unique:[['ticket_id','ci_id']]});tenantRef('ticket_ci','ci_id','configuration_item');
ticketScope('ticket_comment','ticket','Comentario público o nota interna; sin borrado cascada.',[
 user('author_user_id'),f('visibility','status'),f('body','text'),f('edited_at','dt',true),version
]);ref('ticket_comment','author_user_id','app_user');
ticketScope('attachment','ticket','Metadatos y visibilidad; archivo privado en S3.',[
 f('comment_id','id',true),user('uploaded_by'),f('object_key','varchar(512)'),f('file_name','str'),f('content_type','str'),
 f('size_bytes','ms'),f('checksum','hash',true),f('visibility','status'),f('scan_status','status'),f('verified_at','dt',true)
],{checks:['size_bytes >= 0']});tenantRef('attachment','comment_id','ticket_comment');ref('attachment','uploaded_by','app_user');
ticketScope('ticket_participant','ticket','Participante concede alcance; follower solo notifica.',[
 user(),f('kind','status'),user('added_by'),state
],{unique:[['ticket_id','user_id','kind']]});ref('ticket_participant','user_id','app_user');ref('ticket_participant','added_by','app_user');
scoped('ticket_relation','ticket','Relación autorizada entre tickets; ciclos según tipo.',[
 f('source_ticket_id'),f('target_ticket_id'),f('kind','status')
],{unique:[['source_ticket_id','target_ticket_id','kind']],checks:['source_ticket_id <> target_ticket_id']});
tenantRef('ticket_relation','source_ticket_id','ticket');tenantRef('ticket_relation','target_ticket_id','ticket');
scoped('tag','ticket','Etiqueta de proyecto.',[project,f('name','varchar(30)')],{unique:[['project_id','name']]});tenantRef('tag','project_id','project');
ticketScope('ticket_tag','ticket','Etiquetas del ticket.',[f('tag_id')],{unique:[['ticket_id','tag_id']]});tenantRef('ticket_tag','tag_id','tag');
ticketScope('ticket_event','ticket','Hecho inmutable con versión por agregado y proyección pública revisada.',[
 f('sequence','ms'),f('event_type','code'),user('actor_user_id',true),f('occurred_at','dt'),
 f('visibility','status'),f('payload','json'),f('request_id','code')
],{unique:[['ticket_id','sequence']],indexes:[['ticket_id','occurred_at']]});ref('ticket_event','actor_user_id','app_user');
ticketScope('ticket_assignment','ticket','Historia de custodios. La cola actual conserva el ticket durante transferencia.',[
 f('group_id'),user('assignee_user_id',true),f('started_at','dt'),f('ended_at','dt',true),
 f('reason','text'),user('assigned_by'),f('routing_rule_id','id',true)
],{checks:['ended_at IS NULL OR ended_at >= started_at']});
ref('ticket_assignment','group_id','resolver_group');ref('ticket_assignment','assignee_user_id','app_user');ref('ticket_assignment','assigned_by','app_user');tenantRef('ticket_assignment','routing_rule_id','routing_rule');
ticketScope('ticket_transfer','ticket','Solicitar, aceptar, declinar o cancelar traslado; no es rechazo del ticket.',[
 f('from_assignment_id'),f('to_group_id'),user('requested_by'),f('reason','text'),state,
 user('decided_by',true),f('decision_reason','text',true),f('decided_at','dt',true),f('review_due_at','dt'),
 f('result_assignment_id','id',true),version
]);
tenantRef('ticket_transfer','from_assignment_id','ticket_assignment');tenantRef('ticket_transfer','result_assignment_id','ticket_assignment');
ref('ticket_transfer','to_group_id','resolver_group');ref('ticket_transfer','requested_by','app_user');ref('ticket_transfer','decided_by','app_user');

// Relojes por ciclo. Historial fuente + proyección transaccional, sin cron por segundo.
ticketScope('ticket_cycle','clock','Ciclo 1 al aceptar; siguientes al reabrir con motivo.',[
 f('cycle_number','num'),f('started_at','dt'),f('ended_at','dt',true),f('outcome','status',true),f('reason','text',true)
],{unique:[['ticket_id','cycle_number']],checks:['cycle_number > 0','ended_at IS NULL OR ended_at >= started_at']});
ticketScope('sla_evaluation','clock','Entrada y resultado congelados; también registra overrides y migraciones.',[
 f('cycle_id'),f('policy_version_id'),f('rule_id'),f('input_snapshot','json'),f('result_snapshot','json'),
 f('evaluated_at','dt'),f('engine_version','code'),f('reason','text'),user('actor_user_id',true)
]);
tenantRef('sla_evaluation','cycle_id','ticket_cycle');tenantRef('sla_evaluation','policy_version_id','sla_policy_version');tenantRef('sla_evaluation','rule_id','sla_rule');ref('sla_evaluation','actor_user_id','app_user');
ticketScope('ticket_sla_clock','clock','Estado materializado independiente para primera respuesta y resolución.',[
 f('cycle_id'),f('metric','status'),f('state','status'),f('started_at','dt'),
 f('consumed_ms','ms'),f('checkpoint_at','dt'),f('due_at','dt',true,'NULL si pausado; fecha calculada si corre'),
 f('last_due_at','dt',true),f('breached_at','dt',true,'Primer incumplimiento, irreversible'),
 f('completed_at','dt',true),f('active_revision_number','num'),version
],{unique:[['cycle_id','metric']],indexes:[['state','due_at']],checks:['consumed_ms >= 0','active_revision_number > 0',"metric IN ('FIRST_RESPONSE','RESOLUTION')","state IN ('RUNNING','PAUSED','STOPPED','CANCELLED')"]});
tenantRef('ticket_sla_clock','cycle_id','ticket_cycle');
scoped('sla_clock_revision','clock','Presupuesto y calendario aplicados; crear otra fila al cambiar, no UPDATE.',[
 f('clock_id'),f('revision_number','num'),f('evaluation_id'),f('target_id'),f('calendar_version_id'),
 f('target_ms','ms'),f('consumed_at_change_ms','ms'),f('effective_at','dt'),f('reason','text')
],{unique:[['clock_id','revision_number']],checks:['target_ms > 0','consumed_at_change_ms >= 0']});
tenantRef('sla_clock_revision','clock_id','ticket_sla_clock');tenantRef('sla_clock_revision','evaluation_id','sla_evaluation');tenantRef('sla_clock_revision','target_id','sla_target');ref('sla_clock_revision','calendar_version_id','calendar_version');
scoped('sla_pause','clock','Pausa autorizada por reloj. Intervalos [start,end); no doble descuento.',[
 f('clock_id'),f('started_at','dt'),f('ended_at','dt',true),f('reason_code','code'),
 f('reason_text','text'),f('trigger_comment_id','id',true),user('started_by'),user('ended_by',true),
 f('auto_resume_at','dt',true),f('review_at','dt',true),f('dedupe_key','code')
],{unique:[['clock_id','dedupe_key']],checks:['ended_at IS NULL OR ended_at >= started_at']});
tenantRef('sla_pause','clock_id','ticket_sla_clock');tenantRef('sla_pause','trigger_comment_id','ticket_comment');ref('sla_pause','started_by','app_user');ref('sla_pause','ended_by','app_user');
scoped('sla_clock_event','clock','Traza del cálculo, checkpoint y vencimiento histórico antes/después.',[
 f('clock_id'),f('sequence','ms'),f('event_type','code'),f('occurred_at','dt'),
 f('delta_consumed_ms','ms'),f('payload','json'),f('source_event_id','id',true)
],{unique:[['clock_id','sequence']],checks:['delta_consumed_ms >= 0']});tenantRef('sla_clock_event','clock_id','ticket_sla_clock');tenantRef('sla_clock_event','source_event_id','ticket_event');
scoped('sla_alert','clock','Dedupe de alertas por revisión; workers comprueban versión vigente.',[
 f('clock_id'),f('revision_number','num'),f('kind','code'),f('scheduled_at','dt'),
 f('delivered_at','dt',true),f('cancelled_at','dt',true)
],{unique:[['clock_id','revision_number','kind']],indexes:[['scheduled_at','delivered_at']]});tenantRef('sla_alert','clock_id','ticket_sla_clock');

// Operación local. Outbox en la misma transacción que ticket; ID de consumidor idempotente.
table('outbox_event','ops','Evento durable para avisos; no publicar a SQS antes del commit.',[
 f('aggregate_id'),f('event_type','code'),f('payload','json'),f('available_at','dt'),
 f('published_at','dt',true),f('attempts','num'),f('locked_until','dt',true),f('lease_owner','code',true)
],{indexes:[['published_at','available_at']],checks:['attempts >= 0']});
table('consumer_receipt','ops','Idempotencia por consumidor y evento.',[
 f('consumer','code'),f('event_id')
],{unique:[['consumer','event_id']]});
scoped('notification','ops','Notificación con referencia; reautorizar al leer y al enviar.',[
 user('recipient_user_id'),f('ticket_id','id',true),f('source_event_id'),f('kind','code'),f('read_at','dt',true)
],{unique:[['recipient_user_id','source_event_id','kind']]});
ref('notification','recipient_user_id','app_user');tenantRef('notification','ticket_id','ticket');
table('notification_preference','ops','Preferencias por canal y clase de evento.',[
 user(),f('channel','status'),f('event_type','code'),f('enabled','bool')
],{unique:[['user_id','channel','event_type']]});ref('notification_preference','user_id','app_user');
scoped('notification_delivery','ops','Intentos de entrega y resultado del proveedor.',[
 f('notification_id'),f('channel','status'),f('attempt','num'),state,
 f('provider_message_id','str',true),f('sent_at','dt',true),f('last_error_code','code',true)
],{unique:[['notification_id','channel','attempt']]});tenantRef('notification_delivery','notification_id','notification');
table('idempotency_record','ops','Clave por actor y operación; reautorizar todo replay.',[
 user('actor_user_id'),f('operation','code'),f('request_key','code'),f('request_hash','hash'),
 f('resource_id','id',true),f('status','status'),f('expires_at','dt')
],{unique:[['actor_user_id','operation','request_key']]});ref('idempotency_record','actor_user_id','app_user');
table('audit_event','ops','Auditoría restringida; retención separada y exportación inmutable.',[
 f('client_id','id',true),user('actor_user_id',true),f('resource_type','code'),f('resource_id','id',true),
 f('action','code'),f('request_id','code'),f('payload_redacted','json'),f('occurred_at','dt')
],{indexes:[['client_id','occurred_at']]});ref('audit_event','client_id','client');ref('audit_event','actor_user_id','app_user');
scoped('export_job','ops','Exportación de alcance congelado, permiso revalidado antes de descargar.',[
 user('requested_by'),f('filters','json'),state,f('object_key','varchar(512)',true),f('expires_at','dt')
]);ref('export_job','requested_by','app_user');

// DB independiente opcional. Nunca FK a arena ni consultas cross-database.
table('auth_account','identity','Cuenta del proveedor propio de aprendizaje.',[
 f('email_normalized','varchar(254)'),f('email_verified_at','dt',true),state,
 f('token_version','num'),f('updated_at','dt')
],{unique:[['email_normalized']]});
table('auth_password','identity','Hash Argon2id o algoritmo aprobado; no contraseña reversible.',[
 f('account_id'),f('encoded_hash','varchar(512)'),f('changed_at','dt')
],{unique:[['account_id']]});ref('auth_password','account_id','auth_account');
table('auth_session','identity','Una familia de refresh por sesión/dispositivo.',[
 f('account_id'),f('client_code','code'),f('absolute_expires_at','dt'),f('idle_expires_at','dt'),
 f('revoked_at','dt',true),f('revoke_reason','code',true),f('last_seen_at','dt'),version
]);ref('auth_session','account_id','auth_account');
table('auth_refresh_token','identity','Token opaco aleatorio; hash en DB; rotación de un solo uso.',[
 f('session_id'),f('generation','num'),f('token_hash','hash'),f('expires_at','dt'),
 f('used_at','dt',true),f('revoked_at','dt',true)
],{unique:[['token_hash'],['session_id','generation']],checks:['generation >= 0']});ref('auth_refresh_token','session_id','auth_session');
table('auth_one_time_token','identity','Verificación de email o recuperación, un uso con expiración.',[
 f('account_id'),f('purpose','code'),f('token_hash','hash'),f('expires_at','dt'),f('consumed_at','dt',true)
],{unique:[['token_hash']]});ref('auth_one_time_token','account_id','auth_account');
table('auth_mfa_credential','identity','WebAuthn pública o referencia a secreto cifrado TOTP.',[
 f('account_id'),f('kind','status'),f('credential_identifier','varchar(255)'),
 f('public_data','json',true),f('encrypted_secret_ref','varchar(512)',true),f('verified_at','dt',true),f('revoked_at','dt',true)
],{unique:[['credential_identifier']]});ref('auth_mfa_credential','account_id','auth_account');
table('auth_recovery_code','identity','Código de recuperación de un uso, hasheado.',[
 f('account_id'),f('code_hash','hash'),f('used_at','dt',true)
],{unique:[['code_hash']]});ref('auth_recovery_code','account_id','auth_account');
table('auth_signing_key','identity','Metadata kid; clave privada en KMS o secret store.',[
 f('kid','code'),f('algorithm','code'),f('public_jwk','json'),f('private_key_ref','varchar(512)'),
 f('active_from','dt'),f('retire_after','dt',true),state
],{unique:[['kid']]});
table('auth_security_event','identity','Login, recuperación, reutilización, revocación y cambios MFA.',[
 f('account_id','id',true),f('session_id','id',true),f('event_type','code'),f('occurred_at','dt'),f('details_redacted','json')
]);ref('auth_security_event','account_id','auth_account');ref('auth_security_event','session_id','auth_session');
table('auth_outbox_event','identity','Propaga revocaciones de forma idempotente; no sustituye validación online.',[
 f('event_type','code'),f('aggregate_id'),f('payload','json'),f('published_at','dt',true),f('attempts','num')
]);

// MySQL no tiene índices parciales: las claves generadas permiten varios NULL
// históricos pero solo una fila abierta por agregado.
for (const [name,column,expression] of [
 ['ticket_cycle','open_ticket_id','CASE WHEN ended_at IS NULL THEN ticket_id ELSE NULL END'],
 ['ticket_assignment','open_ticket_id','CASE WHEN ended_at IS NULL THEN ticket_id ELSE NULL END'],
 ['ticket_transfer','pending_ticket_id',"CASE WHEN status = 'REQUESTED' THEN ticket_id ELSE NULL END"],
 ['sla_pause','open_clock_id','CASE WHEN ended_at IS NULL THEN clock_id ELSE NULL END'],
]) {
 const t=tables.find(t=>t.name===name);
 t.columns.push({name:column,type:'char(36)',nullable:true,note:'Clave generada: una fila activa por agregado',generated:expression});
 t.unique.push([column]);
}
