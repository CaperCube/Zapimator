/*

======    ffmpeg.js   ======
https://github.com/muaz-khan/WebRTC-Experiment/tree/master/ffmpeg

====== encoding audio & video ======
https://github.com/muaz-khan/Ffmpeg.js/blob/master/audio-plus-canvas-recording.html

====== encoding audio ======
https://stackoverflow.com/questions/44392027/webrtc-convert-webm-to-mp4-with-ffmpeg-js

*/

function notyet(s) {
    s = s || "do something";
    alert("This feature is in development and has been disabled.\nWhen finished it should " + s + ".");
}

////////////////////////////////////////////////////////
// Canvas and draw variables
////////////////////////////////////////////////////////
var canvas = $("#my_canvas");

//var cWidth = canvas.width = document.body.clientWidth;
//var cHeight = canvas.height = (document.body.clientHeight * 0.8);

var desiredCanvasSize = {x: 400, y: 400}; // 1080, 720

var cWidth = canvas.width = desiredCanvasSize.x;//400;
var cHeight = canvas.height = desiredCanvasSize.y;//400;

var ctx = canvas.getContext("2d");

var bgColor = "#ffffff";

function resizeCanvas(w,h) {
    cWidth = canvas.width = $("#my_canvas").style.width = w;
    cHeight = canvas.height = $("#my_canvas").style.height = h;
    // change css
}

var defaultLayerSize = {x: desiredCanvasSize.x, y: desiredCanvasSize.y};

//var ctx =  new fabric.Canvas('my_canvas');
/*
const app = new PIXI.Application({
    width: 800, height: 600, backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);
*/

////////////////////////////////////////////////////////
// Video variables
// REPLACE WITH https://github.com/spite/ccapture.js
////////////////////////////////////////////////////////

//set up for CCapture.js
//format: webm/gif/png/jpg/ffmpegserver
//var videoFormat = 'webm';
//var fps = 60;
//var capturer = new CCapture( {
//    format: videoFormat,
//	framerate: fps
//	//verbose: true
//} );

// Create a capturer that exports an animated GIF
// Notices you have to specify the path to the gif.worker.js 
//var capturer = new CCapture( { format: 'gif', workersPath: 'js/' } );

// Playback framerate vars
var pbStop = false;
var pbFrameCount = 0;
var pfFpsInterval, pbStartTime, pbNow, pbThen, pbElapsed;

// Encoder vars
var seqLength = 120; //about 2 seconds at 60fps
var frameRate = 60; // in frames per second
var seqTime = 2; //in seconds

var encoder;// = new Whammy.Video(60);
var renderProgress = 0;

function startSave() {
    
    encoder = new Whammy.Video(frameRate);
    slider = 0;
    t = 0;
    isDrawing = false;
    animate = true;
    renderProgress = 0;
    $('#progress').value = 0;
    
    stepFrameRender();
    //capturer.start();
}

function stepFrameRender() {
    renderProgress++;
    $('#progress').value++;
    encoder.add(render());
    
//    var c = render();
//    var dataU = c.canvas.toDataURL('image/webp',0.9);
//    console.log(dataU);
//    encoder.add(dataU);
//    console.log("frame " + renderProgress);
    
    if (renderProgress < seqLength) {
        requestAnimationFrame( stepFrameRender );
    }
    else {
        requestAnimationFrame( finishRender );
        //encoder.compile(false, function(output){});
    }
}

function finishRender() {
    
    var output = encoder.compile();
    //var url = webkitURL.createObjectURL(output);
    var url = (window.webkitURL || window.URL).createObjectURL(output);
    
    $("#rendered_video").src = url;
    $("#rendered_video").style.display = "inline-block";
    
    console.log("render complete");
    
    //reset progress bar
    renderProgress = 0;
    $('#progress').value = 0;
    
    //reset animation to frame 0
    slider = 0;
    slider = 0;
    //t = 0;
    animate = false;
    
    // if render has stopped, restart
    if (!isDrawing) {
        isDrawing = true;
        render();
    }
    
    //change play button
    if (animate) {
        t = slider;
        $("#play_img").src = UI.play[1].src;
    }
    else $("#play_img").src = UI.play[0].src;
}

function clearRenderedVideo() {
    console.log("clear");
    
    //reset progress bar
    renderProgress = 0;
    $('#progress').value = 0;
    
    //delete render buffer
    encoder = new Whammy.Video(60);
    
    //clear video reference
    $("#rendered_video").src = "";
    $("#rendered_video").style.display = "none";
}

////////////////////////////////////////////////////////
// Other variables
////////////////////////////////////////////////////////

var infoPannelOpen = false;

var t = 0; //time delta
var hbDebug = false;

// Mouse vars
var mouseX = 0, mouseY = 0;
var mouseSize = 4;
var selDeltaX = 0, selDeltaY = 0;
var lmbDown = false;
var mouseCollide = null;
var selectedLayer = null;

var opacitySliderGrabbed = false;
var rotationSliderGrabbed = false;

