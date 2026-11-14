import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
function entries(bytes){const files=new Map();let p=0;while(bytes.readUInt32LE(p)===0x04034b50){const size=bytes.readUInt32LE(p+18),names=bytes.readUInt16LE(p+26),extra=bytes.readUInt16LE(p+28),start=p+30+names+extra;files.set(bytes.subarray(p+30,p+30+names).toString(),bytes.subarray(start,start+size).toString());p=start+size;}return files;}
test('participant packets separate initial decisions and updates and contain no instructor keys',()=>{
 const files=entries(readFileSync(new URL('../public/downloads/pilot-participant-forms.zip',import.meta.url)));
 assert.equal(files.size,8);
 for(const letter of ['A','B','C','D']){assert.ok(files.has(`FORM_${letter}_INITIAL.md`));assert.ok(files.has(`FORM_${letter}_UPDATE.md`));}
 for(const text of files.values()){assert.doesNotMatch(text,/Instructor-only key|<details>|Critical errors include|Subtract the common \$15,000/);}
 assert.doesNotMatch(files.get('FORM_A_INITIAL.md'),/\$2,800|\$106 shortfall/);
 assert.match(files.get('FORM_A_UPDATE.md'),/\$2,800/);
 assert.match(files.get('FORM_D_INITIAL.md'),/50.share|50 shares/);
});
test('review guide contains unfilled declarations, anchored rubric and calibration instructions',()=>{
 const guide=readFileSync(new URL('../public/downloads/validation-guide.md',import.meta.url),'utf8');
 assert.match(guide,/Independence|independence/);assert.match(guide,/0.{0,50}3|0–3|0\s*\|/);assert.match(guide,/blinded|Blinded/);assert.match(guide,/missing|Missing/);assert.doesNotMatch(guide,/Review completed by ChatGPT|Expert approval: approved/);
});
