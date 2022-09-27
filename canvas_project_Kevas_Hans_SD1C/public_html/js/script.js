
let radius = 10
let canvas = null
let ctx = null
let offscreenCanvas = null
let offscreenCanvasCtx = null
let imageWidth = 100
let imageHeight = 100
let imageX = 250
let imageY = 250
let rotation = 0
let draw = false
let mouseX = 0
let mouseY = 0
let addText = 0
let textLocationX = 0
let textLocationY = 0
let borderColor = ""
let fillColor = ""
let isDraggable = false
let alphaImage = new Image()
alphaImage.src = 'img/frame.png'
let root = document.documentElement
let penSize = 0.05
let drawTextToggle = null

//test

var texts = []
var selectedText = -1
let textX = 0
let textY = 0
let text = ""

let img1 = new Image()
img1.src = "img/marble.jpg"
let img2 = new Image()
img2.src = "img/marble.jpg"
let img3 = new Image()
img3.src = "img/marble.jpg"
let offsetX = 0
let offsetY = 0
let imgJson = [{ src: img1, x: 50, y: 50, width: 100, height: 100, rotation: 0, greyScale: false, brightness: 0, filter: "none", rgb: [0, 0, 0], convolution: "none" }]
//            }
let currentImageIndex = 0
let greyscaleBrightnessFactor = 0

let brightnessLevelRed = 0
let brightnessLevelGreen = 0
let brightnessLevelBlue = 0

let filter = null

let embossConvolutionMatrix = [0, 0, 0,
    0, 2, -1,
    0, -1, 0]

let blurConvolutionMatrix = [1, 2, 1,
    2, 4, 2,
    1, 2, 1]

let sharpenConvolutionMatrix = [0, -2, 0,
    -2, 11, -2,
    0, -2, 0]

let edgeDetectionConvolutionMatrix = [1, 1, 1,
    1, -7, 1,
    1, 1, 1]

let noConvolutionMatrix = [0, 0, 0,
    0, 1, 0,
    0, 0, 0]

let convolvedPixel = null
let convolutionMatrix = null
let imageData = null
let data = null
let originalImageData = null
let originalData = null

let position = { x: 0, y: 0 }
let counter = 0
let minFontSize = 3
let angleDistortion = 0
let letters = "There was a table set out under a tree in front of the house, and the March Hare and the Hatter were having tea at it: a Dormouse was sitting between them, fast asleep, and the other two were using it as a cushion, resting their elbows on it, and talking over its head. 'Very uncomfortable for the Dormouse,' thought Alice; 'only, as it's asleep, I suppose it doesn't mind.'";
let mouse = { x: 0, y: 0, down: false }

window.onload = onAllAssetsLoaded
document.write("<div id='loadingMessage'>Loading...</div>")
function onAllAssetsLoaded() {
    // hide the webpage loading message
    layer()
    document.getElementById('loadingMessage').style.visibility = "hidden"

    canvas = document.getElementById("canvas")
    ctx = canvas.getContext("2d")
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    ctx.fillStyle = "red"

    //canvas 2
    canvas2 = document.getElementById("canvas2")
    ctx2 = canvas2.getContext("2d")
    canvas2.width = canvas.clientWidth
    canvas2.height = canvas.clientHeight

    //offscreen
    offscreenCanvas = document.createElement('canvas')
    offscreenCanvasCtx = offscreenCanvas.getContext('2d')
    offscreenCanvas.width = canvas.width
    offscreenCanvas.height = canvas.height

    //draw text
    position.y = canvas.clientHeight / 2

    renderCanvas()

    canvas.addEventListener('mousedown', mousedownHandler)
    canvas.addEventListener('mousemove', moveHandler)
    canvas.addEventListener('mouseup', mouseUpHandler)
    canvas.addEventListener('mousedown', positionSet)
    canvas.addEventListener('dblclick', doubleClick, false)
    window.onmousewheel = document.onmousewheel = mousewheelHandler
    imageLoader.addEventListener('change', handleImage, false)

    //set defaults
    document.getElementById("lightMode").click()
    document.getElementById("imgTab").click()
    penColor = document.getElementById("penColorPicker").value

}
Math.degrees = function (radians) {
    return radians * 180 / Math.PI
}
Math.radians = function (degrees) {
    return degrees * Math.PI / 180
}
function setRotationDegrees(newRotationDegrees) {
    imgJson[currentImageIndex].rotation = newRotationDegrees
    renderCanvas()
}
function setBrightness(newBrightness) {
    imgJson[currentImageIndex].brightness = parseInt(newBrightness)

    renderCanvas()
}

