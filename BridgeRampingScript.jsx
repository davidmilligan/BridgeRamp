#target bridge

function BrRamp()
{
    this.requiredContext = "\tAdobe Bridge must be running.\n\tExecute against Bridge as the Target.\n";
    
    this.menuID = "brRampAddContextMenu";
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
    var cntCommand = new MenuElement("command", "Ramp ACR Settings...", "at the end of Thumbnail", this.menuID);

    // What to do when the menu item is selected
    cntCommand.onSelect = function(m)
    {
        runRampMain();
    };

    // When to display the menu item
    cntCommand.onDisplay = function()
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
        catch(error){ $.writeln(error); }
    };
    
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
                $.writeln(thumb.name + " offset: " + offset);
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

//runRampMain();
new BrRamp().run();