var listSelectedLayer = null;
var listSelectedLayerID = null;

var isDrawing = true;
var animate = false;
var loopMode = true;
var clickRecordMode = false;
var slider = 0;

var layer = [];

////////////////////////////////////////////////////////
// Save / Load
////////////////////////////////////////////////////////

function loadImage(fName) {
    var img = new Image();
    try {
        img.src = fName;
    }
    catch {
        console.log("Unable to load image " + fName);
    }
    return img;
}

// Load image
$('#DOM_imageLoader').onchange = function (evt) {
    var tgt = evt.target || window.event.srcElement,
        files = tgt.files;

    // FileReader support
    if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = () => askForFileName(fr);
        fr.readAsDataURL(files[0]);
    }
    
    // reset the file input to null so you can load more than one of the same image in a row
    $('#DOM_imageLoader').value = null;
}

function askForFileName(fr) {
    var ln = window.prompt("Name your layer", "layer");
    createLayer( loadImage(fr.result), ln );
}

function createLayer(img,ln) {
    
    layer[layer.length] = new Obj(img, ln, 0, 0);
    
    // Init frames
    initFrames(layer[layer.length - 1]);
    
    // Auto select new layer
    listSelectedLayerID = layer.length - 1;
    // Update layers
    updateLayers();
}

function AddBlankLayer(n, sx, sy) {
    var ln = n || window.prompt("Name your layer", "layer");
    var lw = sx || window.prompt("Layer Width", defaultLayerSize.x);
    var lh = sy || window.prompt("Layer Height", defaultLayerSize.y);
    
    var l = new Image(lw, lh);
    l.src = "";
    
    layer[layer.length] = new Obj(l, ln, 0, 0);
    layer[layer.length - 1].imageSize.X = lw;
    layer[layer.length - 1].imageSize.Y = lh;
    
    // Init frames
    initFrames(layer[layer.length - 1]);
    
    // Auto select new layer
    listSelectedLayerID = layer.length - 1;
    // Update Layers
    updateLayers();
}

function duplicateLayer(sel) {
    alert("This is inprogress and doesn't work. I'll need to come back to this and use the .JSON parse dupe meathod probably");
    
    /*
    var newLayer = {};// = Object.assign({}, sel);
    var key;
    
    for (key in sel) {
        newLayer[key] = sel[key];
    }
    */
    
    // Duplicate layer
    var newLayer = JSON.parse(JSON.stringify(sel));
    
    // Convert all images and ink to base64
    if (sel.obImg && sel.obImg.src.startsWith("data:image/")) newLayer.obImg = sel.obImg.src;
    else newLayer.obImg = null;

    if (sel.dryPaint && sel.dryPaint.src.startsWith("data:image/")) newLayer.dryPaint = sel.dryPaint.src;
    else newLayer.dryPaint = null;
    
    /*
    // Convert images to objects
    if (sel.obImg.src) {
        //sel.imageSize.X, sel.imageSize.Y
        im = new Image(sel.imageSize.X, sel.imageSize.Y);
        im.src = sel.obImg.src;
        newLayer.obImg = im;
    }
    else newLayer.obImg = new Image(sel.imageSize.X, sel.imageSize.Y);
    
    if (sel.dryPaint.src) {
        im = new Image(sel.imageSize.X, sel.imageSize.Y);
        im.src = sel.dryPaint.src;
        newLayer.dryPaint = im;
    }
    else newLayer.dryPaint = new Image(sel.imageSize.X, sel.imageSize.Y);
    */
    
    
    
    
    
    // Change name and add layer
    newLayer.name += " copy";
    layer.push(newLayer);
    
    // Auto select new layer
    listSelectedLayerID = layer.length - 1;
    updateLayers();
    
    /*
    console.log(newLayer.obImg.width);
    console.log(newLayer.obImg.height);
    
    console.log(newLayer.dryPaint.width);
    console.log(newLayer.dryPaint.height);
    
    console.log(newLayer.imageSize.X);
    console.log(newLayer.imageSize.Y);
    
    console.log(sel);
    console.log(newLayer);
    */
}

////////////////////////////////////////////////////////
// Event Listeners
////////////////////////////////////////////////////////

var shiftDown = false;
var ctrlDown = false;

window.addEventListener("keyup", e => {
    // 16 = shift
    if (e.keyCode === 16) {
        shiftDown = false;
        // console.log(shiftDown);
    }
    
    // 17 = control
    if (e.keyCode === 17) {
        ctrlDown = false;
        // console.log(ctrlDown);
    }
});