function filterChoose(filterName) {
    imgJson[currentImageIndex].filter = filterName

    renderCanvas()
}

function convolutionChoose(convolutionType) {
    imgJson[currentImageIndex].convolution = convolutionType
    renderCanvas()
}

function renderCanvas() {
    clearBox()
    layer()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let doubleBuffer = document.createElement('canvas')
    let doubleBufferCtx = doubleBuffer.getContext('2d')
    doubleBuffer.width = canvas.width
    doubleBuffer.height = canvas.height


    ///ALPHA COMP

    let offset = 10
    let shadowColour = '#FFFFFF'
    let alphaMode = document.getElementById("alphaSelection").value


    doubleBufferCtx.drawImage(alphaImage, 0, 0, 400, 400)


    doubleBufferCtx.globalCompositeOperation = alphaMode


    doubleBufferCtx.beginPath()
    doubleBufferCtx.fillStyle = shadowColour
    doubleBufferCtx.fillRect(0, 0, canvas.width, canvas.height)
    doubleBufferCtx.closePath()


    //canvas.toDataURL('image/png')

    doubleBufferCtx.drawImage(canvas, 0, 0, 350, 350)


    //DRAGGABLE TEXT
    for (var i = 0; i < texts.length; i++) {
        var text = texts[i];
        ctx.strokeText(text.text, text.textX, text.textY);
        ctx.fillText(text.text, text.textX, text.textY);

    }

    imgJson.map((image, index) => {
        offscreenCanvasCtx.clearRect(0, 0, canvas.width, canvas.height)
        if (currentImageIndex === index) {

            offscreenCanvasCtx.fillStyle = "red"
            offscreenCanvasCtx.fillRect(image.x - 5, image.y - 5, image.width + 10, image.height + 10)


        }
        offscreenCanvasCtx.drawImage(image.src, image.x, image.y, image.width, image.height)


        if (image.greyScale) {
            imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height)

            for (let i = 0; i < imageData.data.length; i += 4) {

                grayscale = (imageData.data[i + 0] + imageData.data[i + 1] + imageData.data[i + 2]) / 3
                //                            grayscale *= greyscaleBrightnessFactor
                imageData.data[i + 0] = grayscale + image.brightness
                imageData.data[i + 1] = grayscale + image.brightness
                imageData.data[i + 2] = grayscale + image.brightness
                imageData.data[i + 3] = 255
            }
            offscreenCanvasCtx.putImageData(imageData, image.x, image.y)
        }

        imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height)

        if (image.filter === "sepia") {
            sepiaFilter()
        } else if (image.filter === "invert") {
            invertFilter()
        } else if (image.filter === "posterise") {
            posteriseFilter()
        } else if (image.filter === "threshold") {
            thresholdFilter()
        }

        if (image.rgb) {
            for (let i = 0; i < imageData.data.length; i += 4) {


                //                            grayscale *= greyscaleBrightnessFactor
                imageData.data[i + 0] += image.brightness + image.rgb[0]
                imageData.data[i + 1] += image.brightness + image.rgb[1]
                imageData.data[i + 2] += image.brightness + image.rgb[2]
                imageData.data[i + 3] += 255
            }

        }


        offscreenCanvasCtx.putImageData(imageData, image.x, image.y)

        //convolution
        if (image.convolution === "emboss") {
            convolutionMatrix = embossConvolutionMatrix
        } else if (image.convolution === "blur") {
            convolutionMatrix = blurConvolutionMatrix
        } else if (image.convolution === "sharpen") {
            convolutionMatrix = sharpenConvolutionMatrix
        } else if (image.convolution === "edge") {
            convolutionMatrix = edgeDetectionConvolutionMatrix
        } else if (image.convolution === "none") {
            convolutionMatrix = noConvolutionMatrix
        }
        if (image.convolution != "none") {
            offscreenCanvasCtx.drawImage(image.src, image.x, image.y, image.width, image.height);

            // get the image data (i.e. the pixels) from the double buffer
            imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height);
            data = imageData.data

            convolutionAmount = 0
            for (let j = 0; j < 9; j++) {
                convolutionAmount += convolutionMatrix[j];
            }

            originalImageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height);
            originalData = originalImageData.data

            for (let i = 0; i < data.length; i += 4) {
                data[i + 3] = 255 // alpha

                // apply the convolution for each of red, green and blue
                for (let rgbOffset = 0; rgbOffset < 3; rgbOffset++) {
                    // get the pixel and its eight sourrounding pixel values from the original image 
                    let convolutionPixels = [originalData[i + rgbOffset - image.width * 4 - 4],
                    originalData[i + rgbOffset - image.width * 4],
                    originalData[i + rgbOffset - image.width * 4 + 4],
                    originalData[i + rgbOffset - 4],
                    originalData[i + rgbOffset],
                    originalData[i + rgbOffset + 4],
                    originalData[i + rgbOffset + image.width * 4 - 4],
                    originalData[i + rgbOffset + image.width * 4],
                    originalData[i + rgbOffset + image.width * 4 + 4]]

                    // do the convolution
                    convolvedPixel = 0
                    for (let j = 0; j < 9; j++) {
                        convolvedPixel += convolutionPixels[j] * convolutionMatrix[j]
                    }

                    // place the convolved pixel in the double buffer		 
                    if (convolutionMatrix === embossConvolutionMatrix) // embossed is treated differently
                    {
                        data[i + rgbOffset] = convolvedPixel + 127
                    } else {
                        convolvedPixel /= convolutionAmount
                        data[i + rgbOffset] = convolvedPixel
                    }
                }
            }

            offscreenCanvasCtx.putImageData(imageData, image.x, image.y)

        }
        // draw the original image into the double buffer

        ctx.save()

        ctx.translate(image.x + (image.width / 2), image.y + (image.height / 2))
        ctx.rotate(Math.radians(image.rotation))
        ctx.translate(-(image.x + (image.width / 2)), -(image.y + (image.height / 2)))


        ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height)

        ctx.restore()

    })
    //alpha comp
    ctx.drawImage(doubleBuffer, 0, 0, canvas.width, canvas.height);
    doubleBufferCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
}


