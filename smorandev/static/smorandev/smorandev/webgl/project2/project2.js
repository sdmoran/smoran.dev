// Sam Moran, CS4731 E19
// EXTRA CREDIT: Ability to toggle displaying the surface normals for each polygon.

// Keeps track of angle theta we want to rotate
var theta;

// Array to keep track of surface normals for each coordinate
var surfaceNormals;

// Array keeping track of the normal lines for each face. Different from regular surface normals, which give only direction.
// Maybe a better way to do this? Computationally expensive to calculate each time, better to do once and store as array.
var normalLines;

// Whether or not to display the surface normals.
var showNormals;

var segments;
var extents;
var gl;

// Which magnitude/direction to translate 1 or -1.
var translateMagnitude;
// Which index to change - x = 0, y = 1, z = 2.
var magnitudeIndex;
// Magnitudes of the x, y, z translations.
var magnitudes;
// Whether or not we're actually translating
var translating;

// Whether or not we're rotating
var rotating;

// Whether or not we're pulsing
var pulsing;

// Keeps track of information we need for pulsing - whether or not we're expanding, the current number of ticks, and
// how many ticks per cycle.
var expanding;
var tickCount;
var ticksPerCycle;

// Get jQuery
var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

// Resets globals to default values. While by convention, main() is typically top of file, globals are also usually at
// the top and I feel it makes sense to have this method here as default values are defined herein.
function resetGlobals() {
    // Keeps track of angle theta we want to rotate
    theta = 0;

    // Array to keep track of surface normals for each coordinate
    surfaceNormals = [];


    // Array keeping track of the normal lines for each face. Different from regular surface normals, which give only direction.
    // Maybe a better way to do this? Computationally expensive to calculate each time, better to do once and store as array.
    normalLines = [];

    showNormals = false;

    segments = [];
    extents = [0, 0, 0, 0, 0, 0];

    // Which magnitude/direction to translate 1 or -1.
    translateMagnitude = 0;

    // Magnitudes of the x, y, z translations.
    magnitudes = [0, 0, 0];
    // Whether or not we're actually translating
    translating = false;

    // Whether or not we're rotating
    rotating = false;

    // Whether or not we're pulsing
    pulsing = false;

    expanding = true;
    tickCount = 0;
    ticksPerCycle = 20;
}

function loadFileFromServer(event, path) {
    var input = event.target;
    path = path.split('/');
    path.pop();
    path.push('datfiles');
    path.push(input[input.selectedIndex].innerHTML);
    path = path.join('/');

    $.ajax({
        url: path,
        success: function(data) {
            console.log(data);
            parseInput(data);
        }
    })
}