window.addEventListener("keydown", e => {
    // 16 = shift
    if (e.keyCode === 16) {
        shiftDown = true;
        // console.log(shiftDown);
    }
    
    // 17 = control
    if (e.keyCode === 17) {
        ctrlDown = true;
        // console.log(ctrlDown);
    }
    
    // 90 = z
    if (e.keyCode === 90) {
        if (ctrlDown) {
            if (layer[listSelectedLayerID]) {
                layer[listSelectedLayerID].dryPaint = layer[listSelectedLayerID].pastPaint[1];
                layer[listSelectedLayerID].pastPaint[1] = layer[listSelectedLayerID].pastPaint[0];
                layer[listSelectedLayerID].pastPaint[0] = layer[listSelectedLayerID].dryPaint;
                //alert("change this to save a copy of all the layers after every change, not just the ink.");
            }
        }
        //console.log(layer[listSelectedLayerID].obImg.src);
    }
    
    // 79 = o
    if (e.keyCode === 79) {
        if (layer[listSelectedLayerID]) {
            console.log(layer[listSelectedLayerID].opacityFrames);
        }
    }
    
    // 80 = p
    if (e.keyCode === 80) {
        animateToggle();
    }
    
    
    
    function frameStep(v) {
        var vl = parseFloat(v);

        if ((slider + vl) <= seqLength &&
            (slider + vl) >= 0) {
            slider += vl;
            $("#DOM_frameReadout").innerHTML = slider;
            $("#slider_input").value = slider;

            updateLayerProps(listSelectedLayerID);
        }
    }
    
    
    
    // 188 = ,
    if (e.keyCode === 188) {
        if (shiftDown) {
            slider = 0;
            $("#DOM_frameReadout").innerHTML = slider;
            $("#slider_input").value = slider;

            updateLayerProps(listSelectedLayerID);
        }
        else frameStep(-1);
    }
    
    // 190 = .
    if (e.keyCode === 190) {
        if (shiftDown) {
            slider = seqLength;
            $("#DOM_frameReadout").innerHTML = slider;
            $("#slider_input").value = slider;

            updateLayerProps(listSelectedLayerID);
        }
        else frameStep(1);
    }
    
    // 219 = [
    if (e.keyCode === 219) {
        if (brushSize > 1) {
            brushSize -= 1;
            $("#brush_slider").value = brushSize;
        }
    }
    
    // 221 = ]
    if (e.keyCode === 221) {
        if (brushSize < 100) {
            brushSize += 1;
            $("#brush_slider").value = brushSize;
        }
    }
    
    // 189 = -
    if (e.keyCode === 189) {
        if (brushOpacity > 0) {
            brushOpacity -= 0.01;
            $("#opac_pick").value = brushOpacity;
        }
    }
    
    // 187 = +
    if (e.keyCode === 187) {
        if (brushOpacity < 1) {
            brushOpacity += 0.01;
            $("#opac_pick").value = brushOpacity;
        }
    }
    
    // 86 = v
    if (e.keyCode === 86) {
        paintMode = eraseMode = false;
        $("#paint_img").src = UI.paintMode[0].src;
        $("#erase_img").src = UI.eraseMode[0].src;
    }
    
    // 66 = b
    if (e.keyCode === 66) paintToggle();
    
    // 69 = e
    if (e.keyCode === 69) eraseToggle();
    
    // 18 = alt
    if (e.keyCode === 18) {
        var pick = sampleColor();
        if (paintMode || eraseMode) {
            paintColor = pick;
            $("#color_pick").value = pick;
            recolorCustomBrush(customBrushImage);
        }
        else changeBGColor(pick);
    }
});

//refresh the canvas on resize
window.addEventListener("resize", resizeScreen);
function resizeScreen() {
    resizeCanvas(desiredCanvasSize.x, desiredCanvasSize.y);
    //cWidth = canvas.width = 400;
    //cHeight = canvas.height = 400;
}

//////////////////////////////////////////////////////
// Mouse & Touch Events
//////////////////////////////////////////////////////
/*
window.addEventListener("mousemove", mouseMove);
function mouseMove(e) {
//    mouseX = e.clientX;
//    mouseY = e.clientY;
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // Paint mode
    placePaint(layer[listSelectedLayerID], mouseX, mouseY);
    
    // Erase mode
    erasePixels(layer[listSelectedLayerID], mouseX, mouseY);
}
*/
//window.addEventListener("pointermove", function(e){changePressure(e);mouseMove(e);});
window.addEventListener("mousemove", mouseMove);
function mouseMove(e) {
//    mouseX = e.clientX;
//    mouseY = e.clientY;
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // Paint mode
    placePaint(layer[listSelectedLayerID], mouseX, mouseY);
    
    // Erase mode
    erasePixels(layer[listSelectedLayerID], mouseX, mouseY);
}

function mouseInCanvas() {
    var check = false;
    if (mouseX > 0 &&
       mouseX < cWidth &&
       mouseY > 0 &&
       mouseY < cHeight) {
        check = true;
        //console.log("mouse is in canvas");
    }
    return check;
}

