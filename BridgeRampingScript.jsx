#target bridge

function BrRamp()
{
    this.requiredContext = "\tAdobe Bridge must be running.\n\tExecute against Bridge as the Target.\n";
    
    this.rampMenuID = "brRampContextMenu";
    this.deflickerMenuID = "deflickerContextMenu";
}

BrRamp.prototype.run = function()
{

    var retval = true;
    if(!this.canRun()) {
        retval = false; 
        return retval;
    }
    
    // Load the XMP Script library
    if( xmpLib == undefined ) 
    {
        if( Folder.fs == "Windows" )
        {
            var pathToLib = Folder.startup.fsName + "/AdobeXMPScript.dll";
        } 
        else 
        {
            var pathToLib = Folder.startup.fsName + "/AdobeXMPScript.framework";
        }
    
        var libfile = new File( pathToLib );
        var xmpLib = new ExternalObject("lib:" + pathToLib );
    }

    // create the menu element
    var cntCommand = new MenuElement("command", "Ramp ACR Settings...", "at the end of Thumbnail", this.rampMenuID);
    var dflCommand = new MenuElement("command", "Deflicker", "at the end of Thumbnail", this.deflickerMenuID);

    cntCommand.onSelect = function(m)
    {
        runRampMain();
    };
    dflCommand.onSelect = function(m)
    {
        runDeflickerMain();
    };

    var onDisplay = function()
    {
        try
        {
            cntCommand.enabled = true;
            if(app.document.selections.length > 0)
            {
                for(var i = 0; i < app.document.selections.length; i++)
                {
                    
                    if(app.docuument.selections[i].container)
                    {
                        cntCommand.enabled = false;
                        break;
                    }
                }
            }
            else
            {
                cntCommand.enabled = false;
            }
        }
        catch(error){ }
    };
    
    cntCommand.onDisplay = onDisplay;
    dflCommand.onDisplay = onDisplay;
    
    return retval;
}

BrRamp.prototype.canRun = function()
{   
    return BridgeTalk.appName == "bridge" && ! MenuElement.find(this.menuID);
}

