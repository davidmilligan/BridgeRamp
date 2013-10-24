#target bridge

/* Copyright (C) 2013 David Milligan
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

var lineSkip = 3;
var percentile = 0.7;
var evCurveCoefficent = 2 / Math.log(2);
var keyframeRating = 1;

function BrRamp()
{
    this.requiredContext = "\tAdobe Bridge must be running.\n\tExecute against Bridge as the Target.\n";
    
    this.rampMenuID = "brRampContextMenu";
    this.deflickerMenuID = "deflickerContextMenu";
    this.rampAllMenuID = "brRampMultiContextMenu";
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
    var rampCommand = new MenuElement("command", "Ramp...", "at the end of Thumbnail", this.rampMenuID);
    var rampMultipleCommand = new MenuElement("command", "Ramp Multiple...", "at the end of Thumbnail", this.rampAllMenuID);
    var deflickerCommand = new MenuElement("command", "Deflicker...", "at the end of Thumbnail", this.deflickerMenuID);

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
    
    return retval;
}

BrRamp.prototype.canRun = function()
{   
    return BridgeTalk.appName == "bridge" && ! MenuElement.find(this.menuID);
}

var allProperties = [
	"Temperature", "Tint", 
	"Exposure2012", "Contrast2012", "Highlights2012", "Shadows2012", "Whites2012", "Blacks2012",
	"Clarity2012", "Vibrance", "Saturation",
	"Sharpness", "SharpenRadius", "SharpenDetail", "SharpenEdgeMasking",
	"ColorNoiseReduction", "ColorNoiseReductionDetail", "ColorNoiseReductionSmoothness",
	"LuminanceSmoothing", "VignetteAmount", "ShadowTint",
	"RedHue", "RedSaturation", "GreenHue", "GreenSaturation", "BlueHue", "BlueSaturation",
    "HueAdjustmentRed", "HueAdjustmentOrange", "HueAdjustmentYellow", "HueAdjustmentGreen", "HueAdjustmentAqua", "HueAdjustmentBlue", "HueAdjustmentPurple", "HueAdjustmentMagenta",
    "SaturationAdjustmentRed", "SaturationAdjustmentOrange", "SaturationAdjustmentYellow", "SaturationAdjustmentGreen", "SaturationAdjustmentAqua", "SaturationAdjustmentBlue", "SaturationAdjustmentPurple", "SaturationAdjustmentMagenta",
    "LuminanceAdjustmentRed", "LuminanceAdjustmentOrange", "LuminanceAdjustmentYellow", "LuminanceAdjustmentGreen", "LuminanceAdjustmentAqua", "LuminanceAdjustmentBlue", "LuminanceAdjustmentPurple", "LuminanceAdjustmentMagenta",
    "SplitToningShadowHue", "SplitToningShadowSaturation", "SplitToningHighlightHue", "SplitToningHighlightSaturation", "SplitToningBalance",
    "ParametricShadows", "ParametricDarks", "ParametricLights", "ParametricHighlights", "ParametricShadowSplit", "ParametricMidtoneSplit", "ParametricHighlightSplit"];

    
    
/******************************************************************************/

function runRamp()
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
    for(var i = 0; i < allProperties.length; i++)
    	propertyBox.add("Item", allProperties[i]);
   
    propertyBox.selection = 2;
    
    rampDialog.leftGroup.rampPanel.selectionLabel.text += app.document.selections.length;
    
    var startText = rampDialog.leftGroup.rampPanel.startGroup.startText;
    var endText = rampDialog.leftGroup.rampPanel.endGroup.endText
    
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
            rampDialog.leftGroup.rampPanel.additiveGroup.additiveCheckBox.value);
    }
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
            	group1: Group { orientation: 'column', alignChildren:'left' } \
            	group2: Group { orientation: 'column', alignChildren:'left' } \
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
    
    for(var i = 0; i < allProperties.length; i++)
    {
    	var checkbox = null;
    	if(i < allProperties.length / 3)
    	{
    		checkbox = settingsPanel.group1.add("checkbox", undefined, allProperties[i]);
    	}
    	else if(i < allProperties.length * 2 / 3)
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
    }
    noneButton.onClick = function() 
    {
    	for(var i = 0; i < allProperties.length; i++)
    	{
    		checkboxes[i].value = false;
    		checkboxes[i].onClick();
    	}
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
    var count = app.document.selections.length;
    var currentKeyframe = 0;
    var nextKeyframe = 1;
    var targetStart = readSettings(currentKeyframe, enabledSettings);
	for(nextKeyframe = 1; nextKeyframe < count - 1; nextKeyframe++)
	{
		if(app.document.selections[nextKeyframe].rating == keyframeRating)
			break;
	}
    var targetEnd = readSettings(nextKeyframe, enabledSettings);
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
        	targetEnd = readSettings(nextKeyframe, enabledSettings);
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
			
			for(var j = 0; j < enabledSettings.length; j ++)
			{
				var value = (i - currentKeyframe) / (nextKeyframe - currentKeyframe) * (targetEnd[j] - targetStart[j]) + targetStart[j];
				xmp.setProperty(XMPConst.NS_CAMERA_RAW, enabledSettings[j], value);
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
	var result = new Array(allProperties.length);
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

var previewHistogram = null;

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
                lineSkipGroup: Group { \
                    lineSkipLabel: StaticText { text: 'Line Skip: ' }, \
                    lineSkipText: EditText { characters: 8, text: '2', helpTip: 'Improves speed at the cost of accuracy' }, \
                }, \
                selectionLabel: StaticText { text: 'Selected Items: ' }, \
            } \
        }, \
        rightGroup: Group { orientation: 'column', alignChildren:'fill', \
            okButton: Button { text: 'OK' }, \
            cancelButton: Button { text: 'Cancel' }, \
            line1: Panel { height: 3 }, \
            previewButton: Button { text: 'Preview', helpTip: 'Shows the image with the percentile level highlighted'} \
        } \
    } ");
    
    var lineSkipText = deflickerDialog.leftGroup.deflickerPanel.lineSkipGroup.lineSkipText;
    var percentileText = deflickerDialog.leftGroup.deflickerPanel.percentileGroup.percentileText;
    var okButton = deflickerDialog.rightGroup.okButton;
    var cancelButton = deflickerDialog.rightGroup.cancelButton;
    var previewButton = deflickerDialog.rightGroup.previewButton;
    var percentileSlider = deflickerDialog.leftGroup.deflickerPanel.percentileGroup.percentileSlider;
    previewHistogram = null;
    
    deflickerDialog.leftGroup.deflickerPanel.selectionLabel.text += app.document.selections.length;
    lineSkipText.text = lineSkip;
    percentileText.text = percentile;
    percentileSlider.value = percentile * 100;
    lineSkipText.onChange = function() { lineSkip = Math.max(1, Math.round(Number(lineSkipText.text))); };
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
    okButton.onClick = function() { deflickerDialog.close(true); };
    cancelButton.onClick = function() { deflickerDialog.close(false);};
    previewButton.onClick = function() { percentile = Math.min(0.99, Math.max(0.01, Number(percentileText.text))); showPercentilePreview(); };
    
    if(deflickerDialog.show())
    {
        deflicker();
    }
}

