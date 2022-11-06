var nj = require('numjs');
var Jimp = require('jimp');
const path = require('path');
const fs = require('fs');
var getPixels = require("get-pixels")

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

function addMatMat(a, b) {
    let res = a;
    for (let i = 0; i < res.length; i++) {
        for (let j = 0; j < res[i].length; j++) {
            res[i][j] += b[i][0];
        } 
    } 
    return res;
}

function minusMatMat(a, b) {
    let res = a;
    for (let i = 0; i < res.length; i++) {
        for (let j = 0; j < res[i].length; j++) {
            res[i][j] -= b[i][0];
        } 
    } 
    return res;
}

function StrangeSum(matrix) {
    res = [];
    for (let i = 0; i < matrix.length; i++) {
        sum = 0
        for (let j = 0; j < matrix[i].length; j++) {
            sum += matrix[i][0];
        } 
        res.push([sum])
    } 
    return res
}

function multMatVar(a, b) {
    let res = a;
    for (let i = 0; i < res.length; i++) {
        for (let j = 0; j < res[i].length; j++) {
            res[i][j] = res[i][j] * b;
        } 
    } 
    return res;
}

function strangeSum(matrix) {
    res = [];
    for (let i = 0; i < matrix.shape[0]; i++) {
        sum = 0
        for (let j = 0; j < matrix.shape[1]; j++) {
            sum += matrix[i][0];
        } 
        res.push([sum])
    } 
    return res
}











function initializer(layers_dim, shape) {
    res = {};
    console.log("sahpe : " + shape)
    console.log(layers_dim)
    for (let i = 1; i < layers_dim.length; i++) {
        res["W" + i] = (nj.random([layers_dim[i],layers_dim[i-1]]));
        res["b" + i] = (nj.random([layers_dim[i],1]));
        temp = (nj.random([layers_dim[i],1]));
        for (let j = 1; j < shape; j++) {
            res["b" + i] =  nj.concatenate(res["b" + i], temp);
        }
        console.log(res["b" + i].shape)
    }
    return res;
}

function Initializer(layers_dim) {
    res = {};
    for (let i = 1; i < layers_dim.length; i++) {
        var w = [];
        var temp;
        for (let j = 0; j < layers_dim[i]; j++) {
            temp = [];
            for (let v = 0; v < layers_dim[i-1]; v++) {
                temp.push(Math.random());
            }
            w.push(temp);
        }
        res["W" + i] = w;
    }
    
    for (let i = 1; i < layers_dim.length; i++) {
        var b = [];
        var temp;
        for (let j = 0; j < layers_dim[i]; j++) {
            temp = [];
            temp.push(Math.random());
            b.push(temp);
        }
        res["b" + i] = b;
    }
    return res;
}

function sigmoid(matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            matrix[i][j] = 1 / (1 + Math.exp(-matrix[i][j]));
        } 
    } 
    return matrix;
}

function derivSigmoid(matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            matrix[i][j] = matrix[i][j] * (1 - matrix[i][j]);
        } 
    } 
    return matrix;
}

function ForwardPropagation(X, params) {
    res = {};
    res["A0"] = X;
    pre = 1-1;
    L = Object.keys(params).length / 2;
    for (let i = 1; i < L+1; i++) {
        pre = i-1;
        Z = multiply(params["W" + i], res["A" + pre]);
        Z = addMatMat(Z, params["b" + i]);
        Z = sigmoid(Z);
        res["A" + i.toString()] = Z;
    }
    return res;
}

function forwardPropagation(X, params) {
    res = {};
    res["A0"] = X;
    pre = 1-1;
    L = Object.keys(params).length / 2;
    for (let i = 1; i < L+1; i++) {
        pre = i-1;
        Z = nj.sigmoid(nj.add(nj.dot(params["W" + i], res["A" + pre]), params["b" + i]))
        res["A" + i.toString()] = Z;
    }
    return res;
}


