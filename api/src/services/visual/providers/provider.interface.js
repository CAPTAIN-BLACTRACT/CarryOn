export class VisualProvider {
  async resolve(_input) {
    throw new Error('resolve() must be implemented by a visual provider.');
  }
}
