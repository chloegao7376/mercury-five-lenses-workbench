import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
export class LocalBucket{
  constructor(directory){this.directory=directory;this.queue=Promise.resolve();}
  file(key){return path.join(this.directory,crypto.createHash('sha256').update(key).digest('hex')+'.json');}
  async get(key){try{const row=JSON.parse(await fs.readFile(this.file(key),'utf8'));return{etag:row.etag,json:async()=>JSON.parse(row.value)};}catch(err){if(err.code==='ENOENT')return null;throw err;}}
  put(key,value,options={}){const job=this.queue.then(async()=>{await fs.mkdir(this.directory,{recursive:true});const previous=await this.get(key),condition=options.onlyIf;const ifNone=condition instanceof Headers?condition.get('If-None-Match'):condition?.etagDoesNotMatch;if(ifNone==='*'&&previous)return null;if(condition?.etagMatches&&condition.etagMatches!==previous?.etag)return null;const etag=crypto.randomUUID(),file=this.file(key),temp=file+'.tmp';await fs.writeFile(temp,JSON.stringify({etag,value:String(value)}));await fs.rename(temp,file);return{etag};});this.queue=job.catch(()=>{});return job;}
}
