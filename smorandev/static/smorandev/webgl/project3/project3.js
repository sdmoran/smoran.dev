// Sam Moran, CS4731 E19

var colors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 1.0, 1.0, 1.0, 1.0 ]   // white
];

// The number of coordinates we use in drawing the lines connecting shapes
var lineLength = 7;

// Angle beyond which faces will not be lit
var spotlightCutoff = 0.9;

// Angle of rotation
var theta = 0;

// Normals for regular Gouraud shading
var normalsArray = [];

// Normals for flat shading
var flatNormals = [];

// Lighting values
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

// Material properties for use with lighting values
var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.5, 0.5, 0.5, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

// Products of multiplying material properties and lighting values
var diffuseProduct;
var specularProduct;
var ambientProduct;

// Locations of modelview and projection matrices
var modelView, projection;

// Modelview and projection matrices
var mvMatrix, pMatrix;

// WebGL context
var gl;

//Vertices for drawing sphere
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

// Array containing all the points we will draw
var pointsArray = [];

// Draws cube, sphere, and lines by adding them to pointsArray so we can use later.
drawCube(0, 0, 0, 0.5);
drawSphere(va, vb, vc, vd, 5);
drawLine();

// Modelview matrix stack
var stack = [];

function main()
{
    window.onkeypress = function(event) {
        switch(event.key) {
            // Increase angle of spotlight
            case("p"):
                spotlightCutoff -= 0.01;
                gl.uniform1f(gl.getUniformLocation(program, "spotlightCutoff"), spotlightCutoff);
                break;
            // Decrease angle of spotlight
            case("P"):
                spotlightCutoff += 0.01;
                gl.uniform1f(gl.getUniformLocation(program, "spotlightCutoff"), spotlightCutoff);
                break;
            // Turn Gouraud shading on
            case("m"):
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
                break;
            // Turn flat shading on
            case("M"):
                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(flatNormals), gl.STATIC_DRAW);
                break;
            default:
                return;
        }
    };

    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas);

    //Check that the return value is not null.
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    //Set up the viewport
    gl.viewport( 0, 0, 400, 400);

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas> by clearing the color buffer
    gl.enable(gl.DEPTH_TEST);


    projection = gl.getUniformLocation(program, "projMatrix");
    modelView = gl.getUniformLocation(program, "modelMatrix");

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Enable backface culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var vBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Perform multiplication with lighting and material properties to get lighting values
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    var ambientProduct = mult(lightAmbient, materialAmbient);

    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);
    gl.uniform1f(gl.getUniformLocation(program, "spotlightCutoff"), spotlightCutoff);

    modelView = gl.getUniformLocation( program, "modelViewMatrix" );
    projection = gl.getUniformLocation( program, "projectionMatrix" );

    render();
}

var id;

