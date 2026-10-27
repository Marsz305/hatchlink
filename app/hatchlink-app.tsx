"use client";
import {useEffect,useMemo,useState} from "react";
import {BadgeCheck,Banknote,Bell,Bird,BookOpen,CalendarDays,ChevronRight,CircleCheck,ClipboardCheck,Clock3,Download,Egg,FileText,HelpCircle,House,MessageCircle,MoreVertical,PackageCheck,Plus,QrCode,RotateCcw,Search,Send,ShieldCheck,ShoppingBasket,SlidersHorizontal,Store,Truck,UserCheck,WalletCards,X} from "lucide-react";
type Listing={id:number;batchCode:string;breed:string;district:string;crates:number;price:number;oldestEgg:string;newestEgg:string;fertility:number|null;purity:string;status:string;storageMethod?:string|null;storageTemperature?:string|null;eggsTurned?:boolean|null;flockAge?:string|null;maleFemaleRatio?:string|null;vaccinationStatus?:string|null;packagingMethod?:string|null;proposedDeliveryDate?:string|null;sellerApproved?:boolean;lastInspectionDate?:string|null;transactionCount?:number};
type Order={id:number;orderCode:string;breed:string;crates:number;total:number;status:string};
type Account={id:number;email?:string|null;fullName:string;phone:string;ecocash:string;district:string;role:string;status:string};type Payment={id:number;orderId:number;reference:string;amountCents:number;status:string};type Note={id:number;title:string;body:string;readAt:string|null};
type Receipt={id:number;orderId:number;receiptCode:string;batchCode:string;crates:number;eggs:number;officer:string;collectionCode?:string|null;transportMethod?:string|null;collectedAt:string;buyerConfirmed:boolean};type Claim={id:number;orderId:number;category:string;details:string;remedy:string;status:string;dueDate:string;createdAt:string};
type Message={id:number;participantEmail:string;participantRole:string;senderRole:string;senderName:string;body:string;readAt:string|null;createdAt:string};
type DemandRequest={id:number;breed:string;crates:number;neededBy:string;preferredDistrict:string|null;notes:string;status:string;createdAt:string};
const seed:Listing[]=[];
const breeds=["Black Australorp","White Australorp","Potchefstroom Koekoek","Boschveld","Kuroiler","Rhode Island Red","Orpington","Brahma","Mixed Indigenous","Mixed Exotic"];
const age=(d:string)=>Math.max(0,Math.floor((new Date().setHours(12,0,0,0)-new Date(d+"T12:00:00+02:00").getTime())/86400000));
const money=(n:number)=>`US$${n.toFixed(2)}`;
async function post(payload:Record<string,unknown>){const r=await fetch("/api/market",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok){alert(d.error||"Unable to save");return null}return d}
export default function HatchLinkApp({user,signInPath}:{user:{name:string;email:string}|null;signInPath:string}){const[view,setView]=useState("market"),[listings,setListings]=useState(seed),[orders,setOrders]=useState<Order[]>([]),[sellerOrders,setSellerOrders]=useState<Order[]>([]),[sellerListings,setSellerListings]=useState<Listing[]>([]),[accounts,setAccounts]=useState<Account[]>([]),[payments,setPayments]=useState<Payment[]>([]),[notes,setNotes]=useState<Note[]>([]),[receipts,setReceipts]=useState<Receipt[]>([]),[claims,setClaims]=useState<Claim[]>([]),[messages,setMessages]=useState<Message[]>([]),[requests,setRequests]=useState<DemandRequest[]>([]),[query,setQuery]=useState(""),[breed,setBreed]=useState("All breeds"),[selected,setSelected]=useState<Listing|null>(null),[qty,setQty]=useState(1),[notice,setNotice]=useState(""),[menu,setMenu]=useState(false),[gateRole,setGateRole]=useState<"Buyer"|"Seller"|null>(null),[applyRole,setApplyRole]=useState<"Buyer"|"Seller">("Buyer");
useEffect(()=>{fetch("/api/market").then(r=>r.ok?r.json():null).then(d=>{if(d?.listings?.length)setListings(d.listings);if(d?.orders)setOrders(d.orders);if(d?.sellerOrders)setSellerOrders(d.sellerOrders);if(d?.sellerListings)setSellerListings(d.sellerListings);if(d?.accounts)setAccounts(d.accounts);if(d?.payments)setPayments(d.payments);if(d?.notifications)setNotes(d.notifications);if(d?.receipts)setReceipts(d.receipts);if(d?.claims)setClaims(d.claims);if(d?.messages)setMessages(d.messages);if(d?.requests)setRequests(d.requests)}).catch(()=>{});if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{})},[]);
const profileInitials=user?user.name.trim().split(/\s+/).slice(0,2).map(n=>n[0]?.toUpperCase()).join(""):"Guest";const roleStatus=(role:"Buyer"|"Seller")=>accounts.find(a=>a.role===role)?.status;const can=(role:"Buyer"|"Seller")=>roleStatus(role)==="Approved";function requireRole(role:"Buyer"|"Seller",action:()=>void){if(!user||!can(role)){setGateRole(role);return}action()}function rememberAccount(a:Account){setAccounts(x=>x.some(v=>v.id===a.id)?x:[a,...x]);setNotice(a.status==="Approved"?`${a.role} account ready.`:"Application received. You can participate after administrator approval.");setView("market")}
const filtered=useMemo(()=>listings.filter(l=>l.status==="Available"&&age(l.oldestEgg)<=7&&(breed==="All breeds"||l.breed===breed)&&(l.batchCode+l.breed+l.district).toLowerCase().includes(query.toLowerCase())),[listings,breed,query]);
async function reserve(){if(!selected)return;const crates=Math.min(qty,selected.crates);try{const r=await fetch("/api/market",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"reserve",listingId:selected.id,breed:selected.breed,crates,price:selected.price})});const d=await r.json();if(!r.ok){alert(d.error||"Unable to reserve");return}const order=d.order;setOrders(o=>[order,...o]);setListings(ls=>ls.map(l=>l.id===selected.id?{...l,crates:l.crates-crates,status:l.crates-crates===0?"Reserved":"Available"}:l));setSelected(null);setNotice("Reserved for 30 minutes. Complete your EcoCash payment to secure the order.");setView("orders")}catch{alert("Unable to reserve. Please retry.")}}
return <main className={view==="buyer"?"app-shell buyer-mode":view==="sell"?"app-shell seller-mode":"app-shell"}>
<header className="topbar">
<button className="brand" onClick={()=>setView("market")}>
<span className="brandmark">
<Egg/>
</span>
<span>HatchLink <b>Zimbabwe</b>
</span>
</button>
<nav className="desktop-nav">
<Nav icon={<Store/>} active={view==="market"} label="Market" go={()=>setView("market")}/>
<Nav tone="buyer" icon={<ShoppingBasket/>} active={view==="buyer"} label="Buyer portal" go={()=>requireRole("Buyer",()=>setView("buyer"))}/>
<Nav tone="seller" icon={<Plus/>} active={view==="sell"} label="Seller portal" go={()=>requireRole("Seller",()=>setView("sell"))}/>
<Nav icon={<QrCode/>} active={view==="trace"} label="Trace" go={()=>setView("trace")}/>
<Nav icon={<BookOpen/>} active={view==="how"} label="How it works" go={()=>setView("how")}/>
</nav>
<button className={user?"profile":"profile guest-profile"} aria-label={user?`${user.name} account menu`:"Guest menu"} aria-expanded={menu} onClick={()=>setMenu(!menu)}><span>{profileInitials}</span><MoreVertical aria-hidden="true"/></button>
</header>
{menu&&<div className="profile-menu">
<b>{user?.name||"Guest"}</b>
<span>{user?user.email:"Sign up to buy or sell"}</span>
<hr/><div className="role-menu"><button className="buyer-link" onClick={()=>{requireRole("Buyer",()=>setView("buyer"));setMenu(false)}}><ShoppingBasket/>Buyer portal</button><button className="seller-link" onClick={()=>{requireRole("Seller",()=>setView("sell"));setMenu(false)}}><Store/>Seller portal</button><a className="admin-link" href="/admin"><ShieldCheck/>Administrator portal</a></div>{user?<div className="role-applications"><span>ROLE APPLICATIONS</span><button onClick={()=>{setApplyRole("Buyer");setView("apply");setMenu(false)}}>Apply for buyer role</button><button onClick={()=>{setApplyRole("Seller");setView("apply");setMenu(false)}}>Apply for seller role</button></div>:<a href={signInPath} target="_top">Sign up / sign in</a>}<button onClick={()=>{setView("notifications");setMenu(false)}}>Notifications ({notes.filter(n=>!n.readAt).length})</button>
{user&&accounts.some(a=>a.status==="Approved")&&<button onClick={()=>{setView("messages");setMenu(false)}}>Chat with administration</button>}
<button onClick={()=>{setView("how");setMenu(false)}}>How it works & FAQ</button>
<button onClick={()=>{setView("terms");setMenu(false)}}>Marketplace terms</button>{user&&<a href="/signout-with-chatgpt?return_to=/" target="_top">Sign out</a>}</div>}{notice&&<div className="notice">
<CircleCheck/>
<span>{notice}</span>
<button onClick={()=>setNotice("")}>
<X/>
</button>
</div>}
<div className="page">{view==="market"&&<>
<section className="intro">
<div>
<p className="eyebrow">TRACEABLE FERTILISED EGGS</p>
<h1>Find the right eggs.<br/>
<em>Know every batch.</em>
</h1>
<p>Verified surplus eggs, inspected at one aggregation point. Farmers and buyers remain private.</p>
<div className="hero-actions"><button className="primary" onClick={()=>setView("market")}><Search/>Find eggs</button><button className="secondary" onClick={()=>requireRole("Seller",()=>setView("sell"))}><Plus/>Sell eggs</button><button className="secondary" onClick={()=>setView("how")}><BookOpen/>How it works</button></div>
</div>
<div className="trust-card">
<ShieldCheck/>
<div>
<strong>Managed transaction</strong>
<span>Inspection, EcoCash and traceability in one place</span>
</div>
</div>
</section>
<section className="market-tools">
<label className="search">
<Search/>
<input aria-label="Search" placeholder="Search breed, district or batch code" value={query} onChange={e=>setQuery(e.target.value)}/>
</label>
<label className="select">
<SlidersHorizontal/>
<select value={breed} onChange={e=>setBreed(e.target.value)}>
<option>All breeds</option>{breeds.map(b=>
<option key={b}>{b}</option>)}</select>
</label>
</section>
<div className="market-head">
<div>
<h2>Available now</h2>
<p>{filtered.reduce((a,l)=>a+l.crates,0)} crates across {filtered.length} batches</p>
</div>
<span className="fresh-rule">
<Clock3/> Maximum egg age: 7 days</span>
</div>
<section className="listing-grid">{filtered.map(l=>
<article className="listing" key={l.id}>
<div className="listing-top">
<span className="egg-orb">
<Bird/>
</span>
<div className={age(l.oldestEgg)>=6?"age-badge warning":"age-badge"}>{age(l.oldestEgg)} days old</div>
</div>
<p className="batch">{l.batchCode}</p>
<h3>{l.breed}</h3>
<p className="purity">{l.purity}</p>
<div className="trust-strip"><span><BadgeCheck/>{l.sellerApproved?"Seller approved":"Seller review pending"}</span><span><ClipboardCheck/>{l.lastInspectionDate?`Inspected ${new Date(l.lastInspectionDate).toLocaleDateString("en-ZW")}`:"Inspection pending"}</span><span><ShieldCheck/>{l.transactionCount||0} recorded sale{l.transactionCount===1?"":"s"}</span></div>
<div className="metrics">
<div>
<span>Available</span>
<b>{l.crates} crates</b>
</div>
<div>
<span>Per crate</span>
<b>{money(l.price)}</b>
</div>
<div>
<span>Verified fertility</span>
<b>{l.fertility?`${l.fertility}%`:"New seller"}</b>
</div>
<div>
<span>District</span>
<b>{l.district}</b>
</div>
</div>
<div className="date-row">
<CalendarDays/>
<span>Laid {l.oldestEgg.slice(5)} to {l.newestEgg.slice(5)}</span>
</div>
<button className="primary" onClick={()=>{setSelected(l);setQty(1)}}>Reserve crates <ChevronRight/>
</button>
</article>)}{!filtered.length&&<div className="market-empty"><Egg/><h3>No fresh batches available</h3><p>New batches will appear here after approval and inspection.</p></div>}</section>
</>}
{view==="sell"&&<Sell listings={sellerListings} orders={sellerOrders} openChat={()=>setView("messages")} onDone={l=>{setListings(x=>[l,...x]);setSellerListings(x=>[l,...x]);setNotice("Listing submitted for inspection and approval.")}}/>}{view==="orders"&&<Orders orders={orders} onPay={async(order,reference)=>{const r=await post({action:"payment",orderId:order.id,reference});if(r?.payment){setPayments(p=>[r.payment,...p]);setNotice("EcoCash reference submitted for finance verification.")}}}/>} {view==="buyer"&&<BuyerPortal orders={orders} payments={payments} receipts={receipts} claims={claims} requests={requests} onRequest={r=>setRequests(x=>[r,...x])} onReceipt={r=>setReceipts(x=>[r,...x])} onClaim={c=>setClaims(x=>[c,...x])} notice={setNotice} openChat={()=>setView("messages")}/>} {view==="trace"&&<Trace listings={listings}/>} {view==="apply"&&<Apply onDone={rememberAccount} role={applyRole} name={user?.name||""}/>} {view==="notifications"&&<Notifications notes={notes}/>} {view==="messages"&&<SupportChat accounts={accounts} messages={messages} onMessage={m=>setMessages(x=>[m,...x])}/>} {view==="how"&&<HowItWorks/>} {view==="terms"&&<Terms/>}</div>
<footer>
<span>
<Egg/> HatchLink Zimbabwe</span>
<p>Independent managed marketplace · Buyer and seller details stay private</p>
</footer>
<nav className="mobile-nav">
<Nav icon={<House/>} active={view==="market"} label="Market" go={()=>setView("market")}/>
<Nav tone="buyer" icon={<ShoppingBasket/>} active={view==="buyer"} label="Buyer" go={()=>requireRole("Buyer",()=>setView("buyer"))}/>
<Nav tone="seller" icon={<Plus/>} active={view==="sell"} label="Seller" go={()=>requireRole("Seller",()=>setView("sell"))}/>
<Nav icon={<QrCode/>} active={view==="trace"} label="Trace" go={()=>setView("trace")}/>
</nav>
{selected&&<div className="modal-bg" onMouseDown={()=>setSelected(null)}>
<section className="modal" onMouseDown={e=>e.stopPropagation()}>
<button className="close" onClick={()=>setSelected(null)}>
<X/>
</button>
<p className="eyebrow">RESERVE BATCH</p>
<h2>{selected.breed}</h2>
<p>{selected.batchCode} · {selected.district}</p>
<label>Number of crates<input type="number" inputMode="numeric" min="1" max={selected.crates} step="1" value={qty} onChange={e=>setQty(Math.max(1,Math.min(selected.crates,Math.floor(+e.target.value||1))))}/>
<small>{selected.crates} crates available · no five-crate ceiling</small>
</label>
<div className="price-breakdown">
<span>Eggs ({qty*30}) <b>{money(qty*selected.price)}</b>
</span>
<span>Platform commission <b>{money(qty*.75)}</b>
</span>
<span className="total">Total due <b>{money(qty*selected.price+qty*.75)}</b>
</span>
</div>
<div className="privacy-note">
<ShieldCheck/>Your details remain hidden from the farmer.</div>
<p className="fine-print">The buyer arranges and pays collection transport unless a separate delivery fee is shown. Fertility and hatch results are not guaranteed because transport, storage, incubation and electricity interruptions can affect results.</p>
<button className="primary" onClick={()=>requireRole("Buyer",reserve)}>Reserve {qty} crate{qty===1?"":"s"}</button>
</section>
</div>}{gateRole&&<AccountGate role={gateRole} user={user} status={roleStatus(gateRole)} signInPath={signInPath} close={()=>setGateRole(null)} apply={()=>{setApplyRole(gateRole);setGateRole(null);setView("apply")}}/>}</main>}
function Nav({icon,label,active,go,tone}:{icon:React.ReactNode,label:string,active:boolean,go:()=>void,tone?:"buyer"|"seller"}){return <button className={`${active?"nav-active ":""}${tone?`nav-${tone}`:""}`} onClick={go}>{icon}<span>{label}</span>
</button>}
function AccountGate({role,user,status,signInPath,close,apply}:{role:"Buyer"|"Seller";user:{name:string;email:string}|null;status?:string;signInPath:string;close:()=>void;apply:()=>void}){return <div className="modal-bg" onMouseDown={close}>
<section className="modal account-gate" onMouseDown={e=>e.stopPropagation()}>
<button className="close" onClick={close}>
<X/>
</button>
<ShieldCheck className="gate-icon"/>
<p className="eyebrow">ACCOUNT REQUIRED</p>
<h2>{role} access</h2>{!user?<>
<p>You must sign up or sign in before you can {role==="Buyer"?"reserve, pay for or collect eggs":"list or sell eggs"}.</p>
<a className="primary" href={signInPath} target="_top">Sign up / sign in</a>
</>:status==="Pending approval"?<>
<p>Your {role.toLowerCase()} application is awaiting administrator approval. You can participate once it is approved.</p>
<button className="primary" onClick={close}>Return to marketplace</button>
</>:status==="Rejected"?<>
<p>Your {role.toLowerCase()} application is not active. Contact HatchLink administration if you need the decision reviewed.</p>
<button className="primary" onClick={close}>Return to marketplace</button>
</>:<>
<p>You are signed in as <b>{user.email}</b>, but you have not opened a {role.toLowerCase()} account.</p>
<button className="primary" onClick={apply}>Open {role.toLowerCase()} account</button>
</>}</section>
</div>}
function BuyerPortal({orders,payments,receipts,claims,requests,onRequest,onReceipt,onClaim,notice,openChat}:{orders:Order[];payments:Payment[];receipts:Receipt[];claims:Claim[];requests:DemandRequest[];onRequest:(r:DemandRequest)=>void;onReceipt:(r:Receipt)=>void;onClaim:(c:Claim)=>void;notice:(s:string)=>void;openChat:()=>void}){const[tab,setTab]=useState("overview"),[claimOpen,setClaimOpen]=useState(false),[claimForm,setClaimForm]=useState({category:"Fertility concern",remedy:"EcoCash reimbursement",details:""});const sample:Order={id:0,orderCode:"SAMPLE-ORDER",breed:"Black Australorp",crates:2,total:16.5,status:"Example only"};const current=orders[0]||sample;const payment=payments.find(p=>p.orderId===current.id),receipt=receipts.find(r=>r.orderId===current.id),claim=claims.find(c=>c.orderId===current.id);
async function pay(){if(!current.id)return alert("Reserve eggs from the Market first.");const ref=prompt("Enter your EcoCash transaction reference");if(ref?.trim()){const d=await post({action:"payment",orderId:current.id,reference:ref.trim()});if(d?.payment)notice("Payment evidence submitted for verification.")}}
async function receive(){if(!current.id)return alert("This is an example. Reserve and pay for an order first.");const code=prompt("Scan or enter the batch code on the crates",`BATCH-${current.id}`);if(!code)return;const collectionCode=prompt("Enter the one-time collection code",`COL-${current.id}`);if(!collectionCode)return;const transportMethod=prompt("How are the eggs being transported?","Buyer-arranged vehicle")||"Buyer-arranged collection";const d=await post({action:"receive",orderId:current.id,batchCode:code,collectionCode,transportMethod});if(d?.receipt){onReceipt(d.receipt);notice("Receipt confirmed. Your digital collection record is ready.")}}
async function claimSubmit(e:React.FormEvent){e.preventDefault();if(!current.id)return;const d=await post({action:"claim",orderId:current.id,...claimForm});if(d?.claim){onClaim(d.claim);setClaimOpen(false);notice("Claim submitted. Track the decision here until day 10.")}}
return <section className="buyer-page">
<header className="buyer-head">
<div>
<p className="eyebrow">BUYER PORTAL</p>
<h1>My eggs, payments and claims</h1>
<p>Everything you need after choosing a batch—without contacting the farmer.</p>
</div>
<div className="portal-head-actions"><span className="buyer-shield"><ShieldCheck/> Verified buyer area</span><button className="chat-shortcut buyer-chat" onClick={openChat}><MessageCircle/> Chat with administration</button></div>
</header>
<nav className="buyer-tabs">
<button className={tab==="overview"?"active":""} onClick={()=>setTab("overview")}>Overview</button>
<button className={tab==="payment"?"active":""} onClick={()=>setTab("payment")}>Pay</button>
<button className={tab==="receipt"?"active":""} onClick={()=>setTab("receipt")}>Receipt</button>
<button className={tab==="claim"?"active":""} onClick={()=>setTab("claim")}>Claims</button>
<button className={tab==="request"?"active":""} onClick={()=>setTab("request")}>Request eggs</button>
</nav>
{tab==="overview"&&<div className="buyer-grid">
<article className="buyer-order">
<span className="blue-label">{current.id?"CURRENT ORDER":"ILLUSTRATIVE ORDER"}</span>
<h2>{current.breed}</h2>
<p>{current.orderCode}</p>
<div>
<span>{current.crates} crates</span>
<span>{current.crates*30} eggs</span>
<b>{money(current.total)}</b>
</div>
<footer>
<i className="blue-dot"/>{current.status}</footer>
</article>
<div className="buyer-actions">
<button onClick={()=>setTab("payment")}>
<WalletCards/>
<span>
<b>Make or prove payment</b>
<small>{payment?payment.status:"Payment required"}</small>
</span>
<ChevronRight/>
</button>
<button onClick={()=>setTab("receipt")}>
<PackageCheck/>
<span>
<b>Collection receipt</b>
<small>{receipt?"Receipt available":"Confirm eggs received"}</small>
</span>
<ChevronRight/>
</button>
<button onClick={()=>setTab("claim")}>
<RotateCcw/>
<span>
<b>Claim or reimbursement</b>
<small>{claim?claim.status:"No open claim"}</small>
</span>
<ChevronRight/>
</button>
</div>
<TransactionHistory title="Purchase history" orders={orders}/>
</div>}
{tab==="payment"&&<section className="buyer-panel">
<div className="panel-title">
<WalletCards/>
<div>
<p className="eyebrow">ECOCASH PAYMENT</p>
<h2>Pay HatchLink—not the farmer</h2>
</div>
</div>
<div className="pay-card">
<span>Amount due</span>
<strong>{money(current.total)}</strong>
<dl>
<dt>Pay to</dt>
<dd>HatchLink Zimbabwe merchant account</dd>
<dt>Merchant number</dt>
<dd className="pending-value">To be displayed after merchant activation</dd>
<dt>Payment reference</dt>
<dd>{current.orderCode}</dd>
</dl>
</div>
<ol className="pay-steps">
<li>Pay the amount shown to the HatchLink merchant account.</li>
<li>Use <b>{current.orderCode}</b> as your payment reference.</li>
<li>Submit the EcoCash confirmation reference for verification.</li>
</ol>{payment?<div className="verified-strip">
<CircleCheck/>
<span>
<b>Reference {payment.reference}</b>
<small>{payment.status}</small>
</span>
</div>:<button className="buyer-primary" onClick={pay} disabled={!current.id}>Submit EcoCash reference</button>}<p className="safety-copy">HatchLink will never ask for your EcoCash PIN. The live merchant number will appear here only after approved credentials are connected.</p>
</section>}
{tab==="receipt"&&<section className="buyer-panel">
<div className="panel-title">
<PackageCheck/>
<div>
<p className="eyebrow">PROOF OF RECEIPT</p>
<h2>Egg collection record</h2>
</div>
</div>{receipt?<ReceiptCard receipt={receipt} order={current}/>:<div className="receipt-pending">
<QrCode/>
<h3>No receipt recorded yet</h3>
<p>At collection, scan the crate batch code and confirm the quantity received. The time, officer and batch details become your evidence.</p>
<button className="buyer-primary" onClick={receive} disabled={!current.id}>Confirm receipt of eggs</button>
</div>}</section>}
{tab==="claim"&&<section className="buyer-panel">
<div className="panel-title">
<RotateCcw/>
<div>
<p className="eyebrow">DAY-10 OUTCOME</p>
<h2>Reimbursement or cash collection</h2>
</div>
</div>{claim?<ClaimTracker claim={claim}/>:<>
<div className="claim-rule">
<Clock3/>
<p>Physical-condition complaints must be reported within 12 hours. Fertility evidence is submitted after day-7 candling and before the end of day 9.</p>
</div>{claimOpen?<form className="claim-form" onSubmit={claimSubmit}>
<label>Claim category<select value={claimForm.category} onChange={e=>setClaimForm({...claimForm,category:e.target.value})}>
<option>Fertility concern</option>
<option>Physical damage</option>
<option>Wrong breed or quantity</option>
</select>
</label>
<label>Preferred approved remedy<select value={claimForm.remedy} onChange={e=>setClaimForm({...claimForm,remedy:e.target.value})}>
<option>EcoCash reimbursement</option>
<option>Cash collection at aggregation point</option>
<option>Replacement eggs</option>
</select>
</label>
<label>Evidence and details<textarea required placeholder="Give the candling result, affected egg count and evidence available" value={claimForm.details} onChange={e=>setClaimForm({...claimForm,details:e.target.value})}/>
</label>
<button className="buyer-primary">Submit claim</button>
</form>:<button className="buyer-primary" onClick={()=>setClaimOpen(true)} disabled={!current.id}>Start a claim</button>}</>}</section>}
{tab==="request"&&<DemandRequestPanel requests={requests} onRequest={onRequest} notice={notice}/>}</section>}
function DemandRequestPanel({requests,onRequest,notice}:{requests:DemandRequest[];onRequest:(r:DemandRequest)=>void;notice:(s:string)=>void}){const[f,setF]=useState({breed:breeds[0],crates:1,neededBy:new Date().toISOString().slice(0,10),preferredDistrict:"",notes:""}),[sending,setSending]=useState(false);async function submit(e:React.FormEvent){e.preventDefault();setSending(true);const d=await post({action:"request_eggs",...f});if(d?.request){onRequest(d.request);notice("Your request was sent privately to HatchLink administration.");setF({...f,crates:1,notes:""})}setSending(false)}return <section className="buyer-panel demand-panel"><div className="panel-title"><Search/><div><p className="eyebrow">CAN’T FIND A MATCH?</p><h2>Request eggs through HatchLink</h2></div></div><p>Administration can source suitable batches without revealing buyer or seller contact details.</p><form className="demand-form" onSubmit={submit}><label>Breed<select value={f.breed} onChange={e=>setF({...f,breed:e.target.value})}>{breeds.map(b=><option key={b}>{b}</option>)}</select></label><label>Complete crates<input type="number" min="1" required value={f.crates} onChange={e=>setF({...f,crates:+e.target.value})}/><small>{f.crates*30} eggs</small></label><label>Needed by<input type="date" required min={new Date().toISOString().slice(0,10)} value={f.neededBy} onChange={e=>setF({...f,neededBy:e.target.value})}/></label><label>Preferred district (optional)<input value={f.preferredDistrict} onChange={e=>setF({...f,preferredDistrict:e.target.value})}/></label><label className="wide-field">Notes<textarea maxLength={500} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="Any breed status, collection or timing requirements"/></label><button className="buyer-primary" disabled={sending}>{sending?"Sending…":"Send request to administration"}</button></form><div className="request-history"><h3>My requests</h3>{!requests.length?<p className="muted">No sourcing requests yet.</p>:requests.map(r=><article key={r.id}><div><b>{r.breed}</b><span>{r.crates} crates · needed {r.neededBy}</span></div><em>{r.status}</em></article>)}</div></section>}
function ReceiptCard({receipt,order}:{receipt:Receipt;order:Order}){return <article className="receipt-card">
<div className="receipt-brand">
<span>
<Egg/> HatchLink receipt</span>
<button onClick={()=>window.print()}>
<Download/> Print</button>
</div>
<div className="receipt-check">
<CircleCheck/>
<div>
<b>Eggs received by buyer</b>
<span>Confirmed {new Date(receipt.collectedAt).toLocaleString("en-ZW")}</span>
</div>
</div>
<dl>
<dt>Receipt</dt>
<dd>{receipt.receiptCode}</dd>
<dt>Order</dt>
<dd>{order.orderCode}</dd>
<dt>Batch</dt>
<dd>{receipt.batchCode}</dd>
<dt>Breed</dt>
<dd>{order.breed}</dd>
<dt>Quantity</dt>
<dd>{receipt.crates} crates · {receipt.eggs} eggs</dd>
<dt>Released by</dt>
<dd>{receipt.officer}</dd>
<dt>Collection code</dt>
<dd>{receipt.collectionCode||"Recorded securely"}</dd>
<dt>Transport</dt>
<dd>{receipt.transportMethod||"Buyer-arranged collection"}</dd>
<dt>Buyer confirmation</dt>
<dd>Recorded digitally</dd>
</dl>
<p>This record proves physical handover by the HatchLink aggregation point. Seller contact details remain protected.</p>
</article>}
function ClaimTracker({claim}:{claim:Claim}){const steps=["Claim submitted","Evidence review","Decision recorded",claim.remedy,"Closed"];const active=claim.status==="Evidence review"?1:claim.status.includes("Approved")?3:2;return <div className="claim-tracker">
<div className="outcome-card">
<span>Requested outcome</span>
<b>{claim.remedy}</b>
<small>Due by {claim.dueDate}</small>
</div>
<div className="vertical-track">{steps.map((s,i)=>
<div className={i<=active?"done":""} key={s}>
<i>{i<active?"✓":i+1}</i>
<span>
<b>{s}</b>
<small>{i===0?new Date(claim.createdAt).toLocaleDateString("en-ZW"):i===3&&claim.remedy.includes("Cash")?"Buyer presents ID and collection code at the aggregation point":i===3?"Paid to the buyer’s verified EcoCash number":"Pending"}</small>
</span>
</div>)}</div>
<div className="day10">
<Banknote/>
<p>
<b>Day-10 control</b>
<span>HatchLink records the transaction reference for EcoCash reimbursement or issues a one-time code for authorised cash collection.</span>
</p>
</div>
</div>}
function Sell({onDone,listings,orders,openChat}:{onDone:(l:Listing)=>void;listings:Listing[];orders:Order[];openChat:()=>void}){const today=new Date().toISOString().slice(0,10),[f,setF]=useState({breed:breeds[0],crates:1,price:7.5,oldestEgg:today,newestEgg:today,district:"Goromonzi",purity:"Pure breed",storageMethod:"Clean egg trays in a cool room",storageTemperature:"",eggsTurned:true,flockAge:"",maleFemaleRatio:"1:7",vaccinationStatus:"Vaccinated—records available",packagingMethod:"30-egg crate with cushioning",proposedDeliveryDate:today});async function submit(e:React.FormEvent){e.preventDefault();if(age(f.oldestEgg)>7)return alert("The oldest egg is over 7 days old.");let l:Listing={...f,id:Date.now(),batchCode:`PENDING-${String(Date.now()).slice(-5)}`,fertility:null,status:"Under review"};try{const r=await fetch('/api/market',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'list',...f})});const d=await r.json();if(r.ok)l=d.listing}catch{}onDone(l)}return <section className="form-page">
<p className="eyebrow">SELL SURPLUS EGGS</p>
<div className="seller-page-head"><h1>Create a listing</h1><button className="chat-shortcut" onClick={openChat}><MessageCircle/> Chat with administration</button></div>
<p>Only list eggs that are yours to sell and are not committed to another purchaser.</p>
<form onSubmit={submit}>
<div className="form-grid">
<label>Breed<select value={f.breed} onChange={e=>{const breed=e.target.value;setF({...f,breed,purity:breed.startsWith("Mixed ")?"Crossbreed":f.purity})}}>{breeds.map(b=>
<option key={b}>{b}</option>)}</select>
</label>
<label>Breed status<select value={f.purity} onChange={e=>setF({...f,purity:e.target.value})}>
<option>Pure breed</option>
<option>Crossbreed</option>
<option>Breed not independently verified</option>
</select>
</label>
<label>Complete crates<input min="1" type="number" value={f.crates} onChange={e=>setF({...f,crates:+e.target.value})}/>
<small>{f.crates*30} eggs</small>
</label>
<label>Price per crate (US$)<input min="1" step="0.25" type="number" value={f.price} onChange={e=>setF({...f,price:+e.target.value})}/>
</label>
<label>Oldest egg date<input type="date" value={f.oldestEgg} onChange={e=>setF({...f,oldestEgg:e.target.value})}/>
</label>
<label>Newest egg date<input type="date" value={f.newestEgg} onChange={e=>setF({...f,newestEgg:e.target.value})}/>
</label>
<label>District<input value={f.district} onChange={e=>setF({...f,district:e.target.value})}/>
</label>
<label>Storage method<input required value={f.storageMethod} onChange={e=>setF({...f,storageMethod:e.target.value})}/></label>
<label>Storage temperature (optional)<input placeholder="e.g. 18°C" value={f.storageTemperature} onChange={e=>setF({...f,storageTemperature:e.target.value})}/></label>
<label>Breeder-flock age (optional)<input placeholder="e.g. 34 weeks" value={f.flockAge} onChange={e=>setF({...f,flockAge:e.target.value})}/></label>
<label>Cock-to-hen ratio<input required value={f.maleFemaleRatio} onChange={e=>setF({...f,maleFemaleRatio:e.target.value})}/></label>
<label>Vaccination status<select value={f.vaccinationStatus} onChange={e=>setF({...f,vaccinationStatus:e.target.value})}><option>Vaccinated—records available</option><option>Vaccinated—records unavailable</option><option>Not declared</option></select></label>
<label>Packaging method<input required value={f.packagingMethod} onChange={e=>setF({...f,packagingMethod:e.target.value})}/></label>
<label>Proposed delivery date<input required type="date" min={today} value={f.proposedDeliveryDate} onChange={e=>setF({...f,proposedDeliveryDate:e.target.value})}/></label>
</div>
<label className="declaration"><input type="checkbox" checked={f.eggsTurned} onChange={e=>setF({...f,eggsTurned:e.target.checked})}/><span>Eggs were turned regularly during storage.</span></label>
<label className="declaration">
<input type="checkbox" required/>
<span>I confirm these eggs are surplus, mine to sell, correctly dated and not committed to another purchaser.</span>
</label>
<div className="estimate">
<span>Estimated proceeds</span>
<b>{money(f.crates*f.price-f.crates*.75)}</b>
<small>after {money(f.crates*.75)} commission</small>
</div>
<button className="primary">Submit for approval</button>
</form>
<section className="seller-history"><h2>Seller transaction history</h2>{!listings.length&&!orders.length?<p className="muted">Your listings and completed sales will appear here.</p>:<><div className="history-list">{listings.map(l=><article key={l.id}><div><b>{l.batchCode}</b><span>{l.breed} · {l.crates} crates</span></div><em>{l.status}</em></article>)}</div><TransactionHistory title="Sales against my batches" orders={orders}/></>}
</section>
</section>}
function TransactionHistory({title,orders}:{title:string;orders:Order[]}){return <section className="transaction-history"><h2>{title}</h2>{!orders.length?<p className="muted">No transactions recorded yet.</p>:<div className="history-list">{orders.map(o=><article key={o.id}><div><b>{o.orderCode}</b><span>{o.breed} · {o.crates} crates · {o.crates*30} eggs</span></div><aside><strong>{money(o.total)}</strong><em>{o.status}</em></aside></article>)}</div>}</section>}
function Orders({orders,onPay}:{orders:Order[];onPay:(o:Order,r:string)=>void}){return <section className="form-page wide">
<p className="eyebrow">BUYER ACCOUNT</p>
<h1>My orders</h1>{!orders.length?<div className="empty">
<ShoppingBasket/>
<h3>No orders yet</h3>
<p>Your reservations and collection instructions will appear here.</p>
</div>:<div className="order-list">{orders.map(o=>
<article key={o.id}>
<span className="order-icon">
<PackageCheck/>
</span>
<div>
<p>{o.orderCode}</p>
<h3>{o.breed}</h3>
<span>{o.crates} crates · {o.crates*30} eggs</span>
</div>
<div className="order-money">
<b>{money(o.total)}</b>
<span>{o.status}</span>{o.status==="Awaiting EcoCash"&&<button className="small-action" onClick={()=>{const ref=prompt("Enter the EcoCash transaction reference");if(ref?.trim())onPay(o,ref.trim())}}>Submit EcoCash reference</button>}</div>
</article>)}</div>}<div className="payment-note">
<WalletCards/>
<div>
<b>EcoCash merchant integration</b>
<p>Payments currently use secure transaction-reference verification. Automated merchant prompts activate when approved EcoCash credentials are connected; the app never asks for or stores an EcoCash PIN.</p>
</div>
</div>
<div className="timeline-card">
<h2>How settlement works</h2>
<div className="timeline">
<span>
<b>Collection</b>
<small>Check physical condition</small>
</span>
<span>
<b>Day 7</b>
<small>Candle the eggs</small>
</span>
<span>
<b>Day 9</b>
<small>Claims close</small>
</span>
<span>
<b>Day 10</b>
<small>Farmer is paid</small>
</span>
<span>
<b>Day 21–23</b>
<small>Record hatch result</small>
</span>
</div>
</div>
</section>}
function Trace({listings}:{listings:Listing[]}){const[code,setCode]=useState("");const found=listings.find(l=>l.batchCode.toLowerCase()===code.trim().toLowerCase());return <section className="trace-page">
<div className="trace-hero">
<QrCode/>
<p className="eyebrow">BATCH TRACEABILITY</p>
<h1>Trace your eggs</h1>
<p>Buyers find the code on the crate label or receipt. Sellers find it on their listing and delivery record.</p>
<div className="trace-steps"><span><b>1</b> Find the batch code</span><span><b>2</b> Enter or scan it</span><span><b>3</b> Check dates, breed and quantity</span></div>
<label>
<input placeholder="HLZ-2026-BA-000124" value={code} onChange={e=>setCode(e.target.value)}/>
<button type="button" onClick={()=>!code&&setCode(listings[0]?.batchCode||"")}>Find batch</button>
</label>
</div>{code&&!found&&<p className="trace-missing">No batch matches that code. Check the crate label or receipt and try again.</p>}{found&&<article className="trace-result">
<div>
<CircleCheck/>Verified HatchLink batch</div>
<h2>{found.breed}</h2>
<dl>
<dt>Batch</dt>
<dd>{found.batchCode}</dd>
<dt>Egg dates</dt>
<dd>{found.oldestEgg} — {found.newestEgg}</dd>
<dt>Accepted quantity</dt>
<dd>{found.crates*30} eggs</dd>
<dt>Source area</dt>
<dd>{found.district} District</dd>
<dt>Seller identity</dt>
<dd>Protected by HatchLink</dd>
</dl>
</article>}</section>}
function Apply({onDone,role,name}:{onDone:(a:Account)=>void;role:"Buyer"|"Seller";name:string}){const[f,setF]=useState({fullName:name,phone:"",district:"",role}),[submitting,setSubmitting]=useState(false),[duplicate,setDuplicate]=useState("");async function submit(e:React.FormEvent){e.preventDefault();if(submitting)return;setSubmitting(true);setDuplicate("");const d=await post({action:"apply",...f});if(d?.duplicate){setDuplicate(d.message||"This application already exists.");if(d.account)onDone(d.account)}else if(d?.account)onDone(d.account);setSubmitting(false)}return <section className="form-page">
<p className="eyebrow">VERIFIED ACCOUNTS</p>
<h1>Open a {role.toLowerCase()} account</h1>
<p>A short application using your signed-in identity, role and mobile number. Payment details can be verified later, and trading-partner contact details remain private.</p>
<form onSubmit={submit}>
<div className="form-grid">
<label>Full legal name<input required value={f.fullName} onChange={e=>setF({...f,fullName:e.target.value})}/>
</label>
<label>Apply as<select value={f.role} onChange={e=>setF({...f,role:e.target.value as "Buyer"|"Seller"})}>
<option>Seller</option>
<option>Buyer</option>
</select>
</label>
<label>Mobile number<input required inputMode="tel" placeholder="077…" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
</label>
<label>District (optional)<input placeholder="e.g. Goromonzi" value={f.district} onChange={e=>setF({...f,district:e.target.value})}/>
</label>
</div>
<label className="declaration">
<input type="checkbox" required/>
<span>I accept the marketplace terms and consent to identity and payment verification.</span>
</label>{duplicate&&<div className="duplicate-warning">
<ShieldCheck/>
<span>
<b>Application already received</b>{duplicate} You do not need to apply again.</span>
</div>}<button className="primary" disabled={submitting}>{submitting?"Submitting…":"Submit application"}</button>
</form>
</section>}
function SupportChat({accounts,messages,onMessage}:{accounts:Account[];messages:Message[];onMessage:(m:Message)=>void}){const roles=accounts.filter(a=>a.status==="Approved"&&["Buyer","Seller"].includes(a.role)).map(a=>a.role),[role,setRole]=useState(roles[0]||"Buyer"),[body,setBody]=useState(""),[sending,setSending]=useState(false);const thread=messages.filter(m=>m.participantRole===role).slice().reverse();async function submit(e:React.FormEvent){e.preventDefault();if(!body.trim()||sending)return;setSending(true);const d=await post({action:"send_message",role,body:body.trim()});if(d?.message){onMessage(d.message);setBody("")}setSending(false)}return <section className="form-page support-page"><p className="eyebrow">PRIVATE SUPPORT</p><h1>Chat with HatchLink</h1><p>Messages are between your approved {role.toLowerCase()} account and authorised administrators. Buyers and sellers cannot see each other’s messages or contact details.</p>{roles.length>1&&<label className="role-switch">Message as<select value={role} onChange={e=>setRole(e.target.value)}>{roles.map(r=><option key={r}>{r}</option>)}</select></label>}<div className="chat-thread" aria-live="polite">{!thread.length?<div className="empty"><MessageCircle/><h3>No messages yet</h3><p>Ask administration about an account, batch, payment, collection or claim.</p></div>:thread.map(m=><article className={m.senderRole==="Administrator"?"admin-message":"participant-message"} key={m.id}><b>{m.senderRole==="Administrator"?"HatchLink administration":`You · ${m.participantRole}`}</b><p>{m.body}</p><small>{new Date(m.createdAt).toLocaleString("en-ZW")}</small></article>)}</div><form className="chat-compose" onSubmit={submit}><label htmlFor="support-message">Message</label><textarea id="support-message" maxLength={1000} required value={body} onChange={e=>setBody(e.target.value)} placeholder="Type your message to administration…"/><button className="primary" disabled={sending}><Send/> {sending?"Sending…":"Send message"}</button></form></section>}
function Notifications({notes}:{notes:Note[]}){return <section className="form-page">
<p className="eyebrow">NOTIFICATION CENTRE</p>
<h1>Updates</h1>
<div className="notification-list">{!notes.length?<div className="empty">
<Bell/>
<h3>No updates</h3>
<p>Account, payment, delivery and settlement alerts will appear here.</p>
</div>:notes.map(n=>
<article key={n.id}>
<Bell/>
<div>
<b>{n.title}</b>
<p>{n.body}</p>
</div>
</article>)}</div>
<aside className="alert-policy"><Bell/><div><b>Messages stay private</b><p>HatchLink relays updates between participants. In-app alerts work now; SMS and WhatsApp alerts will be enabled when approved messaging providers are connected.</p></div></aside>
</section>}
function HowItWorks(){const faqs=[['Does HatchLink guarantee hatch rate?','No. Inspection and verified records improve confidence, but transport and incubation conditions affect results. Fertility claims use day-7 candling evidence.'],['Will buyers and sellers contact each other?','No. HatchLink coordinates listings, payments, questions, delivery and collection while keeping personal details private.'],['What does a verification badge mean?','Each badge states the specific check completed—identity, flock records, inspection or transaction history. It is not a fertility guarantee.'],['What if the eggs I want are unavailable?','An approved buyer can submit a private Request Eggs form. Administration sources suitable batches without exposing either party.']];return <section className="form-page how-page"><p className="eyebrow">CLEAR, MANAGED TRADING</p><h1>How HatchLink works</h1><p className="lead">Verified participants trade complete 30-egg crates through a neutral aggregation point, with private identities and batch-level evidence.</p><div className="how-steps">{[['1','Sign up','Apply as buyer or seller and wait for administrator approval.'],['2','Find or list','Buyers compare batches; sellers declare fresh, uncommitted eggs.'],['3','Inspect','Sellers deliver privately and HatchLink records accepted and rejected eggs.'],['4','Pay and collect','Buyer pays HatchLink, then collects using a one-time code.'],['5','Track','Day-7 candling supports claims; settlement becomes due on day 10.']].map(([n,t,d])=><article key={n}><b>{n}</b><div><h2>{t}</h2><p>{d}</p></div></article>)}</div><section className="verification-guide"><h2><BadgeCheck/>What our checks mean</h2><div><article><b>Identity verified</b><p>Administrator approved the participant’s identity and account.</p></article><article><b>Batch inspected</b><p>Physical condition, quantity and declared dates were recorded at intake.</p></article><article><b>Performance recorded</b><p>Shown only after enough verified transactions; never presented as a guarantee.</p></article></div></section><div className="checklist-grid"><article><h2>Seller handling checklist</h2><ul><li>Use clean trays and complete 30-egg crates.</li><li>Record oldest and newest lay dates accurately.</li><li>Store cool, dry and away from direct sunlight.</li><li>Turn stored eggs gently and regularly.</li><li>Use cushioning and deliver within the seven-day limit.</li></ul></article><article><h2>Buyer collection checklist</h2><ul><li>Verify batch labels, quantities and receipt code.</li><li>Keep crates level and protect them from vibration and heat.</li><li>Set eggs within 24 hours of collection.</li><li>Record temperature, humidity, turning and interruptions.</li><li>Candle on day 7 and submit any fertility claim by day 9.</li></ul></article></div><section className="faq"><h2><HelpCircle/>Frequently asked questions</h2>{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section></section>}
function Terms(){return <section className="form-page terms">
<p className="eyebrow">MARKETPLACE RULES</p>
<h1>Terms and egg-quality policy</h1>
<div className="legal-warning">
<FileText/>
<p>
<b>Draft for legal review.</b> These operational terms must be reviewed under Zimbabwean law before public trading begins.</p>
</div>
<article>
<h2>Independent marketplace</h2>
<p>HatchLink is an independent aggregation service. Sellers may list only eggs they own and that are not committed to another purchaser. HatchLink does not represent a seller’s employer, association or existing customer.</p>
<h2>Egg acceptance</h2>
<p>Each crate contains 30 eggs. Eggs must be no more than seven calendar days old when delivered. HatchLink may reject cracked, contaminated, incorrectly described or over-age eggs after inspection.</p>
<h2>Transport</h2>
<p>Unless an order shows a separate delivery service and fee, buyers arrange and pay their own collection transport. Buyers must protect eggs from shock, heat and delays after collection.</p>
<h2>Privacy</h2>
<p>Buyers and sellers do not receive each other’s identity, telephone number, EcoCash details or exact address. HatchLink may use verified information for fulfilment, fraud prevention, payment and dispute resolution.</p>
<h2>Fertility and claims</h2>
<p>Physical-condition claims close 12 hours after collection. Eggs should be set within 24 hours and candled on incubation day 7. Fertility claims close at the end of day 9. Final hatch results do not automatically establish seller liability because incubation conditions affect hatchability.</p>
<p className="fine-print"><b>Egg-quality disclaimer:</b> Inspection confirms only the recorded physical condition at the aggregation point. HatchLink and the seller do not guarantee fertility or final hatch rate. Breeder-flock condition, egg age, storage, handling, transport, incubator temperature, humidity, turning, ventilation, hygiene and power interruptions can all affect results.</p>
<h2>Communication</h2>
<p>Buyer and seller contact details remain private. All transaction communication, payment and handover arrangements must go through HatchLink. Direct contact, cash exchanges or off-platform handoffs void platform protections and may result in account suspension. Order messages and approved SMS or WhatsApp alerts are relayed without exposing either party’s identity.</p>
<h2>Payment and settlement</h2>
<p>The platform commission is US$0.75 per completed crate. Seller settlement is due on day 10 after collection unless a valid batch-level claim is open. HatchLink does not describe funds as escrow.</p>
<h2>Traceability</h2>
<p>Batch codes, inspections, orders, complaints and hatch feedback are retained for quality management. Falsifying egg dates, breed or ownership may result in suspension.</p>
</article>
</section>}
function Operations({listings,orders,accounts,payments,setAccounts,setPayments,notice}:{listings:Listing[];orders:Order[];accounts:Account[];payments:Payment[];setAccounts:React.Dispatch<React.SetStateAction<Account[]>>;setPayments:React.Dispatch<React.SetStateAction<Payment[]>>;notice:(s:string)=>void}){async function approve(a:Account,status:string){const d=await post({action:"approve",id:a.id,status});if(d?.account){setAccounts(x=>x.map(v=>v.id===a.id?d.account:v));notice(`Account ${status.toLowerCase()}.`)}}async function verify(p:Payment,status:string){const d=await post({action:"verify_payment",id:p.id,status});if(d?.payment){setPayments(x=>x.map(v=>v.id===p.id?d.payment:v));notice(`Payment marked ${status.toLowerCase()}.`)}}async function inspect(l:Listing){const accepted=prompt(`Accepted eggs from ${l.batchCode}`,String(l.crates*30));if(accepted===null)return;const rejected=l.crates*30-Math.max(0,+accepted);const condition=prompt("Condition summary","Clean, intact and correctly dated")||"Inspected";const d=await post({action:"inspect",listingId:l.id,acceptedEggs:+accepted,rejectedEggs:rejected,condition});if(d?.inspection)notice(`Inspection saved: ${d.inspection.status}.`)}return <section className="form-page wide">
<p className="eyebrow">OPERATIONS</p>
<h1>Control centre</h1>
<div className="stat-grid">
<div>
<Egg/>
<span>Available eggs</span>
<b>{listings.filter(l=>l.status==='Available').reduce((n,l)=>n+l.crates*30,0)}</b>
</div>
<div>
<UserCheck/>
<span>Pending accounts</span>
<b>{accounts.filter(a=>a.status==="Pending approval").length}</b>
</div>
<div>
<WalletCards/>
<span>Payments to verify</span>
<b>{payments.filter(p=>p.status==="Awaiting verification").length}</b>
</div>
<div>
<Truck/>
<span>Orders</span>
<b>{orders.length}</b>
</div>
</div>
<div className="admin-grid">
<section className="admin-card">
<h2>
<UserCheck/> Account approvals</h2>{!accounts.length?<p className="muted">No applications yet.</p>:accounts.map(a=>
<div className="admin-row" key={a.id}>
<div>
<b>{a.fullName}</b>
<span>{a.role} · {a.district} · {a.status}</span>
</div>{a.status==="Pending approval"&&<aside>
<button onClick={()=>approve(a,"Approved")}>Approve</button>
<button className="reject" onClick={()=>approve(a,"Rejected")}>Reject</button>
</aside>}</div>)}</section>
<section className="admin-card">
<h2>
<WalletCards/> EcoCash verification</h2>{!payments.length?<p className="muted">No submitted payments.</p>:payments.map(p=>
<div className="admin-row" key={p.id}>
<div>
<b>{p.reference}</b>
<span>{money(p.amountCents/100)} · {p.status}</span>
</div>{p.status==="Awaiting verification"&&<aside>
<button onClick={()=>verify(p,"Verified")}>Verify</button>
<button className="reject" onClick={()=>verify(p,"Rejected")}>Reject</button>
</aside>}</div>)}</section>
</div>
<div className="ops-table">
<h2>
<ClipboardCheck/> Receiving and inspection</h2>{listings.map(l=>
<div key={l.id}>
<i className={age(l.oldestEgg)>=6?'dot warning':'dot'}/>
<b>{l.batchCode}</b>
<span>{l.breed}</span>
<span>{l.crates} crates</span>
<button className="table-action" onClick={()=>inspect(l)}>Inspect</button>
</div>)}</div>
</section>}
