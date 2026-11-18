export function grabScroll(element, scroller = element) {
    let gesture;
    let suppressClick = false;
    const track = element !== scroller;

    function start(event) {
        suppressClick = false;
        if (event.pointerType !== 'mouse' || event.button !== 0 || scroller.scrollWidth <= scroller.clientWidth) return;
        gesture = { id: event.pointerId, x: event.clientX, left: scroller.scrollLeft, moved: false };
        if (track) element.setPointerCapture(event.pointerId);
    }

    function move(event) {
        if (!gesture || gesture.id !== event.pointerId) return;
        if ((event.buttons & 1) === 0) { end(); return; }
        const delta = event.clientX - gesture.x;
        if (!gesture.moved && Math.abs(delta) < 5) return;
        if (!gesture.moved) {
            gesture.moved = true;
            element.setPointerCapture(event.pointerId);
            scroller.dataset.grabbing = '';
        }
        scroller.scrollLeft = gesture.left + delta * (track ? scroller.scrollWidth / element.clientWidth : -1);
    }

    function end() {
        suppressClick = !!gesture?.moved;
        gesture = undefined;
        delete scroller.dataset.grabbing;
    }

    function click(event) {
        if (!suppressClick || event.detail === 0) return;
        suppressClick = false;
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    const listeners = [
        ['pointerdown', start], ['pointermove', move], ['pointerup', end],
        ['pointercancel', end], ['lostpointercapture', end], ['click', click],
        ['dragstart', event => event.preventDefault()],
    ];
    element.dataset.grabScroll = '';
    for (const [name, handler] of listeners) element.addEventListener(name, handler, true);
    return () => {
        end();
        delete element.dataset.grabScroll;
        for (const [name, handler] of listeners) element.removeEventListener(name, handler, true);
    };
}
