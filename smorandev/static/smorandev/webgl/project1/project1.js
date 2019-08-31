// Keeps track of mode we're in. Defaults to file mode.
var mode = 'file';
// Array to store names of each color
var colorNames = ['Black', 'Red', 'Green', 'Blue'];
// Array to store values of each color
var colorVals = [   [0, 0, 0, 1.0], // Black
    [1.0, 0, 0, 1.0], // Red
    [0, 1.0, 0, 1.0], // Green
    [0, 0, 1.0, 1.0]]; // Blue
// Current index of the colorNames and colorVals arrays
var colorIndex = 0;
// Array containing all segments we want to ultimately draw.
var segments = [];
// The extents of the image to draw
var extents;
// Variable indicating whether or not the 'B' key is currently held down.
var bdown = false;

var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

// Sets WebGL things up
main();
function main()
{
    // Container div for webgl
    var container = document.getElementById("webgl-container");

    // Container for file upload button
    var fileContainer = document.createElement("div");
    fileContainer = container.appendChild(fileContainer);
    fileContainer.id = "fileContainer";

    // File upload button
    var input = document.createElement("input");
    input = fileContainer.appendChild(input);
    input.id = "fileInput";
    input.type = "file";
    input.accept = ".dat";
    input.onchange = function(){openFile(event)};
    fileContainer.appendChild(input);


    var modeText = document.createElement("h4");
    modeText.id = 'modeText';
    modeText.innerHTML = "File Mode";
    container.appendChild(modeText);

    // Handler for changing mode or color when user presses corresponding key
    window.onkeypress = function(event) {
        var modeText = document.getElementById('modeText');
        var key = event.key;
        switch(key) {
            // Enter file mode and update display
            case 'f':
                mode = 'file';
                modeText.innerHTML='File Mode';
                toggleMode("file");
                break;
            // Enter draw mode and update display
            case'd':
                mode = 'draw';
                modeText.innerHTML='Draw Mode';
                toggleMode("draw");
                break;
            // Change color and update display
            case 'c':
                // Increment the color index
                colorIndex = (colorIndex + 1) % 4;
                var currentColor = document.getElementById("currentColor");
                draw(segments, extents);
                break;
            default:
                return 1;
        }
    }
}

// Handler for user uploading file to be displayed
// @param event: the input event to handle
function openFile(event) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function(){
        var dataURL = reader.result;
        clear();
        segments = [];
        parseCoords(dataURL);
    };
    if(input.files[0]) {
        reader.readAsText(input.files[0]);
    }
}

function loadFileFromServer(event, path) {
    var input = event.target;
    console.log("PATH: " + path);
    path = path.split('/');
    path.pop();
    path.push('datfiles');
    path.push(input[input.selectedIndex].innerHTML);
    path = path.join('/');
    console.log("PATH: " + path);

    $.ajax({
        url: path,
        success: function(data) {
            console.log(data);
            parseCoords(data);
        }
    })
}

// Parses the coordinates from the given text.
// @param text: the text of the file being read
function parseCoords(text) {
    segments = [];
    var lines = text.split('\n');   // Splits text on newlines into an array of lines
    var i = 0;
    var polylines;
    extents = [0, 480, 640, 0];     // Default to the extents we need for dino

    // Check if we need to look for a line of '*' at top of file or if we should start parsing right away.
    if (text.includes('*')) {
        for (i; i < lines.length; i++) {
            if (lines[i].includes('*')) {    // Look for line of at least 1 '*'
                break;
            }
        }
        // Finds the extents of the file.
        while (isNaN(parseInt(lines[i]))) {
            i++;
        }
        extents = lines[i++];

        // Parses extents from string into actual numbers
        extents = extents.split(' ');
        extents = extents.filter(function (el) {
            return el != "";    // Type coercion purposeful to ensure filter works as intended
        });
        for(var e = 0; e < extents.length; e++) {
            extents[e] = parseFloat(extents[e]);
        }
        console.log(extents);
    }

    // Array which will contain the points in a single polyline
    var points = [];

    // Finds the number of polylines in the file.
    while (isNaN(parseInt(lines[i]))) {
        i++;
    }
    polylines = lines[i++];

    // The number of polylines we've drawn so far.
    var count = 0;

    // Iterate through file until we've read the number of polylines we're supposed to or until we reach end of file.
    while(count < polylines && i < lines.length) {
        while (isNaN(parseInt(lines[i]))) {
            i++;
        }
        // Get the number of points in this line
        var numpoints = parseInt(lines[i++]);
        console.log(numpoints);
        while(numpoints > 0) {  // Loop until we parse the indicated number of points
            var lineElts = lines[i].split(' ');
            var filtered = lineElts.filter(function (el) {
                return el != "";    // Type coercion purposeful to ensure filter works as intended
            });
            if(filtered.length > 1) {   // If this line has point data, add that data to the current line
                points.push(vec4(filtered[0], filtered[1], 0, 1.0));
                numpoints--;
            }
            i++;
        }
        segments.push(points); // At the end of data for each line segment, push that segment
        points = [];    // Reset points array in preparation for next line segment
        count++;        // Increment count of total lines we've drawn
    }

    // For MAJOR performance improvement, draws segments all at once at the end, rather than many times as we go.
    draw(segments, extents);
}

