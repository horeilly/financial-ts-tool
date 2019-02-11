
let margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let parseDate = d3.timeParse("%Y-%m-%d");

let x = techan.scale.financetime()
    .range([0, width]);

let y = d3.scaleLinear()
    .range([height, 0]);

let candlestick = techan.plot.candlestick()
    .xScale(x)
    .yScale(y);

let xAxis = d3.axisBottom()
    .scale(x);

let yAxis = d3.axisLeft()
    .scale(y);

let svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let urlParams = new URLSearchParams(window.location.search);

function build() {
    let d = [];
    let q = getQueryParams();
    let dataUrl = "https://cors-anywhere.herokuapp.com/https://harryoreilly.s3.amazonaws.com/finance/" + q.stock_symbol + ".csv"

    d3.csv(dataUrl).then(function (data) {
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            if (q.start_date < parseDate(data[i].Date) &&
                (parseDate(data[i].Date) < q.end_date)) {
                let row = data[i];
                d.push({
                    date: parseDate(row.Date),
                    open: +row.Open,
                    high: +row.High,
                    low: +row.Low,
                    close: +row.Close,
                    volume: +row.Volume
                })
            }
        }
    }).then(function () {

        svg.append("g")
            .attr("class", "candlestick");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")");

        svg.append("g")
            .attr("class", "y axis")
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Price ($)");

        // Data to display initially
        draw(d);
    });
}

function draw(data) {
    x.domain(data.map(candlestick.accessor().d));
    y.domain(techan.scale.plot.ohlc(data, candlestick.accessor()).domain());

    svg.selectAll("g.candlestick").datum(data).call(candlestick);
    svg.selectAll("g.x.axis").call(xAxis);
    svg.selectAll("g.y.axis").call(yAxis);
}

function getQueryParams() {

    let start_date, end_date, stock_symbol;

    if (urlParams.has("start_date")) {
        start_date = parseDate(urlParams.get("start_date"));
    } else {
        start_date = parseDate("2018-01-01");
    }

    if (urlParams.has("end_date")) {
        end_date = parseDate(urlParams.get("end_date"));
    } else {
        end_date = parseDate("2019-01-01")
    }

    if (urlParams.has("stock_symbol")) {
        stock_symbol = urlParams.get("stock_symbol").toUpperCase();
    } else {
        stock_symbol = "GOOG"
    }

    return {
        start_date: start_date,
        end_date: end_date,
        stock_symbol: stock_symbol
    }
}
