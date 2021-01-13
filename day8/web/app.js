// console.log(image);

const colorScaler = d3.scaleSequential([0, 255], d3.interpolateGreys);

// Margin convention.
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const cellParams = { width: 10, height:10, row: 28, col: 28 };
const width = cellParams.col * cellParams.width;
const height = cellParams.row * cellParams.height;

// Random
function random() {
    const idx = Math.floor(Math.random() * images.length);
    image = images[idx];
    update();
}

// Update
function update(){
    svg.selectAll('.image-cell')
    .data(image)
    .attr('fill', d => colorScaler(d) );
}



// Draw events
const brash = [
    // dx, dy, value
    [-1, -1,  0],  [-1,  0,  90],  [-1,  1,  0],  
    [ 0, -1, 90],  [ 0,  0, 180],  [ 0,  1, 90],  
    [ 1, -1,  0],  [ 1,  0,  90],  [ 1,  1,  0],  
]

function getIndex(row, col) {
    var idx = row * cellParams.row + col;
    const [idxMin, idxMax] = [0, cellParams.row * cellParams.col - 1]
    if( idx<idxMin || idx>idxMax) {
        return null;
    }
    return idx
}

function mousemove(event, d){
    let [x, y] = d3.pointer(event);
    var row = Math.floor(y / cellParams.height);
    var col = Math.floor(x / cellParams.width);

    brash.forEach(
        ([dx, dy, value]) => {
            var r = row + dx;
            var c = col + dy;
            var idx = getIndex(r, c);
            if (idx !== null) {
                image[idx] =  Math.min(image[idx]+value, 255);
            }
        });

    update();
}

function mousedown() {
    d3.select('.image-canvas')
        .on('mousemove', mousemove);
    
    d3.select('body')
        .on('mouseup', mouseup);
}

function mouseup() {
    d3.select('.image-canvas').on('mousemove', null);
}

// Reset Image
function reset() {
    for(var i=0; i<cellParams.row * cellParams.col; i++) {
        image[i] = 0;
    }
    update();
}

// Detect Image
// TODO: Review
function detect() {
    d3.select('.result-body').text('Calculating...');
    $.getJSON({
        url: API_URL,
        data: {'image': JSON.stringify(image)},
        success: function(data) {
            d3.select('.result-body').text(`Detected Number: ${data['prediction']}`);
        }
    }
    );
}

const svg = d3
    .select('.image-container')
    .append('svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

svg.selectAll('.image-cell')
    .data(image)
    .enter()
    .append('rect')
    .attr('class', 'image-cell')
    .attr('x', (d, i) => (cellParams.width * (i % cellParams.col) ))
    .attr('y', (d, i) => (cellParams.height * Math.floor(i / cellParams.col)) )
    .attr('width', cellParams.width)
    .attr('height', cellParams.height)
    .attr('fill', d => colorScaler(d) )
    .attr('stroke', '#eeeeee');

svg.append('rect')
    .attr('class', 'image-canvas')
    .attr('width', width)
    .attr('height', height)
    .attr('stroke', '#cccccc')
    .attr('fill', '#eeeeee')
    .attr('fill-opacity', 0);


// Drawing
d3.select('.image-canvas').on('mousedown', mousedown);
d3.select('.button-reset').on('click', reset);
d3.select('.button-random').on('click', random);
d3.select('.button-detect').on('click', detect);
