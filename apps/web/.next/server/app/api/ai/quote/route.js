"use strict";(()=>{var e={};e.id=280,e.ids=[280],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7147:e=>{e.exports=require("fs")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},2477:e=>{e.exports=require("node:stream/web")},1017:e=>{e.exports=require("path")},5477:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},5034:e=>{e.exports=require("url")},3837:e=>{e.exports=require("util")},1267:e=>{e.exports=require("worker_threads")},9796:e=>{e.exports=require("zlib")},2795:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>f,patchFetch:()=>h,requestAsyncStorage:()=>c,routeModule:()=>d,serverHooks:()=>m,staticGenerationAsyncStorage:()=>l});var s={};r.r(s),r.d(s,{POST:()=>p,runtime:()=>u});var a=r(3036),o=r(5736),n=r(5262);let i=new(r(2876)).ZP({apiKey:process.env.ANTHROPIC_API_KEY}),u="nodejs";async function p(e){let t;try{t=await e.json()}catch{return new Response("Invalid JSON body.",{status:400})}let{name:r,furnitureType:s,woodType:a,budgetRange:o,dimensions:n,description:u}=t;if(!s||!o||!u)return new Response("furnitureType, budgetRange, and description are required.",{status:400});let p=`You are a senior sales consultant for Square Cube, a premium custom furniture studio based in India.
Your task is to write a warm, professional WhatsApp quote message on behalf of the Square Cube team.
The message should:
- Greet the customer by first name (if provided).
- Acknowledge their specific furniture request with enthusiasm.
- Suggest a price range consistent with the stated budget, using Indian Rupee (₹) formatting.
- Mention the wood type they chose and its premium qualities.
- Give an estimated manufacturing timeline (typically 4–8 weeks for custom pieces).
- End with a friendly call to action: "Reply to this message" or "Call us to finalise your design".
- Be written entirely in plain text suitable for WhatsApp (no markdown formatting, no asterisks).
- Be concise — 5 to 8 sentences.`,d=`Generate a WhatsApp quote message for this custom furniture request:
Customer name: ${r??"Valued Customer"}
Furniture type: ${s}
Wood type: ${a??"Not specified"}
Budget range: ${o}
Dimensions: ${n??"Custom / to be confirmed"}
Customer description: ${u}`,c=new TextEncoder;return new Response(new ReadableStream({async start(e){try{for await(let t of(await i.messages.stream({model:"claude-sonnet-4-6",max_tokens:600,system:p,messages:[{role:"user",content:d}]})))if("content_block_delta"===t.type&&"text_delta"===t.delta.type){let r=JSON.stringify({text:t.delta.text});e.enqueue(c.encode(`data: ${r}

`))}e.enqueue(c.encode("data: [DONE]\n\n"))}catch(r){let t=r instanceof Error?r.message:"Unknown error";e.enqueue(c.encode(`data: ${JSON.stringify({error:t})}

`))}finally{e.close()}}}),{headers:{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"no-cache",Connection:"keep-alive"}})}let d=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/ai/quote/route",pathname:"/api/ai/quote",filename:"route",bundlePath:"app/api/ai/quote/route"},resolvedPagePath:"C:\\Users\\USER\\Downloads\\square-cube-FURNITURE\\apps\\web\\src\\app\\api\\ai\\quote\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:c,staticGenerationAsyncStorage:l,serverHooks:m}=d,f="/api/ai/quote/route";function h(){return(0,n.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:l})}},3036:(e,t,r)=>{e.exports=r(517)}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[522,876],()=>r(2795));module.exports=s})();