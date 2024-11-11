const canvas = document.getElementById("canvasImage");
const renderingContext = canvas.getContext("2d");
let img;
let originalImageData;
let isDraggingSelection = false;
let isDraggingText = false;
let textX = 50;  
let textY = 50; 
let selection = { startX: 0, startY: 0, endX: 0, endY: 0 };

document.getElementById("fileInput").addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    img = new Image();
    img.onload = function () {
      const aspectRatio = img.width / img.height;
      const maxWidth = 500;  
      const maxHeight = maxWidth / aspectRatio;

      canvas.width = maxWidth;
      canvas.height = maxHeight;

      renderingContext.drawImage(img, 0, 0, canvas.width, canvas.height);
      originalImageData = renderingContext.getImageData(0, 0, canvas.width, canvas.height);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

function drawSelection() {
  renderingContext.clearRect(0, 0, canvas.width, canvas.height);
  renderingContext.drawImage(img, 0, 0, canvas.width, canvas.height); 
  if (!isDraggingText) {
    renderingContext.fillStyle = "rgba(0, 0, 0, 0.1)"; 
    renderingContext.fillRect(
      selection.startX,
      selection.startY,
      selection.endX - selection.startX,
      selection.endY - selection.startY
    );
  }
   drawText();
}

document.getElementById("addText").addEventListener("click", function () {
  textX = 50;
  textY = 50;
  drawText();
});


function drawText() {
  const selectedPosition = document.getElementById("textPosition").value;
  let xPos, yPos;

  switch (selectedPosition) {
    case "top-left":
      xPos = 0;
      yPos = parseInt(document.getElementById("textSize").value, 10);
      break;
    case "top-center":
      xPos =
        (canvas.width -
          renderingContext.measureText(document.getElementById("text").value).width) /
        2;
      yPos = parseInt(document.getElementById("textSize").value, 10);
      break;
    case "top-right":
      xPos =
        canvas.width -
        renderingContext.measureText(document.getElementById("text").value).width;
      yPos = parseInt(document.getElementById("textSize").value, 10);
      break;
    case "middle-left":
      xPos = 0;
      yPos = canvas.height / 2;
      break;
    case "middle-center":
      xPos =
        (canvas.width -
          renderingContext.measureText(document.getElementById("text").value).width) /
        2;
      yPos = canvas.height / 2;
      break;
    case "middle-right":
      xPos =
        canvas.width -
        renderingContext.measureText(document.getElementById("text").value).width;
      yPos = canvas.height / 2;
      break;
    case "bottom-left":
      xPos = 0;
      yPos =
        canvas.height - parseInt(document.getElementById("textSize").value, 10);
      break;
    case "bottom-center":
      xPos =
        (canvas.width -
          renderingContext.measureText(document.getElementById("text").value).width) /
        2;
      yPos =
        canvas.height - parseInt(document.getElementById("textSize").value, 10);
      break;
    case "bottom-right":
      xPos =
        canvas.width -
        renderingContext.measureText(document.getElementById("text").value).width;
      yPos =
        canvas.height - parseInt(document.getElementById("textSize").value, 10);
      break;
    default:
      xPos = 0;
      yPos = 0;
      break;
  }
  renderingContext.font = document.getElementById("textSize").value + "px Arial";
  renderingContext.fillStyle = document.getElementById("textColor").value;
  renderingContext.fillText(document.getElementById("text").value, xPos, yPos);
}

document.getElementById("applyEffect").addEventListener("click", function () {
  const effect = document.getElementById("effect").value;
  applyEffect(effect);
});

function applyEffect(effect) {
  if (effect === "none") {
    resetCanvas();
    return;
  }
  const imageData = renderingContext.getImageData(
    selection.startX,
    selection.startY,
    selection.endX - selection.startX,
    selection.endY - selection.startY
  );
  switch (effect) {
    case "grayscale":
      applyGrayscale(imageData);
      break;
    case "sepia":
      applySepia(imageData);
      break;
    case "brightness":
      const brightnessValue = prompt(
        "Enter brightness value (-255 to 255):",
        "50"
      );
      applyBrightness(imageData, parseInt(brightnessValue, 10) || 0);
      break;
    case "invert":
      applyInvert(imageData);
      break;
  }
}

function applyGrayscale(imageData) {
  for (let i = 0; i < imageData.data.length; i += 4) {
    const avg =
      (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    imageData.data[i] = avg;
    imageData.data[i + 1] = avg;
    imageData.data[i + 2] = avg;
  }
  renderingContext.putImageData(imageData, selection.startX, selection.startY);
}

function applySepia(imageData) {
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    const tr = 0.393 * r + 0.769 * g + 0.189 * b;
    const tg = 0.349 * r + 0.686 * g + 0.168 * b;
    const tb = 0.272 * r + 0.534 * g + 0.131 * b;

    imageData.data[i] = tr < 255 ? tr : 255;
    imageData.data[i + 1] = tg < 255 ? tg : 255;
    imageData.data[i + 2] = tb < 255 ? tb : 255;
  }
  renderingContext.putImageData(imageData, selection.startX, selection.startY);
}

function applyBrightness(imageData, value) {
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] += value;
    imageData.data[i + 1] += value;
    imageData.data[i + 2] += value;
  }
  renderingContext.putImageData(imageData, selection.startX, selection.startY);
}

