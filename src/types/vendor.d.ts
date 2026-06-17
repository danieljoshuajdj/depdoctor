declare module '@npmcli/arborist' {
  export default class Arborist {
    constructor(options: { path: string });
    loadActual(): Promise<unknown>;
  }
}

declare module 'pacote' {
  const pacote: {
    packument(name: string, options?: Record<string, unknown>): Promise<unknown>;
  };
  export default pacote;
}
