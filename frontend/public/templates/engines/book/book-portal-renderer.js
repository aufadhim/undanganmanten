/** Three textured planes, one perspective camera; geometry never scales per axis. */
export class BookPortalRenderer{
 constructor(parent){
  this.canvas=document.createElement('canvas');this.canvas.className='book-portal-webgl';this.canvas.hidden=true;parent.append(this.canvas);
  const gl=this.gl=this.canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'high-performance'});if(!gl){this.canvas.remove();return}
  this.textures=new Map();const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
  const program=this.program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec2 a_position;attribute vec2 a_uv;uniform vec2 u_view;uniform vec3 u_camera;uniform vec4 u_rect;uniform float u_depth;varying vec2 v_uv;void main(){vec2 world=u_rect.xy+a_position*u_rect.zw;float z=max(1.,u_camera.z-u_depth);gl_Position=vec4((world-u_camera.xy)*vec2(2000./u_view.x,-2000./u_view.y),0.,z);v_uv=a_uv;}`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D u_image;uniform vec2 u_crop;uniform float u_alpha;varying vec2 v_uv;void main(){vec2 uv=(v_uv-.5)*u_crop+.5;if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.)discard;vec4 c=texture2D(u_image,uv);float edge=smoothstep(0.,.004,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));gl_FragColor=vec4(c.rgb,c.a*u_alpha*edge);}`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);const vertices=new Float32Array([0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,1,1,0,1,0,1,1,1,1]);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
  for(const [name,offset]of [['a_position',0],['a_uv',8]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,16,offset)}
  this.u=Object.fromEntries(['view','camera','rect','depth','crop','alpha'].map(k=>[k,gl.getUniformLocation(program,'u_'+k)]));gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);this.parent=parent;
  this.canvas.addEventListener('webglcontextlost',()=>{this.lost=true;this.hide()});
 }
 async prepare({background,binding,picture,bookRect,pageRect,inscription,width,height}){
  if(!this.gl||this.lost)return false;
  const gl=this.gl;this.width=width;this.height=height;const dpr=Math.min(devicePixelRatio||1,1.35);this.canvas.width=Math.round(width*dpr);this.canvas.height=Math.round(height*dpr);gl.viewport(0,0,this.canvas.width,this.canvas.height);
  const load=async src=>{if(this.textures.has(src))return this.textures.get(src);const image=new Image();image.src=src;await image.decode();const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);const result={texture,width:image.naturalWidth,height:image.naturalHeight};if(!src.startsWith('data:'))this.textures.set(src,result);return result};
  // The page changes on each crossing; release its previous snapshot texture.
  if(this.pageTexture)gl.deleteTexture(this.pageTexture.texture);
  [this.background,this.binding,this.pageTexture]=await Promise.all([load(background),load(binding),load(picture)]);this.bookRect=bookRect;this.pageRect=pageRect;
  if(this.inscriptionTexture)gl.deleteTexture(this.inscriptionTexture.texture);
  const rect=inscription.getBoundingClientRect(),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(rect.width*2));canvas.height=Math.max(1,Math.ceil(rect.height*2));const ctx=canvas.getContext('2d');ctx.scale(2,2);ctx.textAlign='center';ctx.textBaseline='top';
  for(const child of inscription.children){const style=getComputedStyle(child),r=child.getBoundingClientRect(),fontSize=parseFloat(style.fontSize),lineHeight=parseFloat(style.lineHeight)||fontSize*1.2;ctx.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;ctx.fillStyle=style.color;let line='',y=r.top-rect.top;for(const word of child.textContent.split(' ')){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>rect.width){ctx.fillText(line,rect.width/2,y);y+=lineHeight;line=word}else line=next}ctx.fillText(line,rect.width/2,y)}
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);this.inscriptionTexture={texture};this.inscriptionRect=rect;return true;
 }
 draw(frame,progress){
  if(!this.gl||this.lost)return;const gl=this.gl,u=this.u;gl.useProgram(this.program);gl.clearColor(.91,.88,.82,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(u.view,this.width,this.height);gl.uniform3f(u.camera,frame.x,frame.y,frame.z);
  const plane=(asset,rect,depth,crop=[1,1],alpha=1)=>{gl.bindTexture(gl.TEXTURE_2D,asset.texture);gl.uniform4f(u.rect,rect.left-this.width/2,rect.top-this.height/2,rect.width,rect.height);gl.uniform1f(u.depth,depth);gl.uniform2f(u.crop,...crop);gl.uniform1f(u.alpha,alpha);gl.drawArrays(gl.TRIANGLES,0,6)};
  const imageAspect=this.background.width/this.background.height,viewAspect=this.width/this.height;const crop=[Math.min(1,viewAspect/imageAspect),Math.min(1,imageAspect/viewAspect)];
  // Background is behind the book; compensate its initial framing, then let it parallax.
  plane(this.background,{left:-this.width*.06,top:-this.height*.06,width:this.width*1.12,height:this.height*1.12},-120,crop);
  plane(this.binding,this.bookRect,0);plane(this.inscriptionTexture,this.inscriptionRect,.01,[1,1],Math.max(0,1-progress/.3));plane(this.pageTexture,this.pageRect,.01,[frame.uvX,frame.uvY]);
  this.parent.classList.add('portal-webgl-active');this.canvas.hidden=false;this.canvas.dataset.progress=progress.toFixed(3);
 }
 hide(){this.parent?.classList.remove('portal-webgl-active');this.canvas.hidden=true}
}
