/**
 * Generative Art
 *
 * Just experimenting with various generative art algorithms. Hope you Enjoy.
 *
 * Settings are stored in json files. Feel free to play with them!
 * `cat foo.json | jq` is useful to ensure your json is well formed.
 *
 * Contributing:
 * I'll happily accept pull requests, as long as they follow these constraints:
 * 1. Output must be XY plotter friendly (such as AxiDraw).
 *    This implies creating SVGs and being careful about a few things, such as color use (everything is monochrome for
 *    now), keeping line widths small, thinking about where the pen is going to be raised and lowered, etc.
 * 2. Algorithms must interact with the components. These are base images which influence the final image.
 */
class GenArt {
  constructor() {
    this.configs = [];
    this.current = document.location.hash.substr(1)|0;
    $(next).click(_ => {
      this.current = (this.current + 1) % this.configs.length;
      this.render();
      return false;
    });
    $(prev).click(_ => {
      this.current = (this.current + this.configs.length - 1) % this.configs.length;
      this.render();
      return false;
    });

    document.body.onload = _ => {
      getJSON("configs/all.json", configs => {
        for (let i=0; i<configs.length; i++) {
          getJSON(configs[i], config => {
            this.setConfig(i, config);
          });
        }
      });
    }
  }

  setConfig(index, config) {
    this.configs[index] = config;
    if (index == this.current) {
      this.render()
    }
  }

  render() {
    document.location.hash = this.current;
    let config = this.configs[this.current];

    // reset things
    $(svg).empty();
    $(rendering).show();

    document.body.style.backgroundColor = config.background;
    document.body.style.color = config.foreground;
    title.textContent = "#" + this.current + " " + config.title;

    for (let i=0; i<config.components.length; i++) {
      // render each component
      let component = config.components[i];
      let img = new Image();
      img.src = component.name;
      img.onerror = e => {throw e};
      img.onload = _ => this._render(component, img);
    }
  }

  async _render(component, img) {
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Setup the RNG
    let rng;
    if (component.rng.algorithm == "csrng") {
      if (component.rng.seed == "") {
        component.rng.seed = "" + ((Math.random() * 123456789)|0);
        console.log("seed for " + component.name + ": " + component.rng.seed);
      }
      rng = new Csrng(component.rng.seed);
    }

    // Generate random points
    let layout;
    switch (component.points.layout.algorithm) {
      case "uniform-random":
        layout = new UniformRandom();
        break;
      case "best-candidate":
        layout = new BestCandidate();
        break;
      case "grid":
        layout = new Grid();
        break;
      case "poisson-disc":
        layout = new PoissonDisc();
        break;
    }

    let g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    g.setAttribute("style", "fill: " + component.points.color);
    svg.append(g);
    await layout.render(canvas, ctx, rng, component.points, g);
    $(rendering).hide();
  }
}

// Some helpers
function getJSON(file, callback) {
  $.getJSON(file, callback).fail((jqxhr, textStatus, err) => {console.error(textStatus); throw err});
}

function dist(p1, p2) {
  var x = p1.x - p2.x;
  var y = p1.y - p2.y;
  return Math.sqrt(x * x + y * y);
}

new GenArt();