function render() {
    // Sets up perspective projection
    pMatrix = perspective(30, 1, .1, 100);
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix));

    // Gets location of color value in program
    var colorLoc = gl.getUniformLocation(program, "vColor");
    gl.uniform4fv(colorLoc, colors[1]); // Defaults colors to red

    // Initializes modelView matrix
    var eye = vec3(0, 0, 10);
    var at = vec3(0, 0, 0);
    var up = vec3(0, 1.0, 0);

    mvMatrix = lookAt(eye, at, up);
    // Increment theta so our rotation increases at each step
    theta += 0.5;

    // // This is the "base" transformation, rotating theta degrees around y axis.
    mvMatrix = mult(mvMatrix, rotateY(theta));  // Rotates ENTIRE model about Y axis
    stack.push(mvMatrix);   // Save this matrix for later use

    mvMatrix = mult(mvMatrix, translate(0, 2, 0));  // Positions first object at top of frame
    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));   // Updates mvmatrix in WebGL
    // Draws top level cube, with default color
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    // Draws lines to connect
    gl.uniform4fv(colorLoc, colors[0]);
    gl.drawArrays(gl.LINE_STRIP, pointsArray.length - lineLength, lineLength);

        // One layer down
        mvMatrix = mult(mvMatrix, translate(0, -2, 0));

        // Push base matrix for this side of the tree
        mvMatrix = mult(mvMatrix, scalem(0.5, 0.5, 0.5));
        stack.push(mvMatrix);

            mvMatrix = mult(mvMatrix, translate(0, 0, -3)); // Translate this shape out from the above layer
            mvMatrix = mult(mvMatrix, rotateY(-3 * theta));  // Rotate this shape and those below it counterclockwise about its own axis
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            gl.uniform4fv(colorLoc, colors[2]); // Change color
            gl.drawArrays(gl.TRIANGLES, 36, pointsArray.length - 36 - lineLength);


            // Scale and draw connector lines
            stack.push(mvMatrix);
                mvMatrix = mult(mvMatrix, scalem(2.0, 2.0, 1.34));
                gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix));
                gl.uniform4fv(colorLoc, colors[0]); // Change color to black, as we don't these lines to be lit
                gl.drawArrays(gl.LINE_STRIP, pointsArray.length - lineLength, lineLength);
            mvMatrix = stack.pop();

            stack.push(mvMatrix); // Save current modelview matrix

                mvMatrix = mult(mvMatrix, translate(0, -4, -2));    // Because we're at half scale, transformations double
                mvMatrix = mult(mvMatrix, rotateY(3 * theta));  // Rotate this shape counterclockwise about its own axis
                gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
                gl.uniform4fv(colorLoc, colors[3]); // Change color
                gl.drawArrays(gl.TRIANGLES, 36, pointsArray.length - 36 - lineLength);
            mvMatrix = stack.pop(); // Go up 1 level in hierarchy
            stack.push(mvMatrix); // Save current modelview matrix

                mvMatrix = mult(mvMatrix, translate(0, -4, 2));    // Because we're at half scale, transformations double
                mvMatrix = mult(mvMatrix, rotateY(3 * theta));  // Rotate this shape counterclockwise about its own axis
                gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
                gl.uniform4fv(colorLoc, colors[4]);  // Change color
                gl.drawArrays(gl.TRIANGLES, 36, pointsArray.length - 36 - lineLength);
            mvMatrix = stack.pop(); // Go up 1 level in hierarchy

        mvMatrix = stack.pop(); // Go up 1 level in hierarchy
        mvMatrix = stack.pop(); // Get rid of half scale we used for the sphere side

            mvMatrix = mult(mvMatrix, translate(0, 0, 1.5));  // Move in positive z direction
            mvMatrix = mult(mvMatrix, rotateY(-2 * theta));  // Rotate this shape and those below it counterclockwise about its own axis
            gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
            gl.uniform4fv(colorLoc, colors[5]);  // Change color
            gl.drawArrays(gl.TRIANGLES, 0, 36);

            // Scale and draw connector lines
            stack.push(mvMatrix);
                mvMatrix = mult(mvMatrix, scalem(1, 1, 0.67));
                gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
                gl.uniform4fv(colorLoc, colors[0]);  // Change color to black, as we don't want these lines to be lit
                gl.drawArrays(gl.LINE_STRIP, pointsArray.length - lineLength, lineLength);
            mvMatrix = stack.pop();  // Go up 1 level in hierarchy

    stack.push(mvMatrix);
                mvMatrix = mult(mvMatrix, translate(0, -2, 1));  // Move in positive z direction
                mvMatrix = mult(mvMatrix, rotateY(3 * theta));  // Rotate this shape counterclockwise about its own axis
                gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
                gl.uniform4fv(colorLoc, colors[6]);   // Change color
                gl.drawArrays(gl.TRIANGLES, 0, 36);

            mvMatrix = stack.pop();  // Go up 1 level in hierarchy

    mvMatrix = mult(mvMatrix, translate(0, -2, -1));  // Move in positive z direction
                mvMatrix = mult(mvMatrix, rotateY(3 * theta));  // Rotate this shape counterclockwise about its own axis
                gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
                gl.uniform4fv(colorLoc, colors[7]);   // Change color
                gl.drawArrays(gl.TRIANGLES, 0, 36);

    id = requestAnimationFrame(render);
}

