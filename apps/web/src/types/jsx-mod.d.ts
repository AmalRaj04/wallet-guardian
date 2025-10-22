// Allow importing .jsx files without TS declaration errors from generated types
declare module '*.jsx' {
  const value: any;
  export default value;
}

declare module '*.js' {
  const value: any;
  export default value;
}
