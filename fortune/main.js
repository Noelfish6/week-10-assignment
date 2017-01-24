//scroll to top when reload page
window.onload = function(){setTimeout(function(){$(window).scrollTop(0)},10);}
//init ScrollMagic controller and set scenes
var controller = new ScrollMagic.Controller({
    // container:'#word'
});
var slides=document.querySelectorAll('section.slide');
var slide=[];
for (var i=0;i<slides.length;i++){
    slide[i]=new ScrollMagic.Scene({
        triggerElement:slides[i],
    })
    // .setPin(slides[i])
    .update(true)
    .addTo(controller)
    ;
}

//init canvas
var m = {t:30,r:50,b:50,l:30},
    w = document.getElementById('canvas').clientWidth - m.l - m.r,
    h = document.getElementById('canvas').clientHeight - m.t - m.b;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width', w + m.l + m.r)
    .attr('height', h + m.t + m.b)
    .append('g').attr('class','plot')
    .attr('transform','translate('+ m.l+','+ m.t+')');
//set scales
var scaleColor=d3.scaleOrdinal()
	.domain(['China','Taiwan','Hongkong'])
	.range(['#A3FB66','#D65671','#2BA3E6']),
	scaleX=d3.scaleLinear()
	.domain([1995,2016])
	.range([w/22,w]),
	scaleY=d3.scaleLinear()
	.domain([500,1])
	.range([h,h/500]);
var scaleProfit=d3.scalePow()
    .exponent(.5)
    .range([h,0]),
    scaleAsset=d3.scalePow()
    .exponent(.5)
    .range([w/22,w]),
    scaleEmployee=d3.scaleLinear()
    .range([3,30]);
var lineGenerator = d3.line()
    .x(function(d){return scaleX(d.year)})
    .y(function(d){return scaleY(d.rank)})
    .curve(d3.curveCardinal.tension(0.5));
var axisX = d3.axisBottom().tickPadding(10),
    axisY = d3.axisLeft()
var Byname,fortune,X,Y,updatedots,enterdots;


d3.csv('../data/fortunedata_01222017.csv',parse,dataloaded);

function dataloaded(err, fortune){
// console.table(fortune);

Byname=d3.nest()
    .key(function(d){return d.name}).sortKeys(d3.ascending)
    .entries(fortune)

// console.log(Byname)


//set scenes' actions
slide[1].on('enter',function(e){rank();dots(fortune)})
        .on('leave',function(e){plot.select('.rank').remove()})
slide[2].on('enter',function(e){new2016()})
        .on('leave',function(e){plot.selectAll('.dots').transition().style('opacity',.5)})
slide[3].on('enter',function(e){plot.selectAll('.dots').transition().style('opacity',.5);lines(Byname);resetline('.China');})
        .on('leave',function(e){plot.select('.line').remove()})
slide[4].on('enter',function(e){resetline('.Hongkong');})
        .on('leave',function(e){resetline('.China');})
slide[5].on('enter',function(e){resetline('.Taiwan');})
        .on('leave',function(e){resetline('.Hongkong');})
slide[6].on('enter',function(e){resetline('.country')})
        .on('leave',function(e){resetline('.Taiwan')})
slide[7].on('enter',function(e){profit(fortune)})
        .on('leave',function(e){resetprofit();resetline('.country');})
slide[8].on('enter',function(e){})
        .on('leave',function(e){})
}