function runRampMain()
{
    var rampDialog = new Window("dialog { orientation: 'row', text: 'Ramp ACR Settings', alignChildren:'top', \
        leftGroup: Group { orientation: 'column', alignChildren:'fill', \
            rampPanel: Panel { text: 'Ramp', \
                propertyBox: DropDownList { }, \
                startGroup: Group { \
                    startLabel: StaticText { text: 'Start: ' }, \
                    startText: EditText { characters: 8, text: '0' }, \
                }, \
                endGroup: Group{ \
                    endLabel: StaticText { text: 'End: ' }, \
                    endText: EditText { characters: 8, text: '0' }, \
                }, \
                additiveGroup: Group{ \
                    additiveCheckBox: Checkbox { text: 'Additive' }\
                }, \
                selectionLabel: StaticText { text: 'Selected Items: ' }, \
            } \
        }, \
        rightGroup: Group { orientation: 'column', alignChildren:'fill', \
            okButton: Button { text: 'OK' }, \
            cancelButton: Button { text: 'Cancel' } \
        } \
    } ");
    
    var okButton = rampDialog.rightGroup.okButton;
    var cancelButton = rampDialog.rightGroup.cancelButton;
    var propertyBox = rampDialog.leftGroup.rampPanel.propertyBox;
    propertyBox.add("Item", "Temperature");
    propertyBox.add("Item", "Tint");
    propertyBox.add("Item", "Exposure2012");
    propertyBox.add("Item", "Contrast2012");
    propertyBox.add("Item", "Highlights2012");
    propertyBox.add("Item", "Shadows2012");
    propertyBox.add("Item", "Whites2012");
    propertyBox.add("Item", "Blacks2012");
    propertyBox.add("Item", "Clarity2012");
    propertyBox.add("Item", "Saturation");
    propertyBox.add("Item", "Sharpness");
    propertyBox.add("Item", "LuminanceSmoothing");
    propertyBox.add("Item", "ColorNoiseReduction");
    propertyBox.add("Item", "VignetteAmount");
    propertyBox.add("Item", "ShadowTint");
    propertyBox.add("Item", "RedHue");
    propertyBox.add("Item", "RedSaturation");
    propertyBox.add("Item", "GreenHue");
    propertyBox.add("Item", "GreenSaturation");
    propertyBox.add("Item", "BlueHue");
    propertyBox.add("Item", "BlueSaturation");
    propertyBox.add("Item", "Vibrance");
    propertyBox.add("Item", "HueAdjustmentRed");
    propertyBox.add("Item", "HueAdjustmentOrange");
    propertyBox.add("Item", "HueAdjustmentYellow");
    propertyBox.add("Item", "HueAdjustmentGreen");
    propertyBox.add("Item", "HueAdjustmentAqua");
    propertyBox.add("Item", "HueAdjustmentBlue");
    propertyBox.add("Item", "HueAdjustmentPurple");
    propertyBox.add("Item", "HueAdjustmentMagenta");
    propertyBox.add("Item", "SaturationAdjustmentRed");
    propertyBox.add("Item", "SaturationAdjustmentOrange");
    propertyBox.add("Item", "SaturationAdjustmentYellow");
    propertyBox.add("Item", "SaturationAdjustmentGreen");
    propertyBox.add("Item", "SaturationAdjustmentAqua");
    propertyBox.add("Item", "SaturationAdjustmentBlue");
    propertyBox.add("Item", "SaturationAdjustmentPurple");
    propertyBox.add("Item", "SaturationAdjustmentMagenta");
    propertyBox.add("Item", "LuminanceAdjustmentRed");
    propertyBox.add("Item", "LuminanceAdjustmentOrange");
    propertyBox.add("Item", "LuminanceAdjustmentYellow");
    propertyBox.add("Item", "LuminanceAdjustmentGreen");
    propertyBox.add("Item", "LuminanceAdjustmentAqua");
    propertyBox.add("Item", "LuminanceAdjustmentBlue");
    propertyBox.add("Item", "LuminanceAdjustmentPurple");
    propertyBox.add("Item", "LuminanceAdjustmentMagenta");
    propertyBox.add("Item", "SplitToningShadowHue");
    propertyBox.add("Item", "SplitToningShadowSaturation");
    propertyBox.add("Item", "SplitToningHighlightHue");
    propertyBox.add("Item", "SplitToningHighlightSaturation");
    propertyBox.add("Item", "SplitToningBalance");
    propertyBox.add("Item", "ParametricShadows");
    propertyBox.add("Item", "ParametricDarks");
    propertyBox.add("Item", "ParametricLights");
    propertyBox.add("Item", "ParametricHighlights");
    propertyBox.add("Item", "ParametricShadowSplit");
    propertyBox.add("Item", "ParametricMidtoneSplit");
    propertyBox.add("Item", "ParametricHighlightSplit");
    propertyBox.add("Item", "SharpenRadius");
    propertyBox.add("Item", "SharpenDetail");
    propertyBox.add("Item", "SharpenEdgeMasking");
    propertyBox.add("Item", "PostCropVignetteAmount");
    propertyBox.add("Item", "GrainAmount");
    propertyBox.add("Item", "ColorNoiseReductionDetail");
    propertyBox.add("Item", "ColorNoiseReductionSmoothness");
    propertyBox.add("Item", "LensProfileEnable");
    propertyBox.add("Item", "LensManualDistortionAmount");
    propertyBox.add("Item", "PerspectiveVertical");
    propertyBox.add("Item", "PerspectiveHorizontal");
    propertyBox.add("Item", "PerspectiveRotate");
    propertyBox.add("Item", "PerspectiveScale");
    propertyBox.add("Item", "PerspectiveAspect");
    propertyBox.add("Item", "PerspectiveUpright");
    propertyBox.add("Item", "AutoLateralCA");
    propertyBox.add("Item", "DefringePurpleAmount");
    propertyBox.add("Item", "DefringePurpleHueLo");
    propertyBox.add("Item", "DefringePurpleHueHi");
    propertyBox.add("Item", "DefringeGreenAmount");
    propertyBox.add("Item", "DefringeGreenHueLo");
    propertyBox.add("Item", "DefringeGreenHueHi");
   
    propertyBox.selection = 2;
    
    rampDialog.leftGroup.rampPanel.selectionLabel.text += app.document.selections.length;
    
    okButton.onClick = function() 
    { 
        rampDialog.hide(); 
        applyRamp(
            propertyBox.selection.text, 
            Number(rampDialog.leftGroup.rampPanel.startGroup.startText.text), 
            Number(rampDialog.leftGroup.rampPanel.endGroup.endText.text), 
            rampDialog.leftGroup.rampPanel.additiveGroup.additiveCheckBox.value);
    };
    cancelButton.onClick = function() { rampDialog.hide();};
    
    rampDialog.show();
}

function applyRamp(property, startValue, endValue, additive)
{
    var count = app.document.selections.length;
    for(var i = 0; i < count; i++)
    {
        var thumb = app.document.selections[i];
        
        if(thumb.hasMetadata)
        {
            //load the xmp metadata
            var md = thumb.synchronousMetadata;
            var xmp =  new XMPMeta(md.serialize());
            
            var offset = 0;
            if(additive)
            {
                offset = Number(xmp.getProperty(XMPConst.NS_CAMERA_RAW, property));
                //$.writeln(thumb.name + " offset: " + offset);
            }
            var value = (i / (count - 1)) * (endValue - startValue) + startValue + offset;
            xmp.setProperty(XMPConst.NS_CAMERA_RAW, property, value);
            
            // Write the packet back to the selected file
            var updatedPacket = xmp.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
    
            // $.writeln(updatedPacket);
            thumb.metadata = new Metadata(updatedPacket);
        }
        else
            alert("Error: No Metadata found for: " + thumb.name);
    }
}

