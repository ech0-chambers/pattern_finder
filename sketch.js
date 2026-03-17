/*
* TODO: 
*   - zoom and pan
*   - include the actual shader
*   - UI
*/

let info;

function create_slider(label, min = 0, max = 10, step = 1, parent = document, name = undefined, value = undefined, onchange = undefined) {
    name = name == undefined ? label : name;
    value = value == undefined ? (max + min) / 2 : value;
    let d = document.createElement("div");
    d.id = `${name}_container`;
    d.classList.add("slider-container");
    let l = document.createElement("span");
    l.classList.add("slider-label");
    l.innerText = label;
    l.style.gridColumn = "1";
    parent.appendChild(l);
    let s = document.createElement("input");
    s.type = "range";
    s.min = min;
    s.max = max;
    s.step = step;
    s.name = name;
    s.id = name;
    s.value = value;
    s.num_value = () => { return parseFloat(s.value); };
    s.style.gridColumn = "2";
    parent.appendChild(s);
    let v = document.createElement("span");
    v.classList.add("slider-value");
    v.innerText = s.value;
    v.style.gridColumn = "3";
    s.oninput = (e) => {
        if (onchange != undefined) {
            onchange(s.num_value());
        }
        v.innerText = s.value;
    };
    parent.appendChild(v);
    return s;
}

function create_num_input(label, min = 0, max = 10, step = 1, parent = document, name = undefined, value = undefined, onchange = undefined, default_value = 1) {
    name = name == undefined ? label : name;
    value = value == undefined ? (max + min) / 2 : value;
    let l = document.createElement("span");
    l.classList.add("num-input-label");
    l.innerText = label;
    l.style.gridColum = "1";
    parent.appendChild(l);
    let s = document.createElement("input");
    s.type = "number";
    s.min = min;
    s.max = max;
    s.step = step;
    s.name = name;
    s.id = name;
    s.value = value;
    s.num_value = () => { return s.value == "" ? default_value : parseFloat(s.value); };
    s.style.gridColumn = "2";
    parent.appendChild(s);
    s.oninput = (e) => {
        if (s.num_value() < s.min) {
            s.value = s.min;
        }
        if (s.num_value() > s.max) {
            s.value = s.max;
        }
        if (onchange != undefined) {
            onchange(s.num_value());
        }
    };
    d = document.createElement("div");
    d.classList.add("spacer");
    d.style.gridColumn = "3";
    parent.appendChild(d);
    return s;
}

function create_text_input(label, parent = document, name = undefined, value = undefined, onchange = undefined) {
    name = name == undefined ? label : name;
    value = value == undefined ? "" : value;
    let l = document.createElement("span");
    l.classList.add("text-input-label");
    l.innerText = label;
    l.style.gridColum = "1";
    parent.appendChild(l);
    let s = document.createElement("input");
    s.type = "text";
    s.value = value;
    s.style.gridColumn = "2";
    parent.appendChild(s);
    if (onchange != undefined) {
        s.oninput = onchange;
    }
    d = document.createElement("div");
    d.classList.add("spacer");
    d.style.gridColumn = "3";
    parent.appendChild(d);
    return s;
}

function create_button(label, parent = document, name = undefined, onclick = undefined) {
    name = name == undefined ? label : name;
    let b = document.createElement("button");
    b.innerText = label;
    b.style.gridColumn = "1 / span 3";
    parent.appendChild(b);
    if (onclick != undefined) {
        b.onclick = onclick;
    }
    return b;
}

