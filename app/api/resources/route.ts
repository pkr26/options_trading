import {library} from "@/lib/course";
export async function GET(request:Request) {
 const file=new URL(request.url).searchParams.get("file");
 const resource=file ? library.find(r=>r.file===file) ?? library.find(r=>r.file.split('/').pop()===file) : undefined;
 if(file&&!resource) return Response.json({error:"This reference is not available in the course library."},{status:404});
 if(resource&&new URL(request.url).searchParams.get('download')==='1') return new Response(resource.body,{headers:{"Content-Type":"text/markdown; charset=utf-8","Content-Disposition":`attachment; filename="${resource.file.split('/').pop()}"`,"Cache-Control":"private, no-cache"}});
 return Response.json(resource??library.map(r=>({file:r.file,title:r.title})),{headers:{"Cache-Control":"private, no-cache"}});
}