function runDeflickerMain()
{
    deflicker();
}

function computeHistogram(bitmap)
{
    var histogram = new Array(256);
    for(var h = 0; h < 256; h++)
        histogram[h] = 0;
    for(var x = 0; x < bitmap.width; x++)
    {
        for(var y = 0; y < bitmap.height; y++)
        {
            var pixel = new Color(bitmap.getPixel(x,y));
            histogram[Math.round((pixel.red + pixel.green + pixel.blue)/3)]++;
        }
    }
    return histogram;
}

function computePercentiles(histogram, total)
{
    var result = new Array(5);
    result['black'] = 0;
    result['25'] = 63;
    result['50'] = 127;
    result['75'] = 191;
    result['white'] = 255;
    var runningTotal = 0;
    var level = 0;
    for(level = 0; level < 256; level++)
    {
        runningTotal += histogram[level];
        if(runningTotal == 0)
            result['black'] = level;
        if(runningTotal / total < 0.2)
            result['25'] = level;
        if(runningTotal / total < 0.5)
            result['50'] = level;
        if(runningTotal / total < 0.8)
            result['75'] = level;
        if(runningTotal / total >= 1.0)
        {
            result['white'] = level;
            break;
        }
    }
    return result;
}

function deflicker()
{
    initializeProgress();
    var count = app.document.selections.length;
    app.synchronousMode = true; 
    
    //get target values from the first image
    var thumb = app.document.selections[0];
    var bitmap = thumb.core.preview.preview;
    var histogram = computeHistogram(bitmap);
    target = computePercentiles(histogram, bitmap.width * bitmap.height);
    
    for(var i = 1; i < count; i++)
    {
        progress.value = 100 * i / count;
        var thumb = app.document.selections[i];
        var bitmap = thumb.core.preview.preview;
        var histogram = computeHistogram(bitmap);
        computed = computePercentiles(histogram, bitmap.width * bitmap.height);
        
        var thumb = app.document.selections[i];
        var xmp = new XMPMeta();
        if(thumb.hasMetadata)
        {
            //load the xmp metadata
            var md = thumb.synchronousMetadata;
            var xmp =  new XMPMeta(md.serialize());
            xmp.deleteProperty(XMPConst.NS_CAMERA_RAW, 'ToneCurvePV2012');
        }
        xmp.appendArrayItem(XMPConst.NS_CAMERA_RAW, 'ToneCurvePV2012', computed['black'] + ", " + target['black'], 0, XMPConst.ARRAY_IS_ORDERED);
        xmp.appendArrayItem(XMPConst.NS_CAMERA_RAW, 'ToneCurvePV2012', computed['25'] + ", " + target['25'], 0, XMPConst.ARRAY_IS_ORDERED);
        xmp.appendArrayItem(XMPConst.NS_CAMERA_RAW, 'ToneCurvePV2012', computed['50'] + ", " + target['50'], 0, XMPConst.ARRAY_IS_ORDERED);
        xmp.appendArrayItem(XMPConst.NS_CAMERA_RAW, 'ToneCurvePV2012', computed['75'] + ", " + target['75'], 0, XMPConst.ARRAY_IS_ORDERED);
        xmp.appendArrayItem(XMPConst.NS_CAMERA_RAW, 'ToneCurvePV2012', computed['white'] + ", " + target['white'], 0, XMPConst.ARRAY_IS_ORDERED);
        
        // Write the packet back to the selected file
        var updatedPacket = xmp.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);

        // $.writeln(updatedPacket);
        thumb.metadata = new Metadata(updatedPacket);
    }
    progressWindow.hide();
}

function initializeProgress()
{
    progressWindow = new Window("palette { text:'Deflicker Progress', \
        statusText: StaticText { text: 'Processing Images...', preferredSize: [350,20] }, \
        progressGroup: Group { \
            progress: Progressbar { minvalue: 0, maxvalue: 100, value: 0, preferredSize: [300,20] }, \
            cancelButton: Button { text: 'Cancel' } \
        } \
    }");
    statusText = progressWindow.statusText;
    progress = progressWindow.progressGroup.progress;
    progressWindow.progressGroup.cancelButton.onClick = function() { userCanceled = true; }
    progressWindow.show();
}

//runRampMain();
new BrRamp().run();
