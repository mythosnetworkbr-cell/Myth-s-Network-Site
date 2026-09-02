import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload } from '@vercel/blob/client';

export default async function handler(req:VercelRequest,res:VercelResponse){
  if(req.method!=='POST')return res.status(405).json({error:'Método não permitido'});
  if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(500).json({error:'Vercel Blob não configurado. Adicione BLOB_READ_WRITE_TOKEN ao projeto.'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    const json=await handleUpload({
      body,
      request:req,
      token:process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken:async(pathname)=>({
        allowedContentTypes:['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'],
        maximumSizeInBytes:100*1024*1024,
        addRandomSuffix:true,
        pathname:pathname.replace(/[^a-zA-Z0-9._/-]/g,'_')
      }),
      onUploadCompleted:async()=>{}
    });
    return res.status(200).json(json);
  }catch(e:any){return res.status(400).json({error:e.message||'Falha no upload.'});}
}