// Pushes coordinates necessary for drawing a cube to pointsArray.
// @param x: the x coordinate of the center of the cube
// @param y: the y coordinate of the center of the cube
// @param z: the z coordinate of the center of the cube
// @param scale: how long each face of the cube should be
function drawCube(x, y, z, scale) {
    var cubeCoords = [];

    // Declare vertices relative to center and scale
    var vertices = [
        vec4(x - scale, y - scale, z - scale, 1.0 ),
        vec4(x + scale, y - scale, z - scale, 1.0 ),
        vec4(x + scale, y + scale, z - scale, 1.0 ),
        vec4(x - scale, y + scale, z - scale, 1.0 ),
        vec4(x - scale, y - scale, z + scale, 1.0 ),
        vec4(x + scale, y - scale, z + scale, 1.0 ),
        vec4(x + scale, y + scale, z + scale, 1.0 ),
        vec4(x - scale, y + scale, z + scale, 1.0 ),
    ];

    // Function to push a surface and its surface normal.
    function pushFace(a, b, c, d) {
        var v1 = vertices[a];
        var v2 = vertices[b];
        var v3 = vertices[c];
        var v4 = vertices[d];

        // Push half of face
        pointsArray.push(v1);
        pointsArray.push(v2);
        pointsArray.push(v3);

        // Push other half
        pointsArray.push(v1);
        pointsArray.push(v3);
        pointsArray.push(v4);

        // Also push normals for both side, both Gouraud and Flat versions
        normalsArray.push(v1[0], v1[1], v1[2], 0.0);
        normalsArray.push(v2[0], v2[1], v2[2], 0.0);
        normalsArray.push(v3[0], v3[1], v3[2], 0.0);

        normalsArray.push(v1[0], v1[1], v1[2], 0.0);
        normalsArray.push(v3[0], v3[1], v3[2], 0.0);
        normalsArray.push(v4[0], v4[1], v4[2], 0.0);

        // This isn't quite right, but couldn't figure it out more.
        flatNormals.push((v1[0] + v3[0]) / 2, (v1[1] + v3[1]) / 2, (v1[2] + v3[2]) / 2, 0.0);
        flatNormals.push((v1[0] + v3[0]) / 2, (v1[1] + v3[1]) / 2, (v1[2] + v3[2]) / 2, 0.0);
        flatNormals.push((v1[0] + v3[0]) / 2, (v1[1] + v3[1]) / 2, (v1[2] + v3[2]) / 2, 0.0);
        flatNormals.push((v1[0] + v3[0]) / 2, (v1[1] + v3[1]) / 2, (v1[2] + v3[2]) / 2, 0.0);
        flatNormals.push((v1[0] + v3[0]) / 2, (v1[1] + v3[1]) / 2, (v1[2] + v3[2]) / 2, 0.0);
        flatNormals.push((v1[0] + v3[0]) / 2, (v1[1] + v3[1]) / 2, (v1[2] + v3[2]) / 2, 0.0);

    }

    // Face 1
    pushFace(3, 2, 1, 0);

    // Face 2
    pushFace(6, 7, 4, 5);

    // Face 3
    pushFace(5, 1, 2, 6);

    // Face 4
    pushFace(0, 4, 7, 3);

    // Face 5
    pushFace(6, 2, 3, 7);

    // Face 6
    pushFace(4, 0, 1, 5);

    return cubeCoords;
}

// Pushes coordinates necessary for drawing a sphere to pointsArray.
// @param a: first coordinate to subdivide
// @param b: second coordinate to subdivide
// @param c: third coordinate to subdivide
// @param d: fourth coordinate to subdivide
// @param n: number of times to subdivide
function drawSphere(a, b, c, d, n) {
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
}

// Pushes coordinates necessary for drawing a sphere to pointsArray.
// @param a: first coordinate to subdivide
// @param b: second coordinate to subdivide
// @param c: third coordinate to subdivide
// @param n: number of times left to subdivide
function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }

    // Pushes points to array
    function triangle(a, b, c) {
        // Order of these vertices reversed in order for culling to work as expected.
        pointsArray.push(c);
        pointsArray.push(b);
        pointsArray.push(a);

        // Average normal points and push to normals array 3 times for flat shading
        flatNormals.push((a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3, 0.0);
        flatNormals.push((a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3, 0.0);
        flatNormals.push((a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3, 0.0);

        // Normals are vectors
        normalsArray.push(c[0],c[1], c[2], 0.0);
        normalsArray.push(b[0],b[1], b[2], 0.0);
        normalsArray.push(a[0],a[1], a[2], 0.0);

    }
}

// Pushes coordinates necessary to draw connector lines to the pointsArray
function drawLine() {
    // 1 side of line
    pointsArray.push(vec4(0.0, -2.0, -1.5, 1.0), vec4(0.0, -1.0, -1.5, 1.0), vec4(0.0, -1.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0),
            vec4(0.0, -1.0, 0.0, 1.0), vec4(0.0, -1.0, 1.5, 1.0), vec4(0.0, -2.0, 1.5, 1.0));

    lineLength = 7;
    for(var i = 0; i < lineLength; i++) {
        normalsArray.push(0.0, 0.0, 0.0, 0.0);
        flatNormals.push(0.0, 0.0, 0.0, 0.0);
    }
}