// Draws each line segment to the screen.
// @param segments: the array of line segments to be drawn
// @param extents: the extents of the image we're drawing
function draw(segments, extents) {
    if (segments.length === 0) {
        return;
    }
    console.log("Segments length: " + segments.length);

    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = WebGLUtils.setupWebGL(canvas);

    //Check that the return value is not null.
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    // Get the color we want the drawing to be
    var colorvec = colorVals[colorIndex];

    // Look at this fancy JavaScript syntax trickery! Woo! Assigns r, g, b, a to values in colorvec
    var [r, g, b, a] = colorvec;
    var fColorLoc = gl.getUniformLocation(program, "fColor");
    gl.uniform4f(fColorLoc, r, g, b, a);

    // Transformation logic
    var left, right, bottom, top, bumpx, bumpy;
    var width = Math.abs(extents[0] - extents[2]);
    var height = Math.abs(extents[1] - extents[3]);

    // Bounds of projMatrix default to image's extents, for cases when image has square aspect ratio.
    left = extents[0];
    right = extents[2];
    top = extents[1];
    bottom = extents[3];

    // If image is taller than wide, scale width based on height.
    if (width < height) {
        left = bottom = - height / 2;
        right = top = height / 2;
    }

    // Else, if image is wider than tall, scale height based on width.
    else if (width > height) {
        left = bottom = - width / 2;
        right = top = width / 2;
    }

    // Set viewport to canvas width and height
    gl.viewport(0, 0, canvas.width, canvas.height);

    // x and y offsets default to 0
    bumpy = 0;
    bumpx = 0;

    // Calculations to center the image in the canvas. If width and height are equal, there is no need to center or
    // scale - image is a square and can simply be drawn by setting projMatrix values to its extents.
    if(width !== height) {
        bumpy = 0 - (extents[3] + (height / 2));
        bumpx = 0 - (extents[0] + (width / 2));
    }

    // Matrix to center image in canvas
    var modelMatrix = translate(bumpx, bumpy, 0);
    var modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    // Matrix to scale image projection
    var projMatrix = ortho(left, right, bottom, top, -1, 1);
    var projMatrixLoc = gl.getUniformLocation(program, "projMatrix");
    gl.uniformMatrix4fv(projMatrixLoc, false, flatten(projMatrix));

    // Iterates through each line segment and draws to canvas.
    for(var i = 0; i < segments.length; i++) {
        var points = segments[i];
        var pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        // If we are in draw mode and the length of the current line segment is 1, draw it as a point.
        if(points.length === 1 && mode === "draw") {
            gl.drawArrays(gl.POINTS, 0, points.length);
        }
        // In all other cases, draw each segment as a line.
        else {
            gl.drawArrays(gl.LINE_STRIP, 0, points.length);
        }
    }
}

// Handles operations necessary for draw mode.
// @param canvas: the canvas element of the page
// @param event: a mouseclick event on the page
function drawModeHandler(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    console.log("x: ", x, "y: ", y);

    // If we have no line segments, create a new blank segment
    if(segments.length === 0) {
        segments.push([]);
    }

    // If this segment is 100 points long or the user is holding the "b" key, create a new blank segment
    else if(segments[segments.length-1].length === 100 || bdown) {
        segments.push([]);
    }

    // Gets the most recent line, appends the newest point, and pushes it back onto the segments array
    var line = segments.pop();

    // Subtract y from 400 because coordinate systems are flipped. In browser, TOP left is (0, 0). On canvas,
    // BOTTOM left is (0, 0). This flips y axis.
    line.push(vec4(x, 400 - y, 0, 1.0));
    segments.push(line);

    draw(segments, extents);
}

