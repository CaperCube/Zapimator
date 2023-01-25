//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
// Save / Load
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
/*
function imgToB64(o, callback) {
    
//    var img = new Image();
//    img.crossOrigin = 'Anonymous';
//    img.onload = function() {
    //img.onChange = function() {
        var tempCanvas = document.createElement('canvas');
        var tempCtx = tempCanvas.getContext('2d');

        //tempCanvas.style.visibility = "none";
        tempCanvas.height = o.Height;
        tempCanvas.Width = o.Width;
        tempCtx.drawImage(o, 0, 0);

        var uri = tempCanvas.toDataURL('img/png');
        //var b64 = uri.replace(/^data:image.+;base64,/, '');

        o = uri;
        //console.log("Image converted to b64");
        //console.log(uri);
        
        //console.log(b64);
        callback(uri);
        //return uri;
        tempCanvas = null;
    //}
    //img.src = o.src;
}
*/
function ConvertLayerImages(lyr) {
    /*
    if (lyr.obImg) imgToB64(lyr.obImg, function(uri){
        console.log("Image uri: \n" + uri);
    });
    if (lyr.dryPaint) imgToB64(lyr.dryPaint, function(uri){
        console.log("Ink uri: \n" + uri);
    });
    */
    
    var newLayer = JSON.parse(JSON.stringify(lyr));
    
    // Convert all images and ink to base64
    // Image
    if (lyr.obImg) newLayer.obImg = lyr.obImg.src;
    else newLayer.obImg = null;

    // Ink
    if (lyr.dryPaint) newLayer.dryPaint = lyr.dryPaint.src;
    else newLayer.dryPaint = null;
        
    return newLayer;
}

function SaveProject() {
    
    var newLayer = JSON.parse(JSON.stringify(layer));
    
    // Convert all images and ink to base64
    for (var i = 0; i < newLayer.length; i++) {
        //ConvertLayerImages(layer[i]);
        if (layer[i].obImg && layer[i].obImg.src.startsWith("data:image/")) newLayer[i].obImg = layer[i].obImg.src;
        else newLayer[i].obImg = null;
        
        //console.log("saved img:\n" + newLayer[i].name + "\n" + newLayer[i].obImg);
        
        if (layer[i].dryPaint && layer[i].dryPaint.src.startsWith("data:image/")) newLayer[i].dryPaint = layer[i].dryPaint.src;
        else newLayer[i].dryPaint = null;
        
        //console.log("saved ink:\n" + newLayer[i].name + "\n" + newLayer[i].dryPaint);
    }
    
    //console.log(layer);
    //console.log(newLayer);
    
    // Save project settings in object
    var settings = {
        file_bgColor: bgColor,
        //file_brushColor: brushColor,
        file_frameRate: frameRate,
        file_seqLength: seqLength,
        file_layers: newLayer
    };
    
    var d = JSON.stringify(settings);
    var f = new Blob([d], {type: "text/plain"});
    
    //Get Song name
    var fName = window.prompt("Name your project", "project");
    
    downloadFile(f, (fName + ".json"));
    
    //console.log(d);
}

function LoadProject() {
    //alert("This is inprogress and doesn't work. .JSON does not save methods, so I'll need to move all functions outside of the layer object.");
    $("#projectLoader").click();
}

function readFile(callback) {
    //var fileInput = document.querySelector('input[type="file"]');
    var fileInput = $("#projectLoader");
    var file = fileInput.files.item(0);
    var reader = new FileReader();

    reader.onload = function() {
        callback(reader.result);
    }

    reader.readAsText(file);
}

function ParseProject(data) {
    
    // Parse JSON data and create layers
    var newProject = JSON.parse(data);
    
    changeBGColor(newProject.file_bgColor);
    changeFrameCount(newProject.file_seqLength);
    frameRate = newProject.file_frameRate;
    layer = newProject.file_layers;
    
    // Convert images to objects
    for (var i = 0; i < layer.length; i++) {
        //if (layer[i].obImg) {
        if (layer[i].obImg && !layer[i].obImg.includes("http://")) {
            im = new Image(layer[i].imageSize.X, layer[i].imageSize.Y);
            im.src = layer[i].obImg;
            layer[i].obImg = im;
            
            //console.log("loaded img:\n" + layer[i].obImg.src);
        }
        else layer[i].obImg = new Image(layer[i].imageSize.X, layer[i].imageSize.Y);
        
        //if (layer[i].dryPaint) {
        if (layer[i].dryPaint && !layer[i].dryPaint.includes("http://")) {
            im = new Image(layer[i].imageSize.X, layer[i].imageSize.Y);
            im.src = layer[i].dryPaint;
            layer[i].dryPaint = im;
            
            //console.log("loaded ink:\n" + layer[i].dryPaint.src);
        }
        else layer[i].dryPaint = new Image(layer[i].imageSize.X, layer[i].imageSize.Y);
    }
    
    //update layers
    updateLayers();
}

function onLoadProject(e) {
    //var reader = new FileReader();
    
    //var f = $('#file-input').files[0];
    readFile(ParseProject);
}

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
// Download
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

function downloadFile(blobObject, fileName) {
  // Create an invisible A element
  const a = document.createElement("a");
  a.style.display = "none";
  document.body.appendChild(a);

  // Set the HREF to a Blob representation of the data to be downloaded
  a.href = window.URL.createObjectURL(blobObject);

  // Use download attribute to set set desired file name
  a.setAttribute("download", fileName);

  // Trigger the download by simulating click
  a.click();

  // Cleanup
  window.URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
}