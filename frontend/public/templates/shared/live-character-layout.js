import {syncContactShadow} from './character-grounding.js';
/** Update existing GPU planes; do not reload images, recreate canvases or replay the opening. */
export function updateCharacterPlane(scene,side,next,previous={}){
 const pair=scene?.nodes?.find(n=>['couple','stage-pair'].includes(n.layer.id));if(!pair)return;
 const layer=pair.layer,width=next[side+'Width'];if(!Number.isFinite(width)||width<=0)return;
 const offset=Number.isFinite(previous[side+'Y'])?layer.y-previous[side+'Y']:0;
 layer.footY=next[side+'FootY']??layer.footY??1;layer.width=width;layer.height=width*pair.img.naturalHeight/pair.img.naturalWidth;
 layer.x=next[side+'X'];layer.y=next[side+'Y']+(side==='cover'?offset:0);
 const floor=layer.y+layer.height*((layer.footY??1)-.5);
 for(const node of scene.nodes){const l=node.layer;if(l.id==='contact-shadow'){syncContactShadow(pair,node)}else if(layer.id==='stage-pair'&&(l.ground||l.anchor==='bottom'))l.y=floor-(l.id.includes('shadow')?.3:0)}
}
export function updateCharacterLayout(host,next,previous){
 if(!host.InvitationStage?.outside)updateCharacterPlane(host.coverScene,'cover',next,previous);
 updateCharacterPlane(host.heroScene,'hero',next,previous);
 host.refreshClosingCharacter?.();
}
