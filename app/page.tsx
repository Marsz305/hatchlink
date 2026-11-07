import HatchLinkApp from "./hatchlink-app";
import {chatGPTSignInPath,getChatGPTUser} from "./chatgpt-auth";
export const dynamic="force-dynamic";
export default async function Home(){const user=await getChatGPTUser();return <HatchLinkApp user={user?{name:user.displayName,email:user.email}:null} signInPath={chatGPTSignInPath("/")}/>;}
