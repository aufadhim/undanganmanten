import {prisma} from '../lib/prisma.js';
export async function isPublicBlocked(inv){if(!inv)return true;if(inv.suspendedAt)return true;const owner=await prisma.user.findUnique({where:{id:inv.userId},select:{suspendedAt:true}});return !owner||!!owner.suspendedAt;}
export async function themeHidden(id){return !!(await prisma.templateAvailability.findUnique({where:{id}}))?.hidden;}