// Toggles between file and draw modes
// @param mode: the mode to switch to
function toggleMode(mode) {
    // Gets canvas element
    var canvas = document.getElementById('webgl');
    var fileDiv = document.getElementById("fileContainer");
    if(mode === "file" && !document.getElementById("fileInput")) {
        // Clears canvas
        clear();

        // Clears segments
        segments = [];

        // Removes event listener that used for drawing clicks on canvas
        canvas.onclick = null;

        //Removes button to download file and field to name file
        fileDiv.removeChild(document.getElementById("downloadBtn"));
        fileDiv.removeChild(document.getElementById("fileName"));

        // Adds input button to upload files
        var fileInput = document.createElement("input");
        fileInput.id = "fileInput";
        fileInput.type = "file";
        fileInput.accept = ".dat";
        fileInput.onchange = function(){openFile(event)};
        fileDiv.appendChild(fileInput);
    }
    else if(mode === "draw" && document.getElementById("fileInput")) {
        // Clears canvas
        clear();

        // Clears segments
        segments = [];

        // Adds listener for B key down
        document.onkeydown = function(e){bHandler(e)};

        // Adds listener for B key up
        document.onkeyup = function(e) {
            if(e.code === "KeyB") {
                bdown = false;
            }
            document.onkeydown = function(e){bHandler(e)};
        };

        // Sets extents to canvas width and height by default
        extents = [0, canvas.width, canvas.height, 0];

        // Binds onclick handler to canvas elements
        canvas.onclick = function(e){drawModeHandler(canvas, e)};

        // Removes file input button from page
        fileDiv.removeChild(document.getElementById("fileInput"));

        // Adds button to download file
        var downloadBtn = document.createElement("input");
        downloadBtn.type = "button";
        downloadBtn.id = "downloadBtn";
        downloadBtn.value = "Click to download drawing";
        fileDiv.appendChild(downloadBtn);

        // Adds text field to name downloadable file
        var fileName = document.createElement("input");
        fileName.type = "text";
        fileName.id = "fileName";
        // Name defaults to year + month + day + time in milliseconds to ensure unique, useful names
        var d = new Date();
        fileName.value = ("drawing-" + d.getFullYear() + "-" + (d.getMonth() + 1) % 12 + "-" + d.getDate() + d.getTime()).toString();
        fileDiv.appendChild(fileName);

        // Adds listener to button in order to download file
        // This code adapted from https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
        document.getElementById("downloadBtn").addEventListener("click", function(){
            var filename = fileName.value + ".dat";
            download(filename, writeSegments(filename));
        }, false);
    }
}

// Handles keydown events, checks if "B" key is held down
// @param e: the keyd own event we want to analyze
function bHandler(e) {
    document.onkeydown = null;  // Unbinds the listener to prevent undesirable lagging
    if(e.code === "KeyB") {
        bdown = true;
    }
}

// Writes each segment to a string in preparation for writing to a file for downloading
// @param title: the name of the file to be downloaded
function writeSegments(title) {
    var result = [title, "**********"];
    // First append extents
    result.push([extents[0], extents[1], extents[2], extents[3]].join(" "));
    // Next, append number of polylines
    result.push(segments.length);
    //Finally, loop through each segment and push to result
    for(var i = 0; i < segments.length; i++) {
        var currentSegment = [];
        // Push the length of the current line segment
        currentSegment.push(segments[i].length);
        for(var j = 0; j < segments[i].length; j++) {
            currentSegment.push(segments[i][j][0] + " " + segments[i][j][1]);
        }
        result.push(currentSegment.join("\r\n"));
    }

    return result.join("\r\n");
}
// Downloads a file containing the points of the drawing to be downloaded
// @param filename: the name of the file to be downloaded
// @param text: the contents of the file to be downloaded
// This code from https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
function download(filename, text) {
    // Adds element to body which, when clicked, will start a download of a file containing values in segments array
    var dl = document.createElement('a');
    dl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    dl.setAttribute('download', filename);

    // Ensures that the download element is not displayed on the webpage
    dl.style.display = 'none';
    document.body.appendChild(dl);

    // Clicks the element to start download
    dl.click();

    // Removes element
    document.body.removeChild(dl);
}

// Clears the canvas
function clear() {
    // Gets canvas element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = WebGLUtils.setupWebGL(canvas);

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    // Clear <canvas> by clearning the color buffer
    gl.clear(gl.COLOR_BUFFER_BIT);
}