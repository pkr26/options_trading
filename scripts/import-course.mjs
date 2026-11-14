import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, posix } from 'node:path';
const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(app, '..');
const checkOnly = process.argv.includes('--check');
if (process.argv.slice(2).some(argument => argument !== '--check')) throw new Error('Use import-course.mjs with no arguments or --check.');
const staleFiles = [];
// The advanced teaching packages are authored and versioned with the app.
const graduate = JSON.parse(readFileSync(resolve(app, 'content/graduate.json'), 'utf8'));
if (graduate.length !== 26 || graduate.some((module, index) => module.id !== index + 1)) throw new Error('The advanced pathway requires 26 ordered teaching packages.');
const graduateMarkdown = '# Advanced Options Academy\n\nCase seminars, analytical practice, and defended portfolio decisions. All case data are fictional unless explicitly sourced.\n\n' + graduate.map(module => [
  `## Module ${module.id}: ${module.title}`, module.objective,
  `Stage: ${module.stage}. Study allocation: ${module.duration}. Prerequisites: ${module.prerequisites.join(', ') || 'Foundation diagnostic'}.`,
  ...module.sections.map(section => `### ${section.title}\n\n${section.body}`),
  `### Case: ${module.caseStudy.title}`, module.caseStudy.brief, module.caseStudy.exhibits,
  `### Initial decision\n\n${module.caseStudy.decisionPrompt}`,
  `### New information — commit your first decision before reading\n\n${module.caseStudy.update}`,
  `### Defense\n\n${module.caseStudy.defense.map(prompt => `- ${prompt}`).join('\n')}`,
  `### Debrief — attempt the case first\n\n${module.caseStudy.debrief}`,
  ...module.caseStudy.samples.map(sample => `### ${sample.level} submission\n\n${sample.body}`),
  `### Rubric\n\n${module.caseStudy.rubric.map(row => `- **${row.dimension}:** ${row.excellent}`).join('\n')}`,
  `### Assignment\n\n${module.assignment.prompt}\n\n${module.assignment.deliverables.map(item => `- ${item}`).join('\n')}`,
  `### Later transfer questions\n\n${module.reviewQuestions.map(prompt => `- ${prompt}`).join('\n')}`,
  `### Primary references\n\n${module.sources.map(source => `- [${source.title}](${source.url})`).join('\n')}`,
].join('\n\n')).join('\n\n');
function emit(destination, value) {
  const expected = Buffer.isBuffer(value) ? value : Buffer.from(value, 'utf8');
  if (checkOnly) {
    if (!existsSync(destination) || !readFileSync(destination).equals(expected)) staleFiles.push(destination.slice(app.length + 1));
    return;
  }
  mkdirSync(dirname(destination), {recursive:true});
  writeFileSync(destination, expected);
}
const titles = ['Money and markets','Meet the option contract','Understand profit and loss','Why option prices change','Exercise and expiration','Understand the strategies','Risk and better decisions','Practice and put it together'];
const descriptions = ['Start with shares, prices and the way a trade happens.','Learn calls, puts and the details of one contract.','Separate an option’s value from the money you made.','Explore time, volatility and the Greeks, one at a time.','Follow the shares and cash through the life of a contract.','Understand common positions and the choice to make no trade.','Make a plan that accounts for losses and uncertainty.','Bring your skills together with paper exercises and a capstone.'];

