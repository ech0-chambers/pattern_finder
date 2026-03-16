precision highp float;

uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform vec2 uNumCells;
uniform float uThreshold;
uniform vec2 uBottomLeft;
uniform vec2 uBottomRight;
uniform vec2 uTopRight;
uniform vec2 uTopLeft;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec2 pattern_coord_to_image_coord(vec2 p, vec2 bottom_left, vec2 bottom_right, vec2 top_right, vec2 top_left) {
    vec2 bottom = mix(bottom_left, bottom_right, p.x);
    vec2 top = mix(top_left, top_right, p.x);
    return mix(bottom, top, p.y);
}

void main() {
// Offset the input coordinate
    // 50x50 grid of samples within the pattern pixel
    const int num_samples = 50;
    // skip the first and last 3 in each direction, to allow for untidy edges or gridlines
    const int skip = 3;
    // bottom left of the pixel in the preview pattern
    vec2 pBottomLeft = vTexCoord;
    pBottomLeft.x -= 0.5 / uNumCells.x;
    pBottomLeft.y -= 0.5 / uNumCells.y;
    // top right of the same
    vec2 pTopRight = vTexCoord;
    pTopRight.x += 0.5 / uNumCells.x;
    pTopRight.y += 0.5 / uNumCells.y;

    gl_FragColor = vec4(0, 0, 0, 1);
    // we are sampling many points within this "pixel", constructing the position in the space of the pattern preview first, then converting to the position in the image space to actually take the sample.
    vec2 pos = pBottomLeft;
    for(int xi = skip; xi < num_samples - skip; xi++) {
        pos.y = pBottomLeft.y;
        pos.x += (pTopRight.x - pBottomLeft.x) / float(num_samples);
        for(int yi = skip; yi < num_samples - skip; yi++) {
            pos.y += (pTopRight.y - pBottomLeft.y) / float(num_samples);
            // now map to the position in the image.
            vec2 img_pos = pattern_coord_to_image_coord(pos, uTopLeft, uTopRight, uBottomRight, uBottomLeft);
            gl_FragColor += texture2D(uTexture, img_pos);
        }
    }
    // average the colour to greyscale
    gl_FragColor /= float((num_samples - 2 * skip) * (num_samples - 2 * skip));
    float avg = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;
    // threshold
    float b = mix(0.0, 1.0, step(uThreshold, avg));
    gl_FragColor = vec4(vec3(b), 1.0);
}
