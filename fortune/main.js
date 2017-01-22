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
var m = {t:30,r:30,b:50,l:30},
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
	.range(['#66c2a5','#fc8d62','#8da0cb']),
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
var Byname,fortune;


d3.csv('../data/fortunedata_01222017.csv',parse,dataloaded);

function dataloaded(err, fortune){
// console.table(fortune);

Byname=d3.nest()
    .key(function(d){return d.name}).sortKeys(d3.ascending)
    .entries(fortune)

// console.log(Byname)

rank()

//set scenes' actions
slide[1].on('enter',function(e){dots(fortune)})
        .on('leave',function(e){plot.selectAll('.dots').transition().duration(1000).style('opacity',0)})
slide[2].on('enter',function(e){lines(Byname)})
        .on('leave',function(e){plot.selectAll('.dots').transition().duration(1000).style('opacity',.3);plot.selectAll('.country').remove()})
slide[3].on('enter',function(e){resetline('.China');})
        .on('leave',function(e){resetline('.country');})
slide[4].on('enter',function(e){resetline('.Hongkong');})
        .on('leave',function(e){resetline('.China');})
slide[5].on('enter',function(e){resetline('.Taiwan');})
        .on('leave',function(e){resetline('.Hongkong');})
slide[6].on('enter',function(e){plot.select('.rank').transition().style('opacity',0);var data2015=fortune.filter(data=>data.year==2015);profit(data2015)})
        .on('leave',function(e){plot.select('.profit').remove();plot.select('.rank').transition().style('opacity',1);resetline('.Taiwan')})
slide[7].on('enter',function(e){plot.select('.profit').transition().style('opacity',0)})
        .on('leave',function(e){plot.select('.profit').transition().style('opacity',1)})
}

function profit(data){
scaleProfit.domain(d3.extent(data,function(d){return d.profit}))
scaleAsset.domain(d3.extent(data,function(d){return d.assets}))
scaleEmployee.domain(d3.extent(data,function(d){return d.employee}))
var test=d3.extent(data,function(d){return d.assets})
console.log(test)
axisX.scale(scaleAsset).tickSize(-h).ticks(5);
axisY.scale(scaleProfit).tickSize(-w).ticks(5);
var profitbg=plot.append('g').attr('class','profit')
profitbg.append('g').attr('class','axis axis-x')
    .attr('transform','translate(0,'+h+')')
    .call(axisX);
profitbg.append('g').attr('class','axis axis-y')
    .call(axisY);
profitbg.append('g').attr('class','profitnodes')

var updatepf=plot.select('.profitnodes')
    .selectAll('.nodes').data(data,function(d){return d.name})
var enterpf=updatepf.enter()
    .append('circle').attr('class','nodes')
    .attr('r',0)
    .attr('cx',function(d){return scaleAsset(d.assets)})
    .attr('cy',function(d){return scaleProfit(d.profit)})
    .style('fill',function(d){return scaleColor(d.location)})
    .style('opacity',0)
updatepf.merge(enterpf)
    .transition().duration(1000)
    .attr('r',function(d){return scaleEmployee(d.employee)})
    .style('opacity',.5)
updatepf.exit().remove()

}
//dots and line diagram's background
function rank(){
const alldots=[];
for(var i=1;i<=500;i++){
    for(var m=1995;m<=2016;m++){
        alldots.push({rank:i,year:m,});
    };
}
axisX.scale(scaleX).tickSize(-h);
axisY.scale(scaleY).tickSize(-w).ticks(5);
var rankbg=plot.append('g').attr('class','rank')
rankbg.append('g').selectAll('.greydots')
    .data(alldots).enter()
    .append('circle').attr('class','greydots')
    .attr('r','1px')
    .attr('cx',function(d){return scaleX(d.year)})
    .attr('cy',function(d){return scaleY(d.rank)})
    .style('fill','#eee')
    // .style('opacity',.3)
rankbg.append('g').attr('class','axis axis-x')
    .attr('transform','translate(0,'+h+')')
    .call(axisX);
rankbg.append('g').attr('class','axis axis-y')
    .call(axisY);
rankbg.append('g').attr('class','circle')
rankbg.append('g').attr('class','line')
}
//to select specific country's lines
function resetline(country){
    plot.selectAll('.country').transition().duration(1000).style('opacity',0);
    plot.selectAll(country).transition().duration(1000).style('opacity',1)   
}
//to draw line
function lines(data){
var updateline=plot.select('.line').selectAll('.country')
    .data(data,function(d){return d.key});
var enterline=updateline.enter()
        .append('path').attr('class',function(d){return d.values[0].location+' country'})
        .datum(function(d){return d.values})
        .attr('d',function(d){return lineGenerator(d);})
        .style('stroke-width',0)
        .style('stroke','none')
        .style('fill','none')
        .style('opacity',.5)
console.log(data)
updateline.merge(enterline)
        .transition().duration(1000)
        .style('stroke',function(d){return d[0].rank-d[d.length-1].rank>=0?scaleColor(d[0].location):'#999'})
        .style('stroke-width',function(d){return d[0].location?'1px':'.5px'})
        
updateline.exit().remove(); 
}
//to draw dots
function dots(data){
var updatedots=plot.select('.circle').selectAll('.dots')
    .data(data);
var enterdots=updatedots.enter()
    .append('circle').attr('class','dots')
    .attr('cx',function(d){return scaleX(d.year)})
    .attr('cy',function(d){return scaleY(d.rank)})
    .style('stroke',function(d){return scaleColor(d.location)})
    .style('stroke-width','2px')
    .style('fill','none')
    .style('opacity',0)
    .attr('r',0)
    .on('click',function(d){console.log(d.rank)})
    
updatedots.merge(enterdots)
    .transition().duration(1000)
    .style('opacity',.5)
    .attr('r','4px')

updatedots.exit().remove(); 
}

function parse(d){
if(d['Location']==""||d['Location']==undefined)return;
if(d['Year']=='2008')return;

    return {
    	year:+d['Year'],
        rank:+d['Rank'],
        name:d['Name'],
        location:d['Location'],
        profit:+d['Profits'],
        assets:+d['Assets'],
        employee:+d['Employees']      
    }
}
