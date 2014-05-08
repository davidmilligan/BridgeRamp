﻿#target bridge

/* Copyright (C) 2013 David Milligan
 *
 * With additions (C) 2014 by Paulo Jan
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

var percentile = 0.7;
var evCurveCoefficent = 2 / Math.log(2);
var keyframeRating = 1;
var iterations = 3;
var previewSize = 200;
var deflickerThreshold = 3;
var cropX = 0;
var cropY = 0;
var cropWidth = 100;
var cropHeight = 100;
var usarPV2010 = false;
var undoNiveles = 5;
var guardarDatos = false;
var rampGradientCorrections = true;
var rampRadialCorrections = true;

function BrRamp()
{
    this.requiredContext = "\tAdobe Bridge must be running.\n\tExecute against Bridge as the Target.\n";
    
    this.rampMenuID = "brRampContextMenu";
    this.deflickerMenuID = "deflickerContextMenu";
    this.rampAllMenuID = "brRampMultiContextMenu";
    this.backupMenuID = "brRampBackupContextMenu";
    this.undoMenuID = "brUndoContextMenu";
}

function loadXMPLibrary()
{
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
}

BrRamp.prototype.run = function()
{

    var retval = true;
    if(!this.canRun()) 
    {
        retval = false; 
        return retval;
    }
    
    loadXMPLibrary();
    
    // create the menu element
    var rampCommand = MenuElement.create("command", "Ramp...", "at the end of Thumbnail", this.rampMenuID);
    var rampMultipleCommand = MenuElement.create("command", "Ramp Multiple...", "after " + this.rampMenuID, this.rampAllMenuID);
    var deflickerCommand = MenuElement.create("command", "Deflicker...", "at the end of Thumbnail", this.deflickerMenuID);
    var backupCommand = MenuElement.create("command", "Backup XMP Sidecars...", "at the end of Thumbnail", this.backupMenuID);
    var undoCommand = MenuElement.create("command", "Undo Ramp/Deflicker", "at the end of Thumbnail", this.undoMenuID);

    rampCommand.onSelect = function(m)
    {
        try
        {
            runRamp();
        }
        catch(error)
        {
            alert(error);
        }
    };
    rampMultipleCommand.onSelect = function(m)
    {
        try
        {
            runRampMultiple();
        }
        catch(error)
        {
            alert(error);
        }
    };
    deflickerCommand.onSelect = function(m)
    {
        try
        {
            runDeflickerMain();
        }
        catch(error)
        {
            alert(error);
        }
    };
    backupCommand.onSelect = function(m)
    {
    	try
    	{
    		runBackupXMP();
    	}
        catch(error)
        {
            alert(error);
        }
    };

    undoCommand.onSelect = function(m) {
        try
            {
                runUndo();
            }
            catch(error)
            {
                alert(error);
            }        
        
        }

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
    
    rampCommand.onDisplay = onDisplay;
    rampMultipleCommand.onDisplay = onDisplay;
    deflickerCommand.onDisplay = onDisplay;
    backupCommand.onDisplay = onDisplay;
    undoCommand.onDisplay = onDisplay;
    
    return retval;
}

BrRamp.prototype.canRun = function()
{   
    return BridgeTalk.appName == "bridge" && ! MenuElement.find(this.menuID);
}

var commonProperties = [
    "Temperature", "Tint", 
    "Vibrance", "Saturation",
    "Sharpness", "SharpenRadius", "SharpenDetail", "SharpenEdgeMasking",
    "ColorNoiseReduction", "ColorNoiseReductionDetail", "ColorNoiseReductionSmoothness",
    "LuminanceSmoothing", "VignetteAmount", "ShadowTint",
    "RedHue", "RedSaturation", "GreenHue", "GreenSaturation", "BlueHue", "BlueSaturation",
    "HueAdjustmentRed", "HueAdjustmentOrange", "HueAdjustmentYellow", "HueAdjustmentGreen", "HueAdjustmentAqua", "HueAdjustmentBlue", "HueAdjustmentPurple", "HueAdjustmentMagenta",
    "SaturationAdjustmentRed", "SaturationAdjustmentOrange", "SaturationAdjustmentYellow", "SaturationAdjustmentGreen", "SaturationAdjustmentAqua", "SaturationAdjustmentBlue", "SaturationAdjustmentPurple", "SaturationAdjustmentMagenta",
    "LuminanceAdjustmentRed", "LuminanceAdjustmentOrange", "LuminanceAdjustmentYellow", "LuminanceAdjustmentGreen", "LuminanceAdjustmentAqua", "LuminanceAdjustmentBlue", "LuminanceAdjustmentPurple", "LuminanceAdjustmentMagenta",
    "SplitToningShadowHue", "SplitToningShadowSaturation", "SplitToningHighlightHue", "SplitToningHighlightSaturation", "SplitToningBalance",
    "ParametricShadows", "ParametricDarks", "ParametricLights", "ParametricHighlights", "ParametricShadowSplit", "ParametricMidtoneSplit", "ParametricHighlightSplit"];

var Properties2012 = ["Exposure2012", "Contrast2012", "Highlights2012", "Shadows2012", "Whites2012", "Blacks2012",
    "Clarity2012"];
   
var Properties2010 = ["Exposure",  "FillLight", "HighlightRecovery", "Brightness", "Contrast", "Clarity", "Shadows"];

var gradientCorrectionsTag = "GradientBasedCorrections";

var correctionsProperties = ["crs:CorrectionAmount", "crs:LocalExposure", "crs:LocalSaturation", "crs:LocalContrast", "crs:LocalClarity", "crs:LocalSharpness","crs:LocalBrightness","crs:LocalToningHue","crs:LocalToningSaturation","crs:LocalExposure2012","crs:LocalContrast2012","crs:LocalHighlights2012","crs:LocalShadows2012","crs:LocalClarity2012","crs:LocalLuminanceNoise","crs:LocalMoire","crs:LocalDefringe","crs:LocalTemperature","crs:LocalTint"];    

var correctionMasksTag = "crs:CorrectionMasks";

var gradientMasksProperties = ["crs:MaskValue","crs:ZeroX","crs:ZeroY","crs:FullX","crs:FullY"];

var radialCorrectionsTag = "CircularGradientBasedCorrections";

var radialMasksProperties = ["crs:MaskValue","crs:Top","crs:Left","crs:Bottom","crs:Right","crs:Angle","crs:Midpoint","crs:Roundness","crs:Feather"];

/******************************************************************************/