function mouseUpHandler() {
    isDraggable = false
    selectedText = -1
    mouse.down = false
}
function mousedownHandler(e) {
    if (e.which === 1)  // left mouse button
    {
        let canvasBoundingRectangle = canvas.getBoundingClientRect()
        mouseX = e.clientX - canvasBoundingRectangle.left
        mouseY = e.clientY - canvasBoundingRectangle.top
        mouse.down = true
        position.x = mouseX
        position.y = mouseY
        imgJson.map((image, index) => {
            if (mouseIsInsideImage(image.x, image.y, image.width, image.height, mouseX, mouseY)) {
                isDraggable = true
                offsetX = mouseX - image.x
                offsetY = mouseY - image.y
                currentImageIndex = index

                //                            console.log(currentImageIndex)
                //                            offsetX = mouseX - imgJson[i].x
                //                            offsetY = mouseY - imgJson[i].y
                //                            currentImageIndex = i
                document.getElementById("rotationRange").value = image.rotation
                document.getElementById("brightnessRange").value = image.brightness
                document.getElementById("filters").value = image.filter
                document.getElementById("brightnessRed").value = image.rgb[0]
                document.getElementById("brightnessGreen").value = image.rgb[1]
                document.getElementById("brightnessBlue").value = image.rgb[2]


                //                            renderCanvas()
            }

        })
        texts.map((text, index) => {
            //                        console.log("textY" + text.textY)
            if (mouseIsInsideImage(text.textX, text.textY - 100, text.width, text.height, mouseX, mouseY)) {
                selectedText = index

                offsetX = mouseX - text.textX
                offsetY = mouseY - text.textY

                //                            
            }

        })
    }
}

function mousewheelHandler(e) {
    let canvasBoundingRectangle = canvas.getBoundingClientRect()
    mouseX = e.clientX - canvasBoundingRectangle.left
    mouseY = e.clientY - canvasBoundingRectangle.top
    if (mouseIsInsideImage(imgJson[currentImageIndex].x, imgJson[currentImageIndex].y, imgJson[currentImageIndex].width, imgJson[currentImageIndex].height, mouseX, mouseY)) {
        let oldCentreX = imgJson[currentImageIndex].x + (imgJson[currentImageIndex].width / 2)
        let oldCentreY = imgJson[currentImageIndex].y + (imgJson[currentImageIndex].height / 2)

        imgJson[currentImageIndex].width += e.wheelDelta / 120
        imgJson[currentImageIndex].height += e.wheelDelta / 120

        imgJson[currentImageIndex].x = oldCentreX - (imgJson[currentImageIndex].width / 2)
        imgJson[currentImageIndex].y = oldCentreY - (imgJson[currentImageIndex].height / 2)

        renderCanvas()
    }
}


