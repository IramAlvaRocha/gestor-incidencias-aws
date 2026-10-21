import {writeFileSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
import assert from 'node:assert/strict';
import {tables,modules} from './model.mjs';

const base=dirname(fileURLToPath(import.meta.url));
const q=s=>'`'+s+'`';
const list=xs=>xs.map(q).join(', ');
const escape=s=>s.replaceAll("'","''");
const byName=new Map(tables.map(t=>[t.name,t]));
assert.equal(tables.length,byName.size,'Nombres de tablas duplicados');
let foreignKeys=0;
for(const t of tables){
 assert(t.name.length<=64,`Identificador MySQL demasiado largo: ${t.name}`);
 const cs=new Map(t.columns.map(c=>[c.name,c]));
 assert.equal(cs.size,t.columns.length,`Columnas duplicadas: ${t.name}`);
 for(const xs of [...t.unique,...t.indexes]) for(const x of xs) assert(cs.has(x),`${t.name}.${x}`);
 for(const [idx,r] of t.refs.entries()){
  assert(`fk_${t.name}_${idx}`.length<=64,'Nombre FK demasiado largo');
  foreignKeys++;
  const dest=byName.get(r.to);assert(dest,`Tabla destino ${r.to}`);
  assert.equal(dest.db,t.db,'Prohibida FK entre servicios');
  assert.equal(r.columns.length,r.target.length);
  for(let i=0;i<r.columns.length;i++){
   const a=cs.get(r.columns[i]),b=dest.columns.find(c=>c.name===r.target[i]);
   assert(a&&b,`FK ${t.name}->${r.to}`);
   assert.equal(a.type,b.type,`Tipos FK ${t.name}->${r.to}`);
  }
  assert([['id'],...dest.unique].some(xs=>JSON.stringify(xs)===JSON.stringify(r.target)),`FK debe apuntar a UNIQUE: ${t.name}->${r.to}`);
 }
}
function sql(db){
 const ts=tables.filter(t=>t.db===db);
 let out=`-- Arena: ESQUEMA OBJETIVO de referencia. NO es una migración.\n-- MySQL 8.4 / InnoDB. Ejecutar SOLO en schema vacío seleccionado por el operador.\n-- No incluye CREATE DATABASE, USE, DROP ni INSERT. No ejecutar sobre la base actual.\n-- Fuente: model.mjs. Instantes DATETIME(3) UTC; duraciones BIGINT en ms.\nSET time_zone = '+00:00';\nSET NAMES utf8mb4 COLLATE utf8mb4_0900_bin;\n\n`;
 for(const t of ts){
  const lines=t.columns.map(c=>c.generated
   ?`  ${q(c.name)} ${c.type} GENERATED ALWAYS AS (${c.generated}) STORED`
   :`  ${q(c.name)} ${c.type} ${c.nullable?'NULL':'NOT NULL'}${c.note?` COMMENT '${escape(c.note)}'`:''}`);
  lines.push('  PRIMARY KEY (`id`)');
  t.unique.forEach((xs,i)=>lines.push(`  UNIQUE KEY ${q(`uq_${t.name}_${i}`)} (${list(xs)})`));
  t.indexes.forEach((xs,i)=>lines.push(`  KEY ${q(`ix_${t.name}_${i}`)} (${list(xs)})`));
  t.checks.forEach((c,i)=>lines.push(`  CONSTRAINT ${q(`ck_${t.name}_${i}`)} CHECK (${c})`));
  out+=`-- ${modules[t.module]}: ${t.description}\nCREATE TABLE ${q(t.name)} (\n${lines.join(',\n')}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;\n\n`;
 }
 out+='-- FK después de crear tablas para permitir dependencias bidireccionales.\n';
 for(const t of ts) t.refs.forEach((r,i)=>{
  out+=`ALTER TABLE ${q(t.name)} ADD CONSTRAINT ${q(`fk_${t.name}_${i}`)} FOREIGN KEY (${list(r.columns)}) REFERENCES ${q(r.to)} (${list(r.target)}) ON DELETE RESTRICT ON UPDATE RESTRICT;\n`;
 });
 return out;
}
function dbml(db){
 let out=`// Modelo objetivo ${db}. Nullable y referencias reales; sin FK entre servicios.\n// Expresiones generadas y CHECK completos: ver SQL.\nProject ${db}_target { database_type: 'MySQL' }\n\n`;
 for(const t of tables.filter(t=>t.db===db)){
  out+=`Table ${t.name} {\n  Note: '${escape(t.description)}'\n`;
  for(const c of t.columns){
   const attrs=[c.name==='id'?'pk':null,!c.nullable?'not null':null,c.note?`note: '${escape(c.note)}'`:null].filter(Boolean);
   out+=`  ${c.name} ${c.type}${attrs.length?' ['+attrs.join(', ')+']':''}\n`;
  }
  if(t.unique.length||t.indexes.length){
   out+='  indexes {\n';
   for(const xs of t.unique)out+=`    (${xs.join(', ')}) [unique]\n`;
   for(const xs of t.indexes)out+=`    (${xs.join(', ')})\n`;
   out+='  }\n';
  }
  out+='}\n\n';
 }
 for(const t of tables.filter(t=>t.db===db))for(const r of t.refs)
  out+=`Ref: ${t.name}.(${r.columns.join(', ')}) > ${r.to}.(${r.target.join(', ')})\n`;
 return out;
}
function mermaid(module){
 const ts=tables.filter(t=>t.module===module);
 let out='erDiagram\n';
 for(const t of ts){
  out+=`    ${t.name} {\n`;
  for(const c of t.columns.filter(c=>!c.generated&&c.name!=='created_at'))
   out+=`        ${c.type.replace(/[()]/g,'_')} ${c.name}${c.name==='id'?' PK':''}\n`;
  out+='    }\n';
 }
 for(const t of ts)for(const r of t.refs){
  const nullable=r.columns.some(c=>t.columns.find(x=>x.name===c).nullable);
  const one=t.unique.some(xs=>JSON.stringify(xs)===JSON.stringify(r.columns));
  out+=`    ${r.to} ${nullable?'|o':'||'}--${one?'o|':'o{'} ${t.name} : "${r.columns.filter(c=>c!=='client_id').join(', ')}"\n`;
 }
 return out;
}
let dictionary='# Diccionario del modelo objetivo\n\nGenerado desde model.mjs. No representa tablas ya implementadas. Las restricciones entre filas y las transacciones se especifican en [diseño](../../Apuntes/diseno-sla-datos-autenticacion.md).\n\n';
let diagrams='# Diagramas entidad-relación por módulo\n\nLos enlaces entre servicios son lógicos, no claves foráneas. Una línea o{ representa múltiples filas y o| cero o una; FK opcionales se indican con |o. Las tablas externas al módulo aparecen como contexto.\n\n';
for(const [m,label] of Object.entries(modules)){
 const ts=tables.filter(t=>t.module===m);
 dictionary+=`## ${label} (${ts.length} tablas)\n\n`;
 for(const t of ts){
  dictionary+=`### ${t.name}\n\n${t.description}\n\n`;
  for(const c of t.columns)dictionary+=`- \`${c.name}\` · ${c.type}${c.nullable?' · nullable':''}${c.generated?' · generada':''}${c.note?' · '+c.note:''}.\n`;
  if(t.unique.length)dictionary+=`\nÚnicos: ${t.unique.map(xs=>'`'+xs.join(', ')+'`').join('; ')}.\n`;
  if(t.refs.length)dictionary+='\n'+t.refs.map(r=>`- FK (${r.columns.join(', ')}) → ${r.to} (${r.target.join(', ')}).`).join('\n')+'\n';
  dictionary+='\n';
 }
 diagrams+=`## ${label}\n\n\`\`\`mermaid\n${mermaid(m)}\`\`\`\n\n`;
 writeFileSync(join(base,`erd-${m}.mmd`),mermaid(m));
}
writeFileSync(join(base,'arena-target.mysql.sql'),sql('arena'));
writeFileSync(join(base,'identity-target.mysql.sql'),sql('identity'));
writeFileSync(join(base,'arena-target.dbml'),dbml('arena'));
writeFileSync(join(base,'identity-target.dbml'),dbml('identity'));
writeFileSync(join(base,'diccionario.md'),dictionary);
writeFileSync(join(base,'diagramas.md'),diagrams);
writeFileSync(join(base,'schema.json'),JSON.stringify({modules,tables},null,2)+'\n');
// The UI is an offline file deliverable, not a deployed application.
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let cards='';
for(const t of tables)cards+=`<article class="entity" data-module="${t.module}" data-name="${t.name}" id="${t.name}"><h3>${t.name}</h3><p>${esc(t.description)}</p><details><summary>${t.columns.length} columnas</summary><ul>${t.columns.map(c=>`<li><code>${c.name}</code> <small>${c.type}${c.nullable?' · opcional':''}${c.name==='id'?' · PK':''}${c.generated?' · calculada':''}</small></li>`).join('')}</ul></details><div class="relations">${t.refs.map(r=>`<a href="#${r.to}" data-target="${r.to}">${r.columns.join(', ')} → ${r.to}</a>`).join('')}</div></article>`;
const overview=readFileSync(join(base,'overview.svg'),'utf8');
writeFileSync(join(base,'diagrama.html'),`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Arena · modelo de datos propuesto</title>
<style>
:root{color-scheme:light dark;--bg:#f5f6f8;--ink:#172333;--muted:#4e5d70;--line:#cbd3dd;--surface:#fff;--link:#165ab6}
@media(prefers-color-scheme:dark){:root{--bg:#101923;--ink:#eef2f8;--muted:#b4c2d4;--line:#435266;--surface:#172331;--link:#80baff}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,sans-serif}main{max-width:1480px;margin:auto;padding:28px}
h1{font-size:28px;margin:0 0 8px}h2{font-size:22px}h3{font-size:16px;overflow-wrap:anywhere;margin:0}p{color:var(--muted)}a{color:var(--link)}
.overview{overflow:auto;margin:24px 0}.overview svg{width:100%;min-width:760px;height:auto}label{display:inline-flex;flex-direction:column;gap:5px;min-width:220px}select,input,button{font:inherit;padding:9px;border:1px solid var(--line);border-radius:5px;background:var(--surface);color:var(--ink)}.controls{display:flex;flex-wrap:wrap;align-items:end;gap:14px;margin:24px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:18px}
.entity{border:1px solid var(--line);border-radius:6px;padding:18px;background:var(--surface);scroll-margin:20px}.entity:target{outline:3px solid var(--link)}
.entity p{font-size:14px}.entity li{margin:8px 0;overflow-wrap:anywhere}ul{padding-left:18px}small{display:block;color:var(--muted)}summary{cursor:pointer}.relations{display:flex;flex-direction:column;gap:5px;margin-top:14px;font-size:13px;overflow-wrap:anywhere}[hidden]{display:none!important}code{font-size:13px}
@media print{.controls{display:none}.entity{break-inside:avoid}.overview svg{min-width:0}}
</style></head><body><main><h1>Arena · base de datos objetivo</h1>
<p>Propuesta de evolución: ${tables.filter(t=>t.db==='arena').length} tablas de incidencias y ${tables.filter(t=>t.db==='identity').length} de autenticación opcional. Implementar por incrementos. El SQL es de referencia; la base actual sigue con cinco modelos.</p>
<nav><a href="arena-target.mysql.sql">SQL incidencias</a> · <a href="identity-target.mysql.sql">SQL autenticación</a> · <a href="arena-target.dbml">DBML</a> · <a href="diagramas.md">ERD por módulo</a> · <a href="../../Apuntes/diseno-sla-datos-autenticacion.md">Reglas y migración</a></nav>
<div class="overview">${overview}</div>
<h2>Explorar entidades y relaciones</h2><div class="controls"><label>Módulo<select id="module"><option value="">Todos los módulos</option>${Object.entries(modules).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>Buscar entidad<input id="query" type="search" placeholder="ticket_sla_clock"></label><button type="button" id="reset">Ver todas</button><span id="count" aria-live="polite"></span></div>
<section class="grid" aria-label="Entidades del modelo">${cards}</section></main>
<script>
const moduleSelect=document.getElementById('module'),query=document.getElementById('query'),cards=[...document.querySelectorAll('.entity')];
function filter(){let n=0;for(const c of cards){const visible=(!moduleSelect.value||c.dataset.module===moduleSelect.value)&&c.textContent.toLowerCase().includes(query.value.toLowerCase());c.hidden=!visible;if(visible)n++}document.getElementById('count').textContent=n+' entidades visibles'}
moduleSelect.addEventListener('change',filter);query.addEventListener('input',filter);document.getElementById('reset').addEventListener('click',()=>{moduleSelect.value='';query.value='';filter()});
document.querySelectorAll('[data-target]').forEach(a=>a.addEventListener('click',()=>{moduleSelect.value='';query.value='';filter();const target=document.getElementById(a.dataset.target);target.querySelector('details').open=true}));
filter();
</script></body></html>`);
console.log(JSON.stringify({tables:tables.length,arena:tables.filter(t=>t.db==='arena').length,identity:tables.filter(t=>t.db==='identity').length,foreignKeys,validated:'references, key uniqueness, column types, service boundaries',databaseExecution:false},null,2));
