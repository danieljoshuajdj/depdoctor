# Plugins

Plugins can add rules and reporters.

```ts
import type { DoctorPlugin } from 'node-modules-doctor';

const plugin: DoctorPlugin = {
  name: 'node-modules-doctor-plugin-vite',
  setup(api) {
    api.addRule({
      id: 'vite-major-drift',
      title: 'Vite major drift',
      run({ context }) {
        return [];
      }
    });
  }
};

export default plugin;
```

Register plugins in `node-modules-doctor.config.ts`:

```ts
export default defineConfig({
  plugins: ['node-modules-doctor-plugin-vite']
});
```