function moveHandler(e) {
    if (e.which === 1 && currentImageIndex !== null && draw === false && isDraggable === true)  // left mouse button
    {
        let canvasBoundingRectangle = canvas.getBoundingClientRect()
        mouseX = e.clientX - canvasBoundingRectangle.left
        mouseY = e.clientY - canvasBoundingRectangle.top
        //                    if (mouseIsInsideImage(imgJson[currentImageIndex].x, imgJson[currentImageIndex].y, imgJson[currentImageIndex].width, imgJson[currentImageIndex].height, mouseX, mouseY))
        //                    {
        //                        ctx.clearRect(0, 0, canvas.width, canvas.height)
        //                        imageX = mouseX - offsetX
        //                        imageY = mouseY - offsetY
        //                        renderCanvas()
        imgJson[currentImageIndex].x = mouseX - offsetX
        imgJson[currentImageIndex].y = mouseY - offsetY

        renderCanvas()

        //                    }
    } else if (e.which === 1 && draw === true)  // left mouse button
    {

        //TODO Drawing - different pen types (spray, square, circles)
        ctx2.beginPath()


        ctx2.lineWidth = penSize
        ctx2.strokeStyle = penColor
        ctx2.lineCap = "round"

        ctx2.moveTo(mouseX, mouseY)

        positionSet(e)

        ctx2.lineTo(mouseX, mouseY)

        ctx2.stroke()

    } else if (e.which === 1 && selectedText > -1) {


        let canvasBoundingRectangle = canvas.getBoundingClientRect()
        mouseX = e.clientX - canvasBoundingRectangle.left
        mouseY = e.clientY - canvasBoundingRectangle.top

        texts[selectedText].textX = mouseX - offsetX
        texts[selectedText].textY = mouseY - offsetY
        renderCanvas()
    }
    let canvasBoundingRectangle = canvas.getBoundingClientRect()
    mouse.x = e.clientX - canvasBoundingRectangle.left
    mouse.y = e.clientY - canvasBoundingRectangle.top
    //    renderCanvas()
    if (drawTextToggle) {
        drawText()
    }
}

function mouseIsInsideImage(imageTopLeftX, imageTopLeftY, imageWidth, imageHeight, x, y) {
    if ((x > imageTopLeftX) && (y > imageTopLeftY)) {
        if (x > imageTopLeftX) {
            if ((x - imageTopLeftX) > imageWidth) {
                return false // to the right of the image
            }
        }

        if (y > imageTopLeftY) {
            if ((y - imageTopLeftY) > imageHeight) {
                return false // below the image
            }
        }
    } else // above or to the left of the image
    {
        return false
    }
    return true // inside image
}
function newGreyScale(newGrayValue) {
    imgJson[currentImageIndex].greyScale = newGrayValue
    renderCanvas()

}

function drawMode(value) {
    draw = value
    settings = document.getElementsByClassName("penSettings")
    if (draw === true) {
        for (let i = 0; i < settings.length; i++) {
            settings[i].style.display = "block"
        }
    } else {
        for (let i = 0; i < settings.length; i++) {
            settings[i].style.display = "none"
        }
    }
}


function textValue() {
    addText = document.getElementById("addText").value
    textLocationX = document.getElementById("locationX").value
    textLocationY = document.getElementById("locationY").value
    borderColor = document.getElementById("borderColor").value
    fillColor = document.getElementById("fillColor").value


    ctx2.strokeStyle = borderColor
    ctx2.font = "200px Arial"
    ctx2.lineWidth = 10
    ctx2.strokeText(addText, textLocationX, textLocationY)

    //fill
    ctx2.fillStyle = fillColor
    ctx2.font = "200px Arial"
    ctx2.fillText(addText, textLocationX, textLocationY)
}

function copyCanvasToImage() {
    // save canvas image as data url (png format by default)
    let dataURL = canvas.toDataURL()

    // set canvasImg image src to dataURL
    // so it can be saved as an image
    document.getElementById('canvasImage').src = dataURL

}