function runRamp()
{
    var rampDialog = new Window("dialog { orientation: 'row', text: 'Ramp ACR Settings', alignChildren:'top', \
        leftGroup: Group { orientation: 'column', alignChildren:'fill', \
            rampPanel: Panel { text: 'Ramp', \
                propertyBox: DropDownList { }, \
                startGroup: Group { orientation: 'row', \
                    startLabel: StaticText { text: 'Start: ' }, \
                    startText: EditText { characters: 8, text: '0' }, \
                }, \
                endGroup: Group{ \
                    endLabel: StaticText { text: 'End: ' }, \
                    endText: EditText { characters: 8, text: '0' }, \
                }, \
                checkboxesGroup: Group{ orientation: 'row', \
                    additiveCheckBox: Checkbox { text: 'Additive' }, \
                    pv2010CheckBox: Checkbox { text: 'Use PV2010' } \
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
 
    var pv2010CheckBox=rampDialog.leftGroup.rampPanel.checkboxesGroup.pv2010CheckBox;
    
    var allProperties = Properties2012.concat(commonProperties);
    
    rellenarPropiedades(propertyBox, allProperties);
    
    propertyBox.selection = 2;
    
    rampDialog.leftGroup.rampPanel.selectionLabel.text += app.document.selections.length + " ";
    
    var startText = rampDialog.leftGroup.rampPanel.startGroup.startText;
    var endText = rampDialog.leftGroup.rampPanel.endGroup.endText


    pv2010CheckBox.onClick=function ()
        {
        propertyBox.removeAll();
        if (pv2010CheckBox.value == true) {
            allProperties = Properties2010.concat(commonProperties);
            }
        else {
            allProperties = Properties2012.concat(commonProperties);
            }
        //$.writeln("Meeeept: " + allProperties.length);
        rellenarPropiedades(propertyBox, allProperties);
        propertyBox.selection = 2;
        }

    okButton.onClick = function() { rampDialog.close(true); };
    cancelButton.onClick = function() { rampDialog.close(false);};
    propertyBox.onChange = function()
    {
        startText.text = getProperty(propertyBox.selection.text, 0);
        endText.text = getProperty(propertyBox.selection.text, app.document.selections.length - 1);
    }
    propertyBox.onChange();
    
    if(rampDialog.show())
    {
        applyRamp(
            propertyBox.selection.text, 
            Number(startText.text), 
            Number(endText.text), 
            rampDialog.leftGroup.rampPanel.checkboxesGroup.additiveCheckBox.value);
    }
}

function rellenarPropiedades(dropDownARellenar, lista)
    {
     for(var i = 0; i < lista.length; i++) {
        dropDownARellenar.add("Item", lista[i]);
        }
    //return true;
    }

function getProperty(property, index)
{
    var thumb = app.document.selections[index];
    var xmp =  new XMPMeta();
    if(thumb.hasMetadata)
    {
        //load the xmp metadata
        var md = thumb.synchronousMetadata;
        xmp =  new XMPMeta(md.serialize());
        return Number(xmp.getProperty(XMPConst.NS_CAMERA_RAW, property));
    }
    return 0;
}

function applyRamp(property, startValue, endValue, additive)
{
    guardaDatosUndo(Array(property), "Ramp");

    var count = app.document.selections.length;
    for(var i = 0; i < count; i++)
    {
        var thumb = app.document.selections[i];
        
        var xmp =  new XMPMeta();
        var offset = 0;
        if(thumb.hasMetadata)
        {
            //load the xmp metadata
            var md = thumb.synchronousMetadata;
            xmp =  new XMPMeta(md.serialize());
            
            if(additive)
            {
                offset = Number(xmp.getProperty(XMPConst.NS_CAMERA_RAW, property));
                //$.writeln(thumb.name + " offset: " + offset);
            }
        }
        var value = (i / (count - 1)) * (endValue - startValue) + startValue + offset;
        xmp.setProperty(XMPConst.NS_CAMERA_RAW, property, value);
        
        // Write the packet back to the selected file
        var updatedPacket = xmp.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);

        // $.writeln(updatedPacket);
        thumb.metadata = new Metadata(updatedPacket);
    }
}

