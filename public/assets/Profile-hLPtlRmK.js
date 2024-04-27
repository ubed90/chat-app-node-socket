import{u as I,r as v,a as f,c as g,b as L,j as e,C as i,F as O,M as c,d as _,I as H,e as M,f as k,g as d,R as B,h as V,i as h,B as l}from"./index-64q6F6Vr.js";const q=["jpg","jpeg","png"],K=()=>{const{user:t}=I(a=>a.user),[b,F]=v.useState(!1),r=()=>{F(!b)},{mutate:D,isPending:j}=f({mutationKey:["update-profile",t==null?void 0:t._id],mutationFn:a=>g.patch(`/auth/update-profile/${t==null?void 0:t._id}`,a)}),{mutate:S,isPending:p}=f({mutationKey:["delete-profile-picture"],mutationFn:a=>g.delete(`/auth/update-profile/${a}`)}),C=()=>{S(t==null?void 0:t._id,{onSuccess({data:a}){u(h({user:a.user})),l.success(a.message+" 🚀")},onError(a){l.error(a.message)}})},{mutate:U,isPending:P}=f({mutationKey:["update-profile-picture"],mutationFn:a=>g.post(`/auth/update-profile/${t==null?void 0:t._id}`,a)}),w=()=>{if(!o)return l.error("Please upload a file");const a=new FormData;a.append("profilePicture",o),U(a,{onSuccess({data:s}){u(h({user:s.user})),l.success(s.message+" 🚀"),x(null)},onError(s){l.error(s.message)}})},E=()=>{o&&x(null),r()},u=L(),T=a=>{a.preventDefault();const s=new FormData(a.target),m=Object.fromEntries(s.entries());D(m,{onSuccess({data:n}){u(h({user:n.user})),l.success("Profile Update Successfully 🚀")},onError(n){var y,N;l.error(((N=(y=n==null?void 0:n.response)==null?void 0:y.data)==null?void 0:N.message)||n.message)}})},[o,x]=v.useState(null),R=a=>{if(!a.target.files)return;const s=a.target.files[0];if(!s.type.startsWith("image/")&&!q.includes(s.type.replace("Image/","")))return l.error("Only jpg / jpeg / png files are supported");const m=1024*1024*2;if(s.size>m)return l.error("Max Image size is 2MB");x(s)};return e.jsx("section",{className:"profile mx-auto mt-10",children:e.jsxs("div",{className:"profile-card border-[1px] border-neutral border-opacity-70 rounded-xl overflow-hidden",children:[e.jsxs("header",{className:"profile-card-header bg-neutral relative",children:[t!=null&&t.profilePicture?e.jsx("div",{className:"avatar absolute top-full left-2/4 -translate-x-2/4 -translate-y-2/4",children:e.jsx("div",{className:"w-52 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2",children:e.jsx("img",{src:t.profilePicture,className:"!object-contain"})})}):e.jsx("div",{className:"avatar absolute top-full left-2/4 -translate-x-2/4 -translate-y-2/4 placeholder",children:e.jsx("div",{className:"bg-secondary text-neutral-content rounded-full w-52 ring ring-accent ring-offset-base-100 ring-offset-2",children:e.jsx("span",{className:"text-6xl uppercase",children:t==null?void 0:t.name.substring(0,2)})})}),e.jsxs("div",{className:"profile-card-header-action absolute right-5 top-5",children:[e.jsx(i,{type:"button",classes:"btn-circle btn-accent btn-lg",icon:e.jsx(O,{className:"text-3xl"}),clickHandler:r}),e.jsxs(c,{id:"edit-profile-picture",isOpen:b,onClose:r,children:[e.jsx(c.Header,{onClose:r,children:"Edit Profile Picture"}),e.jsxs(c.Body,{className:"pt-6 flex flex-col items-center gap-8",children:[t!=null&&t.profilePicture?e.jsx("div",{className:"avatar",children:e.jsx("div",{className:"w-52 rounded-full",children:e.jsx("img",{src:t.profilePicture})})}):e.jsx("label",{className:"avatar placeholder cursor-pointer",htmlFor:"profile-picture-upload",children:e.jsx("div",{className:"bg-secondary text-neutral-content rounded-full w-52 ring ring-accent ring-offset-base-100 ring-offset-2",children:e.jsx("span",{className:"text-6xl uppercase",children:t==null?void 0:t.name.substring(0,2)})})}),e.jsxs("div",{className:"actions flex flex-col-reverse sm:flex-row gap-4",children:[e.jsx(i,{type:"button",text:"Delete Profile Picture",clickHandler:C,icon:e.jsx(_,{}),classes:"btn-outline btn-error rounded-lg text-xl",isDisabled:!(t!=null&&t.profilePicture)||p,isLoading:p,loadingText:"Deleting..."}),e.jsx("input",{id:"profile-picture-upload",type:"file",className:"file-input file-input-bordered rounded-lg w-full max-w-xs",accept:".jpg,.jpeg,.png",onChange:R,disabled:p})]})]}),e.jsx(c.Footer,{children:e.jsxs("div",{className:"flex mt-4 justify-end gap-4",children:[e.jsx(i,{type:"reset",clickHandler:E,classes:"btn btn-outline btn-white rounded-md text-xl",text:"Cancel",icon:e.jsx(H,{}),isDisabled:P}),e.jsx(i,{type:"button",classes:"btn btn-accent rounded-md text-xl",clickHandler:w,text:"Update",icon:e.jsx(M,{className:"text-4xl"}),loadingText:"Updating...",isLoading:P,isDisabled:!o})]})})]})]})]}),e.jsx("div",{className:"profile-card-body px-4 mt-28",children:e.jsxs(k,{id:"profile-form",method:"POST",onSubmit:T,children:[e.jsx(d,{type:"text",name:"name",label:"Name",required:!0,placeholder:"eg. John Doe",customClasses:"!text-xl md:input-lg !input-bordered focus:outline-accent !py-6",defaultValue:t==null?void 0:t.name}),e.jsx(d,{type:"email",name:"email",label:"email",required:!0,placeholder:"eg. johnDoe@gmail.com",customClasses:"!text-xl md:input-lg !input-bordered focus:outline-accent !py-6",defaultValue:t==null?void 0:t.email}),e.jsx(d,{type:"text",name:"username",label:"username",required:!0,placeholder:"eg. johndoe123",customClasses:"!text-xl md:input-lg !input-bordered focus:outline-accent !py-6",defaultValue:t==null?void 0:t.username}),e.jsx(d,{type:"text",name:"phoneNumber",label:"Phone Number",maxLength:10,minLength:10,placeholder:"eg. 8987876543",customClasses:"!text-xl md:input-lg !input-bordered focus:outline-accent !py-6",defaultValue:t==null?void 0:t.phoneNumber})]})}),e.jsxs("footer",{className:"profile-card-footer p-4 flex gap-4",children:[e.jsx(i,{classes:"btn-outline btn-accent rounded-xl text-2xl btn-lg flex-1",text:"Reset",icon:e.jsx(B,{}),type:"reset",form:"profile-form",isLoading:j,loadingText:"Updating..."}),e.jsx(i,{classes:"btn-accent rounded-xl text-2xl btn-lg flex-1",text:"Update",icon:e.jsx(V,{}),type:"submit",form:"profile-form",isLoading:j,loadingText:"Updating..."})]})]})})};export{K as default};