function create_divider(parent) {
    let d = document.createElement("div");
    d.classList.add("divider");
    d.style.gridColumn = "1 / span 3";
    parent.appendChild(d);
    return d;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function intersection(A2, A1, B1, B2) {
    // A1: p5.Vector ...
    // intersection between lines A1 -> A2 and B1 -> B2.
    // if parallel, returns undefined
    let dxA = A1.x - A2.x;
    let dyA = A1.y - A2.y;
    let dxB = B1.x - B2.x;
    let dyB = B1.y - B2.y;
    let D = dxA * dyB - dxB * dyA;
    if (Math.abs(D) < 1e-9) {
        return undefined;
    }
    let CA = A1.x * A2.y - A2.x * A1.y;
    let CB = B1.x * B2.y - B2.x * B1.y;
    return new p5.Vector(
        (CA * dxB - dxA * CB) / D,
        (CA * dyB - dyA * CB) / D
    );
}

class Corner {
    constructor(pos, p, draw_colour = colours.foreground.base, highlight_colour = colours.yellow.base) {
        this.pos = pos;
        this.draw_colour = draw_colour;
        this.highlight_colour = highlight_colour;
        this.draw_length = 10;
        this.p = p;
        this.dragging = false;
        this.hovered = false;
        this.offset = p.createVector(0, 0);
    }

    draw(A, B, highlight) {
        if (highlight) {
        }
        if (highlight || this.dragging) {
            this.p.stroke(this.highlight_colour);
            this.p.strokeWeight(6);
        } else {
            this.p.stroke(this.draw_colour);
            this.p.strokeWeight(4);
        }
        let corner_pos = this.pos.copy();
        corner_pos.add(this.offset)
        let t = A.pos.copy();
        t.sub(this.pos);
        t.setMag(this.draw_length);
        t.add(this.pos);
        this.p.line(this.pos.x, this.pos.y, t.x, t.y);
        t = B.pos.copy();
        t.sub(this.pos);
        t.setMag(this.draw_length);
        t.add(this.pos);
        this.p.line(this.pos.x, this.pos.y, t.x, t.y);
    }

    pressed() {
        if (this.hovered) {
            this.dragging = true;
        }
    }

    dragged(event) {
        if (this.dragging) {
            let dragging_scale;
            if (this.p.keyIsDown(this.p.SHIFT)) {
                dragging_scale = 0.25;
            } else {
                dragging_scale = 1;
            }
            this.pos.x += event.movementX * dragging_scale / pan_zoom.scale;
            this.pos.y += event.movementY * dragging_scale / pan_zoom.scale;
        }
    }

    released() {
        this.dragging = false;
    }

    dist_sq(pos) {
        return p5.Vector.sub(this.pos, pos).magSq();
    }
}

class Quad {
    constructor(bottom_left, bottom_right, top_right, top_left, p, draw_color = colours.red.base, highlight_color = colours.yellow.base, fill_color = colours.background.base, fill_opacity = 0.5) {
        this.bottom_left = new Corner(bottom_left, p, draw_color = draw_color, highlight_color = highlight_color);
        this.bottom_right = new Corner(bottom_right, p, draw_color = draw_color, highlight_color = highlight_color);
        this.top_right = new Corner(top_right, p, draw_color = draw_color, highlight_color = highlight_color);
        this.top_left = new Corner(top_left, p, draw_color = draw_color, highlight_color = highlight_color);
        this.p = p;
        this.draw_color = draw_color;
        this.highlight_color = highlight_color;
        this.fill_color = hexToRgb(fill_color);
        this.fill_opacity = fill_opacity;
        this.corners = [this.bottom_left, this.bottom_right, this.top_right, this.top_left];
    }

    closest_corner(pos) {
        let closest;
        let d = 1e9;
        this.corners.forEach(
            (c) => {
                let d2 = c.dist_sq(pos);
                if (d2 < d) {
                    closest = c;
                    d = d2;
                }
            }
        );
        return {
            corner: closest,
            dist: Math.sqrt(d)
        };
    }

    draw(ticks_x, ticks_y) {
        let mousePos = this.p.createVector(this.p.mouseX - this.p.width / 2, this.p.mouseY - this.p.height / 2);
        mousePos = pan_zoom.screen_to_world(mousePos);
        let closest = this.closest_corner(mousePos);
        let any_hovered = false;
        this.corners.forEach((c) => {
            if (closest.corner == c && closest.dist < (20 / pan_zoom.scale)) {
                c.hovered = true
                any_hovered = true;
            } else {
                c.hovered = false
                if (c.dragging) {
                    any_hovered = true;
                }
            }
        });

        this.p.prevent_mouse_events = any_hovered; // prevent panning the canvas if we're instead grabbing a corner
        this.p.stroke(this.draw_color);
        this.p.strokeWeight(2);
        this.p.fill(this.fill_color.r, this.fill_color.g, this.fill_color.b, this.fill_opacity * 255);
        this.p.beginShape();
        this.p.vertex(this.bottom_left.pos.x, this.bottom_left.pos.y);
        this.p.vertex(this.bottom_right.pos.x, this.bottom_right.pos.y);
        this.p.vertex(this.top_right.pos.x, this.top_right.pos.y);
        this.p.vertex(this.top_left.pos.x, this.top_left.pos.y);
        this.p.endShape(this.p.CLOSE);
        this.bottom_left.draw(this.bottom_right, this.top_left, closest.corner == this.bottom_left && closest.dist < 20 / pan_zoom.scale);
        this.bottom_right.draw(this.bottom_left, this.top_right, closest.corner == this.bottom_right && closest.dist < 20 / pan_zoom.scale);
        this.top_right.draw(this.top_left, this.bottom_right, closest.corner == this.top_right && closest.dist < 20 / pan_zoom.scale);
        this.top_left.draw(this.top_right, this.bottom_left, closest.corner == this.top_left && closest.dist < 20 / pan_zoom.scale);
        this.p.stroke(this.draw_color);
        this.p.strokeWeight(2);
        for (let i = 1; i < ticks_x; i++) {
            let top = this.top_left.pos.copy();
            top.lerp(this.top_right.pos, i / ticks_x);
            let bottom = this.bottom_left.pos.copy();
            bottom.lerp(this.bottom_right.pos, i / ticks_x);
            this.p.line(top.x, top.y, bottom.x, bottom.y);
        }
        for (let i = 1; i < ticks_y; i++) {
            let left = this.top_left.pos.copy();
            left.lerp(this.bottom_left.pos, i / ticks_y);
            let right = this.top_right.pos.copy();
            right.lerp(this.bottom_right.pos, i / ticks_y);
            this.p.line(left.x, left.y, right.x, right.y);
        }

        let i = intersection(this.bottom_left.pos, this.bottom_right.pos, this.top_left.pos, this.top_right.pos);
        if (i != undefined) {
            this.p.line(this.bottom_right.pos.x, this.bottom_right.pos.y, i.x, i.y);
            this.p.line(this.top_right.pos.x, this.top_right.pos.y, i.x, i.y);
        }
    }

    pressed() {
        this.corners.forEach((c) => { c.pressed(); });
    }

    released() {
        this.corners.forEach((c) => { c.released(); });
    }

    dragged(event) {
        this.corners.forEach((c) => { c.dragged(event); });
    }
}


let NUM_STITCHES = 24; // placeholders
let NUM_ROWS = 56;
let IMG_THRESHOLD = 0.5;
let PREVIEW_SCALE = 3;

let q;
let input_canvas_container = document.getElementById("source-panel");
let pan_zoom;
let settings_container = document.getElementById("controls");
let settings;
let measure = {
    dx: undefined,
    dy: undefined
}; // for "measuring" in one area and extrapolating number of rows/stitches. This will not be accurate for quads that are very non-rectangular
// dx -> stitch size along the axis bl -> br and tl -> tr (average)
// dy -> row size along the axis bl -> tl and br -> tr (average)
let img;
let img_display_size;
let has_changed = true; // this will be false unless something has been modified in the latest loop. Only draws the shader (output) if something has changed.


function get_content_rect(element) {
    let bbox = element.getBoundingClientRect();
    let computed_style = window.getComputedStyle(element);
    let dimensions = {
        width: bbox.width,
        height: bbox.height
    };
    dimensions.width  -= parseFloat(computed_style.borderLeftWidth)   + parseFloat(computed_style.marginLeft)   + parseFloat(computed_style.paddingLeft) 
                       + parseFloat(computed_style.borderRightWidth)  + parseFloat(computed_style.marginRight)  + parseFloat(computed_style.paddingRight);
    dimensions.height -= parseFloat(computed_style.borderTopWidth)    + parseFloat(computed_style.marginTop)    + parseFloat(computed_style.paddingTop) 
                       + parseFloat(computed_style.borderBottomWidth) + parseFloat(computed_style.marginBottom) + parseFloat(computed_style.paddingBottom);
    return dimensions;
}

function resize_preview_canvas(){
    let cnv = preview_canvas_container.children[0];
    let bbox = get_content_rect(preview_canvas_container);
    let s = bbox.width / NUM_STITCHES;
    s = bbox.height / NUM_ROWS < s ? bbox.height / NUM_ROWS : s;
    cnv.style.transform = `scale(${s}) translate(${(s - 1) / (2 * s) * 100}%, ${(s - 1) / (2 * s) * 100}%)`;
}

let last_corners = [0, 0, 0, 0];
let last_num_stitches;
let last_num_rows;
let last_threshold;

function input_sketch(p) {
    settings = {
        // upload_button: create_button("Upload Image", settings_container)
        upload_button: p.createFileInput((file) => {
            if (file.type == "image") {
                img = p.createImg(file.data, '');
                img.hide();                
            } else {
                img = null;
            }
        })
    };
    settings.upload_button.parent(settings_container);
    settings.upload_button.elt.style.gridColumn = "1 / span 3";
    create_divider(settings_container);
    settings.filename = create_text_input("Filename", settings_container, "filename", "untitled.png");
    settings.download_button = create_button("Download Pattern", settings_container);
    create_divider(settings_container);
    settings.num_stitches = create_num_input("Stitches", 1, 300, 1, settings_container, "stitches", NUM_STITCHES, (v) => {
        NUM_STITCHES = v;
        measure = {dx: undefined, dy: undefined};
        resize_preview_canvas();
    });
    settings.num_rows = create_num_input("Rows", 1, 1000, 1, settings_container, "rows", NUM_ROWS, (v) => {
        NUM_ROWS = v;
        measure = {dx: undefined, dy: undefined};
        resize_preview_canvas();
    });
    settings.measure_button = create_button("Measure", settings_container)
    settings.threshold = create_slider("Threshold", 0, 1, 0.01, settings_container, "threshold", IMG_THRESHOLD, (v) => {
        IMG_THRESHOLD = v;
    });
    // settings.preview_scale = create_slider("Preview Scale", 1, 15, 0.1, settings_container, "preview-scale", 3, (v) => {
    //     PREVIEW_SCALE = v;
    // });
    //
    p.setup = async function () {
        let bbox = get_content_rect(input_canvas_container);
        input_canvas = p.createCanvas(bbox.width, bbox.height, p.WEBGL);
        pan_zoom = new Controls(input_canvas, p);
        input_canvas.parent(input_canvas_container);
        img = await p.loadImage('pattern.png');
        let img_scale = p.width / img.width;
        img_scale = p.height / img.height < img_scale ? p.height / img.height : img_scale;
        img_display_size = {
            width: img.width * img_scale,
            height: img.height * img_scale
        }
        p.noStroke();
        bottom_left = p.createVector(-137.5, 100);
        top_right = p.createVector(126, -97.5);
        bottom_right = p.createVector(top_right.x, bottom_left.y);
        top_left = p.createVector(bottom_left.x, top_right.y);
        p.rectMode(p.CORNERS);
        q = new Quad(p.createVector(-150, 100), p.createVector(130, 90), p.createVector(100, -150), p.createVector(-120, -140), p);
        info = document.getElementById("info");
        settings.measure_button.onclick = () => {
            measure.dx = (q.top_right.pos.dist(q.top_left.pos) + q.bottom_right.pos.dist(q.bottom_left.pos)) / 2 / NUM_STITCHES;
            measure.dy = (q.top_right.pos.dist(q.bottom_right.pos) + q.top_left.pos.dist(q.bottom_left.pos)) / 2 / NUM_ROWS;
        };
    }
    p.draw = function () {
        if (img) {
            p.background(colours.background[4]);
            pan_zoom.apply_pan_zoom(p);
            p.imageMode(p.CENTER);
            p.image(img, 0, 0, img_display_size.width, img_display_size.height);
            q.draw(NUM_STITCHES, NUM_ROWS);
            pan_zoom.undo_pan_zoom(p);
            // definitely a better way to do this, but it works.
            has_changed = !(
                   last_corners[0].x == q.bottom_left.pos.x
                && last_corners[0].y == q.bottom_left.pos.y
                && last_corners[1].x == q.bottom_right.pos.x
                && last_corners[1].y == q.bottom_right.pos.y
                && last_corners[2].x == q.top_right.pos.x
                && last_corners[2].y == q.top_right.pos.y
                && last_corners[3].x == q.top_left.pos.x
                && last_corners[3].y == q.top_left.pos.y
                && last_num_rows == NUM_ROWS
                && last_num_stitches == NUM_STITCHES
                && last_threshold == IMG_THRESHOLD
            );
            last_corners[0] = q.bottom_left.pos.copy();
            last_corners[1] = q.bottom_right.pos.copy();
            last_corners[2] = q.top_right.pos.copy();
            last_corners[3] = q.top_left.pos.copy();
            last_num_rows = NUM_ROWS;
            last_num_stitches = NUM_STITCHES;
            last_threshold = IMG_THRESHOLD;
        } else {
            p.background(colours.background[4]);
        }
        // p.noLoop();
    }
    p.mousePressed = function () {
        q.pressed();
    }
    p.mouseReleased = function () {
        q.released();
        if (measure.dx != undefined && measure.dy != undefined) {
            let s = (q.top_right.pos.dist(q.top_left.pos) + q.bottom_right.pos.dist(q.bottom_left.pos)) / 2 / measure.dx;
            s = Math.round(s);
            settings.num_stitches.value = s;
            NUM_STITCHES = s;
            let r = (q.top_right.pos.dist(q.bottom_right.pos) + q.top_left.pos.dist(q.bottom_left.pos)) / 2 / measure.dy;
            r = Math.round(r);
            settings.num_rows.value = r;
            NUM_ROWS = r;
            resize_preview_canvas();
        }
    }
    p.mouseDragged = function (event) {
        q.dragged(event);
    }
    p.prevent_mouse_events = false;
}

new p5(input_sketch);


// Preview canvas and pattern extraction
let preview_canvas_container = document.getElementById("preview-panel");
let preview_canvas;
function preview_sketch(p) {
    p.setup = async function () {
        p.pixelDensity(1);
        preview_canvas = p.createCanvas(NUM_STITCHES, NUM_ROWS, p.WEBGL);
        preview_canvas.parent(preview_canvas_container);
        imgShader = await p.loadShader('shader.vert', 'shader.frag');
        p.noStroke();
        settings.download_button.onclick = () => {
            let filename = settings.filename.value;
            if (!filename.endsWith(".png")) {
                filename = filename + ".png";
            }
            p.saveCanvas(filename);
        }
        resize_preview_canvas();
    };
    p.draw = function () {
        if (has_changed && p && img) { // guard since occasionally these won't be loaded by the time this starts.
            p.pixelDensity(1); // have to set this again in chrome for some reason. Really messes with stuff if it's wrong.#
            p.resizeCanvas(NUM_STITCHES, NUM_ROWS);
            p.background(colours.red[5]);
            p.imageMode(p.CENTER);
            p.imageShader(imgShader);
            imgShader.setUniform('uNumCells', [NUM_STITCHES, NUM_ROWS]);
            imgShader.setUniform('uThreshold', IMG_THRESHOLD);
            imgShader.setUniform('uBottomLeft', [q.bottom_left.pos.x / img_display_size.width + 0.5, q.bottom_left.pos.y / img_display_size.height + 0.5]);
            imgShader.setUniform('uTopRight', [q.top_right.pos.x / img_display_size.width + 0.5, q.top_right.pos.y / img_display_size.height + 0.5]);
            imgShader.setUniform('uBottomRight', [q.bottom_right.pos.x / img_display_size.width + 0.5, q.bottom_right.pos.y / img_display_size.height + 0.5]);
            imgShader.setUniform('uTopLeft', [q.top_left.pos.x / img_display_size.width + 0.5, q.top_left.pos.y / img_display_size.height + 0.5]);
            imgShader.setUniform('uTexture', img);
            p.image(img, 0, 0, p.width, p.height);
            has_changed = false;
        }
        // p.noLoop();
    }
}

new p5(preview_sketch);
