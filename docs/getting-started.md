# Getting Started with pkg-ct

This guide introduces the concepts, architecture, and step-by-step instructions to get started using `pkg-ct` (Package City Inspector).

---

## 🏛️ What is pkg-ct? (The Story of the City Inspector)

Imagine your software project is not just a collection of text files, but a bustling, growing **city**.

* **The Buildings:** Every direct package you install is a building. The primary structures (like React, Express, or NestJS) are the skyscrapers and central town halls. Your utility libraries are the shops, schools, and offices.
* **The Infrastructure Grid:** Beneath the surface lies a massive network of pipes, power grids, subways, and telecommunication lines. These are your **transitive dependencies**—the packages installed by other packages. You did not install them directly, but without them, your city goes dark.
* **The Abandoned Structures:** Over time, some buildings are abandoned by their architects. These are **deprecated packages** or unmaintained libraries. They sit vacant, accumulating dust and structural weaknesses, waiting for a security vulnerability to start a fire.
* **The Ghost Buildings:** Some buildings were constructed but are completely empty and boarded up. Nobody works there; nobody visits. These are **unused dependencies**—declared in your registry but never imported in your code. They consume valuable space (increases your `node_modules` size) and make the city map confusing.
* **The Franchise Clones:** Sometimes, multiple versions of the same franchise (e.g., Starbucks or McDonald's) are constructed on the exact same block. This is **dependency duplication**. You might have `lodash@4.17.21` and `lodash@4.17.15` sitting right next to each other because different parts of your infrastructure did not coordinate their version plans.
* **The Incompatible Grid Links:** When you try to connect a building that runs on a 220V power grid to a local line that only outputs 110V, things break. This is a **peer dependency conflict**.
* **The Hazardous Zones:** Sometimes, a building contains a gas leak or chemical hazard. These are **security vulnerabilities** that expose your city's residents to external threats.
* **The Specialized Construction Sites:** Some buildings are made of steel that must be forged on-site using specialized heavy machinery (compilers). These are **native modules** that require `node-gyp` or C++ build chains, slowing down construction workers (causing long build and deployment times).
* **The Hidden Side Alleys:** Some contractors build secret passages where they run custom, uninspected activities. These are **package lifecycle scripts** (`preinstall`, `postinstall`) that execute arbitrary scripts when packages are fetched.

In this metaphor, **`pkg-ct` is the City Inspector.**

Equipped with blueprints (AST scanners), structural history (NPM registry metadata), and an advanced diagnostic engine, `pkg-ct` walks through your city. It doesn't just list the buildings; it checks the foundations, traces the wires, maps the pipes, calculates safety grades, runs risk simulations, and drafts a step-by-step remediation plan to keep your city healthy, secure, and ready for release.

---

## 🧸 What is a Dependency? (The Child's Guide)

Before we start inspecting our codebase city, let's learn how its buildings are made.

### 1. The Package
A **package** is a box of pre-written code created by other programmers. Instead of writing your own math formulas or custom animations from scratch, you download a package that has already done it. It is like buying a pre-assembled LEGO block.

### 2. NPM (The Package Marketplace)
**npm** (Node Package Manager) is the world's largest toy store for code. Programmers from all over the world upload their packages to this store. When you need a package, you ask `npm` to fetch it for you.

### 3. package.json (The Shopping List)
Your project has a special file called `package.json`. It is your **shopping list**. It tells the computer exactly which packages your project needs to work.
Here is an example:
```json
{
  "name": "my-toy-app",
  "dependencies": {
    "react": "^19.0.0"
  }
}
```
This tells npm: *"Go fetch React version 19 so I can build my app!"*

### 4. node_modules (The Warehouse)
When npm downloads the packages from your shopping list, it puts them in a folder called `node_modules`. This folder is your **warehouse**. It contains all the downloaded code. Warning: it can grow very large and heavy!

### 5. The Lockfile (package-lock.json / pnpm-lock.yaml)
The **lockfile** is a detailed receipt. While `package.json` says *"I want React version 19,"* the lockfile writes down: *"I downloaded exactly React version 19.0.0 from server XYZ at 2:05 PM, and verified its safety signature."* It makes sure that every computer builds the exact same city.

### 6. Transitive Dependency (The Downstream Friend)
If you invite a friend (Direct Dependency) to your house, and they bring their three siblings (Transitive Dependencies) with them, your house now has four guests! 
In code, if you install a package like `express`, it will install dozens of other packages it needs to work. Those extra packages are transitive dependencies.

### 7. Peer Dependency (The Required Partnership)
A **peer dependency** is a package that says: *"I will work for you, but only if you already have my best friend installed."* For example, the package `react-dom` will work only if you also install `react`. If you don't install its partner, you get a peer dependency mismatch.

---

## 📥 Installation

Install `pkg-ct` globally using npm:

```bash
npm install -g @danijsrr/pkg-ct
```

Alternatively, you can run it on the fly using `npx`:

```bash
npx @danijsrr/pkg-ct doctor
```

---

## 🗺️ First Scan Tutorial

Let's walk through your very first inspection scan. Go to the directory of your Node project and run:

```bash
pkg-ct scan
```

### The Output Diagram

When you run `pkg-ct scan`, the CLI prints a structured inventory sheet that looks like this:

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PKG-CT Scan Output
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Packages: 245
Duplicate package families: 3
Deprecated packages: 1
Peer dependency issues: 2
Install script packages: 4
Native build risks: 0
Lockfile: npm (package-lock.json)
Scanned in 142ms
```

### Line-by-Line Explanation

1. **`Packages: 245`**
   * *Meaning:* The total number of packages installed in your `node_modules` tree, including direct and transitive dependencies.
2. **`Duplicate package families: 3`**
   * *Meaning:* You have 3 packages installed in multiple, conflicting versions. For example, you might have two versions of `safe-buffer` in the tree.
3. **`Deprecated packages: 1`**
   * *Meaning:* One package in your tree is officially deprecated by its author. It should be replaced.
4. **`Peer dependency issues: 2`**
   * *Meaning:* Two packages are missing their required partners or are receiving versions outside of their expected ranges.
5. **`Install script packages: 4`**
   * *Meaning:* Four installed packages execute custom lifecycle scripts during installation. These scripts should be reviewed to prevent security breaches.
6. **`Native build risks: 0`**
   * *Meaning:* No packages require C++ compiling on-site. This is excellent for build speeds.
7. **`Lockfile: npm (package-lock.json)`**
   * *Meaning:* `pkg-ct` successfully detected your package manager type (npm) and read its lockfile format.
8. **`Scanned in 142ms`**
   * *Meaning:* The time it took to parse the physical node tree and compute the inventory.