// Markdown is authored in several folders. Preserve its source-relative meaning
// before the browser renders it, especially the two different README.md files.
function normalizeLinks(markdown, sourceFile) {
  if (/<script\b|javascript\s*:/i.test(markdown)) throw new Error(`${sourceFile}: unsafe active content`);
  return markdown.replace(/\]\(([^)\n]+)\)/g, (whole, href) => {
    if (/^(?:[a-z][a-z\d+.-]*:|#|\/)/i.test(href)) return whole;
    const [, target, suffix = ''] = href.match(/^([^?#]*)([?#].*)?$/) ?? [];
    if (!target) return whole;
    const normalized = posix.normalize(posix.join(posix.dirname(sourceFile), target));
    if (normalized === '..' || normalized.startsWith('../')) throw new Error(`${sourceFile}: link escapes course root`);
    return `](${normalized}${suffix})`;
  });
}

const files = readdirSync(resolve(root, 'beginner')).filter(f => /^0[1-8]_.*\.md$/.test(f)).sort();
if(files.length !== 8) throw new Error(`Expected 8 modules; found ${files.length}`);
const modules = files.map((file, i) => {
  const sourceFile = `beginner/${file}`;
  const raw = normalizeLinks(readFileSync(resolve(root, sourceFile), 'utf8'), sourceFile);
  const matches = [...raw.matchAll(/^## Lesson\s+(\d+)[^\n]*$/gm)];
  if(matches.length !== 8) throw new Error(`${file}: expected 8 lessons; found ${matches.length}`);
  const checkpoint = [...raw.matchAll(/^## (?:Module\b[^\n]*checkpoint|Checkpoint\b[^\n]*|Final\b[^\n]*checkpoint|Your checkpoint\b[^\n]*)[^\n]*$/gmi)]
    .find(m => m.index > matches[7].index);
  if (!checkpoint) throw new Error(`${file}: missing checkpoint after its last lesson`);
  const lastEnd = checkpoint.index;
  const introduction = raw.slice(raw.indexOf('\n') + 1, matches[0].index).trim();
  const lessons = matches.map((m, j) => {
    const id = Number(m[1]);
    if(id !== i * 8 + j + 1) throw new Error(`Unexpected lesson ${id}`);
    const body = raw.slice(m.index + m[0].length, matches[j+1]?.index ?? lastEnd).trim();
    const title = m[0].replace(/^## Lesson\s+\d+\s*[:—–.·-]?\s*/, '');
    if(!body.includes('<details>') || body.length < 350) throw new Error(`Lesson ${id} missing teaching/answer`);
    if (/^##\s/m.test(body)) throw new Error(`Lesson ${id} contains a following section`);
    return {id, moduleId:i+1, title, minutes:10, sourceFile, body};
  });
  return {id:i+1,title:titles[i],description:descriptions[i],file,sourceFile,introduction,lessons,checkpoint:raw.slice(lastEnd).trim()};
});
// Import the complete teaching/reference library, not only its source list.
// A preserved personal learning record is user data, not published course text.
const resources = [
  ...readdirSync(root).filter(file => file.endsWith('.md') && file !== 'MY_LEARNING_RECORD.md'),
  ...readdirSync(resolve(root,'beginner')).filter(file => file.endsWith('.md') && !/^0[1-8]_/.test(file)).map(file => `beginner/${file}`),
  'labs/README.md',
  'course-app/README.md',
].sort();
const library = resources.map(file => {
  const raw = readFileSync(resolve(root,file),'utf8');
  return {file,title:raw.split('\n')[0].replace(/^#\s*/,''),body:normalizeLinks(raw,file)};
});
library.push({file:'GRADUATE_COURSE.md', title:'Advanced Options Academy — complete teaching packages', body:graduateMarkdown});
// A standalone download has no neighboring course files; the ZIP keeps those
// relative links because it supplies the referenced documents at its root.
const standaloneGraduate = graduateMarkdown.replace(/\[([^\]]+)\]\((?!https?:|#)([^)\n]+\.md(?:#[^)\n]*)?)\)/g, '$1 (course-library reference: $2)');
emit(resolve(app,'public/downloads/advanced-course.md'), standaloneGraduate);
emit(resolve(app,'content/course.json'),JSON.stringify(modules,null,2)+'\n');
emit(resolve(app,'content/library.json'),JSON.stringify(library,null,2)+'\n');

// Keep this as a teaching-file allowlist. Never copy the workspace wholesale:
// account records, application dependencies, credentials and runtime state are
// intentionally outside the downloadable course.
const teachingFiles = (directory, pattern) => readdirSync(resolve(root,directory),{withFileTypes:true})
  .filter(entry => entry.isFile() && pattern.test(entry.name))
  .map(entry => `${directory}/${entry.name}`);
const attachments = [
  ...teachingFiles('scripts',/\.py$/),
  ...teachingFiles('labs',/\.py$/),
  ...teachingFiles('labs/data',/\.(?:csv|json)$/),
].sort();
for (const file of attachments) {
  const destination=resolve(app,'public',file);
  emit(destination,readFileSync(resolve(root,file)));
}

// A small standards-compatible ZIP using stored entries avoids a Python or
// command-line zip dependency. The fixed DOS timestamp makes repeated imports
// of unchanged teaching files reproducible; filenames use the UTF-8 flag.
function crc32(buffer) {
  let crc=0xffffffff;
  for(const byte of buffer) {
    crc ^= byte;
    for(let bit=0;bit<8;bit++) crc=(crc>>>1)^((crc&1)?0xedb88320:0);
  }
  return (crc^0xffffffff)>>>0;
}
function teachingZip(files,overrides) {
  const locals=[],centrals=[];
  let offset=0,centralSize=0;
  for(const file of files) {
    if(posix.isAbsolute(file)||file.split('/').includes('..')) throw new Error('Invalid teaching archive path');
    const name=Buffer.from(file,'utf8'),data=overrides.get(file)??readFileSync(resolve(root,file)),crc=crc32(data);
    const local=Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50,0); local.writeUInt16LE(20,4); local.writeUInt16LE(0x800,6);
    local.writeUInt16LE(33,12); local.writeUInt32LE(crc,14);
    local.writeUInt32LE(data.length,18); local.writeUInt32LE(data.length,22); local.writeUInt16LE(name.length,26);
    locals.push(local,name,data);
    const central=Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50,0); central.writeUInt16LE(20,4); central.writeUInt16LE(20,6); central.writeUInt16LE(0x800,8);
    central.writeUInt16LE(33,14); central.writeUInt32LE(crc,16);
    central.writeUInt32LE(data.length,20); central.writeUInt32LE(data.length,24); central.writeUInt16LE(name.length,28);
    central.writeUInt32LE(offset,42);
    centrals.push(central,name); centralSize += central.length+name.length;
    offset += local.length+name.length+data.length;
  }
  const end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0); end.writeUInt16LE(files.length,8); end.writeUInt16LE(files.length,10);
  end.writeUInt32LE(centralSize,12); end.writeUInt32LE(offset,16);
  return Buffer.concat([...locals,...centrals,end]);
}
const archiveOverrides=new Map([
  ['GRADUATE_COURSE.md',Buffer.from(graduateMarkdown,'utf8')],
  ['DOWNLOAD_README.md',Buffer.from('# Your offline options course\n\nStart with [the beginner course](beginner/README.md). This package contains 64 small lessons, review aids, reference chapters, Python teaching scripts and synthetic lab data. No brokerage account is needed.\n\nMY_LEARNING_RECORD.md is a newly generated blank template. The existing personal learning record, completion history, notes, accounts and application databases are not included.\n\nThe browser application source and dependencies are not included. [Application note](course-app/README.md) explains that boundary. Root documents may describe the app or link to its source checkout; use the course Markdown directly for offline study.\n\nFor Python practice, see [the teaching labs](labs/README.md). All supplied market data are synthetic unless a document explicitly says otherwise.\n','utf8')],
  ['MY_LEARNING_RECORD.md',Buffer.from('# Blank learning record for the offline course\n\nThis is a newly generated blank template. It contains no prior learner answers, progress or personal information. For daily beginner work, start with [the workbook](beginner/WORKBOOK.md). The optional extended template follows.\n\n'+readFileSync(resolve(root,'LEARNING_RECORD_TEMPLATE.md'),'utf8'),'utf8')],
  ['course-app/README.md',Buffer.from('# Browser application note\n\nThis offline download contains teaching material and Python labs. It does not contain the frontend/backend application source, its dependencies, runtime files, or any user database.\n\nTo study without the app, open [the beginner course](../beginner/README.md). To run the browser app, use the separate source checkout and its course-app/README.md setup instructions, or a hosted link supplied separately. Commands for the app require that full source checkout; they do not run from this teaching-only package.\n','utf8')],
]);
const archiveFiles=[
  ...readdirSync(root,{withFileTypes:true}).filter(entry=>entry.isFile()&&entry.name.endsWith('.md')&&entry.name!=='MY_LEARNING_RECORD.md').map(entry=>entry.name),
  ...teachingFiles('beginner',/\.md$/),
  ...attachments,
  'labs/README.md',
  ...archiveOverrides.keys(),
].sort();
emit(resolve(app,'public/downloads/options-course.zip'),teachingZip(archiveFiles,archiveOverrides));
if (checkOnly) {
  if (staleFiles.length) {
    console.error(`Teaching outputs differ from their sources:\n${staleFiles.map(file => `  ${file}`).join('\n')}\nRun npm run content:import, review the changes, then check again.`);
    process.exitCode = 1;
  } else console.log(`Teaching outputs are current: ${modules.length} modules, ${modules.flatMap(m=>m.lessons).length} lessons, ${library.length} reference documents, ${attachments.length} attachments and ${archiveFiles.length} ZIP entries.`);
} else console.log(`Imported ${modules.length} modules, ${modules.flatMap(m=>m.lessons).length} lessons and ${library.length} reference documents; copied ${attachments.length} attachments and packaged ${archiveFiles.length} teaching files`);
