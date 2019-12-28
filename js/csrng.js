/**
 * Uses sha1() to create a stream of random bytes.
 *
 * Note: this is very slow but it makes for a nice loading animation, to some degree.
 */
class Csrng {
  constructor(seed) {
    // convert seed to array
    let arr =  new Uint8Array(seed.split('').map(x => x.charCodeAt(0)));
    this.cursor = 0;
    this.state = crypto.subtle.digest("SHA-1", arr);
  }

  async byte() {
    let state = new Uint8Array(await this.state);
    if (this.cursor == state.length) {
      this.state = crypto.subtle.digest("SHA-1", state);
      this.cursor = 0;
      return this.byte();
    }
    return state[this.cursor++];
  }

  async float() {
    // this method isn't great...
    let t = (await this.byte() << 8) | await this.byte();
    return t / 0xffff;
  }
}