function updateBrightnessLevel() {
    brightnessLevelRed = parseInt(document.getElementById("brightnessRed").value)
    brightnessLevelGreen = parseInt(document.getElementById("brightnessGreen").value)
    brightnessLevelBlue = parseInt(document.getElementById("brightnessBlue").value)

    imgJson[currentImageIndex].rgb = [brightnessLevelRed, brightnessLevelGreen, brightnessLevelBlue]

    renderCanvas()
}

function sepiaFilter() {
    for (let i = 0; i < imageData.data.length; i += 4) {
        red = imageData.data[i];
        green = imageData.data[i + 1];
        blue = imageData.data[i + 2];

        imageData.data[i] = (red * 0.393) + (green * 0.769) + (blue * 0.189)
        imageData.data[i + 1] = (red * 0.349) + (green * 0.686) + (blue * 0.168)
        imageData.data[i + 2] = (red * 0.272) + (green * 0.534) + (blue * 0.131)
    }
}

function invertFilter() {
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i + 0] = 255 - imageData.data[i + 0]
        imageData.data[i + 1] = 255 - imageData.data[i + 1]
        imageData.data[i + 2] = 255 - imageData.data[i + 2]
        imageData.data[i + 3] = 255
    }
}

function posteriseFilter() {
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i + 0] -= imageData.data[i + 0] % 64
        imageData.data[i + 1] -= imageData.data[i + 1] % 64
        imageData.data[i + 2] -= imageData.data[i + 2] % 64
        imageData.data[i + 3] = 255
    }
}

function thresholdFilter() {
    for (let i = 0; i < imageData.data.length; i += 4) {
        for (let rgb = 0; rgb < 3; rgb++) {
            if (imageData.data[i + rgb] < 128) {
                imageData.data[i + rgb] = 0
            } else {
                imageData.data[i + rgb] = 255
            }
        }
        imageData.data[i + 3] = 255
    }
}
function getText() {
    var text = { text: document.getElementById("theText").value, textX: 100, textY: 80 }
    texts.push(text)


    ctx.font = "100px verdana"
    text.width = ctx.measureText(text.text).width

    text.height = 110

    borderColor = document.getElementById("borderColor").value
    fillColor = document.getElementById("fillColor").value
    ctx.strokeStyle = borderColor
    ctx.fillStyle = fillColor
    ctx.lineWidth = 10
    renderCanvas()

}
function combineToCanvas1() {
    offscreenCanvasCtx.drawImage(canvas, 0, 0)
    offscreenCanvasCtx.drawImage(canvas2, 0, 0)

}
function clearCanvas2() {
    ctx2.clearRect(0, 0, canvas.width, canvas.height)

}

function setPenSize(size) {
    penSize = size

    root.style.setProperty("--dot-size", penSize + "px")

}
function setPenColor(color) {
    penColor = color
    root.style.setProperty("--dot-color", penColor)

}
function openTab(event, tabid) {
    var content, tab, i

    //Hide contents of all tabs
    content = document.getElementsByClassName("content")
    for (i = 0; i < content.length; i++) {
        content[i].style.display = "none"
    }

    //Remove active class from all tabs
    tab = document.getElementsByClassName("tab")
    for (i = 0; i < tab.length; i++) {
        tab[i].className = tab[i].className.replace(" active", "")
    }

    //Add active class to button after clicking
    document.getElementById(tabid).style.display = "flex"
    event.currentTarget.className += " active"
}

function switchMode(mode) {
    var body = document.body
    if (mode == 'dark') {
        body.classList.add("dark")
        body.classList.remove("light")
        body.classList.remove("custom")
        body.classList.remove("rainbow")
    }
    if (mode == 'custom') {
        body.classList.add("custom")
        body.classList.remove("dark")
        body.classList.remove("light")
        body.classList.remove("rainbow")
    }
    if (mode == 'light') {
        body.classList.add("light")
        body.classList.remove("dark")
        body.classList.remove("custom")
        body.classList.remove("rainbow")
    }
    if (mode == 'rainbow') {
        body.classList.add("rainbow")
        body.classList.remove("dark")
        body.classList.remove("light")
        body.classList.remove("custom")
    }

}

function setBgColor(color) {
    let root = document.documentElement
    root.style.setProperty('--bg-color', color)

}

