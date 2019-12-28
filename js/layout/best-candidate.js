/**
 * BestCandidate is slower than Poisson-disc (when implemented right) and looks less nice.
 * I wrote it because the PoissonDisc is currently not optimized.
 */
class BestCandidate {
  async render(canvas, ctx, rng, config, svg) {
    let points = [];
    while (points.length < config.layout.number) {
      let best = {
        x: null,
        y: null,
        dist: 0,
        seen: 0
      };
      // pick whether we want to be inside or outside
      var inside = await rng.float() < config.layout.prob;
      while (best.seen < config.layout.candidates) {
        let x = await rng.float() * 2.0 - 1.0;
        let y = await rng.float() * 2.0 - 1.0;
        let px = ((x + 1.0) / 2.0 * canvas.width)|0;
        let py = ((y + 1.0) / 2.0 * canvas.height)|0;
        let pixels = ctx.getImageData(px, py, 1, 1).data;
        var is_inside = (pixels[0] < 128) && (pixels[1] < 128) && (pixels[2] < 128);
        if (inside != is_inside) {
          continue;
        }

        // find distance to closest point
        let closest = 3;
        for (let i=0; i<points.length; i++) {
          let point = points[i];
          let t = dist(point, {x: x, y:y});
          if (t < closest) {
            closest = t;
            if (closest < best.dist) {
              break;
            }
          }
        }

        // keep point which is further from all others
        if (closest >= best.dist) {
          best.x = x;
          best.y = y;
          best.dist = closest;
        }
        best.seen = best.seen + 1;
      }

      var dot = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
      dot.setAttribute("cx", best.x);
      dot.setAttribute("cy", best.y);
      dot.setAttribute("r", config.size);
      svg.append(dot);
      points.push({x: best.x, y: best.y});
    }
  }
}