function main()
{
    resetGlobals();
    // Handler for changing mode or color when user presses corresponding key
    window.onkeypress = function(event) {
        switch(event.key) {
            // Toggle rotation on x axis around current position
            case("r"):
                rotating = !rotating;
                break;

            // Toggle pulsing
            case("b"):
                pulsing = !pulsing;
                break;

            default:
                handleTranslation(event);
                return;
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
        parseInput(dataURL);
    };
    if(input.files[0]) {
        // Reset all global variables, as this is a new drawing
        resetGlobals();
        reader.readAsText(input.files[0]);
    }
}

// Function for reading keyboard input and handling the translation of an image
function handleTranslation(event) {
    // If we're currently translating, stop!
    if(translating) {
        translating = false;
    }

    // Otherwise, start translating
    else {
        var mag = 0.1;
        translating = true;
        switch (event.key) {
            // Translate positive x by incrementing
            case("x"):
                magnitudeIndex = 0;
                translateMagnitude = mag;
                break;

            // Translate negative x
            case("c"):
                magnitudeIndex = 0;
                translateMagnitude = -mag;
                break;

            // Translate positive y
            case("y"):
                magnitudeIndex = 1;
                translateMagnitude = mag;
                break;

            // Translate negative y
            case("u"):
                magnitudeIndex = 1;
                translateMagnitude = -mag;
                break;

            // Translate positive z
            case("z"):
                magnitudeIndex = 2;
                translateMagnitude = mag;
                break;

            // Translate negative z
            case("a"):
                magnitudeIndex = 2;
                translateMagnitude = -mag;
                break;
            default:
                translating = false;
                break;
        }
    }
}

// Parses the coordinates from the given text.
// @param text: the text of the file being read
function parseInput(text) {
    var lines = text.split('\n');   // Splits text on newlines into an array of lines
    var i = 0;
    var numVertices;
    var numFaces;
    var vertices = [];
    var faces = [];

    // If this is not a .ply file, don't accept it
    if(!lines[0].includes("ply")) {
        alert("Not a .ply file!");
        return;
    }

    // Loop through header
    while(!lines[i].includes("end_header")) {
        if(lines[i]) {
            if (lines[i].includes("element vertex")) {
                numVertices = parseInt(lines[i].split(" ")[2]);
            }
            if (lines[i].includes("element face")) {
                numFaces = parseInt(lines[i].split(" ")[2]);
            }
            i++;
        }
    }

    i++;

    // Loop through vertices
    for(var j = 0; j < numVertices; j++) {
        // Splits line on spaces and filters out spaces/newlines
        var vertex = lines[i].split(" ").filter(function (elt) {
            return elt !== "";
        });
        // Parses each vertex as a float
        vertex = vertex.map(parseFloat);
        // Push this vertex onto the list of vertices
        vertices.push(vertex);

        // Check if this vertex has a coordinate outside our current extents
        // Check if x is bigger than our biggest x value
        if(vertex[0] > extents[0]) {
            extents[0] = vertex[0];
        }
        // Check if x is smaller than our smallest x value
        if(vertex[0] < extents[1]) {
            extents[1] = vertex[0];
        }
        // Check if y is bigger than our biggest y value
        if(vertex[1] > extents[2]) {
            extents[2] = vertex[1];
        }
        // Check if y is smaller than our smallest y value
        if(vertex[1] < extents[3]) {
            extents[3] = vertex[1];
        }
        // Check if z is bigger than our biggest z value
        if(vertex[2] > extents[4]) {
            extents[4] = vertex[2];
        }
        // Check if z is smaller than our smallest z value
        if(vertex[2] < extents[5]) {
            extents[5] = vertex[2];
        }

        i++;
    }

    // Loop through faces
    for(var k = 0; k < numFaces; k++) {
        // Splits line on spaces and filters out spaces/newlines
        var faceVertices = lines[i].split(" ").filter(function (elt) {
            return elt != "";
        });

        // Use callback function to prevent undesirable behavior with map and parseint
        var vertexNumbers = faceVertices.map(function(num) {
            return parseInt(num, 10);
        }).filter(function(elt) {   // Have to filter out NaN again b/c previous filter doesn't work.
            return !isNaN(elt);
        });

        var currentFace = [];
        // For each face, get each vertex's coordinates, create a vec4, and push to an array representing that face
        for(var f = 1; f < vertexNumbers.length; f++) {
            var coords = vertices[vertexNumbers[f]];
            var x = coords[0];
            var y = coords[1];
            var z = coords[2];
            currentFace.push(vec4(x, y, z, 1.0));
        }

        faces.push(currentFace);
        i++;
    }

    segments = faces;

    calculateSurfaceNormals();
    calculateNormalLines();
    setupRender();
}

// Perform necessary GL setup to prevent overhead in render() function
function setupRender() {
    if (segments.length === 0) {
        return;
    }

    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas);

    //Check that the return value is not null.
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    var fColorLoc = gl.getUniformLocation(program, "fColor");
    gl.uniform4f(fColorLoc, 0.0, 0.0, 0.0, 1.0);

    // Setup perspective using an FOV of 30 degrees and the z extents of the image for the front and far planes
    var fovy = 30;
    var thisProj = perspective(fovy, 1, extents[4], extents[5]);

    var projMatrix = gl.getUniformLocation(program, 'projMatrix');
    gl.uniformMatrix4fv(projMatrix, false, flatten(thisProj));

    // Calculate the midpoint of the image so we can calculate the position/distance the camera should be
    var midx = (extents[0] + extents[1]) / 2;
    var midy = (extents[2] + extents[3]) / 2;
    var midz = (extents[4] + extents[5]) / 2;

    // Looking from -z direction, so eye is at -z coordinate
    var eye = vec3(midx, midy, -midz - calculateDistance(fovy));
    var at = vec3(midx, midy, midz);
    var up = vec3(0.0, 1.0, 0.0);

    var viewMatrix = lookAt(eye, at, up);
    var viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

    render();
}

// WebGL setup and actual drawing split into 2 functions so overhead setup is not performed every time we animate a
// frame. This way has MASSIVE performance benefits.
function render() {
    clear();
    // Only increment theta if we are rotating
    if(rotating) {
        theta++;
    }

    // If we're translating, increase appropriate magnitude.
    if(translating) {
        magnitudes[magnitudeIndex] += translateMagnitude;
    }

    // If we're pulsing, increment pulse distance
    if(pulsing) {
        tick();
    }

    // Translate and rotate matrices will be the same for each point on any given render, so we can pre-calculate
    var rotMatrix = rotateX(theta);
    var translateMatrix = translate(magnitudes);

    // How far we want the pulsing polygons to move
    var pulseDist = 0.01 * tickCount * Math.max(Math.abs(extents[0] - extents[1]), Math.abs(extents[2] - extents[3]));

    // Performance improvements by moving gl setup functions outside the loop, worse organizationally but reduces
    // overhead
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    var modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    var vPosition = gl.getAttribLocation(program, "vPosition");

    for(var i = 0; i < segments.length; i++) {
        var points = segments[i];
        // Gets the direction of the normal vector
        var normVector = surfaceNormals[i];

        // Matrix representing the translations we use to "pulse" each face
        var pulseMatrix = translate(pulseDist * normVector[0], pulseDist * normVector[1], pulseDist * normVector[2]);

        // First we "scale" by translating along surface normals, then rotate.
        var ctMatrix = mult(rotMatrix, pulseMatrix);
        // Lastly, we apply translation to the matrix from the previous step.
        ctMatrix = mult(translateMatrix, ctMatrix);

        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(ctMatrix));

        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);    // Dynamic draw or stream draw might improve performance?

        // Interestingly, moving these 2 lines outside the loop seems to make performance slightly WORSE.
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.drawArrays(gl.LINE_LOOP, 0, points.length);

        // Toggles display of normal lines from the surface of each polygon.
        if(showNormals) {
            var normLine = normalLines[i];
            gl.bufferData(gl.ARRAY_BUFFER, flatten(normLine), gl.STATIC_DRAW);
            gl.drawArrays(gl.LINE_STRIP, 0, normLine.length);
        }
    }

    // Deletes the points buffer
    gl.deleteBuffer(pBuffer);
    requestAnimationFrame(render);
}

