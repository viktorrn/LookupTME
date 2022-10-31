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


var imageLoader0 = $('imageLoader0');
var imageLoader1 = $('imageLoader1');
var downloadBtn =  $('btn');
var roomWidth_input = $('roomWidth');
var roomHeight_input = $('roomHeight');
var tileSize_input = $('tileSize');
var drawScale_input = $('drawScale');

var tileCanvas = $('tileCanvas');
var tileCtx = tileCanvas.getContext('2d');
var lookupCanvas = $('lookupCanvas');
var lookupCtx = lookupCanvas.getContext('2d');

var roomDisplayCanvas = $('roomDisplayCanvas');
var roomCtx = roomDisplayCanvas.getContext('2d');



function generateNewRoom(width,height)
{
  let room = {};
  room['id'] = null;
  room['width'] = width;
  room['height'] = height;
  room['data'] =  new Uint8Array(width*height);
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

let worldHandlerObject = 
{
  displayWidth:512,
  displayHeight:512,

  currentRoomWidth:16,
  currentRoomHeight:16,

  tileSize:16,
  scale:1,
  displayBuffer: new Uint8ClampedArray(),

  roomArray: new Array(),
  currentWorldSelected: 0,
};


async function updateRoomSize(world)
{
  let room = world.roomArray[world.currentWorldSelected];

  let width = room.width*world.tileSize + room.width+1;
  let height = room.height*world.tileSize + room.height+1;

  console.log("new size ",width,height )
  let buffer = new Uint8ClampedArray(width * height * 4);

  for(let y = 0; y < world.currentRoomHeight; y++){
    for(let x = 0; x < world.currentRoomWidth; x++){
      buffer[y * world.currentRoomWidth + x] = 0; //world.displayBuffer[y * world.currentRoomWidth + x];
    }   
  }

  world.displayWidth = width;
  world.displayHeight = height;
  world.currentRoomHeight = room.width;
  world.currentRoomWidth = room.width;
  world.displayBuffer = buffer;
  return true;
}

function saveDataToRoomData()
{

}

async function resizeImageData (imageData, width, height) {
  const resizeWidth = width >> 0
  const resizeHeight = height >> 0
  const ibm = await window.createImageBitmap(imageData, 0, 0, imageData.width, imageData.height, {
    resizeWidth, resizeHeight
  })
  const canvas = document.createElement('canvas')
  canvas.width = resizeWidth
  canvas.height = resizeHeight
  const ctx = canvas.getContext('2d')
  ctx.scale(resizeWidth / imageData.width, resizeHeight / imageData.height)
  ctx.drawImage(ibm, 0, 0)
  return ctx.getImageData(0, 0, resizeWidth, resizeHeight)
}

async function drawRoom(world)
{
  console.log("draw room")
  let room = world.roomArray[world.currentWorldSelected];  
  let buffer = world.displayBuffer;
  let width = world.displayWidth;
  let height = world.displayHeight;

  for(var y = 0; y < height; y++) {
    for(var x = 0; x < width; x++) {
        var pos = (y * width + x) * 4; // position in buffer based on x and y
        if(x % (room.width) && y % (room.height))
        {
          buffer[pos  ] = 107;           // some R value [0, 255]
          buffer[pos+1] = 101;           // some G value
          buffer[pos+2] = 115;           // some B value
          buffer[pos+3] = 0;           // set alpha channel
        }
        else{
          buffer[pos  ] = 255;           // some R value [0, 255]
          buffer[pos+1] = 255;           // some G value
          buffer[pos+2] = 255;           // some B value
          buffer[pos+3] = 175;           // set alpha channel
        }
       
    }
  }

 
  roomDisplayCanvas.width = width;
  roomDisplayCanvas.height = height;
  console.log(roomDisplayCanvas)
  var iData = roomCtx.createImageData(width,height);
  iData.data.set(buffer);
  roomCtx.putImageData(iData, 0, 0);

  roomDisplayCanvas.style.scale = world.scale;
}

window.onload = async (e)=>{ 

    
  imageLoader0.addEventListener('change', (e)=>{handleImage(e,tileCanvas,tileCtx)}, false);
  imageLoader1.addEventListener('change', (e)=>{handleImage(e,lookupCanvas,lookupCtx)}, false);

  roomWidth_input.addEventListener('change',async (e)=>{
   // worldHandlerObject.roomArray[worldHandlerObject.currentWorldSelected].width = roomWidth_input.value;
   // await updateRoomSize(worldHandlerObject);
    drawRoom(worldHandlerObject);
  },false)

  roomHeight_input.addEventListener('change',async (e)=>{
   // worldHandlerObject.roomArray[worldHandlerObject.currentWorldSelected].height = roomHeight_input.value;
   // await updateRoomSize(worldHandlerObject);
    drawRoom(worldHandlerObject);
  },false);


  drawScale_input.addEventListener('change',async (e)=>{
    worldHandlerObject.scale = drawScale_input.value;
    drawRoom(worldHandlerObject);
    
  },false)

  tileSize_input.addEventListener('change',async (e)=>{
    
      //let currentRoom = worldHandlerObject.roomArray[worldHandlerObject.currentWorldSelected];
      worldHandlerObject.tileSize = tileSize_input.value;
      await updateRoomSize(worldHandlerObject);
      drawRoom(worldHandlerObject);
  },false);

  downloadBtn.addEventListener('click',async(e)=>{
  
    var image = tileCanvas.toDataURL();
    var aDownloadLink = document.createElement('a');
    
    aDownloadLink.download = 'canvas_image.png';
    aDownloadLink.href = image;
    aDownloadLink.click();
  });
  

  // init data
  console.log("room")
  worldHandlerObject.roomArray[0] = (generateNewRoom(16,16));
  await updateRoomSize(worldHandlerObject);
  drawRoom(worldHandlerObject);
}

document.addEventListener('onload',(e)=>{
 
 
},false);