function showPercentilePreview()
{
    //get target values from the first image
    var thumb = app.document.selections[0];
    var bitmap = thumb.core.preview.preview;
    if(previewHistogram == null)
        previewHistogram = computeHistogram(bitmap);
    var level = computePercentile(previewHistogram, percentile, Math.ceil(bitmap.width / lineSkip) * Math.ceil(bitmap.height / lineSkip));
    var output = bitmap.clone();
    for(var x = 0; x < output.width; x+=lineSkip)
    {
        for(var y = 0; y < output.height; y+=lineSkip)
        {
            var pixel = new Color(output.getPixel(x,y));
            var lum = Math.round((pixel.red + pixel.green + pixel.blue)/3);
            if(lum >= level - 4 && lum <= level + 4)
                output.setPixel(x, y, "#ff0000");
        }
    }
    var tempFilename = Folder.temp + "/PercentilePreview.jpg";
    output.exportTo(tempFilename, 10);
    File(tempFilename).execute();
}

function convertToEV(value)
{
    return evCurveCoefficent * Math.log(value);
}

function computeHistogram(bitmap)
{
    var histogram = new Array(256);
    for(var h = 0; h < 256; h++)
        histogram[h] = 0;
    for(var x = 0; x < bitmap.width; x+=lineSkip)
    {
        for(var y = 0; y < bitmap.height; y+=lineSkip)
        {
            var pixel = new Color(bitmap.getPixel(x,y));
            histogram[Math.round((pixel.red + pixel.green + pixel.blue)/3)]++;
        }
    }
    return histogram;
}

function computePercentile(histogram, percentile, total)
{
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
    var count = app.document.selections.length;
    app.synchronousMode = true; 
    
    //get target values from the first image
    var thumb = app.document.selections[0];
    progress.value = 100 * 1 / (count + 1);
    statusText.text = "Processing " + thumb.name + " (keyframe)";
    var bitmap = thumb.core.preview.preview;
    var histogram = computeHistogram(bitmap);
    var targetStart = computePercentile(histogram, percentile, Math.ceil(bitmap.width / lineSkip) * Math.ceil(bitmap.height / lineSkip));
    var targetEnd = targetStart;
    
    for(var i = 1; i < count - 1; i++)
    {
        thumb = app.document.selections[i];
        if(thumb.rating == keyframeRating)
        {
        	targetStart = targetEnd;
        	var nextKeyframe = i + 1;
        	for(nextKeyframe = i + 1; nextKeyframe < count - 1; nextKeyframe++)
        	{
        		if(app.document.selections[nextKeyframe].rating == keyframeRating)
        			break;
        	}
			//get target values from the last image
			thumb = app.document.selections[k];
			progress.value = 100 * 2 / (count + 1);
			statusText.text = "Processing " + thumb.name + " (keyframe)";
			bitmap = thumb.core.preview.preview;
			histogram = computeHistogram(thumb);
			targetEnd = computePercentile(histogram, percentile, Math.ceil(bitmap.width / lineSkip) * Math.ceil(bitmap.height / lineSkip));
        }
        else
        {
			progress.value = 100 * (i + 2) / (count + 1);
			statusText.text = "Processing " + thumb.name;
			bitmap = thumb.core.preview.preview;
			histogram = computeHistogram(bitmap);
			computed = computePercentile(histogram, percentile, Math.ceil(bitmap.width / lineSkip) * Math.ceil(bitmap.height / lineSkip));
			
			var xmp = new XMPMeta();
			var offset = 0;
			if(thumb.hasMetadata)
			{
				//load the xmp metadata
				var md = thumb.synchronousMetadata;
				var xmp =  new XMPMeta(md.serialize());
				offset = Number(xmp.getProperty(XMPConst.NS_CAMERA_RAW, 'Exposure2012'));
			}
			var target =  (i / count) * (targetEnd - targetStart) + targetStart;
			var ev = convertToEV(target) - convertToEV(computed) + offset;
			xmp.setProperty(XMPConst.NS_CAMERA_RAW, 'Exposure2012', ev)
			
			// Write the packet back to the selected file
			var updatedPacket = xmp.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
	
			// $.writeln(updatedPacket);
			thumb.metadata = new Metadata(updatedPacket);
        }
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

new BrRamp().run();
