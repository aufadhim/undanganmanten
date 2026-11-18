// Only this internal route may override the normal post-login destination.
export function plannerInviteContext(search) {
 const token=new URLSearchParams(search).get('plannerInvite');
 return /^[a-f0-9]{64}$/.test(token||'') ? {returnPath:'/planner/invite/'+token,query:'?plannerInvite='+token} : {returnPath:'',query:''};
}
