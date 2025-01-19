import{r as a}from"./index-C1rHHvMa.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),c=(...e)=>e.filter((r,o,t)=>!!r&&t.indexOf(r)===o).join(" ");/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var u={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=a.forwardRef(({color:e="currentColor",size:r=24,strokeWidth:o=2,absoluteStrokeWidth:t,className:i="",children:s,iconNode:n,...l},d)=>a.createElement("svg",{ref:d,...u,width:r,height:r,stroke:e,strokeWidth:t?Number(o)*24/Number(r):o,className:c("lucide",i),...l},[...n.map(([m,h])=>a.createElement(m,h)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=(e,r)=>{const o=a.forwardRef(({className:t,...i},s)=>a.createElement(w,{ref:s,iconNode:r,className:c(`lucide-${f(e)}`,t),...i}));return o.displayName=`${e}`,o};export{N as C};
