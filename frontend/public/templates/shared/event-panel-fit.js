/** Keep the complete ceremony panel inside the viewport, including map links. */
export function eventPanelScale(height, width, viewportHeight, viewportWidth) {
 const availableHeight = Math.max(1, viewportHeight - 164);
 return Math.min(1, availableHeight / Math.max(1, height), Math.max(1, viewportWidth - 36) / Math.max(1, width));
}
const installed = new WeakSet();
export function fitEventPanel(container) {
 const panel = container?.closest('.paper.scene-panel');
 if (!panel || installed.has(panel)) return;
 installed.add(panel);
 const doc = panel.ownerDocument;
 if (!doc.getElementById('shared-save-date-css') && !doc.querySelector('link[href*="/shared/save-the-date.css"]')) {
  const link = doc.createElement('link');
  link.id = 'shared-save-date-css';
  link.rel = 'stylesheet';
  link.href = '/templates/shared/save-the-date.css';
  link.addEventListener('load', () => schedule());
  doc.head.append(link);
 }
 const win = panel.ownerDocument.defaultView;
 let pending = 0;
 const schedule = () => {
  if (pending) return;
  pending = win.requestAnimationFrame(() => {
   pending = 0;
   const scale = eventPanelScale(Math.max(panel.offsetHeight, panel.scrollHeight), panel.offsetWidth, win.innerHeight, win.innerWidth);
   const value = String(scale);
   if (panel.style.getPropertyValue('--event-panel-fit') !== value) {
    panel.style.setProperty('--event-panel-fit', value);
    // Reading surfaces measure transformed bounds after layout settles.
    win.dispatchEvent(new win.Event('resize'));
   }
  });
 };
 new win.ResizeObserver(schedule).observe(panel);
 new win.MutationObserver(schedule).observe(panel, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['style','class','hidden']});
 win.addEventListener('resize', schedule);
 panel.ownerDocument.fonts?.ready.then(schedule);
 panel.ownerDocument.fonts?.addEventListener('loadingdone', schedule);
 schedule();
}
