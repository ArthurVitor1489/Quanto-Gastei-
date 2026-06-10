/**
 * Quanto Gastei? - TypeScript Declarations
 * Allows importing CSS modules and stylesheet fallbacks in TypeScript files.
 */

declare module '*.css' {
  const content: any;
  export default content;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