window.addEventListener("mousedown", mouseDown);
function mouseDown(e) {
    lmbDown = true;
    
    //if (mouseCollide != null) {
    if (mouseInCanvas()) {
        if (mouseCollide != null && !paintMode && !eraseMode) {
            selectedLayer = mouseCollide;
    //        selDeltaX = mouseCollide.position.X - mouseX;
    //        selDeltaY = mouseCollide.position.Y - mouseY;
            selDeltaX = selectedLayer.position.X - mouseX;
            selDeltaY = selectedLayer.position.Y - mouseY;

            // Select layer in list
            listSelectedLayerID = layer.indexOf(selectedLayer);
            listSelectedLayer = layer[listSelectedLayerID];
            $("#DOM_layers").value = listSelectedLayerID;
            $("#DOM_layer" + listSelectedLayerID).selected = true;
            updateLayerProps(listSelectedLayerID);

            // if click-to-record is on, start playing animation
            if (clickRecordMode && layer[listSelectedLayerID].positionAnim) {
                if (!animate) animateToggle();
            }
        }
        
        // Paint mode
        startPaint(layer[listSelectedLayerID], mouseX, mouseY);
        
        // Erase mode
        startErase(layer[listSelectedLayerID], mouseX, mouseY);        
        //if (eraseMode) isErasing = true;
    }
}

window.addEventListener("mouseup", mouseUp);
function mouseUp(e) {
    lmbDown = false;
    
//    var rect = canvas.getBoundingClientRect();
//    if ( e.clientX >= rect.left ||
//         e.clientY >= rect.top ||
//         e.clientX <= rect.right ||
//         e.clientY <= rect.bottom ) {
//        selectedLayer = null;
//    }
    selectedLayer = null;
    opacitySliderGrabbed = false;
    rotationSliderGrabbed = false;
    
    // Paint mode
    dryPaint(layer[listSelectedLayerID]);
    
    // Erase mode
    clearEraserLines(layer[listSelectedLayerID]);
}

//////////////////////////////////////////////////////
// Pen Events
//////////////////////////////////////////////////////

window.addEventListener('pointerup', mouseUp, false);
window.addEventListener('pointermove', pointerMove, false);
window.addEventListener('pointerup', mouseUp, false);

function pointerMove (_e, _el) {  
    /*
    //var xpos, ypos;
    if (typeof _e.offsetX === 'undefined') { // ff hack
        // dans ce cas, jQuery facilite l'appel d'offset
        mouseX = _e.pageX - $(_el).offset().left; 
        mouseY = _e.pageY - $(_el).offset().top;
    }
    else {
        mouseX = _e.offsetX;
        mouseY = _e.offsetY;
    }
    return { x: xpos, y: ypos };
    */
    
    var rect = canvas.getBoundingClientRect();
    
    if (typeof _e.offsetX === 'undefined') { // ff hack
        // dans ce cas, jQuery facilite l'appel d'offset
        mouseX = _e.pageX - $(_el).offset().left - rect.left; 
        mouseY = _e.pageY - $(_el).offset().top - rect.top;
    }
    else {
        mouseX = _e.offsetX;
        mouseY = _e.offsetY;
    }
    return { x: mouseX, y: mouseY };
    
    
    
    
    //mouseX = e.clientX - rect.left;
    //mouseY = e.clientY - rect.top;
    
    // Paint mode
    placePaint(layer[listSelectedLayerID], mouseX, mouseY);
    
    // Erase mode
    erasePixels(layer[listSelectedLayerID], mouseX, mouseY);
}

//////////////////////////////////////////////////////
// DOM Update functions
//////////////////////////////////////////////////////
function rname(e) {
    renameLayer(listSelectedLayerID);
}

function updateLayers() {
    
    $("#DOM_layers").innerHTML = "";
    
    for (var i = layer.length - 1; i > -1; i--) {
        
        var ln;
        var lnEnd;
        
        //if layer is locked, add " ■" to the end
        if (layer[i].locked) lnEnd = " ■";
        else lnEnd = " □";
        //if layer is hidden, add " ●" to the end
        if (layer[i].isVisible) lnEnd += " ●";
        else lnEnd += " ○";
        
        ln = layer[i].name + lnEnd;
        
        var op = document.createElement("option");
        //op.value = "layer" + i;
        op.setAttribute("value", ("layer" + i));
        op.setAttribute("id", ("DOM_layer" + i));
        op.innerHTML = ln;
        op.addEventListener("dblclick", rname);
        
        // append row
        $("#DOM_layers").appendChild(op);
    }
            
    //Change icons on buttons
    if (layer[listSelectedLayerID]) {
        if (layer[listSelectedLayerID].locked) $("#layerlock_img").src = UI.layerLock[1].src;
        else $("#layerlock_img").src = UI.layerLock[0].src;

        if (layer[listSelectedLayerID].isVisible) $("#layerhide_img").src = UI.layerVis[0].src;
        else $("#layerhide_img").src = UI.layerVis[1].src;
    }
    
    if ((listSelectedLayerID != null) && layer[listSelectedLayerID]) {
        $("#DOM_layers").value = listSelectedLayerID;
        $("#DOM_layer" + listSelectedLayerID).selected = true;
    }
}

