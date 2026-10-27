import {eq} from "drizzle-orm";
import {getDb} from "../db";
import {adminUsers} from "../db/schema";

export const PRIMARY_ADMIN_EMAIL="jimgoto@gmail.com";
export const MAX_ACTIVE_ADMINS=3;

export async function getAdminAccess(email:string){
  const normalized=email.trim().toLowerCase();
  if(normalized===PRIMARY_ADMIN_EMAIL)return {allowed:true,role:"Primary Administrator",primary:true};
  const db=getDb();
  const [record]=await db.select().from(adminUsers).where(eq(adminUsers.email,normalized));
  return {allowed:Boolean(record?.active),role:record?.role??"Administrator",primary:false};
}
