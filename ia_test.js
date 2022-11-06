var Jimp = require('jimp');
const path = require('path');
const fs = require('fs');
var getPixels = require("get-pixels")

///////////////////////////////////////////////
////////        Utilities              ////////
///////////////////////////////////////////////

function getPhotoLink(folder) {
    let links = fs.readdirSync(folder);
    return links;
}

async function greyscale(link) {
    const image = await Jimp.read(link);
    image.grayscale().write(link);
 }
 async function greyscaleFolder(folder) {
    links = getPhotoLink(folder);
    for (let i = 0; i < links.length; i++) {
        greyscale(folder + "/" + links[i]);
    }
}

async function resize(link) {
    const image = await Jimp.read(link);
    image.resize(64,64,Jimp.RESIZE_BEZIER, function(err){
       if (err) throw err;
    }).write(link);
 }

 async function resizeFolder(folder) {
    links = getPhotoLink(folder);
    for (let i = 0; i < links.length; i++) {
        resize(folder + "/" + links[i]);
    }
}

// convert img in array of pixel (RGBA to just one color)
// also normalize the data 
function imageToArray(link) {
    return new Promise((resolve, reject) => {
        getPixels(link, function(err, pixels) {
            if(err) {
              console.log("Bad image path")
              reject(err)
            }
            else {
                var array = [];
                for (let i = 0; i < pixels.data.length; i++) {
                    if (i % 4 == 0) {
                        array.push(pixels.data[i] / 254);
                    }
                }
                resolve(array)
            }
          })
    });
}

async function waitImage(link) {
    return await imageToArray(link).then(array => {return array});
}

async function getImage(folder, links, min, max) {
    var array = [];
    for (let i = min; i < max; i++) {
        array.push(await waitImage(folder + "/" + links[i]));
    }
   return array;
}

function multiply(a, b) {
    var aNumRows = a.length;
    var aNumCols = a[0].length;
    var bNumRows = b.length;
    var bNumCols = b[0].length;
    var m = new Array(aNumRows);
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols);
        for (var c = 0; c < bNumCols; ++c) {
            m[r][c] = 0;
            for (var i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
}

function addMatVar(array, variable) {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            array[i][j] += variable;
        }
    }
    return array;
}

function subMatMat(array, bis) {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            array[i][j] -= bis[i][j];
        }
    }
    return array;
}

function transpose(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const grid = [];
    for (let j = 0; j < cols; j++) {
      grid[j] = Array(rows);
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        grid[j][i] = matrix[i][j];
      }
    }
    return grid;
  }

///////////////////////////////////////////////
////////            iA                 ////////
///////////////////////////////////////////////

function Initializer(array) {
    var w = [];
    var temp;
    for (let i = 0; i < array[0].length; i++) {
        temp = [];
        temp.push(0.005);
        w.push(temp);
    }
    var b = Math.random();
    return [w, b]
}

// take the tested value, weight and bias
// return the model
function model(X, W, b) {
    var Z = multiply(X, W);
    Z = addMatVar(Z, b);
    var A = Z;
    for (let i = 0; i < A.length; i++) {
        A[i][0] = 1 / (1 + Math.exp(-Z[i][0]));
    } 
    return A;
}

// calculate the loss/cost
function crossEntropy(A, y) {
    var epsilon = Number.EPSILON;
    var sum = 0
    for (let i = 0; i < A.length; i++) {
        sum += y[i][0] * Math.log(A[i][0] + epsilon) + (1 - y[i][0]) * Math.log(1- A[i][0] + epsilon);
    }
    return - 1/y.length * sum;
}

// take the array, model and 
// return the gradients
function gradients(X, A, y) {
    var xT = transpose(X);
    var sub = subMatMat(A, y);
    var dW = multiply(xT,  sub);
    for (let i = 0; i < dW.length; i++) {
        dW[i][0] = dW[i][0] * 1 / y.length;
    }

    var db = 0;
    for (let i = 0; i < sub.length; i++) {
        db += sub[i][0];
    }
    db = db * 1 / y.length;
    return [dW, db];
}

// take the weight, bias, gradients, and learning rate
// return the updated weight and bias
function update(W, b, dW, db, lr) {
    for (let i = 0; i < W.length; i++) {
        W[i][0] -= lr * dW[i][0];
    }
    b -= lr * db;
    return [W, b];
}


// a test
function predict(X, W, b) {
    var A = model(X, W, b);
    var res = [];
    console.log("A")
    console.log(A)

    for (let i = 0; i < A.length; i++) {
        res.push([A[i][0] >= 0.5]);
    }
    return res;
}

function neurone(X, y, lr, niter) {
    var i = Initializer(X);
    var W = i[0];
    var b = i[1];

    for (let i = 0; i < niter; i++) {
        var A = model(X, W, b);
        //console.log(A)
        var g = gradients(X, A, y);
        var dW = g[0];
        var db = g[1];

        u = update(W, b, dW, db, lr);
        W = u[0];
        b = u[1];

        console.log(i/niter * 100)
    }
    return [W, b]
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}

function getY(links) {
    array = [];
    for (let i = 0; i < links.length; i++) {
        if (links[i].includes("dog")) {
            array.push([1]);
        }
        else {
            array.push([0]);
        }
    }
    return array
}

function accuracy(array, test) {
    var correct = 0;
    for (let i = 0; i < test.length; i++) {
        if (array[i][0] == test[i][0]) {
            correct += 1;
        }
    }
    return correct / test.length;
}

(async () => {

    links = getPhotoLink("cats");
    array = shuffleArray(links);
    img = await getImage("cats", array, 0, 100);
    y = getY(array);
 
    console.log("starting neurone")
    n = neurone(img, y, 0.001, 100);
    console.log(n)

    console.log("verif result")
    linksBis = getPhotoLink("dogs");
    arrayBis = shuffleArray(linksBis);
    imgBis = await getImage("dogs", arrayBis, 1400, 1500);
    ar = [];
    l = [];
    for (let i = 1000; i < 1500; i++) {
        l.push(linksBis[i]);
        ar.push(arrayBis[i]);
    }
    console.log("result")
    yBis = getY(ar);
    pred = predict(imgBis, n[0], n[1]);
    console.log("pred")
    console.log(pred)
    console.log(l)
    
}
)();