function selectLayer() {
    if ($("#DOM_layers").value != null) {
        listSelectedLayerID = $("#DOM_layers").value.substring(5,$("#DOM_layers").value.length).valueOf();
    }
    
    //console.log(listSelectedLayerID);
    
    listSelectedLayer = layer[listSelectedLayerID];
    
    // update layer props & button icons
    updateLayerProps(listSelectedLayerID);
    console.log(listSelectedLayer.name);
}

function moveLayer(v) {
    if (listSelectedLayerID != null) {
        
        var a = parseFloat(listSelectedLayerID);
        var b = a + parseFloat(v);
        
        if ( b < layer.length &&
             b > -1)
        {
            var tempLayer = layer[a];
            layer[a] = layer[b];
            layer[b] = tempLayer;
            
            listSelectedLayerID = b;
            
            // updat list
            updateLayers();
            $("#DOM_layers").value = listSelectedLayerID;
            $("#DOM_layer" + listSelectedLayerID).selected = true;
        }
    }
}

function lockLayerToggle(s) {
    if (s != null) {
        layer[s].locked = !layer[s].locked;
        console.log(layer[s].locked);
    }
    
    updateLayers();
}

function hideLayerToggle(s) {
    //this.isVisible
    if (s != null) {
        layer[s].isVisible = !layer[s].isVisible;
        console.log(layer[s].isVisible);
    }
    
    updateLayers();
}

// Clear keyframes //////////////////////////////////////////////
function clearLayerPos(s) {
    if (s != null && !layer[s].locked) {
        for (var i = 0; i < seqLength + 1; i ++) {
            layer[s].positionFrames[i] = { X: null, Y: null };
        }
        // Set first frame to the current frame's position
        layer[s].positionFrames[0] = { X: layer[s].position.X, Y: layer[s].position.Y };
        $("#DOM_layerposx").value = layer[s].positionFrames[0].X;
        $("#DOM_layerposy").value = layer[s].positionFrames[0].Y;
    }
}

function clearLayerScale(s) {
    if (s != null && !layer[s].locked) {
        for (var i = 0; i < seqLength + 1; i ++) {
            layer[s].scaleFrames[i] = { X: null, Y: null };
        }
        // Set first frame to the current frame's scale
        layer[s].scaleFrames[0] = { X: layer[s].scale.X, Y: layer[s].scale.Y };
        $("#DOM_layerscalex").value = layer[s].scaleFrames[0].X;
        $("#DOM_layerscaley").value = layer[s].scaleFrames[0].Y;
    }
}

function clearLayerRotation(s) {
    if (s != null && !layer[s].locked) {
        for (var i = 0; i < seqLength + 1; i ++) {
            layer[s].rotationFrames[i] = null;
        }
        // Set first frame to the current frame's rotation
        layer[s].rotationFrames[0] = layer[s].rotation;
        $("#DOM_layerrotation").value = layer[s].rotationFrames[0];
    }
}

function clearLayerOpacity(s) {
    if (s != null && !layer[s].locked) {
        for (var i = 0; i < seqLength + 1; i ++) {
            layer[s].opacityFrames[i] = null;
        }
        // Set first frame to the current frame's opacity
        layer[s].opacityFrames[0] = layer[s].opacity;
        $("#DOM_layeropacity").value = layer[s].opacityFrames[0];
    }
}

function toggleLayerPosAnim(s) {
    if (layer[s]) {
        if (!layer[s].locked) { 
            layer[s].positionAnim = !layer[s].positionAnim;
            // If turning off, clear frames
            if (!layer[s].positionAnim) clearLayerPos(s);
            // Update layer props
            updateLayerProps(s);
        }
    }
}

function toggleLayerScaleAnim(s) {
    if (layer[s]) {
        if (!layer[s].locked) { 
            layer[s].scaleAnim = !layer[s].scaleAnim;
            // If turning off, clear frames
            if (!layer[s].scaleAnim) clearLayerScale(s);
            // Update layer props
            updateLayerProps(s);
        }
    }
}

function toggleLayerRotAnim(s) {
    if (layer[s]) {
        if (!layer[s].locked) { 
            layer[s].rotationAnim = !layer[s].rotationAnim;
            // If turning off, clear frames
            if (!layer[s].rotationAnim) clearLayerRotation(s);
            // Update layer props
            updateLayerProps(s);
        }
    }
}

function toggleLayerOpacityAnim(s) {
    if (layer[s]) {
        if (!layer[s].locked) { 
            layer[s].opacityAnim = !layer[s].opacityAnim;
            // If turning off, clear frames
            if (!layer[s].opacityAnim) clearLayerOpacity(s);
            // Update layer props
            updateLayerProps(s);
        }
    }
}

