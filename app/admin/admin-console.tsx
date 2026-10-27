"use client";
import {useEffect,useState} from "react";
import {BarChart3,ClipboardCheck,Egg,LogOut,MessageCircle,RotateCcw,ShieldCheck,UserCheck,Users,WalletCards} from "lucide-react";
type Account={id:number;email?:string|null;fullName:string;phone:string;ecocash:string;district:string;role:string;status:string};type Payment={id:number;orderId:number;orderCode:string;buyerName:string;sellerName:string;reference:string;amountCents:number;status:string};type Listing={id:number;batchCode:string;breed:string;crates:number;status:string};type Admin={id:number;email:string;role:string;active:boolean};type Claim={id:number;orderId:number;category:string;remedy:string;status:string;dueDate:string;createdAt:string};type Inspection={id:number;listingId:number;acceptedEggs:number;rejectedEggs:number;condition:string;status:string;createdAt:string};type Order={id:number;orderCode:string;listingId:number;buyerEmail:string;crates:number;total:number;status:string;createdAt:string};type Message={id:number;participantEmail:string;participantRole:string;senderRole:string;senderName:string;body:string;createdAt:string};type DemandRequest={id:number;buyerEmail:string;breed:string;crates:number;neededBy:string;preferredDistrict:string|null;notes:string;status:string;createdAt:string};
async function send(payload:Record<string,unknown>){const r=await fetch("/api/admin",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)}),d=await r.json();if(!r.ok)throw new Error(d.error||"Action failed");return d}
export default function AdminConsole({user}:{user:{name:string;email:string;role:string;primary:boolean}}){const[data,setData]=useState<{accounts:Account[];payments:Payment[];listings:Listing[];admins:Admin[];claims:Claim[];inspections:Inspection[];orders:Order[];messages:Message[];requests:DemandRequest[];maxAdmins:number}|null>(null),[error,setError]=useState(""),[notice,setNotice]=useState("");async function load(){const r=await fetch("/api/admin",{cache:"no-store"}),d=await r.json();if(!r.ok)setError(d.error);else setData(d)}useEffect(()=>{load()},[]);async function act(payload:Record<string,unknown>){try{await send(payload);setNotice("Action completed and recorded.");await load()}catch(e){setError(e instanceof Error?e.message:"Action failed")}}if(!data)return <main className="admin-shell">
<p>{error||"Loading secure administration…"}</p>
</main>;const activeAdmins=1+data.admins.filter(a=>a.active).length,now=new Date(),dayStart=new Date(now.getFullYear(),now.getMonth(),now.getDate()),weekStart=new Date(dayStart),monthStart=new Date(now.getFullYear(),now.getMonth(),1),yearStart=new Date(now.getFullYear(),0,1);weekStart.setDate(dayStart.getDate()-((dayStart.getDay()+6)%7));const validOrders=data.orders.filter(o=>!["Cancelled","Refunded"].includes(o.status)),summary=(start:Date)=>{const rows=validOrders.filter(o=>new Date(o.createdAt)>=start);return {orders:rows.length,crates:rows.reduce((n,o)=>n+o.crates,0),value:rows.reduce((n,o)=>n+o.total,0)}},periods=[["Today",dayStart],["This week",weekStart],["This month",monthStart],["Year to date",yearStart]] as const,threads=Array.from(new Map(data.messages.map(m=>[`${m.participantEmail}|${m.participantRole}`,{email:m.participantEmail,role:m.participantRole,name:data.accounts.find(a=>a.email===m.participantEmail&&a.role===m.participantRole)?.fullName||m.participantEmail}])).values()),conversion=data.listings.length?Math.round(validOrders.length/data.listings.length*100):0,fulfilled=validOrders.filter(o=>/Paid|Collected|Completed|Claims/.test(o.status)).length,fulfilment=validOrders.length?Math.round(fulfilled/validOrders.length*100):0,totalCrates=validOrders.reduce((n,o)=>n+o.crates,0),claimRate=totalCrates?data.claims.length/totalCrates*100:0,rejectedEggs=data.inspections.reduce((n,i)=>n+i.rejectedEggs,0),repeatBuyers=new Set(validOrders.filter((o,i,a)=>a.findIndex(x=>x.buyerEmail===o.buyerEmail)!==i).map(o=>o.buyerEmail)).size;return <main className="admin-shell">
<header>
<a className="admin-brand" href="/">
<Egg/>HatchLink</a><span className="admin-area-label">ADMINISTRATOR PORTAL</span>
<div>
<span>
<ShieldCheck/>{user.role}</span>
<b>{user.name}</b>
<small>{user.email}</small>
</div>
<a className="admin-signout" href="/signout-with-chatgpt?return_to=/" target="_top">
<LogOut/>Sign out</a>
</header>
<div className="admin-body">
<p className="eyebrow">SECURE ADMINISTRATION</p>
<h1>Today’s control centre</h1>
<p className="admin-intro">Start with items that need attention. Records are shown newest first, and every action is verified on the server.</p>
<nav className="admin-links" aria-label="Administrator operations"><a href="#reports">Reports</a><a href="#requests">Egg requests</a><a href="#messages">Messages</a><a href="#accounts">Accounts</a><a href="#payments">Payments</a><a href="#claims">Claims</a><a href="#security">Administrators</a><a href="#inspections">Inspections</a><a href="#history">Inspection history</a></nav>
<div className="admin-priority"><b>Suggested order:</b><span>1. Approve accounts</span><span>2. Verify payments</span><span>3. Decide claims</span><span>4. Inspect batches</span></div>{(notice||error)&&<div className={error?"admin-alert error":"admin-alert"}>{error||notice}<button onClick={()=>{setError("");setNotice("")}}>×</button>
</div>}<div className="stat-grid">
<div>
<UserCheck/>
<span>Pending accounts</span>
<b>{data.accounts.filter(a=>a.status==="Pending approval").length}</b>
</div>
<div>
<WalletCards/>
<span>Payments to verify</span>
<b>{data.payments.filter(p=>p.status==="Awaiting verification").length}</b>
</div>
<div>
<RotateCcw/>
<span>Open claims</span>
<b>{data.claims.filter(c=>!["Approved","Rejected"].includes(c.status)).length}</b>
</div>
<div>
<Users/>
<span>Administrators</span>
<b>{activeAdmins}/{data.maxAdmins}</b>
</div>
</div>
<section className="secure-card report-summary" id="reports"><h2><BarChart3/>Transaction summary</h2><p>Recorded orders excluding cancelled and refunded transactions.</p><div className="report-grid">{periods.map(([label,start])=>{const s=summary(start);return <article key={label}><span>{label}</span><strong>US${s.value.toFixed(2)}</strong><small>{s.orders} transaction{s.orders===1?"":"s"} · {s.crates} crates</small></article>})}</div><div className="market-kpis"><article><span>Listing conversion</span><b>{conversion}%</b></article><article><span>Fulfilment progress</span><b>{fulfilment}%</b></article><article><span>Claims / 100 crates</span><b>{claimRate.toFixed(1)}</b></article><article><span>Rejected eggs</span><b>{rejectedEggs}</b></article><article><span>Repeat buyers</span><b>{repeatBuyers}</b></article></div></section>
<section className="secure-card" id="requests"><h2><Egg/>Buyer egg requests</h2>{!data.requests.length?<p>No private sourcing requests yet.</p>:data.requests.map(r=>{const buyer=data.accounts.find(a=>a.email===r.buyerEmail&&a.role==="Buyer");return <div className="secure-row" key={r.id}><div><b>{r.breed} · {r.crates} crates</b><span>Buyer: {buyer?.fullName||r.buyerEmail} · needed {new Date(r.neededBy).toLocaleDateString("en-ZW")}</span><small>{r.preferredDistrict||"Any district"}{r.notes?` · ${r.notes}`:""}</small></div><aside><em>{r.status}</em>{!["Closed","Declined"].includes(r.status)&&<><button onClick={()=>act({action:"update_request",id:r.id,status:r.status==="Submitted"?"Sourcing":"Matched"})}>{r.status==="Submitted"?"Start sourcing":"Mark matched"}</button><button className="danger" onClick={()=>act({action:"update_request",id:r.id,status:"Declined"})}>Decline</button></>}</aside></div>})}</section>
<section className="secure-card admin-messages" id="messages"><h2><MessageCircle/>Buyer and seller messages</h2>{!threads.length?<p>No support conversations yet.</p>:threads.map(t=>{const thread=data.messages.filter(m=>m.participantEmail===t.email&&m.participantRole===t.role).slice().reverse();return <article className="admin-thread" key={`${t.email}-${t.role}`}><header><div><b>{t.name}</b><span>{t.role} · {t.email}</span></div><button onClick={()=>{const body=prompt(`Reply to ${t.name}`);if(body?.trim())act({action:"reply_message",participantEmail:t.email,participantRole:t.role,body:body.trim()})}}>Reply</button></header><div>{thread.slice(-6).map(m=><p className={m.senderRole==="Administrator"?"from-admin":"from-user"} key={m.id}><b>{m.senderRole==="Administrator"?"Admin":m.senderName}</b><span>{m.body}</span><small>{new Date(m.createdAt).toLocaleString("en-ZW")}</small></p>)}</div></article>})}</section>
<div className="admin-secure-grid">
<section className="secure-card" id="accounts">
<h2>
<UserCheck/>Account approvals</h2>{data.accounts.map(a=>
<div className="secure-row" key={a.id}>
<div>
<b>{a.fullName}</b>
<span>{a.role} · {a.district}</span>
<small>{a.phone} · payment details verified later</small>
</div>
<aside>
<em>{a.status}</em>{a.status==="Pending approval"&&<>
<button onClick={()=>act({action:"approve",id:a.id,status:"Approved"})}>Approve</button>
<button className="danger" onClick={()=>act({action:"approve",id:a.id,status:"Rejected"})}>Reject</button>
</>}</aside>
</div>)}</section>
<section className="secure-card" id="payments">
<h2>
<WalletCards/>Payment verification</h2>{!data.payments.length?<p>No submitted payments.</p>:data.payments.map(p=>
<div className="secure-row" key={p.id}>
<div>
<b>{p.reference}</b>
<span>{p.orderCode} · US${(p.amountCents/100).toFixed(2)}</span>
<small>Buyer: <b>{p.buyerName}</b> · Seller: <b>{p.sellerName}</b></small>
</div>
<aside>
<em>{p.status}</em>{p.status==="Awaiting verification"&&<>
<button onClick={()=>act({action:"verify_payment",id:p.id,status:"Verified"})}>Verify</button>
<button className="danger" onClick={()=>act({action:"verify_payment",id:p.id,status:"Rejected"})}>Reject</button>
</>}</aside>
</div>)}</section>
<section className="secure-card" id="claims">
<h2><RotateCcw/>Claims requiring decision</h2>{!data.claims.length?<p>No claims submitted.</p>:data.claims.map(c=><div className="secure-row" key={c.id}><div><b>{c.category}</b><span>Order {c.orderId} · {c.remedy}</span><small>Due {new Date(c.dueDate).toLocaleDateString("en-ZW")} · {c.status}</small></div><aside>{!["Approved","Rejected"].includes(c.status)&&<><button onClick={()=>act({action:"resolve_claim",id:c.id,status:"Approved"})}>Approve</button><button className="danger" onClick={()=>act({action:"resolve_claim",id:c.id,status:"Rejected"})}>Reject</button></>}</aside></div>)}</section>
</div>
<section className="secure-card admin-management" id="security">
<h2>
<ShieldCheck/>Administrator security</h2>
<p>Only the Primary Administrator can appoint or remove administrators. The hard limit is {data.maxAdmins} active administrators.</p>{user.primary&&activeAdmins<data.maxAdmins&&<button onClick={()=>{const email=prompt("Enter the new administrator's verified ChatGPT email");if(email)act({action:"add_admin",email})}}>Add administrator</button>}<div className="admin-member primary">
<span>JG</span>
<div>
<b>jimgoto@gmail.com</b>
<small>Primary Administrator · cannot be removed</small>
</div>
</div>{data.admins.map(a=>
<div className="admin-member" key={a.id}>
<span>{a.email.slice(0,2).toUpperCase()}</span>
<div>
<b>{a.email}</b>
<small>{a.role} · {a.active?"Active":"Removed"}</small>
</div>{user.primary&&a.active&&<button className="danger" onClick={()=>act({action:"remove_admin",id:a.id})}>Remove</button>}</div>)}</section>
<section className="secure-card" id="inspections">
<h2>
<ClipboardCheck/>Batches awaiting inspection</h2>{data.listings.filter(l=>l.status!=="Expired").map(l=>
<div className="secure-row" key={l.id}>
<div>
<b>{l.batchCode}</b>
<span>{l.breed} · {l.crates} crates · {l.status}</span>
</div>
<button onClick={()=>{const accepted=prompt("Accepted eggs",String(l.crates*30));if(accepted!==null)act({action:"inspect",listingId:l.id,acceptedEggs:+accepted,rejectedEggs:l.crates*30-(+accepted),condition:"Inspected by authorised administrator"})}}>Inspect</button>
</div>)}</section>
<section className="secure-card inspection-history" id="history"><h2><ClipboardCheck/>Inspection history · newest first</h2>{!data.inspections.length?<p>No inspections recorded.</p>:data.inspections.map(i=><div className="secure-row" key={i.id}><div><b>Listing {i.listingId} · {i.status}</b><span>{i.acceptedEggs} accepted · {i.rejectedEggs} rejected</span><small>{new Date(i.createdAt).toLocaleString("en-ZW")} · {i.condition}</small></div></div>)}</section>
</div>
</main>}