function CalculGradients(caches, y, params) {
    gradients = {};
    m = y.length
    L = Object.keys(params).length / 2;
    dZ = minusMatMat(caches["A" + L], y);

    for (let i = L; i > 0; i--){
        pre = L-1
        gradients["dW" + i] = multMatVar(multiply(dZ, transpose(caches["A" + pre])), 1/m)
        gradients["db" + i] = multMatVar(StrangeSum(dZ), 1/m)
        dZ = multiply(multiply(transpose(params["W" + i]), dZ), derivSigmoid(caches["A" + pre]))
    }

    return gradients;
}

function calculGradients(caches, y, params) {
    gradients = {};
    m = y.length
    L = Object.keys(params).length / 2;

    dZ = nj.subtract(caches["A" + L], y);

    for (let i = L; i > 0; i--){
        pre = L-1
        gradients["dW" + i] = multNjVar(nj.dot(dZ, caches["A" + pre].T), 1/m)
        //gradients["db" + i] = 
        console.log(nj.sum(dZ))
        dZ = nj.dot(nj.dot(params["W" + i].T, dZ), nj.sigmoid(caches["A" + pre])) // need derivate of sigmoid
    }

    return gradients;
}

function multNjVar(matrix, mult) {
    for (let i = 0; i < matrix.shape[0]; i++) {
        for (let j = 0; j < matrix.shape[1]; j++) {
           val = matrix.get(i, j)
           val = val * mult;
           matrix.set(i, j, val);
        } 
    } 
    return matrix;
}

function BackwardPropagation(X, y, params, caches, lr) {
    gradients = calculGradients(caches, y, params);
    L = Object.keys(params).length / 2;
    for (let i = L; i > 0; i--){
        params["W" + i] = minusMatMat(params["W" + i], multMatVar(gradients["dW" + i], lr))
        params["b" + i] = minusMatMat(params["b" + i], multMatVar(gradients["db" + i], lr))
    }
    return params;
}

function Predict(X, params) {
    caches = ForwardPropagation(X, params);
    L = Object.keys(params).length / 2;
    AL = caches["A" + L];
    console.log(AL)
    for (let i = 0; i < AL.length; i++) {
        for (let j = 0; j < AL[i].length; j++) {
            console.log(AL[i][j])
            AL[i][j] = AL >= 0.5;
            
        } 
    } 
    return AL
}

function NeuralNetwork(X, y, layers_dim, lr, niter) {
    params = Initializer(layers_dim);

    for (let i = 0; i <= niter; i++) {
        console.log(i)
        caches = ForwardPropagation(X, params);
        params = BackwardPropagation(X, y, params, caches, lr);
    }

    y_pred = Predict(X, params)

    return y_pred;
}



(async () => {

    X = nj.random([5,2]);
    X = X.T
    y = nj.ones([1,5]);
    init = initializer([X.shape[0], 32, 64, y.shape[0]], X.shape[1]);

    Xbis = [[-4.07989383 , 3.57150086 ],
    [ 2.47034915 , 4.09862906],    
    [ 1.7373078  , 4.42546234],   
    [ 0.74285061,  1.46351659],  
    [ 0.87305123 , 4.71438583]]  
    ybis =  [[1],
        [0],
        [0],
        [1],
        [0]]

    //ini = Initializer([Xbis.length, 32, 64, ybis[0].length])

    //caches = forwardPropagation(Xbis, ini);
    //console.log(caches["A" + Object.keys(caches).length / 2]);
    //grad = calculGradients(caches, ybis, ini)
    //console.log(grad["dW" + 2])

    //bp = backwardPropagation(Xbis, ybis, ini, caches, 0.01)

    //console.log(neuralNetwork(Xbis, ybis, [Xbis.length, 32, 64, ybis[0].length], 0.01, 100))


    /*
    links = getPhotoLink("cats");
    array = shuffleArray(links);
    img = await getImage("cats", array, 0, 100);
    y = getY(array);
    */
   console.log("here")
    console.log(NeuralNetwork(Xbis, ybis, [Xbis.length, 32, 64, ybis[0].length], 0.01, 100))
    
    /*
    caches = forwardPropagation(X, init);
    grad = calculGradients(caches, y, init)
    console.log(caches["A2"])*/

}
)();