//dots and line diagram's background
function rank(){
const alldots=[];
for(var i=1;i<=500;i++){
    for(var m=1995;m<=2016;m++){
        alldots.push({rank:i,year:m,});
    };
}

var rankbg=plot.append('g').attr('class','rank')
rankbg.append('g').selectAll('.greydots')
    .data(alldots).enter()
    .append('circle').attr('class','greydots')
    .attr('r','0.5px')
    .attr('cx',function(d){return scaleX(d.year)})
    .attr('cy',function(d){return scaleY(d.rank)})
    .style('fill','#DCD9B9')
    // .style('opacity',.3)
X=rankbg.append('g').attr('class','axis axis-x')
    .attr('transform','translate(0,'+h+')'),
Y=rankbg.append('g').attr('class','axis axis-y');
rankbg.append('g').attr('class','circle')
rankbg.append('g').attr('class','line')
}
//to select specific country's lines
function resetline(country){
    plot.selectAll('.country').transition().duration(1000).style('opacity',0);
    plot.selectAll(country).transition().duration(1000).style('opacity',.5)   
}
//to draw line
function lines(data){
var updateline=plot.select('.line').selectAll('.country')
    .data(data,function(d){return d.key});
axisX.scale(scaleX).tickSize(0);
axisY.scale(scaleY).tickSize(0).ticks(5);
X.call(axisX);
Y.call(axisY);
var enterline=updateline.enter()
        .append('path').attr('class',function(d){return d.values[0].location+' country'})
        .datum(function(d){return d.values})
        .attr('d',function(d){return lineGenerator(d);})
        
updateline.merge(enterline)
        .style('stroke',function(d){return d[0].rank-d[d.length-1].rank>=0?scaleColor(d[0].location):'#999'})
        .style('fill','none')
        .style('opacity',.5)
        .style('stroke-width',2)
        
updateline.exit().remove(); 
}
//to draw dots
function dots(data){

axisX.scale(scaleX).tickSize(0);
axisY.scale(scaleY).tickSize(0).ticks(5);
X.call(axisX);
Y.call(axisY);
updatedots=plot.select('.circle').selectAll('.dots')
    .data(data);
enterdots=updatedots.enter()
    .append('circle').attr('class',function(d){return d.year==2016&&d.prerank==undefined?'dots new2016 y'+d.year:'dots y'+d.year})
    .attr('cx',0)
    .attr('cy',0)
    .style('stroke',function(d){return scaleColor(d.location)})
    .style('stroke-width','2px')
    .style('fill','none')
    .style('opacity',0)
    .attr('r',0)
    .on('click',function(d){console.log(d.rank)})
    
updatedots.merge(enterdots)
    .transition().duration(1000)
    .attr('cx',function(d){return scaleX(d.year)})
    .attr('cy',function(d){return scaleY(d.rank)})
    .style('opacity',.5)
    .attr('r','4px')

updatedots.exit().remove(); 
}

//only 2016 new
function new2016(){
plot.selectAll('.dots').transition().duration(1000).style('opacity',0.1);
plot.selectAll('.new2016').transition().duration(1000).style('opacity',1)
}

//draw profit
function profit(data){
const data2015=data.filter(d=>{return d.year==2015;})
plot.selectAll('.dots').style('opacity',0);
plot.selectAll('.greydots').style('opacity',0);
plot.selectAll('.tick').style('opacity',0);
plot.selectAll('.country').style('opacity',0);
scaleProfit.domain(d3.extent(data2015,function(d){return d.profit}))
scaleAsset.domain(d3.extent(data2015,function(d){return d.assets}))
scaleEmployee.domain(d3.extent(data2015,function(d){return d.employee}))

axisX.scale(scaleAsset).ticks(5);
axisY.scale(scaleProfit).ticks(5);

X.call(axisX);
Y.call(axisY); 
var test=d3.extent(data2015,function(d){return d.employee})
console.log(scaleEmployee(test[1]))

var updateprofit=plot.selectAll('.y2015').style('opacity',1).data(data2015)
    
    .transition().duration(2000)
    .attr('cx',function(d){return scaleAsset(d.assets)})
    .attr('cy',function(d){return scaleProfit(d.profit)})
    .attr('r',function(d){return scaleEmployee(d.employee)+'px'});
 
 }
function resetprofit(){
axisX.scale(scaleX).tickSize(0);
axisY.scale(scaleY).tickSize(0).ticks(5);
X.call(axisX);
Y.call(axisY);
plot.selectAll('.greydots').style('opacity',1);
plot.selectAll('.tick').style('opacity',1);
plot.selectAll('.country').style('opacity',.5);
console.log(updatedots)
console.log(enterdots)
updatedots.merge(enterdots)
    .transition()
    .attr('cx',function(d){return scaleX(d.year)})
    .attr('cy',function(d){return scaleY(d.rank)})
    .style('opacity',.5)
    .attr('r','4px')

}

function parse(d){
if(d['Location']==""||d['Location']==undefined)return;
if(d['Year']==2008)return;

    return {
    	year:+d['Year'],
        rank:+d['Rank'],
        prerank:+d['PreviousRank']?+d['PreviousRank']:undefined,
        name:d['Name'],
        location:d['Location'],
        profit:+d['Profits'],
        assets:+d['Assets'],
        employee:+d['Employees'],
    }
}