/******************************************************************************/

var enabledSettings = null;

function runRampMultiple()
{
    var rampDialog = new Window("dialog { orientation: 'row', text: 'Ramp ACR Settings', alignChildren:'top', \
        leftGroup: Group { orientation: 'column', alignChildren:'left', \
            settingsPanel: Panel { orientation: 'row', text: 'Settings', \
                group1: Group { orientation: 'column', alignChildren:'left', \
                    gbcCheckbox: Checkbox { text: 'GradientBasedCorrections' }, \
                    rbcCheckbox: Checkbox { text: 'CircularGradientBasedCorrections' } \
                }, \
                group2: Group { orientation: 'column', alignChildren:'left' }, \
                group3: Group { orientation: 'column', alignChildren:'left' } \
            } \
        }, \
        rightGroup: Group { orientation: 'column', alignChildren:'fill', \
            okButton: Button { text: 'OK' }, \
            cancelButton: Button { text: 'Cancel' }, \
            line1: Panel { height: 3 }, \
            allButton: Button { text: 'Check All' }, \
            noneButton: Button { text: 'Check None' }, \
        } \
    } ");
    
    var allProperties = Properties2012.concat(commonProperties);

    var gbcCheckbox = rampDialog.leftGroup.settingsPanel.group1.gbcCheckbox;
    var rbcCheckbox = rampDialog.leftGroup.settingsPanel.group1.rbcCheckbox;
    var settingsPanel = rampDialog.leftGroup.settingsPanel;
    var okButton = rampDialog.rightGroup.okButton;
    var cancelButton = rampDialog.rightGroup.cancelButton;
    var allButton = rampDialog.rightGroup.allButton;
    var noneButton = rampDialog.rightGroup.noneButton;
    var checkboxes = new Array(allProperties.length);
    
    if(enabledSettings == null)
    {
        enabledSettings = new Array();
        for(var i = 0; i < allProperties.length; i++)
        {
            enabledSettings.push(allProperties[i]);
        }
    }
    gbcCheckbox.value = rampGradientCorrections;
    gbcCheckbox.onClick = function() { rampGradientCorrections = this.value; };
    rbcCheckbox.value = rampRadialCorrections;
    rbcCheckbox.onClick = function() { rampRadialCorrections = this.value; };
    for(var i = 0; i < allProperties.length; i++)
    {
        var checkbox = null;
        if((i + 2) < (allProperties.length + 2) / 3)
        {
            checkbox = settingsPanel.group1.add("checkbox", undefined, allProperties[i]);
        }
        else if((i + 2) < (allProperties.length + 2) * 2 / 3)
        {
            checkbox = settingsPanel.group2.add("checkbox", undefined, allProperties[i]);
        }
        else
        {
            checkbox = settingsPanel.group3.add("checkbox", undefined, allProperties[i]);
        }
        checkboxes[i] = checkbox;
        checkbox.value = indexOf(enabledSettings, allProperties[i]) >= 0;
        checkbox.onClick = function()
        {
            if(this.value)
            {
                if(indexOf(enabledSettings, this.text) == -1)
                    enabledSettings.push(this.text);
            }
            else
            {
                remove(enabledSettings, this.text);
            }
        };
    }
    allButton.onClick = function() 
    {
        for(var i = 0; i < allProperties.length; i++)
        {
            checkboxes[i].value = true;
            checkboxes[i].onClick();
        }
        gbcCheckbox.value = true;
        rbcCheckbox.value = true;
    }
    noneButton.onClick = function() 
    {
        for(var i = 0; i < allProperties.length; i++)
        {
            checkboxes[i].value = false;
            checkboxes[i].onClick();
        }
        gbcCheckbox.value = false;
        rbcCheckbox.value = false;
    }
    okButton.onClick = function() { rampDialog.close(true); };
    cancelButton.onClick = function() { rampDialog.close(false);};
    
    if(rampDialog.show())
    {
        rampMultiple(enabledSettings);
    }
}

function indexOf(array, item)
{
    for(var i = 0; i < array.length; i++)
    {
        if(array[i] == item)
            return i;
    }
    return -1;
}

function remove(array, item)
{
    var index = indexOf(array, item);
    if(index >= 0)
    {
        array.splice(index, 1);
    }
}