function applyInvert(imageData) {
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = 255 - imageData.data[i];
    imageData.data[i + 1] = 255 - imageData.data[i + 1];
    imageData.data[i + 2] = 255 - imageData.data[i + 2];
  }
  renderingContext.putImageData(imageData, selection.startX, selection.startY);
}

document.getElementById("crop").addEventListener("click", function () {
  cropImage();
});

function cropImage() {  
  const scaleFactorX = img.width / canvas.width;
  const scaleFactorY = img.height / canvas.height;

  const croppedImageData = renderingContext.getImageData(
    selection.startX,
    selection.startY,
    selection.endX - selection.startX,
    selection.endY - selection.startY
  );

  canvas.width = selection.endX - selection.startX;
  canvas.height = selection.endY - selection.startY;
  renderingContext.clearRect(0, 0, canvas.width, canvas.height);

  renderingContext.putImageData(croppedImageData, 0, 0); 
  selection = { startX: 0, startY: 0, endX: 0, endY: 0 };
}

document.getElementById("reset").addEventListener("click", function () {
  resetCanvas();
});

function resetCanvas() {
  const aspectRatio = img.width / img.height;
  const maxWidth = 500; 
  const maxHeight = maxWidth / aspectRatio;

  canvas.width = maxWidth;
  canvas.height = maxHeight;

  selection = { startX: 0, startY: 0, endX: 0, endY: 0 };

  document.getElementById("text").value = ""; 
  isDraggingText = false;

  renderingContext.clearRect(0, 0, canvas.width, canvas.height);

  renderingContext.drawImage(img, 0, 0, canvas.width, canvas.height);
}

document.getElementById("save").addEventListener("click", function () {
  saveImage();
});

function saveImage() {
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "edited_image.png";
  a.click();
}
document.getElementById("scaleImage").addEventListener("click", function () {
  const newWidth = prompt("Enter new width:", canvas.width);
  const newHeight = prompt("Enter new height:", canvas.height);

  if (newWidth && newHeight) {
    scaleImage(parseInt(newWidth, 10), parseInt(newHeight, 10));
  }
});

function scaleImage(newWidth, newHeight) {
  const aspectRatio = img.width / img.height;

  if (newWidth) {
    canvas.width = newWidth;
    canvas.height = newWidth / aspectRatio;
  } else if (newHeight) {
    canvas.height = newHeight;
    canvas.width = newHeight * aspectRatio;
  }

  renderingContext.clearRect(0, 0, canvas.width, canvas.height);
  renderingContext.drawImage(img, 0, 0, canvas.width, canvas.height);
  originalImageData = renderingContext.getImageData(0, 0, canvas.width, canvas.height);
  selection = { startX: 0, startY: 0, endX: 0, endY: 0 };
  drawSelection();
}

let isResizingSelection = false;

document.addEventListener("keydown", function (e) {
  if (e.key === "Shift" && selection.startX !== undefined) {
    isDraggingSelection = true;
  }
});

document.addEventListener("keyup", function (e) {
  if (e.key === "Shift") {
    isDraggingSelection = false;
  }
});
canvas.addEventListener("mousedown", function (e) {
  if (!isDraggingSelection) {
    selection.startX = e.clientX - canvas.getBoundingClientRect().left;
    selection.startY = e.clientY - canvas.getBoundingClientRect().top;
    isResizingSelection = true;
  } else {
    const textBoundingBox = renderingContext.measureText(
      document.getElementById("text").value
    );
    if (
      e.clientX >= textX &&
      e.clientX <= textX + textBoundingBox.width &&
      e.clientY >=
        textY - parseInt(document.getElementById("textSize").value, 10) &&
      e.clientY <= textY
    ) {
      isDraggingText = true;
    }
  }
});

canvas.addEventListener("mousemove", function (e) {
  if (isResizingSelection) {
    selection.endX = e.clientX - canvas.getBoundingClientRect().left;
    selection.endY = e.clientY - canvas.getBoundingClientRect().top;
    drawSelection();
  } else if (isDraggingText) {
    textX = e.clientX - canvas.getBoundingClientRect().left;
    textY = e.clientY - canvas.getBoundingClientRect().top;
    drawSelection();
    drawText();
  } else if (isDraggingSelection) {
    const offsetX = e.clientX - canvas.getBoundingClientRect().left - selection.startX;
    const offsetY = e.clientY - canvas.getBoundingClientRect().top - selection.startY;

    selection.startX += offsetX;
    selection.startY += offsetY;
    selection.endX += offsetX;
    selection.endY += offsetY;

    drawSelection();
  }
});

canvas.addEventListener("mouseup", function () {
  isDraggingSelection = false;
  isResizingSelection = false;
  isDraggingText = false;
  drawSelection();
});

document.getElementById("clearSelection").addEventListener("click", function () {
  clearSelection();
});

function clearSelection() {
  if (selection.startX !== undefined) {
    const imageData = renderingContext.getImageData(
      selection.startX,
      selection.startY,
      selection.endX - selection.startX,
      selection.endY - selection.startY
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 255; 
      imageData.data[i + 1] = 255;
      imageData.data[i + 2] = 255; 
    }

    renderingContext.putImageData(imageData, selection.startX, selection.startY);
    updateModifiedImageData(imageData, selection.startX, selection.startY);
    renderingContext.putImageData(modifiedImageData, 0, 0);
  }
}

