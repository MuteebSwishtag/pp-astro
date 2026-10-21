import pageSchema from './pageSchema.json';

type SchemaNode = Record<string, any>;
type SchemaGraph = { '@context': string; '@graph': SchemaNode[] };

// Emit the imported graph unchanged: no added entities or field overrides.
export function getPageSchema(pathname: string): SchemaGraph | undefined {
  const path = pathname.replace(/\/$/, '') || '/';
  return (pageSchema as Record<string, SchemaGraph>)[path];
}
