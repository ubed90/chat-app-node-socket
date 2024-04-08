import{k as f,a as b,c as h,j as e,n as w,L as j,f as y,g as N,C as P,B as o}from"./index-64q6F6Vr.js";const F=()=>{const[i]=f(),{email:r,token:n}=Object.fromEntries(i.entries()),{mutate:c,isPending:d,isSuccess:x,data:m}=b({mutationKey:["reset-password"],mutationFn:async({password:s})=>{const{data:t}=await h.post("/auth/reset-password",{password:s,email:r,token:n});return t}}),u=s=>{s.preventDefault();const t=new FormData(s.target),p=Object.fromEntries(t.entries()),{password:a}=p;if(!a||String(a).trim()==="")return o.error("Password cannot be empty.");c({password:a,email:r,token:n},{onError:g=>{var l;o.error((l=g.response)==null?void 0:l.data.message)}})};return d?e.jsxs("section",{className:"px-4 w-full h-full flex flex-col gap-y-8 items-center justify-center",children:[e.jsx("span",{className:"loading loading-bars loading-lg text-accent"}),e.jsx("h5",{className:"text-2xl md:text-4xl text-accent",children:"Please wait your request is being processed..."})]}):x?e.jsxs("section",{className:"px-4 w-full h-full flex flex-col gap-y-6 items-center justify-center",children:[e.jsx(w,{className:"text-7xl text-accent"}),e.jsx("h5",{className:"text-2xl md:text-4xl text-accent",children:m.message||"Voila! Your password is reset suucessfully."}),e.jsx(j,{to:"/login",className:"btn btn-lg btn-outline btn-wide btn-secondary rounded-xl text-2xl",children:"Login"})]}):e.jsx("main",{className:"app-container",children:e.jsxs("section",{className:"card w-full p-9 bg-primary bg-opacity-10 rounded-xl",children:[e.jsx("h1",{className:"card-title text-5xl lg:text-7xl",children:"Reset Password"}),e.jsx("div",{className:"divider divider-primary"}),e.jsxs(y,{method:"POST",onSubmit:u,children:[e.jsx(N,{name:"password",type:"password",placeholder:"eg. Password@1234",label:"New Password",customClasses:"input-md md:input-lg",borderRadius:"rounded-xl",required:!0}),e.jsx(P,{loadingText:"loading...",classes:"btn-secondary btn-lg btn-block text-xl md:text-2xl mt-5",text:"Reset Password",type:"submit"})]})]})})};export{F as default};