function rampMultiple(enabledSettings)
{
    guardaDatosUndo(enabledSettings, "Ramp Multiple");
    
    var count = app.document.selections.length;
    var currentKeyframe = 0;
    var nextKeyframe = 1;
    var settings = new Array();
    var correctionsCount = 0;
    var masksCount = new Array();
    for(var i = 0; i < enabledSettings.length; i++)
        settings.push(enabledSettings[i]);
            
    if(rampGradientCorrections || rampRadialCorrections)
    {
        //generate all the property paths we need for gradient corrections
        var thumb = app.document.selections[0];
        var xmp =  new XMPMeta();
        if(thumb.hasMetadata)
        {
            var md = thumb.synchronousMetadata;
            xmp =  new XMPMeta(md.serialize());
            var getCorrectionSettings = function(tag, maskProperties)
            {
            	correctionsCount = xmp.countArrayItems(XMPConst.NS_CAMERA_RAW, tag);
				for(var j = 1; j<= correctionsCount; j++)
				{
					for(var i = 0; i < correctionsProperties.length; i++)
					{
						settings.push(tag + "[" + j + "]/" + correctionsProperties[i]);
					}
					masksCount.push(xmp.countArrayItems(XMPConst.NS_CAMERA_RAW, tag + "[" + j + "]/" + correctionMasksTag));
					for(var k = 1; k<= masksCount[j-1]; k++)
					{
						for(var i = 0; i < maskProperties.length; i++)
						{
							settings.push(tag + "[" + j + "]/" + correctionMasksTag + "[" + k + "]/" + maskProperties[i]);
						}
					}
				}
            };
            if(rampGradientCorrections)
            	getCorrectionSettings(gradientCorrectionsTag, gradientMasksProperties);
            if(rampRadialCorrections)
            	getCorrectionSettings(radialCorrectionsTag, radialMasksProperties);
        }
    }
    
    var targetStart = readSettings(currentKeyframe, settings);
    for(nextKeyframe = 1; nextKeyframe < count - 1; nextKeyframe++)
    {
        if(app.document.selections[nextKeyframe].rating == keyframeRating)
            break;
    }
    var targetEnd = readSettings(nextKeyframe, settings);
    for(var i = 1; i < count - 1; i++)
    {
        var thumb = app.document.selections[i];
        if(thumb.rating == keyframeRating)
        {
            currentKeyframe = nextKeyframe;
            targetStart = targetEnd;
            nextKeyframe = i + 1;
            for(nextKeyframe = i + 1; nextKeyframe < count - 1; nextKeyframe++)
            {
                if(app.document.selections[nextKeyframe].rating == keyframeRating)
                    break;
            }
            targetEnd = readSettings(nextKeyframe, settings);
        }
        else
        {
            if(targetStart == null || targetEnd == null)
                break;
            
            var xmp =  new XMPMeta();
            if(thumb.hasMetadata)
            {
                //load the xmp metadata
                var md = thumb.synchronousMetadata;
                xmp =  new XMPMeta(md.serialize());
            }
            
            for(var j = 0; j < settings.length; j ++)
            {
                var value = (i - currentKeyframe) / (nextKeyframe - currentKeyframe) * (targetEnd[j] - targetStart[j]) + targetStart[j];
                xmp.setProperty(XMPConst.NS_CAMERA_RAW, settings[j], value);
            }
            
            // Write the packet back to the selected file
            var updatedPacket = xmp.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
    
            // $.writeln(updatedPacket);
            thumb.metadata = new Metadata(updatedPacket);
        }
    }
}

function readSettings(keyframe, settings)
{
    var result = new Array(settings.length);
    var thumb = app.document.selections[keyframe];
    var xmp =  new XMPMeta();
    if(thumb.hasMetadata)
    {
        try
        {
            //load the xmp metadata
            var md = thumb.synchronousMetadata;
            xmp =  new XMPMeta(md.serialize());
                
            for(var j = 0; j < settings.length; j ++)
                result[j] = Number(xmp.getProperty(XMPConst.NS_CAMERA_RAW, settings[j]));
        }
        catch(err)
        {
            alert("Error Loading Metadata for keyframe: "+ thumb.name);
            return null;
        }
    }
    else
    {
        alert("Error Loading Metadata for keyframe: "+ thumb.name);
        return null;
    }
    return result;
}


/******************************************************************************/

