/*
Triangles.js - v0.8
Copyright (c) 2015 Taylor Lei
Licensed under the MIT license.

Extended by:
Copyright (c) 2023 Alexander Bodin
*/
var TriangleBG = function(opts) {
   if (opts.canvas.tagName !== "CANVAS") {
      console.log("Warning: triangles.js requires a canvas element!");
      return;
   }
   //set primary canvas and context
   this.canvas = opts.canvas;
   this.ctx = this.canvas.getContext("2d");

   //used when canvas is resized
   this.alternateElem = false;

   this.ctx.canvas.height = this.canvas.clientHeight;
   this.ctx.canvas.width = this.canvas.clientWidth;

   //rendering opts for padding, colors...; default values
   this.render = {
      offset: {x: -50, y:-50},
      pad: 2,
      mouseLightRadius: this.ctx.canvas.width/3,
      mouseLight: opts.mouseLight,
      mouseLightIncrement: 10,
      mouseSaturationIncrement: 50,
      resizeAdjustment: false,
      variance: 1.3,
      variance_animation: 3,
      speed: 1,
      i: 0, // keep track of animation step
      pattern: "x*y",
      color1: {
         hue: 0, //Math.round(180*Math.random()),
         saturation: 0, //Math.round(100*Math.random()),
         lightness: 0, //Math.round(100*Math.random())
      },
      color2: {
         hue: 0,
         saturation: 0,
         lightness: 0
      },
      color3: {
         hue: 0,
         saturation: 0,
         lightness: 0
      },
      colorDelta: {
         hue: 0.5,
         saturation: 0,
         lightness: 0
      }
   }
   //default colors
   this.render.color2.hue = this.render.color1.hue;
   this.render.color2.saturation = this.render.color1.saturation;
   this.render.color2.lightness = this.render.color1.lightness+ 2;
   this.render.color3.hue = this.render.color1.hue;
   this.render.color3.saturation = this.render.color1.saturation;
   this.render.color3.lightness = this.render.color1.lightness+ 2;

   this.net = {
      w:0, h:0,
      cellWidth: 100,
      cellHeight: 100
   };

   this.vert = [];
   this.mouse = {x:null,y:null}

   //set baseCell width and height from options:
   if (opts.alternateElem) {
      this.alternateElem = opts.alternateElem;
   }
   if (opts.cellWidth) {
      this.net.cellWidth = opts.cellWidth;

   }
   if (opts.cellHeight) {
      this.net.cellHeight = opts.cellHeight;
   }
   if (opts.mouseLight) {
      this.render.mouseLightRadius = opts.mouseLightRadius;
      if (opts.mouseLightRadius) {
         this.render.mouseLightRadius = opts.mouseLightRadius;
      }
      if (opts.mouseLightIncrement) {
         this.render.mouseLightIncrement = opts.mouseLightIncrement;
      }
      if (opts.mouseSaturationIncrement) {
         this.render.mouseSaturationIncrement = opts.mouseSaturationIncrement;
      }
   }
   if (opts.variance) {
      this.render.variance = opts.variance;
   }
   if (opts.variance_animation) {
      this.render.variance_animation = opts.variance_animation;
   }
   if (opts.speed) {
      this.render.speed = opts.speed;
   }
   if (opts.pattern) {
      this.render.pattern = opts.pattern;
   }
   if (opts.resizeAdjustment) {
      this.render.resizeAdjustment = opts.resizeAdjustment;
   }
   if (opts.baseColor1) {
      if (opts.baseColor1.baseHue) {
         this.render.color1.hue = opts.baseColor1.baseHue;
         this.render.color2.hue = opts.baseColor1.baseHue;
      }
      if (opts.baseColor1.baseSaturation) {
         this.render.color1.saturation = opts.baseColor1.baseSaturation;
         this.render.color2.saturation = opts.baseColor1.baseSaturation;
      }
      if (opts.baseColor1.baseLightness) {
         this.render.color1.lightness = opts.baseColor1.baseLightness;
         this.render.color2.lightness = opts.baseColor1.baseLightness + 2;
      }
   }
   if (opts.baseColor2) {
      if (opts.baseColor2.baseHue) {
         this.render.color2.hue = opts.baseColor2.baseHue;
      }
      if (opts.baseColor2.baseSaturation) {
         this.render.color2.saturation = opts.baseColor2.baseSaturation;
      }
      if (opts.baseColor2.baseLightness) {
         this.render.color2.lightness = opts.baseColor2.baseLightness;
      }
   }
   if (opts.baseColor3) {
      if (opts.baseColor3.baseHue) {
         this.render.color3.hue = opts.baseColor3.baseHue;
      }
      if (opts.baseColor3.baseSaturation) {
         this.render.color3.saturation = opts.baseColor3.baseSaturation;
      }
      if (opts.baseColor3.baseLightness) {
         this.render.color3.lightness = opts.baseColor3.baseLightness;
      }
   }
   if (opts.colorDelta) {
      if (opts.colorDelta.hue) {
         this.render.colorDelta.hue = opts.colorDelta.hue;
      }
      if (opts.colorDelta.saturation) {
         this.render.colorDelta.saturation = opts.colorDelta.saturation;
      }
      if (opts.colorDelta.lightness) {
         this.render.colorDelta.lightness = opts.colorDelta.lightness;
      }
   }
   //vertices
   this.generateNet(false);

   //window size change, so canvas doesn't deform
   window.addEventListener("resize", this, false);
   window.addEventListener("mousemove", this, false);
   this.handleEvent = function(e) {
      switch(e.type) {
         case "resize":
            if (this.alternateElem) {
               var dataURL = this.canvas.toDataURL("image/png");
               this.alternateElem.style.backgroundImage = "url("+dataURL+")";
            }
            if (this.render.resizeAdjustment) {
               this.ctx.canvas.height = this.canvas.clientHeight;
               this.ctx.canvas.width = this.canvas.clientWidth;
               this.generateNet(true);
            }
         break;
         case "mousemove":
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
            this.mouse.x = e.clientX - this.render.offset.x - this.canvas.offsetLeft + scrollLeft;
            this.mouse.y = e.clientY - this.render.offset.y - this.canvas.offsetTop + scrollTop;
         break;
      }
   }

   this.delete = false;
};
TriangleBG.prototype.generateNet = function(regenerate) {
   //fit a number of cellWidth to screen + so no problems can happen, pad by render.pad on each side
   this.net.w = Math.floor(screen.width/this.net.cellWidth) + this.render.pad*2; //+4 for edges
   this.net.h = Math.floor(screen.height/this.net.cellHeight) + this.render.pad*2;
   //render padding
   this.render.offset.x = -this.render.pad*this.net.cellWidth;
   this.render.offset.y = -this.render.pad*this.net.cellWidth;

   //generate vertices with random offsets
   var x;
   for (x = 0; x < this.net.w; x++) {
      this.vert.push([]);

      //how random are the offsets?
      var y;
      for (y = 0; y < this.net.h; y++) {
         this.vert[x].push({
            offset: {
               //x offset around - this.cellWidth/4 to this.cellWidth/4, to 2 decimals
               x: Math.floor(100 * Math.random()*this.net.cellWidth/this.render.variance - this.net.cellWidth/this.render.variance*2 ) / 100 ,
               y: Math.floor(100 * Math.random()*this.net.cellHeight/this.render.variance - this.net.cellHeight/this.render.variance*2 ) / 100
            },
            trig: {
               theta_x: Math.random()*360 - 180,
               k_x: Math.random()*this.render.variance_animation,
               theta_y: Math.random()*360 - 180,
               k_y: Math.random()*this.render.variance_animation,
            }
         });
      }
   }

   if (!regenerate) {
      this.renderLoop();
   }
   if (this.alternateElem) {
      var dataURL = this.canvas.toDataURL("image/png");
   }
   this.alternateElem.style.backgroundImage = "url("+dataURL+")";
};
TriangleBG.prototype.renderLoop = function() {
   if (this.delete === true) {
      return;
   }

   this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
   this.ctx.translate(this.render.offset.x, this.render.offset.y);
   for (x = 0; x < this.net.w-1; x++) {
      var y;
      for (y = 0; y < this.net.h-1; y++) {
         var hueDelta = 0;
         var pattern;
         var saturationDelta = 0;
         var lightnessDelta = 0;
         var lightnessIncrement = 0;
         var saturationIncrement = 0;
         var mouseLightRadius = this.render.mouseLightRadius;
         //render pattern (direction of gradient)
         if (this.render.pattern === "x*y") {
            pattern = Math.abs(x*y);
         }
         else if (this.render.pattern === "x"){
            pattern = Math.abs(x);
         }
         else if (this.render.pattern === "y"){
            pattern = Math.abs(y);
         }
         hueDelta =  pattern * this.render.colorDelta.hue
         saturationDelta = this.render.colorDelta.saturation
         lightnessDelta = this.render.colorDelta.lightness

         // Calculate all points in the square (will make 6 triangles)
         let [x1, y1] = this.calculatePoint(this.net, this.vert, this.render, x, y)
         let [x2, y2] = this.calculatePoint(this.net, this.vert, this.render, x, y+1)
         let [x3, y3] = this.calculatePoint(this.net, this.vert, this.render, x+1, y)
         let [x4, y4] = this.calculatePoint(this.net, this.vert, this.render, x+1, y+1)
         
         //Change direction of square split in a checkerboard pattern
         if ((x%2===1 && y%2===0) || (x%2===0 && y%2===1)) {
            c_x1 = (x1 + x2 + x4) /3;
            c_y1 = (y1 + y2 + y4) /3;
            c_x2 = (x1 + x3 + x4) /3;
            c_y2 = (y1 + y3 + y4) /3;
            triangles1 = [
               [[x1,y1], [x2,y2], [c_x1, c_y1]],
               [[x1,y1], [x4,y4], [c_x1, c_y1]],
               [[x2,y2], [x4,y4], [c_x1, c_y1]],
               [[x1,y1], [x3,y3], [c_x2, c_y2]],
               [[x1,y1], [x4,y4], [c_x2, c_y2]],
               [[x3,y3], [x4,y4], [c_x2, c_y2]],
            ]
         }else {
            c_x1 = (x1 + x2 + x3) /3;
            c_y1 = (y1 + y2 + y3) /3;
            c_x2 = (x2 + x3 + x4) /3;
            c_y2 = (y2 + y3 + y4) /3;
            triangles1 = [
               [[x1,y1], [x2,y2], [c_x1, c_y1]],
               [[x1,y1], [x3,y3], [c_x1, c_y1]],
               [[x2,y2], [x3,y3], [c_x1, c_y1]],
               [[x2,y2], [x3,y3], [c_x2, c_y2]],
               [[x2,y2], [x4,y4], [c_x2, c_y2]],
               [[x3,y3], [x4,y4], [c_x2, c_y2]],
            ]
         }
         let triangles2 = [
            [[x1,y1], [x2,y2], [x4,y4]],
            [[x1,y1], [x3,y3], [x4,y4]],
         ]
         let triangles = triangles1
         //console.log(triangles[0][0][0])
         for (let j = 0; j < triangles.length; j++) {
            this.ctx.beginPath();
            this.ctx.lineTo(triangles[j][0][0],triangles[j][0][1]);
            this.ctx.lineTo(triangles[j][1][0],triangles[j][1][1]);
            this.ctx.lineTo(triangles[j][2][0],triangles[j][2][1]);
            this.ctx.closePath();

            let centerX = (triangles[j][0][0] + triangles[j][1][0] + triangles[j][2][0])/3;
            let centerY = (triangles[j][0][1] + triangles[j][1][1] + triangles[j][2][1])/3;

            let hue = 0, sat = 0, lig = 0, mouseSat = 0, mouseLight = 0
            switch (j%6) {
               case 0:
               case 5:
               case 3:
                  hue = this.render.color1.hue
                  sat = this.render.color1.saturation
                  lig = this.render.color1.lightness
                  mouseSat = this.render.mouseSaturationIncrement
                  mouseLight = this.render.mouseLightIncrement
                  break;
               case 1:
               case 6:
               case 8:
                  hue = this.render.color2.hue
                  sat = this.render.color2.saturation
                  lig = this.render.color2.lightness
                  mouseSat = this.render.mouseSaturationIncrement
                  mouseLight = this.render.mouseLightIncrement + 3
                  break;
               case 2:
               case 4:
               case 7:
                  hue = this.render.color3.hue
                  sat = this.render.color3.saturation
                  lig = this.render.color3.lightness
                  mouseSat = this.render.mouseSaturationIncrement-5
                  mouseLight = this.render.mouseLightIncrement + 6
                  break;
            
               default:
                  break;
            }
            
            if (this.render.mouseLight && Math.pow(Math.abs(this.mouse.x - centerX),2) + Math.pow(Math.abs(this.mouse.y-centerY),2) < Math.pow(mouseLightRadius,2)) {
               var radius = Math.sqrt( Math.pow(Math.abs(this.mouse.x-centerX),2) + Math.pow(Math.abs(this.mouse.y - centerY),2) );
               lightnessIncrement = (mouseLightRadius-radius)/(mouseLightRadius)*mouseLight;
               saturationIncrement = (mouseLightRadius-radius)/(mouseLightRadius)*mouseSat;
            }
            var col = 'hsl(' + Math.floor(hue + hueDelta) + ', ' +
                               Math.floor(sat + saturationDelta + saturationIncrement) +  '% ,' +
                               (lig + lightnessDelta + lightnessIncrement) +'%)';
   
            this.ctx.fillStyle = col;
            this.ctx.strokeStyle = col;
            this.ctx.fill();
            this.ctx.stroke();
         }
      }
   }
   this.ctx.translate(-this.render.offset.x, -this.render.offset.y);
   //this.ctx.fillStyle = this.render.color1.lightness > 50 ? "black" : "white";
   //this.ctx.font = "bold 170px Arial";
   //this.ctx.fillText("essiq", (canvas.width / 2) - 255, (canvas.height / 2) + 8);

   this.render.i += 1;
   if (this.render.mouseLight) {
      window.setTimeout(this.renderLoop.bind(this), 1000/15);
   }
};
TriangleBG.prototype.delete = function() {
   this.delete = true;
};

TriangleBG.prototype.calculatePoint = function(net, vert, render, x, y) {

   let drawX = x * net.cellWidth + vert[x][y].offset.x + Math.sin(vert[x][y].trig.theta_x * render.speed * render.i) * vert[x][y].trig.k_x;
   let drawY = y * net.cellHeight + vert[x][y].offset.y + Math.sin(vert[x][y].trig.theta_y * render.speed * render.i) * vert[x][y].trig.k_y;

   return [drawX, drawY]
}