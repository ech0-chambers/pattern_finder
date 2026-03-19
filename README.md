# Pattern Finder

*A simple tool for extracting machine knitting patterns from scanned or photographed images.*

You can access the tool [here](#). Please note that you will need a mouse or trackpad; it will not currently work with a touchscreen.

## Basic Usage

When you open the tool, you should first upload your pattern as an image by clicking the "Upload Image" button in the sidebar on the right hand side. If your pattern is a `pdf` file, you will need to convert it to an image first (for example, by taking a screenshot). Your image will appear in the panel on the left, while the extracted pattern will show on the right.

You will notice a grid overlay on the image. This is the area from which the tool will extract the pattern. Click and drag the corners of this grid to the corners of your pattern. In the sidebar, set the number of stitches and rows in your pattern. You may need to adjust the "threshold" value in the sidebar to reliably pick up the pattern; if the tool is missing stitches which are black on the source image, then try raising the threshold. If white stitches are being misidentified as black, try lowering the threshold. 

For large patterns, finding the total number of stitches or rows in the pattern might be quite tedious. Instead, you can manipulate the selected area to cover a small region of known dimensions (say, 20 stitches by 20 rows). Enter these dimensions as normal, then click "measure". This will record the size of the stitches and rows. Now manipulate the selected area to cover the entire pattern. You'll notice that the number of stitches and rows has been automatically filled in. However, this is only an estimate, and may need to be fine-tuned by one or two stitches.

Once you are happy with the pattern, change the filename and then click "Download" in the sidebar. This will save the pattern as an image suitable for AYAB, DAK, etc.

## Limitations

Currently, the tool can only handle patterns with two colours. I may revisit this in the future to allow for multi-coloured designs, but that would require significant changes to how the pattern is extracted.

As noted, touchscreen support is very limited and likely will not work at all. 

While the tool can handle skewed and rotated images well, it can only handle scans/photographs of flat pages. A photograph of a page in a book, unless it was held down flat, will likely cause the tool some issues. Similarly, a photograph with inconsistent lighting (e.g, a shadow across half the pattern) will likely not be handled well.

Large images (such as a screenshot from a 4k monitor) will be somewhat laggy. Consider cropping or reducing the quality before uploading.