function runDeflickerMain()
{
    var deflickerDialog = new Window("dialog { orientation: 'row', text: 'Deflicker', alignChildren:'top', \
        leftGroup: Group { orientation: 'column', alignChildren:'fill', \
            deflickerPanel: Panel { text: 'Deflicker', alignChildren:'left', \
                percentileGroup: Group{ \
                    percentileLabel: StaticText { text: 'Percentile: ' }, \
                    percentileSlider: Slider { minvalue: 0, maxvalue: 100, value: 50 }, \
                    percentileText: EditText { characters: 5, text: '0.5', helpTip: 'Choose a value between 0.0 and 1.0. Use preview to ensure chosen percentile crosses the sky.'}, \
                }, \
                previewSizeGroup: Group{ \
                    previewSizeLabel: StaticText { text: 'Analysis Size: ' }, \
                    previewSizeText: EditText { characters: 5, text: '200', helpTip: 'Resizes the image to this many pixels on the longest side before analysis (smaller = faster/less acurate)' }, \
                }, \
                cropLabel: StaticText { text: 'Analysis Crop (%): ' }, \
                cropGroup: Group{ \
                    cropXLabel: StaticText { text: 'X: ' }, \
                    cropXText: EditText { characters: 3, text: '0' }, \
                    cropYLabel: StaticText { text: 'Y: ' }, \
                    cropYText: EditText { characters: 3, text: '0' }, \
                    cropWidthLabel: StaticText { text: 'Width: ' }, \
                    cropWidthText: EditText { characters: 3, text: '100' }, \
                    cropHeightLabel: StaticText { text: 'Height: ' }, \
                    cropHeightText: EditText { characters: 3, text: '100' }, \
                }, \
                iterationsGroup: Group{ \
                    iterationsLabel: StaticText { text: 'Max Iterations: ' }, \
                    iterationsText: EditText { characters: 3, text: '1', helpTip: 'Maximum number of deflicker passes to run' }, \
                }, \
                checkboxesGroup: Group { orientation: 'column', alignChildren: 'left', \
                    pv2010Checkbox: Checkbox { text: 'Use PV2010' }, \
                    guardarDatosCheckbox: Checkbox { text: 'Store data in external file' } \
                }, \
                selectionLabel: StaticText { text: 'Selected Items: ???????' }, \
                percentileLabel: StaticText { text: 'Percentile Level: ???????' }, \
            } \
        }, \
        rightGroup: Group { orientation: 'column', alignChildren:'fill', \
            okButton: Button { text: 'OK' }, \
            cancelButton: Button { text: 'Cancel' }, \
            line1: Panel { height: 3 }, \
            previewButton: Button { text: 'Preview .', helpTip: 'Shows the image with the percentile level highlighted'} \
        } \
    } ");
    
    var previewSizeText = deflickerDialog.leftGroup.deflickerPanel.previewSizeGroup.previewSizeText;
    var cropXText = deflickerDialog.leftGroup.deflickerPanel.cropGroup.cropXText;
    var cropYText = deflickerDialog.leftGroup.deflickerPanel.cropGroup.cropYText;
    var cropWidthText = deflickerDialog.leftGroup.deflickerPanel.cropGroup.cropWidthText;
    var cropHeightText = deflickerDialog.leftGroup.deflickerPanel.cropGroup.cropHeightText;
    var percentileText = deflickerDialog.leftGroup.deflickerPanel.percentileGroup.percentileText;
    var okButton = deflickerDialog.rightGroup.okButton;
    var cancelButton = deflickerDialog.rightGroup.cancelButton;
    var previewButton = deflickerDialog.rightGroup.previewButton;
    var percentileSlider = deflickerDialog.leftGroup.deflickerPanel.percentileGroup.percentileSlider;
    var percentileLabel = deflickerDialog.leftGroup.deflickerPanel.percentileLabel;
    var iterationsText = deflickerDialog.leftGroup.deflickerPanel.iterationsGroup.iterationsText;
    var pv2010Checkbox=deflickerDialog.leftGroup.deflickerPanel.checkboxesGroup.pv2010Checkbox;
    var guardarDatosCheckbox = deflickerDialog.leftGroup.deflickerPanel.checkboxesGroup.guardarDatosCheckbox;
    //$.writeln("Moooo: " + guardarDatosCheckbox);
    //$.writeln("Moooo: " + okButton);
    previewHistogram = null;
    
    deflickerDialog.leftGroup.deflickerPanel.selectionLabel.text = "Selected Items: " + app.document.selections.length;
    percentileText.text = percentile;
    percentileSlider.value = percentile * 100;
    iterationsText.text = iterations;
    previewSizeText.text = previewSize;
    cropXText.text = cropX;
    cropYText.text = cropY;
    cropWidthText.text = cropWidth;
    cropHeightText.text = cropHeight;
    pv2010Checkbox.onClick = function() { usarPV2010 = this.value; }
    guardarDatosCheckbox.onClick = function() { guardarDatos = this.value; }
    iterationsText.onChange = function() { iterations = Number(this.text); };
    previewSizeText.onChange = function() { previewSize = Number(this.text); };
    cropXText.onChange = function() { cropX = Math.max(this.text, 0); };
    cropYText.onChange = function() { cropY = Math.max(this.text, 0); };
    cropWidthText.onChange = function() { cropWidth = Math.min(this.text, 100); };
    cropHeightText.onChange = function() { cropHeight = Math.min(this.text, 100); };
    percentileText.onChange = function() 
    { 
        percentile = Math.min(0.99, Math.max(0.01, Number(percentileText.text))); 
        percentileSlider.value = percentile * 100;
    };
    percentileSlider.onChange = function()
    {
        percentile = Math.min(0.99, Math.max(0.01, Number(percentileSlider.value / 100))); 
        percentileText.text = percentile;
    };
    var updateAll = function()
    {
        iterationsText.onChange();
        percentileText.onChange(); 
        previewSizeText.onChange();
        cropXText.onChange();
        cropYText.onChange();
        cropWidthText.onChange();
        cropHeightText.onChange();
        pv2010Checkbox.onClick();
        guardarDatosCheckbox.onClick();
    }
    okButton.onClick = function() { updateAll(); deflickerDialog.close(true); };
    cancelButton.onClick = function() { deflickerDialog.close(false);};
    previewButton.onClick = function() 
    { 
        updateAll();
        percentileLabel.text = "Percentile Level: " + showPercentilePreview(); 
    };
    
    if(deflickerDialog.show())
    {
        deflicker();
    }
}

