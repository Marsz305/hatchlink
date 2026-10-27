import {chatGPTSignOutPath,requireChatGPTUser} from "../chatgpt-auth";
import {getAdminAccess} from "../../lib/admin-auth";
import AdminConsole from "./admin-console";
export const dynamic="force-dynamic";
export default async function AdminPage(){const user=await requireChatGPTUser("/admin");const access=await getAdminAccess(user.email);if(!access.allowed)return <main className="access-page"><section><p className="eyebrow">RESTRICTED AREA</p><h1>Administrator access denied</h1><p><b>{user.email}</b> is signed in, but is not on the HatchLink administrator allowlist.</p><a href={chatGPTSignOutPath("/admin")} target="_top">Sign in with another account</a><a href="/">Return to marketplace</a></section></main>;return <AdminConsole user={{name:user.displayName,email:user.email,role:access.role,primary:access.primary}}/>}
