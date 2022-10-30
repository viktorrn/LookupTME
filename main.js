function $(e){return document.getElementById(e)};
function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
  }


var imageWidth = 300;
var imagesLoaded = 0;



var tileAmount = 10;
var worldSizeX = 32;
var worldSizeY = 32;
var displayWidth = 32*20;
var displayHeight = 32*20;


let worldHandlerObject = 
{
  displayWidth:512,
  displayHeight: 512,
  roomArray: new Array(),
  currentWorldSelected: 0,
};

var imageLoader0 = $('imageLoader0');
var imageLoader1 = $('imageLoader1');
var downloadBtn =  $('btn');
var worldSizeX_input = $('worldSizeX');
var worldSizeY_input = $('worldSizeY');
var tileSize_input = $('tileSize');

worldSizeX_input.addEventListener('change', (e)=>{
  if(isNaN(worldSizeX_input.value)) 
  {worldSizeX = worldSizeX_input.value};
  updateWorldSize(e);
},false)

worldSizeY_input.addEventListener('change', (e)=>{
  if(isNaN(worldSizeY_input.value)) 
  {worldSizeY = worldSizeY_input.value};
  updateWorldSize(e);
},false);

tileSize_input.addEventListener('change',(e)=>{
  
    //tileSize.valueOf = tileSize_input.value;
  
  console.log( tileSize)
  drawWorldData();
})

var tileCanvas = $('tileCanvas');
var tileCtx = tileCanvas.getContext('2d');
var lookupCanvas = $('lookupCanvas');
var lookupCtx = lookupCanvas.getContext('2d');

var worldCanvas = $('worldCanvas');
var worldCtx = worldCanvas.getContext('2d');

imageLoader0.addEventListener('change', (e)=>{handleImage(e,tileCanvas,tileCtx)}, false);
imageLoader1.addEventListener('change', (e)=>{handleImage(e,lookupCanvas,lookupCtx)}, false);




function generateNewRoom(tax,tay,width,height)
{
  let room = {};
  room['tileAmountX'] = tax;
  room['tileAmountY'] = tay;
  room['width'] = width;
  room['height'] = height;
  return room;
}

var tileMapObject;

function handleImage(e,canvas,ctx){
  var reader = new FileReader();
  reader.onload = function(event){
      var img = new Image();
      img.onload = function(){
        let scaleX = imageWidth/img.width;
        let scaleY = imageWidth/img.height;
        
        canvas.width = imageWidth;
        canvas.height = imageWidth;
        ctx.scale(scaleX,scaleY);
        ctx.drawImage(img,0,0);
      }
      img.src = event.target.result;
      console.log(event.target)
  }
  reader.readAsDataURL(e.target.files[0]);    
  
}

function pick(event) {
  const bounding = canvas.getBoundingClientRect();
  const x = event.clientX - bounding.left;
  const y = event.clientY - bounding.top;
  const pixel = ctx.getImageData(x, y, 1, 1);
  const data = pixel.data;

  //const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
  //destination.style.background = rgba;
  //destination.textContent = rgba;

  //return rgba;
}

function drawRoom(world)
{
  console.log(world);
  let room = world.roomArray[world.currentWorldSelected];
  let tileAmountX = room.tileAmountX;
  let tileAmountY = room.tileAmountY;
  let tileSizeX = Math.floor(world.displayWidth/tileAmountX);
  let tileSizeY = Math.floor(world.displayHeight/tileAmountY);
  
  console.log(tileAmountX);
  
   

  let width = tileAmountX*tileSizeX + tileAmountX+1;
  let height = tileAmountY*tileSizeY + tileAmountY+1;
  
  let buffer = new Uint8ClampedArray(width * height * 4);

  for(var y = 0; y < height; y++) {
    for(var x = 0; x < width; x++) {
        var pos = (y * width + x) * 4; // position in buffer based on x and y
        if(y % tileSizeY && x % tileSizeX)
        {
          buffer[pos  ] = 155;           // some R value [0, 255]
          buffer[pos+1] = 155;           // some G value
          buffer[pos+2] = 155;           // some B value
          buffer[pos+3] = 255;           // set alpha channel
        }
        else{
          buffer[pos  ] = 205;           // some R value [0, 255]
          buffer[pos+1] = 205;           // some G value
          buffer[pos+2] = 205;           // some B value
          buffer[pos+3] = 255;           // set alpha channel
        }
       
    }
  }
  worldCanvas.width = width;
  worldCanvas.height = height;
  console.log(worldCanvas)
  var iData = worldCtx.createImageData(width,height);
  iData.data.set(buffer);
  worldCtx.putImageData(iData, 0, 0);
  console.log("reDraw world data")
}

function updateWorldSize(e)
{
  worldCanvas.width = displayWidth;
  worldCanvas.height = displayHeight;
  let scaleX = displayWidth/worldSizeX;
  let scaleY = displayHeight/worldSizeY;
  worldCtx.scale(scaleX,scaleY);
}


downloadBtn.addEventListener('click',()=>{
  
  var image = tileCanvas.toDataURL();
  var aDownloadLink = document.createElement('a');
  
  aDownloadLink.download = 'canvas_image.png';
  aDownloadLink.href = image;
  aDownloadLink.click();
});


worldHandlerObject.roomArray[0] = (generateNewRoom(16,16,512,512));
drawRoom(worldHandlerObject);

document.addEventListener('onload',(e)=>{

 
},false);