function showPercentilePreview()
{
    //get target values from the first image
    var thumb = app.document.selections[0];
    var bitmap = thumb.core.preview.preview.resize(previewSize);
    var level = computePercentile(bitmap, percentile);
    var output = bitmap.clone();
    var xmin = Math.round(Math.max(cropX * output.width / 100, 0));
    var ymin = Math.round(Math.max(cropY * output.height / 100, 0));
    var xmax = Math.min(cropX + cropWidth, 100) * output.width / 100;
    var ymax = Math.min(cropY + cropHeight, 100) * output.height / 100;
    for(var x = xmin; x < xmax; x+=2)
    {
        for(var y = ymin; y < ymax; y+=2)
        {
            if(x == xmin || Math.abs(x - xmax) <= 2)
            {
                output.setPixel(x, y, y % 8 < 4 ? "#000000" : "#ffffff");
                output.setPixel(x, y + 1, y % 8 < 4 ? "#000000" : "#ffffff");
            }
            else if(y == ymin || Math.abs(y - ymax) <= 2)
            {
                output.setPixel(x, y, x % 8 < 4 ? "#000000" : "#ffffff");
                output.setPixel(x + 1, y, x % 8 < 4 ?"#000000" : "#ffffff");
            }
            else
            {
                var pixel = new Color(output.getPixel(x,y));
                var lum = Math.round((pixel.red + pixel.green + pixel.blue)/3);
                if(lum >= level - 4 && lum <= level + 4)
                    output.setPixel(x, y, "#ff0000");
            }
        }
    }
    var tempFilename = Folder.temp + "/PercentilePreview.jpg";
    var tempFile = File(tempFilename);
    //$.writeln("temp file path: " + tempFile.fsName);
    if(tempFile.exists)
    {
        tempFile.remove();
    }
    output.exportTo(tempFile, 100);
    File(tempFilename).execute();
    return level;
}

function convertToEV(value)
{
    return evCurveCoefficent * Math.log(value);
}

function computePercentile(bitmap, percentile)
{
    var histogram = new Array(256);
    var total = 0;
    for(var h = 0; h < 256; h++)
        histogram[h] = 0;
    var xmin = Math.round(Math.max(cropX * bitmap.width / 100, 0));
    var ymin = Math.round(Math.max(cropY * bitmap.height / 100, 0));
    var xmax = Math.min(cropX + cropWidth, 100) * bitmap.width / 100;
    var ymax = Math.min(cropY + cropHeight, 100) * bitmap.height / 100;
    for(var x = xmin; x < xmax; x++)
    {
        for(var y = ymin; y < ymax; y++)
        {
            var pixel = new Color(bitmap.getPixel(x,y));
            histogram[Math.round((pixel.red + pixel.green + pixel.blue)/3)]++;
            total++;
        }
    }
    
    var runningTotal = 0;
    var level = 0;
    for(level = 0; level < 256; level++)
    {
        runningTotal += histogram[level];
        if(runningTotal / total >= percentile)
            return level;
    }
    return 255;
}

function deflicker()
{
    initializeProgress();
    if (usarPV2010 == true) {   var exposureEnXMP = 'Exposure';  }
    else { var exposureEnXMP = 'Exposure2012';   }
    
    guardaDatosUndo(Array(exposureEnXMP), "Deflicker");
    
    var count = app.document.selections.length;
    var moreIterationsNeeded = false;
    var currentKeyframe = 0;
    var nextKeyframe = 0;
    app.synchronousMode = true; 
    var items = new Array(count);
    var datosOriginales=new Array(count);
    var datosAGuardar=new Array(count);
    for(var i = 0; i < count; i++)
        items[i] = app.document.selections[i];
    
    for(var iteration = 0; iteration < iterations; iteration++)
    {
        initializeProgress("Deflicker Progress" + (iterations > 1 ? " (Iteration " + (iteration + 1) + ")" : ""));
        //$.writeln("\n*** Iteration " + (iteration + 1) + " ***");
        //get target values from the first image
        if(iteration > 0)
        {
            statusText.text = "Purge Cache";
            for(var i = 0; i < count; i++)
            {
                app.purgeFolderCache(items[i]);
                app.document.select(items[i]);
            }
        }
        else {
            for (var i=0; i < count; i++) {
                var xmp = new XMPMeta();
                var thumb = items[i];
                if(thumb.hasMetadata)
                {
                    //load the xmp metadata
                    var md = thumb.synchronousMetadata;
                    var xmp =  new XMPMeta(md.serialize());
                    datosOriginales[i] = Number(xmp.getProperty(XMPConst.NS_CAMERA_RAW, exposureEnXMP));
                    //$.writeln("Mooooo: " + datosOriginales[i]);
                    }
                }
         }
        currentKeyframe = 0;
        nextKeyframe = 0;
        var thumb = items[0];
        progress.value = 100 * 1 / (count + 1);
        statusText.text = "Processing " + thumb.name + " (keyframe)";
        var bitmap = thumb.core.preview.preview.resize(previewSize);
        var targetStart = computePercentile(bitmap, percentile);
        var targetEnd = targetStart;
        //$.writeln("keyframe " + thumb.name + ": " + targetStart);
        var findNextKeyframe = function(index)
        {
            nextKeyframe = index + 1;
            for(nextKeyframe = index + 1; nextKeyframe < count - 1; nextKeyframe++)
            {
                if(items[nextKeyframe].rating == keyframeRating)
                    break;
            }
            //get target values from the last image
            var thumb = items[nextKeyframe];
            progress.value = 100 * (index + 2) / (count + 1);
            statusText.text = "Processing " + thumb.name + " (keyframe)";
            var bitmap = thumb.core.preview.preview.resize(previewSize);
            var result = computePercentile(bitmap, percentile);
            //$.writeln("keyframe " + thumb.name + ": " + result);
            return result;
        }
        targetEnd = findNextKeyframe(0);
        moreIterationsNeeded = false;
        
        for(var i = 1; i < count - 1; i++)
        {
            thumb = items[i];
            if(thumb.rating == keyframeRating)
            {
                targetStart = targetEnd;
                currentKeyframe = nextKeyframe;
                targetEnd = findNextKeyframe(i);
            }
            else
            {
                progress.value = 100 * (i + 2) / (count + 1);
                statusText.text = "Processing " + thumb.name;
                bitmap = thumb.core.preview.preview.resize(previewSize);
                computed = computePercentile(bitmap, percentile);
                
                var xmp = new XMPMeta();
                var offset = 0;
                if(thumb.hasMetadata)
                {
                    //load the xmp metadata
                    var md = thumb.synchronousMetadata;
                    var xmp =  new XMPMeta(md.serialize());
                    offset = Number(xmp.getProperty(XMPConst.NS_CAMERA_RAW, exposureEnXMP));
                }
                var target =  ((i - currentKeyframe) / (nextKeyframe - currentKeyframe)) * (targetEnd - targetStart) + targetStart;
                var ev = convertToEV(target) - convertToEV(computed) + offset;
                if(Math.abs(target - computed) > deflickerThreshold)
                    moreIterationsNeeded = true;
                //$.writeln(thumb.name + ": " + ev + "ev (" + target + " - " + computed + ")");
                xmp.setProperty(XMPConst.NS_CAMERA_RAW, exposureEnXMP, ev)
                datosAGuardar[i]=ev;
                
                // Write the packet back to the selected file
                var updatedPacket = xmp.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
        
                // $.writeln(updatedPacket);
                thumb.metadata = new Metadata(updatedPacket);
            }
        }
        if(!moreIterationsNeeded)
            break;
    }
    for(var i = 0; i < count; i++)
    {
        app.purgeFolderCache(items[i]);
        app.document.select(items[i]);
    }

    if (guardarDatos == true) {
        var todosLosThumbs=cogerTodosLosThumbsEnCarpeta();
        var seqOffset=buscaSeqOffset(todosLosThumbs, items[0]);
 
        for(var i = 0; i < count; i++)
        {
            app.document.select(items[i]);
            datosAGuardar[i] = datosAGuardar[i] - datosOriginales[i];
            }

        datosAGuardar[0]=0;
        datosAGuardar[count - 1]=0;

        var json={
            "offset": seqOffset,
            "evValues" : datosAGuardar
            };
        var jsonFile=new File(app.document.presentationPath + "/deFlickerdata.json");
        jsonFile.open("w");
        jsonFile.write(json.toSource());
        jsonFile.close();
        }
  
    if(moreIterationsNeeded)
        alert("More Deflicker Iterations may be needed");
    progressWindow.hide();
}