// update layer inputs
function updateLayerProps(l) {
    if (layer[l]) {
        $("#DOM_layerposx").value = layer[l].position.X;
        $("#DOM_layerposy").value = layer[l].position.Y;

        $("#DOM_layerscalex").value = layer[l].scale.X;
        $("#DOM_layerscaley").value = layer[l].scale.Y;
        
        //if(!opacitySliderGrabbed)
        $("#DOM_layeropacity").value = layer[l].opacity;

        $("#DOM_layerrotation").value = layer[l].rotation;
        
        // Lock button icon
        if (layer[listSelectedLayerID].locked) $("#layerlock_img").src = UI.layerLock[1].src;
        else $("#layerlock_img").src = UI.layerLock[0].src;

        // Hide button icon
        if (layer[listSelectedLayerID].isVisible) $("#layerhide_img").src = UI.layerVis[0].src;
        else $("#layerhide_img").src = UI.layerVis[1].src;
        
        // Position button icon
        if (layer[listSelectedLayerID].positionAnim) $("#layerposition_img").src = UI.layerMove[1].src;
        else $("#layerposition_img").src = UI.layerMove[0].src;
        
        // Scale button icon
        if (layer[listSelectedLayerID].scaleAnim) $("#layerscale_img").src = UI.layerScale[1].src;
        else $("#layerscale_img").src = UI.layerScale[0].src;
        
        // Rotation button icon
        if (layer[listSelectedLayerID].rotationAnim) $("#layerrotation_img").src = UI.layerRotate[1].src;
        else $("#layerrotation_img").src = UI.layerRotate[0].src;
        
        // Opacity button icon
        if (layer[listSelectedLayerID].opacityAnim) $("#layeropacity_img").src = UI.layerOpacity[1].src;
        else $("#layeropacity_img").src = UI.layerOpacity[0].src;
        
        // Blending Mode
        $("#DOM_blendMode").value = layer[listSelectedLayerID].blendingMode;
        
        // if locked, turn off all inputs
        /*
        if (layer[listSelectedLayerID].locked) {
            $("#DOM_layerposx").readOnly = true;
            $("#DOM_layerposy").readOnly = true;
            $("#DOM_layerscalex").readOnly = true;
            $("#DOM_layerscaley").readOnly = true;
            $("#DOM_layerrotation").readOnly = true;
            $("#DOM_layeropacity").readOnly = true;
        }
        else {
            $("#DOM_layerposx").readOnly = false;
            $("#DOM_layerposy").readOnly = false;
            $("#DOM_layerscalex").readOnly = false;
            $("#DOM_layerscaley").readOnly = false;
            $("#DOM_layerrotation").readOnly = false;
            $("#DOM_layeropacity").readOnly = false;
        }
        */
    }
}

function changeLayerPosition(s, d, val) {
    if (layer[s]) { 
        if (!layer[s].locked) { 
            layer[s].position[d] = val;

            // if rotation recording mode is on, record to curent frame
            // else record only to first frame
            if (layer[s].positionAnim) layer[s].positionFrames[slider][d] = val;
            else layer[s].positionFrames[0][d] = val;

            // If click-to-record, start playback
            if (clickRecordMode && layer[s].positionAnim) {
                if (!animate) animateToggle();
            }
        }
    }
}

function changeLayerScale(s, d, val) {
    if (layer[s]) { 
        if (!layer[s].locked) { 
            layer[s].scale[d] = val;

            // if rotation recording mode is on, record to curent frame
            // else record only to first frame
            if (layer[s].scaleAnim)
                layer[s].scaleFrames[slider][d] = val;
            else layer[s].scaleFrames[0][d] = val;

            // If click-to-record, start playback
            if (clickRecordMode && layer[s].scaleAnim) {
                if (!animate) animateToggle();
            }
        }
    }
}

function changeLayerRotation(s, val) {
    if (layer[s]) { 
        if (!layer[s].locked) { 
            layer[s].rotation = val;

            // if rotation recording mode is on, record to curent frame
            // else record only to first frame
            if (layer[s].rotationAnim)
                layer[s].rotationFrames[slider] = val;
            else layer[s].rotationFrames[0] = val;

            // If click-to-record, start playback
            if (clickRecordMode && layer[s].rotationAnim) {
                if (!animate) animateToggle();
            }
        }
    }
}

function changeLayerOpacity(s, val) {
    if (layer[s]) { 
        if (!layer[s].locked) { 
            layer[s].opacity = val;

            // if opacity recording mode is on, record to curent frame
            // else record only to first frame
            if (layer[s].opacityAnim)
                layer[s].opacityFrames[slider] = val;
            else layer[s].opacityFrames[0] = val;

            // If click-to-record, start playback
            if (clickRecordMode && layer[s].opacityAnim) {
                if (!animate) animateToggle();
            }
        }
        // update layer dom
        updateLayerProps(s);
    }
}

function ChangeBlendingMode(v) {
    if (!layer[listSelectedLayerID].locked) layer[listSelectedLayerID].blendingMode = v;
}

function deleteLayer(s) {
    console.log(s);
    if (layer[s] != null) {
        layer.splice(s, 1);
        updateLayers();
    }
}

// Update number of frames in the animation
function changeFrameCount(o) {
    seqLength = o;
    $('#slider_input').max = seqLength;
    $('#progress').max = seqLength;
    
    for (var i = 0; i < layer.length; i++) {
        //layer[i].initFrames();
        initFrames(layer[i]);
    }
}

