/**
 * Grid snaps uniform random points to a grid.
 */
class Grid {
  async render(canvas, ctx, rng, config, svg) {
    let points = [];
    while (points.length < config.layout.number) {
      var inside = await rng.float() < config.layout.prob;
      let x;
      let y;
      while (true) {
        x = await rng.float() * 2.0 - 1.0;
        x = ((x * (1/config.layout.spacing_x))|0)*config.layout.spacing_x
        y = await rng.float() * 2.0 - 1.0;
        y = ((y * (1/config.layout.spacing_y))|0)*config.layout.spacing_y;

        let px = ((x + 1.0) / 2.0 * canvas.width)|0;
        let py = ((y + 1.0) / 2.0 * canvas.height)|0;
        let pixels = ctx.getImageData(px, py, 1, 1).data;
        var is_inside = (pixels[0] < 128) && (pixels[1] < 128) && (pixels[2] < 128);
        if (inside == is_inside) {
          break;
        }
      }

      var dot = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", y);
      dot.setAttribute("r", config.size);
      svg.append(dot);
      points.push({x: x, y: y});
    }
  }
}
