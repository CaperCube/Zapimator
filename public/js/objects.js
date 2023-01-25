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

var availableBlendingModes = [
    "normal",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "hard-light", 
    "soft-light",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity"
];
//availableBlendingModes.includes(o.blendingMode);

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
    
    this.blendingMode = "normal";
    
    this.positionAnim = false;
    this.rotationAnim = false;
    this.scaleAnim = false;
    this.opacityAnim = false;
    
    this.positionFrames = [ { X: iX, Y: iY } ];
    this.rotationFrames = [ 0 ];
    this.scaleFrames = [ { X: 1, Y: 1 } ];
    this.opacityFrames = [ 1 ];
    
    /*
    this.frame = function() {
        
        /////////////////////////////////////////////////
        // Exicute on Render Frame
        /////////////////////////////////////////////////
        //if (mouseCollide == this) hbDebug = true;
        //if (mouseBoxCollide(this)) mouseCollide = this;
        
        this.draw();
    }
    */
    
}

/////////////////////////////////////////////////////////
// Layer Object Functions
/////////////////////////////////////////////////////////

function draw(o) {
    
    //renderPaint(o);
    
    if (o.imageSize.X == null || o.imageSize.Y == null) o.imageSize = { X: o.obImg.width, Y: o.obImg.height };
    //console.log(this.imageSize);

    ////////////////////////////////////////////////
    // Object Draw
    ////////////////////////////////////////////////
    if (!(selectedLayer == o && lmbDown)) {
    //if (0==0){//&& lmbDown)) { //do something like this instead to avoid freezing animations that aren't being changed
        //console.log("HEY");
        //console.log(this.positionFrames[slider]);

        // Position X
        if (o.positionFrames[slider].X != null) {
            o.position.X = o.positionFrames[slider].X;
        }
        // Else use last keyframe
        else {
            for (var i = slider; i > 0; i--) {
                if (o.positionFrames[i].X != null) {
                    o.position.X = o.positionFrames[i].X;
                    i = 0;
                }
            }
        }

        // Position Y
        if (o.positionFrames[slider].Y != null) {
            o.position.Y = o.positionFrames[slider].Y;
        }
        // Else use last keyframe
        else {
            for (var i = slider; i > 0; i--) {
                if (o.positionFrames[i].Y != null) {
                    o.position.Y = o.positionFrames[i].Y;
                    i = 0;
                }
            }
        }
        
        // Scale X
        if (o.scaleFrames[slider].X != null) {
            o.scale.X = o.scaleFrames[slider].X;
        }
        // Else use last keyframe
        else {
            for (var i = slider; i > 0; i--) {
                if (o.scaleFrames[i].X != null) {
                    o.scale.X = o.scaleFrames[i].X;
                    i = 0;
                }
            }
        }

        // Scale Y
        if (o.scaleFrames[slider].Y != null) {
            o.scale.Y = o.scaleFrames[slider].Y;
        }
        // Else use last keyframe
        else {
            for (var i = slider; i > 0; i--) {
                if (o.scaleFrames[i].Y != null) {
                    o.scale.Y = o.scaleFrames[i].Y;
                    i = 0;
                }
            }
        }

        // Opacity
        if(!opacitySliderGrabbed) {
            if (o.opacityFrames[slider] != null) {
                o.opacity = o.opacityFrames[slider];
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
        if (o.rotationFrames[slider] != null) {
            o.rotation = o.rotationFrames[slider];
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
        /*
        // if not animating, go to last keyframe
        if (!animate) {
            for (var i = slider; i > 0; i--) {

                //---------------------------------
                // Position
//                if (o.positionFrames[i].X != null) {
//                    o.position.X = o.positionFrames[i].X;
//                    i = 0;
//                }
//                if (o.positionFrames[i].Y != null) {
//                    o.position.Y = o.positionFrames[i].Y;
//                    i = 0;
//                }

                //---------------------------------
                // Scale


                //---------------------------------
                // Opacity
                if (o.opacityFrames[i] != null) {
                    o.opacity = o.opacityFrames[i];
                    i = 0;
                }
                //else o.opacity = 1;

                //---------------------------------
                // Rotation
                if (o.rotationFrames[i] != null) {
                    o.rotation = o.rotationFrames[i];
                    i = 0;
                }
                //else o.rotation = 0;

            }
        }
        */
    }
    //this.rotation += 10;
    //this.scale.X = 0.25;
    //this.scale.Y = 1;
    //this.opacity = mouseY/canvas.height;

    if (o.isVisible) {

        //set alpha
        if (!availableBlendingModes.includes(o.blendingMode)) o.blendingMode = "normal";
        ctx.globalCompositeOperation = o.blendingMode;
        ctx.globalAlpha = o.opacity;

        //ctx.drawImage(this.obImg, m.X,m.Y, this.scale.X, this.scale.Y);
        if (o.obImg != null) {
            drawImageCenter(
                o.obImg,
                o.position.X + o.imageSize.X/2,
                o.position.Y + o.imageSize.Y/2,
                //m.X,
                //m.Y,
                o.imageSize.X/2,
                o.imageSize.Y/2,
                o.scale.X,
                o.scale.Y,
                o.rotation
            );
        }

        // Paint
        renderPaint(o);

        //reset alpha
        ctx.globalCompositeOperation = "normal";
        ctx.globalAlpha = 1;
    }

    ////////////////////////////////////////////////
    // Object Debug
    ////////////////////////////////////////////////
    if (hbDebug) {
        if (selectedLayer == o) ctx.strokeStyle = "blue";
        else ctx.strokeStyle = "#BBB";
        ctx.lineWidth = 1;
        ctx.lineJoin = "miter";
        ctx.strokeRect(o.position.X, o.position.Y, o.imageSize.X, o.imageSize.Y);
    }
}


// Render paint (two paint modes, Line and Custom)

// Line mode   - just draws lines with size & opacity
// Custom mode - places a chosen image along the path with a user defined spacing, size, & opacity

function renderPaint(o) {//angleOffset) {

    //var af = angleOffset || 0;
    //console.log("drawing paint at: " + af);
    
    // Dry paint
    if (o.dryPaint != null) {
        drawImageCenter(
            o.dryPaint,
            o.position.X + o.imageSize.X/2,
            o.position.Y + o.imageSize.Y/2,
            o.imageSize.X/2,
            o.imageSize.Y/2,
            o.scale.X,
            o.scale.Y,
            o.rotation
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
    if (o.wetPaint != null) {
        
        if (!availableBlendingModes.includes(o.blendingMode)) o.blendingMode = "normal";
        ctx.globalCompositeOperation = o.blendingMode;
        ctx.globalAlpha = brushOpacity;
        
        if (!softBrushMode) {
            //ctx.beginPath();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            //ctx.strokeStyle = o.wetPaint[0].color;
            //ctx.lineWidth = o.wetPaint[0].size;
            //ctx.moveTo(o.wetPaint[0].X, o.wetPaint[0].Y);
            if (o.wetPaint.length > 1) {
                for (var i = 1; i < o.wetPaint.length - 1; i++) {
                    ctx.beginPath();
                    ctx.strokeStyle = o.wetPaint[i].color;
                    ctx.lineWidth = o.wetPaint[i].size;
                    ctx.moveTo(o.wetPaint[i-1].X, o.wetPaint[i-1].Y);

                    // segment
                    ctx.lineTo(o.wetPaint[i].X, o.wetPaint[i].Y);

                    //stroke line
                    ctx.stroke();
                    //+ this.position.Y
                }
            }
            //ctx.stroke();
        }
        // Soft brush & wet paint
        else {
            
            for (var i = 1; i < o.wetPaint.length; i++) {
                ctx.drawImage(
                    customBrushImage,
                    o.wetPaint[i].X - (brushSize/2),
                    o.wetPaint[i].Y - (brushSize/2),
                    brushSize, brushSize
                );
            }
            
            //drawImageCenter(customBrushImage, x, y, cx, cy, scaleX, scaleY, rotation);
            //ctx.drawImage(customBrushImage, 0, 0);
        }
        ctx.globalCompositeOperation = "normal";
        ctx.globalAlpha = 1;
    }
}

function initFrames(o) {
    //seqLength
    for (var i = 1; i < seqLength + 1; i ++) {
        o.positionFrames[i] = { X: null, Y: null };
        o.rotationFrames[i] = null;
        o.scaleFrames[i] = { X: null, Y: null };
        o.opacityFrames[i] = null;
    }
    //console.log("init " + seqLength + " frames");
}
//this.initFrames();



function drag(mX, mY, dX, dY) {
    var out = { X: null, Y: null };
    
    out.X = mX + dX;
    out.Y = mY + dY;
    
    return out;
}

function mouseBoxCollide(obj) {
    
    var box = {
        left: obj.position.X,
        //right: (obj.position.X + obj.imageSize.X),
        right: (obj.position.X + obj.obImg.width),
        top: obj.position.Y,
        //bottom: (obj.position.Y + obj.imageSize.Y)
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

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}