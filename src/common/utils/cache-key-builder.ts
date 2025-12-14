export class CacheKeyBuilder {
  private parts: string[] = [];

  add(key: string, value?: any): this {
    if (value !== undefined && value !== null && value !== '') {
      this.parts.push(`${key}=${value}`);
    }
    return this;
  }

  build(prefix: string, separator: string = '|'): string {
    return [prefix, ...this.parts].join(separator);
  }
}
