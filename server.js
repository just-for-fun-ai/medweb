require('dotenv').config();
const http=require('http'),fs=require('fs'),path=require('path'),nodemailer=require('nodemailer');
const root=__dirname,port=Number(process.env.PORT||8080),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.md':'text/markdown; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 if(req.method==='POST'&&req.url==='/api/alert'){
  let raw='';req.on('data',c=>{raw+=c;if(raw.length>10000)req.destroy()});
  req.on('end',async()=>{try{
   const {recipient,alert}=JSON.parse(raw);
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient||'')||!alert||typeof alert.vital!=='string')return reply(400,{error:'Recipient and alert required'});
   if(!process.env.SMTP_HOST||!process.env.SMTP_USER||!process.env.SMTP_PASS||!process.env.MAIL_FROM)return reply(503,{error:'SMTP is not configured'});
   const transporter=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE==='true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
   await transporter.sendMail({from:process.env.MAIL_FROM,to:recipient,subject:'MedWeb vital alert: '+alert.vital,text:'A configured vital threshold was crossed.\nDevice: '+String(alert.device||'').slice(0,80)+'\nVital: '+alert.vital+'\nReading: '+String(alert.value)+' '+String(alert.unit||'')+'\nTime: '+String(alert.at||'')+'\n\nReview the reading and follow your clinical escalation process.'});
   reply(200,{sent:true});
  }catch(e){reply(400,{error:'Could not process email alert'})}});
  function reply(status,obj){res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(obj))}
  return;
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end()}
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)})
});
server.listen(port,'0.0.0.0',()=>console.log('MedWeb listening on http://0.0.0.0:'+port));
