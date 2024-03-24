import{a as u,c as m,r as g,j as s,f as h,g as l,C as p,B as i}from"./index-aGzJEc1h.js";import{R as f,a as P}from"./index-bHpzn_J6.js";const y=()=>{const{mutate:w,isPending:r}=u({mutationKey:["change-password"],mutationFn:async({password:t,newPassword:e})=>{const{data:o}=await m.post("/auth/change-password",{password:t,newPassword:e});return o}}),[a,d]=g.useState({password:"",newPassword:""}),n=({key:t,value:e})=>{d({...a,[t]:e})},x=t=>{t.preventDefault(),w({password:a.password,newPassword:a.newPassword},{onSuccess(e){d({password:"",newPassword:""}),i.success(e.message)},onError(e){var o,c;i.error(((c=(o=e==null?void 0:e.response)==null?void 0:o.data)==null?void 0:c.message)||e.message)}})};return s.jsx("section",{className:"profile mx-auto mt-10",children:s.jsxs("div",{className:"border-[1px] border-neutral border-opacity-70 rounded-xl px-4",children:[s.jsx("h2",{className:"text-3 md:text-5xl text-accent xl pt-4",children:"Change Password"}),s.jsx("div",{className:"divider m-0"}),s.jsx("div",{className:"profile-card-body pt-4",children:s.jsxs(h,{id:"change-password-form",method:"POST",onSubmit:x,children:[s.jsx(l,{type:"password",name:"password",label:"Password",required:!0,placeholder:"eg. Password@123",customClasses:"!text-xl md:input-lg !input-bordered focus:outline-accent !py-6",value:a.password,handleChange:n}),s.jsx(l,{type:"password",name:"newPassword",label:"New Password",required:!0,placeholder:"eg. Password@123",customClasses:"!text-xl md:input-lg !input-bordered focus:outline-accent !py-6",value:a.newPassword,handleChange:n})]})}),s.jsxs("footer",{className:"profile-card-footer flex gap-4 pb-4",children:[s.jsx(p,{classes:"btn-outline btn-accent rounded-xl text-2xl btn-lg flex-1",text:"Reset",icon:s.jsx(f,{}),type:"reset",form:"change-password-form",isLoading:r,onClick:()=>d({password:"",newPassword:""})}),s.jsx(p,{classes:"btn-accent rounded-xl text-2xl btn-lg flex-1",text:"Update",icon:s.jsx(P,{}),type:"submit",form:"change-password-form",isLoading:r,isDisabled:r||!a.password||!a.newPassword||a.password===a.newPassword,loadingText:"Updating..."})]})]})})};export{y as default};