function resetValues(input) {
    if (input === 'brightness') {
        document.getElementById("brightnessRange").value = 0
        setBrightness(0)
    } else if (input === 'red') {
        document.getElementById("brightnessRed").value = 0
        imgJson[currentImageIndex].rgb[0] = 0
        renderCanvas()
    } else if (input === 'green') {
        document.getElementById("brightnessGreen").value = 0
        imgJson[currentImageIndex].rgb[1] = 0
        renderCanvas()
    } else if (input === 'blue') {
        document.getElementById("brightnessBlue").value = 0
        imgJson[currentImageIndex].rgb[2] = 0
        renderCanvas()
    }
}
function positionSet(e) {
    let canvasBoundingRectangle = canvas.getBoundingClientRect()
    mouseX = e.clientX - canvasBoundingRectangle.left
    mouseY = e.clientY - canvasBoundingRectangle.top
}
/* function toTheFront(canvas){
 if (getElementById("drawMode") === 1){
 document.getElementById('canvas').style.zIndex = 2
 document.getElementById('canvas2').style.zIndex = 1
 }
 else{
 document.getElementById('canvas').style.zIndex = 1
 document.getElementById('canvas2').style.zIndex = 2
 }
 
 } */

function handleImage(e) {
    var reader = new FileReader()
    reader.onload = function (event) {
        var img = new Image()
        img.src = event.target.result
        let file = { src: img, x: 50, y: 50, width: 100, height: 100, rotation: 0, greyScale: false, brightness: 0, filter: "none", rgb: [0, 0, 0], convolution: "none" }
        imgJson.push(file)
        renderCanvas()
    }
    reader.readAsDataURL(e.target.files[0])


}
function putBehind() {
    var tmp = imgJson[currentImageIndex]
    if (currentImageIndex - 1 >= 0) {
        imgJson[currentImageIndex] = imgJson[currentImageIndex - 1]
        imgJson[currentImageIndex - 1] = tmp

    }
}

function putForward() {
    var tmp = imgJson[currentImageIndex]
    if (currentImageIndex + 1 <= imgJson.length) {
        imgJson[currentImageIndex] = imgJson[currentImageIndex + 1]
        imgJson[currentImageIndex + 1] = tmp

    }
}

function updateProjectName(name) {
    document.getElementById("saveImageFile").download = name
}
function remove() {
    imgJson.splice(currentImageIndex, 1)
    renderCanvas()
}
function removeText() {
    texts.splice(selectedText, 1)
    renderCanvas()
}
function layer() {
    let htmlString = `<div class = "count">`

    imgJson.map((image, index) => {
        htmlString += `
                           <img src="${(image.src).src}" onclick="changeIndex(${index})">
						    Layer ${index}
                       `

    })

    htmlString += `</div><br>`

    document.getElementById("layer").innerHTML = htmlString
}
function clearBox(elementID) {
    document.getElementById("layer").innerHTML = ""
}
function changeIndex(value) {
    currentImageIndex = value
    renderCanvas()
}

function distance(pt, pt2) {

    var xs = 0
    var ys = 0

    xs = pt2.x - pt.x
    xs = xs * xs
    ys = pt2.y - pt.y
    ys = ys * ys

    return Math.sqrt(xs + ys)
}

function textWidth(string, size) {
    ctx2.font = size + "px Georgia"

    if (ctx2.fillText) {
        return ctx2.measureText(string).width
    } else if (ctx2.mozDrawText) {
        return ctx2.mozMeasureText(string)
    }

}

function drawText() {
    if (mouse.down) {
        let d = distance(position, mouse)
        let fontSize = minFontSize + d / 2
        let letter = letters[counter]
        let stepSize = textWidth(letter, fontSize)

        if (d > stepSize) {
            let angle = Math.atan2(mouse.y - position.y, mouse.x - position.x)

            ctx2.font = fontSize + "px Georgia"

            ctx2.save()
            ctx2.translate(position.x, position.y)
            ctx2.rotate(angle)
            ctx2.fillText(letter, 0, 0)
            ctx2.restore()

            counter++
            if (counter > letters.length - 1) {
                counter = 0
            }

            //console.log (position.x + Math.cos( angle ) * stepSize)
            position.x = position.x + Math.cos(angle) * stepSize
            position.y = position.y + Math.sin(angle) * stepSize

        }
    }
}

function doubleClick(event) {
    canvas2.width = canvas2.width
}

function drawTextMode(value) {
    if (value === true) {
        drawTextToggle = true
    } else {
        drawTextToggle = false
    }
}