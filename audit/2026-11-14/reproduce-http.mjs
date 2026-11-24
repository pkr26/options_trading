// Requires the documented loopback portable-development mock auth on port5173.
// lessonId0 is invalid, so both requests terminate before any DB write.
const base=process.env.OPTIONS_AUDIT_BASE_URL??'http://127.0.0.1:5173';
const destination=new URL(base);
if(destination.protocol!=='http:'||!['localhost','127.0.0.1','[::1]'].includes(destination.hostname)) throw new Error('Use a loopback HTTP development service.');
const payload=JSON.stringify({lessonId:0,content:'valid',ignored:'x'.repeat(100000)});
for(const streaming of [false,true]){
 const body=streaming?new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode(payload));controller.close();}}):payload;
 const response=await fetch(base+'/api/notes',{method:'PUT',headers:{'content-type':'application/json',cookie:'__sites_local_auth=1'},body,...(streaming?{duplex:'half'}:{})});
 console.log(JSON.stringify({streaming,bytes:Buffer.byteLength(payload),status:response.status,body:await response.text()}));
}