// Newell method to calculate surface normal
// @param points: the coordinates representing vertices of the face to calculate a normal for
function surfaceNormal(points) {
    var x = 0;
    var y = 0;
    var z = 0;

    // Do rest of points
    for(var i = 0; i < points.length - 1; i++) {
        x += (points[i][1] + points[i + 1][1]) * (points[i + 1][2] - points[i][2]); // x = y * z
        y += (points[i][2] + points[i + 1][2]) * (points[i + 1][0] - points[i][0]); // y = z * x
        z += (points[i][0] + points[i + 1][0]) * (points[i + 1][1] - points[i][1]); // z = x * y
    }

    // Do first and last
    x += (points[points.length - 1][1] + points[0][1]) * (points[0][2] - points[points.length - 1][2]); // x = y * z
    y += (points[points.length - 1][2] + points[0][2]) * (points[0][0] - points[points.length - 1][0]); // y = z * x
    z += (points[points.length - 1][0] + points[0][0]) * (points[0][1] - points[points.length - 1][1]); // z = x * y

    // Normalize the vector
    var length = Math.sqrt(x * x + y * y + z * z);
    return vec4(x / length, y / length, z / length, 1.0);
}

// Calculates surface normals for each polygon
function calculateSurfaceNormals() {
    const len = segments.length;
    for(var i = 0; i < len; i++) {
        var points = segments[i];
        var normalVector = surfaceNormal(points);
        surfaceNormals.push(normalVector);
    }
}

// Calculates normal LINES for each polygon (surface normal & another point along that line)
function calculateNormalLines() {
    const len = segments.length;
    for(var i = 0; i < len; i++) {
        var points = segments[i];
        var normalVector = surfaceNormals[i];
        // Scales each line by 1/10 of the longest dimension of the shape
        var scaleFactor = 0.1 * Math.max(Math.abs(extents[0] - extents[1]), Math.abs(extents[2] - extents[3]));

        // Find center of each surface so the surface normal can be positioned there
        var x = (points[0][0] + points[1][0] + points[2][0]) / 3;
        var y = (points[0][1] + points[1][1] + points[2][1]) / 3;
        var z = (points[0][2] + points[1][2] + points[2][2]) / 3;

        var centered = vec4(x, y, z, 1.0);

        normalLines.push([centered, vec4(centered[0] + normalVector[0] * scaleFactor, centered[1] + normalVector[1] * scaleFactor, centered[2] + normalVector[2] * scaleFactor, 1.0)]);
    }
}

// Given the desired fov, calculate the distance we need to pull camera back in order to see entire scene.
// @param fov: the FOV angle in degrees we want to calculate distance for
function calculateDistance(fov) {
    // Calculate longest edge of the image, to make sure we pull back far enough from it
    var longestEdge = Math.max(Math.abs(extents[0] - extents[1]), Math.abs(extents[2] - extents[3]));
    return 3 * longestEdge / Math.sin(fov);    // Multiplying by 2 would ensure the bounds of the image would touch the
                                        // bounds of the canvas. Multiplying by 3 means it takes only 2/3 the canvas.
}

// Clears the canvas
function clear() {
    // Gets canvas element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = WebGLUtils.setupWebGL(canvas);

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    // Clear <canvas> by clearing the color buffer
    gl.clear(gl.COLOR_BUFFER_BIT);
}

// Handles logic necessary for pulsing
function tick() {
    //If we've expanded for a full cycle, start contracting
    if(expanding) {
        tickCount++;
        if(tickCount >= ticksPerCycle) {
            expanding = false;
        }
    }
    else {
        tickCount--;
        if(tickCount <= 0) {
            expanding = true;
        }
    }
}

// Toggles displaying normal lines on the image
function toggleShowNormals() {
    showNormals = !showNormals;
}