function buscaSeqOffset(todos, inicioSeleccion) {
    var nombre=inicioSeleccion.name;
    for (i=0; i < todos.length; i++) {
        if (todos[i].name == nombre) { return i; }
        }
    //Algo muy raro ha pasado aquí... ¡¡Las fotos seleccionadas no están en la carpeta!!
    return false;
    }


function cogerTodosLosThumbsEnCarpeta() {
    
    var count = app.document.selections.length;
    var tempThumbs=Array();
    for (i=0; i < count; i++) {
        tempThumbs[i]=app.document.selections[i];
        }
    
    app.document.selectAll();
    var todosLosThumbs=app.document.getSelection("cr2");
    app.document.deselectAll();
    
    for (i=0; i < count; i++) {
        app.document.select(tempThumbs[i]);
        }
    
    return todosLosThumbs;
    }


function initializeProgress(title)
{
    progressWindow = new Window("palette { text:'Deflicker Progress', \
        statusText: StaticText { text: 'Processing Images...', preferredSize: [350,20] }, \
        progressGroup: Group { \
            progress: Progressbar { minvalue: 0, maxvalue: 100, value: 0, preferredSize: [300,20] }, \
            cancelButton: Button { text: 'Cancel' } \
        } \
    }");
    progressWindow.text = title;
    statusText = progressWindow.statusText;
    progress = progressWindow.progressGroup.progress;
    progressWindow.progressGroup.cancelButton.onClick = function() { userCanceled = true; }
    progressWindow.show();
}

function runBackupXMP()
{
	var backupLocation = Folder.selectDialog ("Select a destination folder for the backup");
	if(backupLocation != null)
	{
		var count = app.document.selections.length;
		for(var i = 0; i < count; i++)
		{
			var thumb = app.document.selections[i];
			var sourceXMP = File(thumb.spec.fullName.substr(0, thumb.spec.fullName.lastIndexOf(".")) + ".XMP");
			if(!sourceXMP.exists)
				sourceXMP = File(thumb.spec.fullName.substr(0, thumb.spec.fullName.lastIndexOf(".")) + ".xmp");
			if(sourceXMP.exists)
			{
				var destination = File(backupLocation.fullName + "/" + sourceXMP.name);
				if(destination.exists)
				{
					alert("Error: file(s) already exist in this destination");
					break;
				}
				sourceXMP.copy(destination);
			}
		}
	}
}


