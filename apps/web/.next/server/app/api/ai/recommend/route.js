"use strict";(()=>{var e={};e.id=471,e.ids=[471],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7147:e=>{e.exports=require("fs")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},2477:e=>{e.exports=require("node:stream/web")},1017:e=>{e.exports=require("path")},5477:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},5034:e=>{e.exports=require("url")},3837:e=>{e.exports=require("util")},1267:e=>{e.exports=require("worker_threads")},9796:e=>{e.exports=require("zlib")},9625:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>g,patchFetch:()=>x,requestAsyncStorage:()=>m,routeModule:()=>d,serverHooks:()=>h,staticGenerationAsyncStorage:()=>l});var s={};t.r(s),t.d(s,{POST:()=>p});var a=t(3036),o=t(5736),n=t(5262),i=t(942);let u=new(t(2876)).ZP({apiKey:process.env.ANTHROPIC_API_KEY}),c=`
Available product categories and slugs (use these EXACT slugs):
- Sofas: classic-chesterfield-sofa, l-shaped-sectional, two-seater-lovechair
- Beds: queen-platform-bed, storage-king-bed
- Dining: six-seater-dining-table, farmhouse-dining-set
- Tables: walnut-coffee-table, glass-side-table, laptop-writing-desk
- Storage: oak-bookshelf, chest-of-drawers, wardrobe-with-mirror
- Chairs: accent-armchair, bar-stool-set, rocking-chair
- Outdoor: teak-garden-bench, patio-dining-set
`.trim();async function p(e){let r;try{r=await e.json()}catch{return i.NextResponse.json({error:"Invalid JSON."},{status:400})}let{query:t}=r;if(!t||"string"!=typeof t||t.trim().length<3)return i.NextResponse.json({error:"query must be at least 3 characters."},{status:400});let s=`You are a furniture recommendation engine for Square Cube, a premium custom furniture brand.

Given a customer's natural-language description, recommend 1–3 matching products from the catalogue below.

${c}

Customer query: "${t.trim()}"

Respond with ONLY a JSON object — no markdown, no code fences, no explanation:
{
  "recommendations": [
    { "slug": "<exact-slug-from-catalogue>", "reason": "<one sentence why this matches>" },
    ...
  ]
}

If no products match, return: { "recommendations": [] }`;try{let e;let r=(await u.messages.create({model:"claude-haiku-4-5-20251001",max_tokens:400,messages:[{role:"user",content:s}]})).content.filter(e=>"text"===e.type).map(e=>e.text).join("");try{e=JSON.parse(r.trim())}catch{let t=r.match(/\{[\s\S]*\}/);e=t?JSON.parse(t[0]):{recommendations:[]}}return i.NextResponse.json({success:!0,data:e})}catch(e){return console.error("[ai/recommend]",e),i.NextResponse.json({error:"Recommendation failed."},{status:500})}}let d=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/ai/recommend/route",pathname:"/api/ai/recommend",filename:"route",bundlePath:"app/api/ai/recommend/route"},resolvedPagePath:"C:\\Users\\USER\\Downloads\\square-cube-FURNITURE\\apps\\web\\src\\app\\api\\ai\\recommend\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:m,staticGenerationAsyncStorage:l,serverHooks:h}=d,g="/api/ai/recommend/route";function x(){return(0,n.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:l})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[522,746,876],()=>t(9625));module.exports=s})();