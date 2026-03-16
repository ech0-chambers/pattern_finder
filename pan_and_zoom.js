
class Controls {
    constructor(canvas, p) {
        this.canvas = canvas;
        this.p = p;
        this.controls = {
            view: { x: 0, y: 0, zoom: 1 },
            viewPos: { prevX: null, prevY: null, isDragging: false },
        }

        this.canvas.mouseWheel((e) => {
            this.zoom(this.controls).worldZoom(e, this.p.keyIsDown("ALT"), this.p.width, this.p.height);
        })

        addEventListener('mousedown', e => {
            if (p.prevent_mouse_events) {
                return;
            }
            if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {this.move(this.controls).mousePressed(e);}
        });
        addEventListener('mousemove', e => {
            if (p.prevent_mouse_events) {
                return;
            }
            this.move(this.controls).mouseDragged(e)
        });
        addEventListener('mouseup', e => {
            if (p.prevent_mouse_events) {
                return;
            }
            this.move(this.controls).mouseReleased(e)
        });
    }

    apply_pan_zoom(p) {
        this.p.scale(this.controls.view.zoom);
        this.p.translate(this.controls.view.x, this.controls.view.y);
    }
    
    undo_pan_zoom(p) {
        this.p.translate(-this.controls.view.x, -this.controls.view.y);
        this.p.scale(1 / this.controls.view.zoom);
    }

    screen_to_world(pos) {
        let outpos = pos.copy();
        outpos.div(this.controls.view.zoom);
        outpos.x -= this.controls.view.x;
        outpos.y -= this.controls.view.y;
        return outpos;
    }
    
    world_to_screen(pos) {
        // position on the image to physical pixel location on the canvas
        let outpos = pos.copy();
        outpos.x += this.controls.view.x;
        outpos.y += this.controls.view.y;
        outpos.mult(this.controls.view.zoom);
        return outpos;
    }

    get scale() {
        return this.controls.view.zoom;
    }

    move(controls) {
        function mousePressed(e) {
            controls.viewPos.isDragging = true;
            controls.viewPos.prevX = e.clientX;
            controls.viewPos.prevY = e.clientY;
        }

        function mouseDragged(e) {
            const { prevX, prevY, isDragging } = controls.viewPos;
            if (!isDragging) return;

            const pos = { x: e.clientX, y: e.clientY };
            const dx = pos.x - prevX;
            const dy = pos.y - prevY;

            if (prevX || prevY) {
                controls.view.x += dx / controls.view.zoom;
                controls.view.y += dy / controls.view.zoom;
                controls.viewPos.prevX = pos.x, controls.viewPos.prevY = pos.y
            }
        }

        function mouseReleased(e) {
            controls.viewPos.isDragging = false;
            controls.viewPos.prevX = null;
            controls.viewPos.prevY = null;
        }

        return {
            mousePressed,
            mouseDragged,
            mouseReleased
        }
    }

    zoom(controls) {
        // function calcPos(x, y, zoom) {
        //   const newX = width - (width * zoom - x);
        //   const newY = height - (height * zoom - y);
        //   return {x: newX, y: newY}
        // }

        function worldZoom(e, small, width, height) {
            const { x, y, deltaY } = e;
            const direction = deltaY > 0 ? -1 : 1;
            const factor = 0.25;
            const small_factor = 0.02;
            const zoom = 1 * direction * (small ? small_factor : factor);

            const wx = (x - controls.view.x) / (width * controls.view.zoom);
            const wy = (y - controls.view.y) / (height * controls.view.zoom);

            if (controls.view.zoom + zoom < 0.1) return;

            // controls.view.x -= wx * width * zoom;
            // controls.view.y -= wy * height * zoom;
            controls.view.zoom += zoom;
        }

        return { worldZoom }
    }
}