function runUndo() {

    var jsonFile=new File(app.document.presentationPath + "/undoData.json");

    if (jsonFile.exists) {
        jsonFile.open("r");
        var todosLosDatos=eval(jsonFile.read());
        jsonFile.close();
        }
    else { return false; }

    if (todosLosDatos.length == 0) { return false; }

    var undoDialog = new Window("dialog { orientation: 'row', text: 'Undo Ramp/Deflicker', alignChildren:'top', \
        leftGroup: Group { orientation: 'column', alignChildren:'fill', \
            undoPanel: Panel { text: 'Previous actions', \
                propertyBox: DropDownList { }, \
            } \
        }, \
        rightGroup: Group { orientation: 'column', alignChildren:'fill', \
            okButton: Button { text: 'OK' }, \
            cancelButton: Button { text: 'Cancel' } \
        } \
    } ");

    var okButton = undoDialog.rightGroup.okButton;
    var cancelButton = undoDialog.rightGroup.cancelButton;
    var propertyBox = undoDialog.leftGroup.undoPanel.propertyBox;

    var count=todosLosDatos.length;
    
    for (i=0; i < count; i++) {
        var item=todosLosDatos[i];
        propertyBox.add("Item", "Undo " + item["descripcion"]);
        
        }
    propertyBox.selection = count - 1;

    okButton.onClick = function() { undoDialog.close(true); };
    cancelButton.onClick = function() { undoDialog.close(false);};
    
    if(undoDialog.show())
    {
        //$.writeln("MOOOOOO: " + propertyBox.selection.text);
        Undo(Number(propertyBox.selection));
        }
    }



function guardaDatosUndo(propiedadesACambiar, accion) {
    //"propiedades" es un array de las propiedades que vamos a modificar. Con propósitos únicamente informativos
    
    var todosLosThumbs=cogerTodosLosThumbsEnCarpeta();
    var seqOffset=buscaSeqOffset(todosLosThumbs, app.document.selections[0]);

    var allProperties = commonProperties.concat(Properties2010, Properties2012);
    var numAllProperties=allProperties.length;
    
    var numPropiedadesACambiar=propiedadesACambiar.length;
    if (numPropiedadesACambiar > 3) {
        numPropiedadesACambiar = 4;
        propiedadesACambiar[3] = "etc.";
        }
    
    var count = app.document.selections.length;
    var undoObject={
        "offset": seqOffset,
        "descripcion": accion + " ("
        }

    for (i=0; i < numPropiedadesACambiar; i++) {
        undoObject["descripcion"] += (propiedadesACambiar[i] + " ");
        }
    undoObject["descripcion"] += ")";

    for (i=0; i < numAllProperties; i++) {
        undoObject[allProperties[i]] = Array();
        }

    for (i=0; i < count; i++) {
        var thumb=app.document.selections[i];

        var xmp =  new XMPMeta();
        if(thumb.hasMetadata)
           {
             //load the xmp metadata
            var md = thumb.synchronousMetadata;
            xmp =  new XMPMeta(md.serialize());
            for (j=0; j < numAllProperties; j++) {
                var p = allProperties[j];
                undoObject[p][i] = Number(xmp.getProperty(XMPConst.NS_CAMERA_RAW, allProperties[j]));
                }
            }
        }

    guardaADiscoUndo(undoObject);
    }


function guardaADiscoUndo(objeto) {
    var jsonFile=new File(app.document.presentationPath + "/undoData.json");
    if (jsonFile.exists) {
        jsonFile.open("r");
        var todosLosDatos=eval(jsonFile.read());
        jsonFile.close();
        }
    else {
        var todosLosDatos=Array();
        }
    
    todosLosDatos.push(objeto);
    if (todosLosDatos.length > undoNiveles) {
        todosLosDatos.shift();
        }

    jsonFile.open("w");
    jsonFile.write(todosLosDatos.toSource());
    jsonFile.close();
    }


function Undo(num) {
    var jsonFile=new File(app.document.presentationPath + "/undoData.json");
    if (jsonFile.exists) {
        jsonFile.open("r");
        var todosLosDatos=eval(jsonFile.read());
        jsonFile.close();
        }
    else { return false; }
    
    var datosARestaurar=todosLosDatos[num];
    var offset=datosARestaurar["offset"];
    
    var todosLosThumbs=cogerTodosLosThumbsEnCarpeta();
    var count=todosLosThumbs.length;

    //Dejamos en el objeto sólo los parámetros a restaurar
    delete datosARestaurar["offset"];
    delete datosARestaurar["descripcion"];

    for (i = offset; i < count; i++) {
        
        var thumb=todosLosThumbs[i];
        
         var xmp =  new XMPMeta();
            if(thumb.hasMetadata)
            {
                //load the xmp metadata
                var md = thumb.synchronousMetadata;
                xmp =  new XMPMeta(md.serialize());
            }
            
            for (var parametro in datosARestaurar) {
                var value=datosARestaurar[parametro][i - offset];
                xmp.setProperty(XMPConst.NS_CAMERA_RAW, parametro, value);
               }
            
            // Write the packet back to the selected file
            var updatedPacket = xmp.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);

            // $.writeln(updatedPacket);
            thumb.metadata = new Metadata(updatedPacket);
        }

    for (var i = offset; i < count; i++)
            {
                app.purgeFolderCache(todosLosThumbs[i]);
                app.document.select(todosLosThumbs[i]);
            }


    //Borrar los Undos ya usados
    var nuevosDatos=Array();
    var numDatosActuales=todosLosDatos.length;

    for (i=0; i < num; i++) {
        nuevosDatos[i]=todosLosDatos[i];
        }

    jsonFile.open("w");
    jsonFile.write(nuevosDatos.toSource());
    jsonFile.close();
    }


new BrRamp().run();