function frameStep(v) {
    var vl = parseFloat(v);
    
    if ((slider + vl) <= seqLength &&
        (slider + vl) >= 0) {
        slider += vl;
        $("#DOM_frameReadout").innerHTML = slider;
        $("#slider_input").value = slider;
        
        updateLayerProps(listSelectedLayerID);
    }
}

function renameLayer(s) {
    if (layer[s]) {
        var ln = window.prompt("Rename layer", layer[s].name);
        layer[s].name = ln;
        updateLayers();
    }
}

function clickRecordToggle() {
    clickRecordMode = !clickRecordMode;
    
    if (clickRecordMode) $("#clickrecord_img").src = UI.clickRecord[1].src;
    else $("#clickrecord_img").src = UI.clickRecord[0].src;
}

function paintToggle() {
    paintMode = !paintMode;
    
    if (paintMode) {
        $("#paint_img").src = UI.paintMode[1].src;
        
        eraseMode = false;
        $("#erase_img").src = UI.eraseMode[0].src;
    }
    else $("#paint_img").src = UI.paintMode[0].src;
}

function eraseToggle() {
    eraseMode = !eraseMode;
    
    if (eraseMode) {
        $("#erase_img").src = UI.eraseMode[1].src;
        
        paintMode = false;
        $("#paint_img").src = UI.paintMode[0].src;
    }
    else $("#erase_img").src = UI.eraseMode[0].src;
}

/////////////////////////////////////////////////////////////
// Other Functions
/////////////////////////////////////////////////////////////

function animateToggle() {
    // if render has stopped, restart
    if (!isDrawing) {
        isDrawing = true;
        render();
    }
    
    // if at the end of the animation and playing is stopped
    if (slider >= (seqLength) && !animate) {
        //rest the playback and start playing
        t = 0;
        slider = 0;
        $("#slider_input").value = 0;
        
        animate = true;
    }
    else animate = !animate;
    
    //change play button
    if (animate) {
        t = slider;
        $("#play_img").src = UI.play[1].src;
        
        // Reset framerate vars
        pfFpsInterval = 1000 / frameRate;
        pbThen = Date.now();
        pbStartTime = pbThen;
    }
    else $("#play_img").src = UI.play[0].src;
}

function loopToggle() {
    loopMode = !loopMode;
    if (loopMode) {
        //$("#loop_button").innerHTML = "Loop";
        $("#loop_img").src = UI.loop[1].src;
    }
    else $("#loop_img").src = UI.loop[0].src;
}

function drawToggle() {
    isDrawing = !isDrawing;
    if (isDrawing) {
        t = 0;
        slider = 0;
        render();
    }
}

function debugToggle() {
    hbDebug = !hbDebug;
}

function changeSlider() {
    animate = false;
    slider = ($("#slider_input").value/1);
}

function changeBGColor(o) {
    bgColor = o;
    $("#bgcolor_pick").value = o;
}

$("#slider_input").oninput = changeSlider;

/////////////////////////////////////////////////////////////
// Init
/////////////////////////////////////////////////////////////
var exampleImage = $("#face_example");
var fab;
function init() {
    
    resizeCanvas(desiredCanvasSize.x,desiredCanvasSize.y);
    
    $('#slider_input').max = seqLength;
    $('#progress').max = seqLength;
    
    /*
    fab = new fabric.Image(exampleImage, {
        left: 100,
        top: 100,
        angle: 30,
        opacity: 0.85
    });
    ctx.add(fab);
    */
    
//    layer[0] = new Obj(loadImage("img/files.png"), "files", -50, 100);
//    layer[1] = new Obj(loadImage("img/trash.png"), "trash", 200, 200);
//    layer[2] = new Obj(loadImage("img/trash.png"), "trash2", 300, 200);
    
    // init layer
    AddBlankLayer("Background", defaultLayerSize.x, defaultLayerSize.y);
    updateLayers();
}

/////////////////////////////////////////////////////////////
// Render
/////////////////////////////////////////////////////////////

