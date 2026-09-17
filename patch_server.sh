sed -i 's/(req: any)/(req: express.Request)/g' server.ts
sed -i 's/(m: any)/(m: { sender: string, text: string })/g' server.ts
sed -i 's/error: (e as any).message/error: e instanceof Error ? e.message : String(e)/g' server.ts
sed -i "s/return req.ip;/return req.ip || 'unknown';/g" server.ts
