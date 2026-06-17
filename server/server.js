const express=require("express");
const cors=require("cors");
const app=express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

function parse(prompt){
 prompt=prompt.toLowerCase();
 let mode="platformer";
 let enemy="zombie";
 let difficulty=1;

 if(prompt.includes("alien")) enemy="alien";
 if(prompt.includes("robot")) enemy="robot";

 if(prompt.includes("shoot")||prompt.includes("gun")) mode="shooter";

 if(prompt.includes("hard")) difficulty=3;
 if(prompt.includes("medium")) difficulty=2;

 return {mode,enemy,difficulty};
}

function sprite(seed){
 return `https://api.dicebear.com/7.x/pixel-art/png?seed=${seed}_${Math.random()}`
}

app.post("/generate",(req,res)=>{
 const cfg=parse(req.body.prompt);

 let bg="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

if(cfg.enemy==="alien") bg="/alien_bg.png";
if(cfg.enemy==="zombie") bg=Math.random()<0.5?"/zombie_bg1.png":"/zombie_bg2.png";
if(cfg.enemy==="robot") bg="https://images.unsplash.com/photo-1518770660439-4636190af475";

res.json({
  ...cfg,
  background:bg,
  playerSprite:sprite("player"),
  enemySprite:sprite(cfg.enemy),
  powerupSprite:sprite("powerup")
 });
});

app.listen(3000,()=>console.log("running"));