function render() {
    //if (animate) t++;
    //t++;
    //if (t > seqLength) {
    //    t = 0;
    //}
    
    $("#DOM_frameReadout").innerHTML = slider;
    
    if (animate) {
        
        ////////////////////////////////////////
        // Only change frame on frameRate intervals
        ////////////////////////////////////////
        pbNow = Date.now();
        pbElapsed = pbNow - pbThen;
        
        if (pbElapsed > pfFpsInterval) {
            
            pbThen = pbNow - (pbElapsed % pfFpsInterval);
            
            t++
            if (t > seqLength) t = 0;
        }
        ////////////////////////////////////////
        ////////////////////////////////////////
        
        slider = t;
        $("#slider_input").value = t;
        //updateLayerProps(listSelectedLayerID);
        
        if (slider >= (seqLength)) {
            if (loopMode) {
                slider = 0;
                $("#slider_input").value = 0;
                animate = true;
            }
            // if at end & loop is off, stop & turn off clickRecord
            else if (animate) {
                animateToggle();
                if (clickRecordMode) clickRecordToggle();
                
            }
        }
        
        //console.log ("T Val: " + t + "\n Slider: " + $("#slider_input").value + "\n SeqLeng: " + seqLength);
    }
    
    //if (slider >= (seqLength - 1))
    //console.log("timer: " + t);
    
    /////////////////////////////////////////////////////////
    // Clear & Draw
    /////////////////////////////////////////////////////////
    //ctx.clearRect(0, 0, cWidth, cHeight);
    // Whammy.js cannot export webM with transparent BG :(
    //ctx.fillStyle = "#333638";
    ctx.fillStyle = bgColor;
    ctx.fillRect(0,0,cWidth,cHeight);
    
    var colTagged = false;
    for (var i = 0; i < layer.length; i++) {
        // Check mouse collisions
        if (mouseBoxCollide(layer[i])) {
            mouseCollide = layer[i];
            colTagged = true;
        }
        // Draw
        //layer[i].frame();
        draw(layer[i]);
    }
    
    // if no collisions, reset mouseCollide
    if (!colTagged) mouseCollide = null;
    
    if (lmbDown) {
        if (selectedLayer != null){//&& (mouseY < cHeight)) {
            
            //move
            selectedLayer.position = drag(mouseX, mouseY, selDeltaX, selDeltaY);
            
            // If positionRecord mode is on, record to curent frame
            if (selectedLayer.positionAnim)
                selectedLayer.positionFrames[slider] = drag(mouseX, mouseY, selDeltaX, selDeltaY);
                //layer[s].positionFrames[slider][d] = val;
            //else layer[s].positionFrames[0][d] = val;
            else selectedLayer.positionFrames[0] = drag(mouseX, mouseY, selDeltaX, selDeltaY);
            
            // update layer props
            //updateLayerProps(listSelectedLayerID);
        }
        /*
        if (mouseCollide != null ){//&& (mouseY < cHeight)) {
            //move
            mouseCollide.position = drag(mouseX, mouseY, selDeltaX, selDeltaY);
            //set
            mouseCollide.positionFrames[slider] = drag(mouseX, mouseY, selDeltaX, selDeltaY);
        }
        */
    }
    else {
        //mouseCollide = null;
    }
    
    // Erase paint
    drawEraserPaint();
    
    // Brush Preview
    if (eraseMode || paintMode) {
        ctx.strokeStyle = "#bbb";
        //if (eraseMode) ctx.strokeStyle = bgColor;
        //else ctx.strokeStyle = paintColor;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, brushSize/2, 0, 2 * Math.PI);
        ctx.stroke();
    }
    /////////////////////////////////////////////////////////
    // Debug
    /////////////////////////////////////////////////////////
    if (hbDebug) {
        
        // Mouse Debug
        ctx.strokeStyle = "#bbb";
        ctx.lineWidth = 1;
        ctx.lineJoin = "miter";
        ctx.beginPath();
        ctx.moveTo(mouseX, 0);
        ctx.lineTo(mouseX, cHeight);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, mouseY);
        ctx.lineTo(cWidth, mouseY);
        ctx.stroke();
        
        // Canvas Center
        ctx.strokeStyle = "#ddd";
        ctx.beginPath();
        ctx.moveTo(0, cHeight/2);
        ctx.lineTo(cWidth, cHeight/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cWidth/2, 0);
        ctx.lineTo(cWidth/2, cHeight);
        ctx.stroke();
        
        if (lmbDown) {
            ctx.strokeStyle = "green";
        }
        else if (mouseCollide != null) {
            ctx.strokeStyle = "#0000FF";
        }
        else {
            ctx.strokeStyle = "red";
        }
        ctx.strokeRect(mouseX - mouseSize, mouseY - mouseSize, mouseSize*2, mouseSize*2);
        ctx.strokeRect(mouseX, mouseY, 1, 1);
        
        ctx.font = "10px Arial";
        //ctx.fillStyle = "#bbb";
        ctx.fillStyle = "#99bbdd";
        
        ctx.fillText("X: " + Math.floor(mouseX), 5, cHeight - 35);
        ctx.fillText("Y: " + Math.floor(mouseY), 5, cHeight - 25);
        ctx.fillText("lmbDown: " + lmbDown, 5, cHeight - 15);
        
        var lName;
        if (selectedLayer != null) lName = selectedLayer.name;
        else lName = "null";
        ctx.fillText("Selected Layer: " + lName, 5, cHeight - 5);
        //console.log(selectedLayer);
        
        // Animation Debug
        ctx.fillText("animate: " + animate, 5, cHeight - 65);
        ctx.fillText("Frame: " + (slider + 1), 5, cHeight - 55);
        
    }
   
    if (layer[listSelectedLayerID]) updateLayerProps(listSelectedLayerID);
    /////////////////////////////////////////////////////////
    // Request function loop
    /////////////////////////////////////////////////////////
    if (isDrawing) {
        requestAnimationFrame( render );
    }
    
    return ctx;
}

init();
render();