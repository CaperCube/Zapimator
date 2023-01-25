/*
var frames1 = [
    {x:null, y:null, xd:null, yd:null}
];

for (var i = 0; i < 360; i++) {
    frames1[i] = {
        x: null,
        y: null,
        xd: null,
        yd: null
    };
}
*/

/////////////////////////////////////////////////////////
// v0.52
//rotation now works with scaling
/////////////////////////////////////////////////////////

//https://stackoverflow.com/questions/17411991/html5-canvas-rotate-image
function drawImageCenter(image, x, y, cx, cy, scaleX, scaleY, rotation, cctx){
    
    cctx = cctx || ctx;
    
    //ctx.setTransform(scaleX, 0, 0, scaleY, x, y); // sets scale and origin
    cctx.setTransform(1, 0, 0, 1, x, y);
    cctx.rotate(rotation * Math.PI/180);
    cctx.drawImage(image, -cx * scaleX, -cy * scaleY, image.width * scaleX, image.height * scaleY);
    
    cctx.setTransform(1,0,0,1,0,0); // which is much quicker than save and restore
}

/////////////////////////////////////////////////////////
// Layer Object
/////////////////////////////////////////////////////////

function Obj(img, n, iX, iY) {
    
    this.name = n;
    this.obImg = img;
    this.wetPaint = null; // Store temporary lines (as points) here { X: 0, Y: 0 }
    this.pastPaint = [];
    this.dryPaint = null; // Store image data for the paint here
    this.paintPos = { X: iX, Y: iY };
    
    // Position, Scale, Rotation, Opacity
    this.imageSize = { X: null, Y: null };
    this.position = { X: iX, Y: iY };
    this.opacity = 1;
    this.scale = { X: 1, Y: 1 };
    this.rotation = 0;
    
    this.locked = false;
    this.isVisible = true;
    
    this.positionAnim = false;
    this.rotationAnim = false;
    this.scaleAnim = false;
    this.opacityAnim = false;
    
    this.positionFrames = [ { X: iX, Y: iY } ];
    this.rotationFrames = [ 0 ];
    this.scaleFrames = [ { X: 1, Y: 1 } ];
    this.opacityFrames = [ 1 ];
    
    this.initFrames = function() {
        //seqLength
        for (var i = 1; i < seqLength + 1; i ++) {
            this.positionFrames[i] = { X: null, Y: null };
            this.rotationFrames[i] = null;
            this.scaleFrames[i] = { X: null, Y: null };
            this.opacityFrames[i] = null;
        }
        //console.log("init " + seqLength + " frames");
    }
    this.initFrames();
    
    this.renderPaint = function() {//angleOffset) {
        
        //var af = angleOffset || 0;
        //console.log("drawing paint at: " + af);
        
        // Dry paint
        if (this.dryPaint != null) {
            drawImageCenter(
                this.dryPaint,
                this.position.X + this.imageSize.X/2,
                this.position.Y + this.imageSize.Y/2,
                this.imageSize.X/2,
                this.imageSize.Y/2,
                this.scale.X,
                this.scale.Y,
                this.rotation
//                this.position.X + this.dryPaint.width/2,
//                this.position.Y + this.dryPaint.height/2,
//                this.dryPaint.width/2,
//                this.dryPaint.height/2,
//                this.scale.X,
//                this.scale.Y,
//                this.rotation
            );
        }
        
        // Wet paint
        if (this.wetPaint != null) {
            ctx.beginPath();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = this.wetPaint[0].color;
            ctx.lineWidth = this.wetPaint[0].size;
            ctx.moveTo(this.wetPaint[0].X, this.wetPaint[0].Y);

            for (var i = 1; i < this.wetPaint.length; i++) {
                ctx.lineTo(this.wetPaint[i].X, this.wetPaint[i].Y);
                //+ this.position.Y
            }
            ctx.stroke();
        }
    }
    
    this.draw = function() {
        if (this.imageSize.X == null || this.imageSize.Y == null) this.imageSize = { X: img.width, Y: img.height };
        //console.log(this.imageSize);
        /////////////////////////////////////////////////////
        // Object Draw
        /////////////////////////////////////////////////////
        if (!(mouseCollide == this && lmbDown)) {
            //console.log("HEY");
            //console.log(this.positionFrames[slider]);
            
            // Position X
            if (this.positionFrames[slider].X != null) {
                this.position.X = this.positionFrames[slider].X;
            }
            // Else use last keyframe
            else {
                for (var i = slider; i > 0; i--) {
                    if (this.positionFrames[i].X != null) {
                        this.position.X = this.positionFrames[i].X;
                        i = 0;
                    }
                }
            }
            
            // Position Y
            if (this.positionFrames[slider].Y != null) {
                this.position.Y = this.positionFrames[slider].Y;
            }
            // Else use last keyframe
            else {
                for (var i = slider; i > 0; i--) {
                    if (this.positionFrames[i].Y != null) {
                        this.position.Y = this.positionFrames[i].Y;
                        i = 0;
                    }
                }
            }
            
            // Scale X
            if (this.scaleFrames[slider].X != null) {
                this.scale.X = this.scaleFrames[slider].X;
            }
            // Else use last keyframe
            else {
                for (var i = slider; i > 0; i--) {
                    if (this.scaleFrames[i].X != null) {
                        this.scale.X = this.scaleFrames[i].X;
                        i = 0;
                    }
                }
            }
            
            // Scale Y
            if (this.scaleFrames[slider].Y != null) {
                this.scale.Y = this.scaleFrames[slider].Y;
            }
            // Else use last keyframe
            else {
                for (var i = slider; i > 0; i--) {
                    if (this.scaleFrames[i].Y != null) {
                        this.scale.Y = this.scaleFrames[i].Y;
                        i = 0;
                    }
                }
            }
            
            // Opacity
            if(!opacitySliderGrabbed) {
                if (this.opacityFrames[slider] != null) {
                    this.opacity = this.opacityFrames[slider];
                }
                // Else use last keyframe
                /*
                else {
                    for (var i = slider; i > 0; i--) {
                        if (this.opacityFrames[i] != null) {
                            this.opacity = this.opacityFrames[i];
                            i = 0;
                        }
                    }
                }
                */
            }
            
            // Rotation
            if (this.rotationFrames[slider] != null) {
                this.rotation = this.rotationFrames[slider];
            }
            // Else use last keyframe
            /*
            else {
                for (var i = slider; i > 0; i--) {
                    if (this.rotationFrames[i] != null) {
                        this.rotation = this.rotationFrames[i];
                        i = 0;
                    }
                }
            }
            */
            
            //else this.position = this.positionFrames[0];
            //this.position = this.positionFrames[slider];
            
        }
        
        //this.rotation += 10;
        //this.scale.X = 0.25;
        //this.scale.Y = 1;
        //this.opacity = mouseY/canvas.height;
        
        if (this.isVisible) {
            
            //set alpha
            ctx.globalAlpha = this.opacity;
            
            //ctx.drawImage(this.obImg, m.X,m.Y, this.scale.X, this.scale.Y);
            if (this.obImg != null) {
                drawImageCenter(
                    this.obImg,
                    this.position.X + this.imageSize.X/2,
                    this.position.Y + this.imageSize.Y/2,
                    //m.X,
                    //m.Y,
                    this.imageSize.X/2,
                    this.imageSize.Y/2,
                    this.scale.X,
                    this.scale.Y,
                    this.rotation
                );
            }
            
            // Paint
            this.renderPaint();
            
            //reset alpha
            ctx.globalAlpha = 1;
        }
        
        /////////////////////////////////////////////////////
        // Object Debug
        /////////////////////////////////////////////////////
        if (hbDebug) {
            if (selectedLayer == this) ctx.strokeStyle = "blue";
            else ctx.strokeStyle = "#BBB";
            ctx.lineWidth = 1;
            ctx.lineJoin = "miter";
            ctx.strokeRect(this.position.X, this.position.Y, this.obImg.width, this.obImg.height);
        }
    }
    
    this.frame = function() {
        
        /////////////////////////////////////////////////////
        // Exicute on Render Frame
        /////////////////////////////////////////////////////
        //if (mouseCollide == this) hbDebug = true;
        //if (mouseBoxCollide(this)) mouseCollide = this;
        this.draw();
    }
    
}

/////////////////////////////////////////////////////////
// Layer Object Functions
/////////////////////////////////////////////////////////

function draw() {
    
}

function drag(mX, mY, dX, dY) {
    var out = { X: null, Y: null };
    
    out.X = mX + dX;
    out.Y = mY + dY;
    
    return out;
}

function mouseBoxCollide(obj) {
    
    var box = {
        left: obj.position.X,
        right: (obj.position.X + obj.obImg.width),
        top: obj.position.Y,
        bottom: (obj.position.Y + obj.obImg.height)
    };
    
    var mouseBox = {
        left: (mouseX - mouseSize),
        right: (mouseX + mouseSize),
        top: (mouseY - mouseSize),
        bottom: (mouseY + mouseSize)
    };
    
    if (mouseBox.right > box.left &&
        mouseBox.left < box.right &&
        mouseBox.bottom > box.top &&
        mouseBox.top < box.bottom) {
        if (obj.locked) return false;
        else return true;
        //console.log("clicked");
    }
    else {
        //mouseCollide = null;
        return false;
    }
}
