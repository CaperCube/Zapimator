// Set all img elements to non-draggable
var DOMimgs = document.getElementsByTagName("img");
for(var i = 0; i < DOMimgs.length; i++){
   DOMimgs[i].setAttribute("draggable", false);
}

/////////////////////////////////////////////////////////////
// UI images
/////////////////////////////////////////////////////////////
function nImage(s) {
    var tempImage = new Image();
    tempImage.src = s;
    return tempImage;
}

var UI = {
    // Timeline
    play: [
        nImage("img/ui/Play.svg"),
        nImage("img/ui/Pause.svg")
    ],
    record: [
        nImage("img/ui/Record_Off.svg"),
        nImage("img/ui/Record_On.svg")
    ],
    loop: [
        nImage("img/ui/Loop_Off.svg"),
        nImage("img/ui/Loop_On.svg")
    ],
    clickRecord: [
        nImage("img/ui/ClickRecord_Off.svg"),
        nImage("img/ui/ClickRecord_On.svg")
    ],
    frameStep: [
        nImage("img/ui/BackFrame.svg"),
        nImage("img/ui/NextFrame.svg")
    ],
    paintMode: [
        nImage("img/ui/PaintMode_Off.svg"),
        nImage("img/ui/PaintMode_On.svg")
    ],
    eraseMode: [
        nImage("img/ui/EraseMode_Off.svg"),
        nImage("img/ui/EraseMode_On.svg")
    ],
    editMode: [
        nImage("img/ui/EditMode_Off.svg"),
        nImage("img/ui/EditMode_On.svg")
    ],
    
    // Layer menu
    addRemoveLayer: [
        //nImage("img/ui/AddLayer.svg"),
        //nImage("img/ui/RemoveLayer.svg"),
        nImage("img/ui/NewImage.svg"),
        nImage("img/ui/Delete.svg"),
        nImage("img/ui/NewLayer.svg"),
        nImage("img/ui/Duplicate.svg"),
        nImage("img/ui/Folder.svg")
    ],
    layerOrder: [
        nImage("img/ui/LayerUp.svg"),
        nImage("img/ui/LayerDown.svg")
    ],
    clearAnim: nImage("img/ui/ClearAnimation.svg"),
    layerVis: [
        nImage("img/ui/Visible.svg"),
        nImage("img/ui/Hidden.svg")
    ],
    layerLock: [
        nImage("img/ui/Unlocked.svg"),
        nImage("img/ui/Locked.svg")
    ],
    // Layer Properties
    layerMove: [
        nImage("img/ui/Move_Off.svg"),
        nImage("img/ui/Move_On.svg")
    ],
    layerScale: [
        nImage("img/ui/Scale_Off.svg"),
        nImage("img/ui/Scale_On.svg")
    ],
    layerRotate: [
        nImage("img/ui/Rotate_Off.svg"),
        nImage("img/ui/Rotate_On.svg")
    ],
    layerOpacity: [
        nImage("img/ui/Opacity_Off.svg"),
        nImage("img/ui/Opacity_On.svg")
    ]
}

/////////////////////////////////////////////////////////////
// Init images
/////////////////////////////////////////////////////////////
function initImg() {
    // Timeline
    $("#play_img").src = UI.play[0].src;
    //$("#record_img").src = UI.record[0].src;
    $("#loop_img").src = UI.loop[1].src;
    $("#backframe_img").src = UI.frameStep[0].src;
    $("#nextframe_img").src = UI.frameStep[1].src;
    $("#clickrecord_img").src = UI.clickRecord[0].src;
    $("#paint_img").src = UI.paintMode[0].src;
    $("#erase_img").src = UI.eraseMode[0].src;
    
    // Layer menu
    $("#addlayer_img").src = UI.addRemoveLayer[0].src;
    $("#removelayer_img").src = UI.addRemoveLayer[1].src;
    $("#addblanklayer_img").src = UI.addRemoveLayer[2].src;
    $("#duplicatelayer_img").src = UI.addRemoveLayer[3].src;
    //$("#addfolder_img").src = UI.addRemoveLayer[4].src;
    $("#movelayerup_img").src = UI.layerOrder[0].src;
    $("#movelayerdown_img").src = UI.layerOrder[1].src;
    $("#layerlock_img").src = UI.layerLock[0].src;
    $("#layerhide_img").src = UI.layerVis[1].src;
    
    // Layer Properties
    $("#layerposition_img").src = UI.layerMove[0].src;
    $("#layerscale_img").src = UI.layerScale[0].src;
    $("#layerrotation_img").src = UI.layerRotate[0].src;
    $("#layeropacity_img").src = UI.layerOpacity[0].src;
}

initImg();